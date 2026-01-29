"use client";

import { useEffect, useMemo, useState } from "react";
import { amongusSupabase } from "@/amongus/lib/supabaseClient";
import {
  assignTasksToPlayers,
  chooseImposters,
  type Player,
  type Room,
  type RoomViewModel,
  type Task,
} from "@/amongus/lib/gameLogic";
import { DEFAULT_TASKS, TASKS_PER_PERSON } from "@/amongus/lib/tasks";

type LocalMode = "landing" | "leader" | "player";

interface StoredSession {
  roomId: string;
  playerId: string;
  code: string;
  isLeader: boolean;
}

const STORAGE_KEY = "amongus-session-v1";

function loadStoredSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

function saveStoredSession(session: StoredSession | null) {
  if (typeof window === "undefined") return;
  if (!session) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function generateRoomCode(length = 4): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    for (let i = 0; i < length; i++) {
      code += alphabet[arr[i] % alphabet.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  }
  return code;
}

export function AmongUsGameClient() {
  const [mode, setMode] = useState<LocalMode>("landing");
  const [session, setSession] = useState<StoredSession | null>(null);
  const [roomState, setRoomState] = useState<RoomViewModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createName, setCreateName] = useState("");
  const [joinName, setJoinName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [hasAlertedCompletion, setHasAlertedCompletion] = useState(false);

  // Load any existing session on first mount
  useEffect(() => {
    const stored = loadStoredSession();
    if (stored) {
      setSession(stored);
      setMode(stored.isLeader ? "leader" : "player");
    }
  }, []);

  // Reusable function to fetch room state
  async function fetchRoomState(
    sessionToUse: StoredSession
  ): Promise<RoomViewModel | null> {
    try {
      const { roomId, playerId } = sessionToUse;

      const { data: room, error: roomError } = await amongusSupabase
        .from("amongus_rooms")
        .select("*")
        .eq("id", roomId)
        .single<Room>();

      if (roomError || !room) {
        throw roomError ?? new Error("Room not found");
      }

      const { data: players, error: playersError } = await amongusSupabase
        .from("amongus_players")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true })
        .returns<Player[]>();

      if (playersError || !players) {
        throw playersError ?? new Error("Players not found");
      }

      const myPlayer = players.find((p) => p.id === playerId) ?? null;

      const { data: tasks, error: tasksError } = await amongusSupabase
        .from("amongus_tasks")
        .select("*")
        .eq("room_id", roomId)
        .eq("player_id", playerId)
        .order("created_at", { ascending: true })
        .returns<Task[]>();

      if (tasksError || !tasks) {
        throw tasksError ?? new Error("Tasks not found");
      }

      const { data: allTasks, error: allTasksError } = await amongusSupabase
        .from("amongus_tasks")
        .select("id, is_completed, counts_for_completion")
        .eq("room_id", roomId);

      if (allTasksError || !allTasks) {
        throw allTasksError ?? new Error("Tasks not found");
      }

      const relevant = allTasks.filter(
        (t: any) => t.counts_for_completion === true
      );
      const allCompleted =
        relevant.length > 0 &&
        relevant.every((t: any) => t.is_completed === true);

      const viewModel: RoomViewModel = {
        room,
        players,
        myPlayer,
        myTasks: tasks,
        allTasksCompleted: allCompleted,
      };

      setRoomState(viewModel);
      return viewModel;
    } catch (err) {
      console.error("Error fetching room state", err);
      setError("Unable to sync game state. Retrying...");
      return null;
    }
  }

  // Polling for room state every 3 seconds
  useEffect(() => {
    if (!session) return;

    // Capture current session so TypeScript knows it's non-null inside the async function
    const currentSession = session;
    let cancelled = false;

    async function pollState() {
      if (!currentSession || cancelled) return;
      await fetchRoomState(currentSession);
    }

    pollState();
    const id = window.setInterval(pollState, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [session]);

  // Alert when all tasks complete (once)
  useEffect(() => {
    if (!roomState) return;
    if (roomState.allTasksCompleted && !hasAlertedCompletion) {
      setHasAlertedCompletion(true);
      alert("All crewmate tasks are completed!");
    }
  }, [roomState, hasAlertedCompletion]);

  const isLeader = session?.isLeader ?? false;
  const currentRoomState = roomState?.room.state ?? "lobby";

  async function handleCreateGame() {
    if (!createName.trim()) {
      setError("Please enter your name.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const code = generateRoomCode(4);

      const { data: room, error: roomError } = await amongusSupabase
        .from("amongus_rooms")
        .insert({
          code,
          num_imposters: 1,
          state: "lobby",
        })
        .select("*")
        .single<Room>();

      if (roomError || !room) {
        throw roomError ?? new Error("Failed to create room");
      }

      const { data: player, error: playerError } = await amongusSupabase
        .from("amongus_players")
        .insert({
          room_id: room.id,
          name: createName.trim(),
          is_leader: true,
        })
        .select("*")
        .single<Player>();

      if (playerError || !player) {
        throw playerError ?? new Error("Failed to create leader");
      }

      await amongusSupabase
        .from("amongus_rooms")
        .update({ leader_player_id: player.id })
        .eq("id", room.id);

      const newSession: StoredSession = {
        roomId: room.id,
        playerId: player.id,
        code: room.code,
        isLeader: true,
      };
      setSession(newSession);
      saveStoredSession(newSession);
      setMode("leader");
      setCreateName("");
      setHasAlertedCompletion(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create game.");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinGame() {
    if (!joinName.trim() || !joinCode.trim()) {
      setError("Please enter your name and the room code.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const code = joinCode.trim().toUpperCase();

      const { data: room, error: roomError } = await amongusSupabase
        .from("amongus_rooms")
        .select("*")
        .eq("code", code)
        .neq("state", "ended")
        .single<Room>();

      if (roomError || !room) {
        throw roomError ?? new Error("Room not found or already ended");
      }

      // Check if a player with this name already exists in the room
      const trimmedName = joinName.trim();
      const { data: existingPlayer } = await amongusSupabase
        .from("amongus_players")
        .select("*")
        .eq("room_id", room.id)
        .eq("name", trimmedName)
        .maybeSingle<Player>();

      let player: Player;
      if (existingPlayer) {
        // Rejoin existing player
        player = existingPlayer;
      } else {
        // Create new player
        const { data: newPlayer, error: playerError } = await amongusSupabase
          .from("amongus_players")
          .insert({
            room_id: room.id,
            name: trimmedName,
            is_leader: false,
          })
          .select("*")
          .single<Player>();

        if (playerError || !newPlayer) {
          throw playerError ?? new Error("Failed to join room");
        }
        player = newPlayer;
      }

      const newSession: StoredSession = {
        roomId: room.id,
        playerId: player.id,
        code: room.code,
        isLeader: false,
      };
      setSession(newSession);
      saveStoredSession(newSession);
      setMode("player");
      setJoinName("");
      setJoinCode("");
      setHasAlertedCompletion(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to join game.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAssignRolesAndTasks() {
    if (!session || !roomState) return;
    const { roomId } = session;
    const players = roomState.players;
    if (players.length < 2) {
      setError("Need at least 2 players to start.");
      return;
    }

    try {
      const numImposters = Math.min(
        roomState.room.num_imposters,
        players.length - 1
      );
      const imposters = chooseImposters(players, numImposters);
      const impostersSet = new Set(imposters.map((p) => p.id));

      const assigned = assignTasksToPlayers(
        players,
        DEFAULT_TASKS,
        TASKS_PER_PERSON
      );

      // Update roles for each player
      for (const player of players) {
        const role = impostersSet.has(player.id) ? "imposter" : "crewmate";
        const { error: roleError } = await amongusSupabase
          .from("amongus_players")
          .update({ role })
          .eq("id", player.id);

        if (roleError) {
          throw roleError;
        }
      }

      // Clear previous tasks if any
      await amongusSupabase
        .from("amongus_tasks")
        .delete()
        .eq("room_id", roomId);

      const taskRows = players.flatMap((p) => {
        const forPlayer = assigned.get(p.id) ?? [];
        const isImposter = impostersSet.has(p.id);
        return forPlayer.map((taskText) => ({
          room_id: roomId,
          player_id: p.id,
          task_text: taskText,
          counts_for_completion: !isImposter,
        }));
      });

      if (taskRows.length > 0) {
        const { error: tasksError } = await amongusSupabase
          .from("amongus_tasks")
          .insert(taskRows);
        if (tasksError) {
          throw tasksError;
        }
      }

      const { error: roomError } = await amongusSupabase
        .from("amongus_rooms")
        .update({ state: "reveal" })
        .eq("id", roomId);

      if (roomError) throw roomError;

      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to assign roles and tasks.");
    }
  }

  async function handleUpdateImposters(num: number) {
    if (!session) return;
    if (num < 1) return;
    try {
      await amongusSupabase
        .from("amongus_rooms")
        .update({ num_imposters: num })
        .eq("id", session.roomId);
      // Immediately refresh state
      await fetchRoomState(session);
    } catch (err) {
      console.error("Failed to update imposter count", err);
    }
  }

  async function handleBeginGame() {
    if (!session) return;
    try {
      await amongusSupabase
        .from("amongus_rooms")
        .update({ state: "playing" })
        .eq("id", session.roomId);
    } catch (err) {
      console.error(err);
      setError("Failed to begin game.");
    }
  }

  async function handleEndGame() {
    if (!session) return;
    try {
      await amongusSupabase
        .from("amongus_rooms")
        .update({ state: "ended" })
        .eq("id", session.roomId);
    } catch (err) {
      console.error(err);
      setError("Failed to end game.");
    }
  }

  async function handleToggleTask(task: Task) {
    if (!session) return;
    try {
      const { error: updateError } = await amongusSupabase
        .from("amongus_tasks")
        .update({ is_completed: !task.is_completed })
        .eq("id", task.id);
      if (updateError) throw updateError;

      // Optimistic update
      setRoomState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          myTasks: prev.myTasks.map((t) =>
            t.id === task.id ? { ...t, is_completed: !t.is_completed } : t
          ),
        };
      });

      // Immediately refresh state to get accurate completion status
      await fetchRoomState(session);
    } catch (err) {
      console.error(err);
      setError("Failed to update task.");
    }
  }

  function handleResetToLanding() {
    setSession(null);
    saveStoredSession(null);
    setRoomState(null);
    setMode("landing");
    setError(null);
    setHasAlertedCompletion(false);
  }

  async function handleLeaveGame() {
    const current = session;
    if (!current) {
      handleResetToLanding();
      return;
    }

    try {
      await amongusSupabase
        .from("amongus_players")
        .delete()
        .eq("id", current.playerId);
    } catch (err) {
      console.error("Failed to leave game", err);
    } finally {
      handleResetToLanding();
    }
  }

  const players = roomState?.players ?? [];
  const myPlayer = roomState?.myPlayer ?? null;
  const myTasks = roomState?.myTasks ?? [];

  const sortedPlayers = useMemo(
    () =>
      [...players].sort((a, b) => {
        if (a.is_leader && !b.is_leader) return -1;
        if (!a.is_leader && b.is_leader) return 1;
        const aCreated = a.created_at ?? "";
        const bCreated = b.created_at ?? "";
        return aCreated.localeCompare(bCreated);
      }),
    [players]
  );

  const allTasksCompleted = roomState?.allTasksCompleted ?? false;

  return (
    <div
      className="amongus-root"
      style={
        allTasksCompleted
          ? {
              background:
                "radial-gradient(circle at top, #065f46, #022c22)",
            }
          : undefined
      }
    >
      <div className="amongus-container">
        <header className="amongus-card">
          <div className="amongus-heading">Among Us IRL</div>
          <div className="amongus-subtitle">
            Create a room, share the code, and let everyone get random roles and
            tasks on their own phone.
          </div>
        </header>

        {error && (
          <div className="amongus-card" style={{ borderColor: "#f97316" }}>
            <div className="amongus-section-title">Notice</div>
            <p className="amongus-hint">{error}</p>
          </div>
        )}

        {!session && mode === "landing" && (
          <div className="amongus-card">
            <div className="amongus-actions-column">
              <button
                className="amongus-button-primary"
                onClick={() => setMode("leader")}
              >
                <span>👑 Create Game</span>
              </button>
              <button
                className="amongus-button-secondary"
                onClick={() => setMode("player")}
              >
                <span>🔑 Join Game</span>
              </button>
            </div>
          </div>
        )}

        {!session && mode === "leader" && (
          <div className="amongus-card">
            <div className="amongus-input-row">
              <label className="amongus-label">Your Name</label>
              <input
                className="amongus-input"
                placeholder="Ty"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
              />
            </div>
            <div style={{ height: "0.75rem" }} />
            <button
              className="amongus-button-primary"
              onClick={handleCreateGame}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Room"}
            </button>
            <div style={{ height: "0.5rem" }} />
            <button
              className="amongus-button-secondary"
              onClick={() => setMode("landing")}
            >
              Back
            </button>
          </div>
        )}

        {!session && mode === "player" && (
          <div className="amongus-card">
            <div className="amongus-input-row">
              <label className="amongus-label">Your Name</label>
              <input
                className="amongus-input"
                placeholder="Player name"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
              />
            </div>
            <div style={{ height: "0.75rem" }} />
            <div className="amongus-input-row">
              <label className="amongus-label">Room Code</label>
              <input
                className="amongus-input"
                placeholder="ABCD"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              />
              <div className="amongus-hint">
                Ask your game leader for the 4-letter code.
              </div>
            </div>
            <div style={{ height: "0.75rem" }} />
            <button
              className="amongus-button-primary"
              onClick={handleJoinGame}
              disabled={loading}
            >
              {loading ? "Joining..." : "Join Game"}
            </button>
            <div style={{ height: "0.5rem" }} />
            <button
              className="amongus-button-secondary"
              onClick={() => setMode("landing")}
            >
              Back
            </button>
          </div>
        )}

        {session && (
          <>
            <div className="amongus-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginBottom: "0.75rem",
                }}
              >
                <span className="amongus-section-title">Room Code</span>
                <span className="amongus-badge">
                  {isLeader ? "Leader" : "Player"} • {currentRoomState}
                </span>
              </div>
              <div
                style={{ marginBottom: "0.5rem" }}
                className="amongus-room-code"
              >
                {session.code}
              </div>
              <div className="amongus-hint">
                Share this code with everyone in the game. You can leave and
                join a different room at any time.
              </div>
              <div style={{ height: "0.75rem" }} />
              <button
                className="amongus-button-secondary"
                onClick={handleLeaveGame}
              >
                Leave Game
              </button>
            </div>

            <div className="amongus-card">
              <div className="amongus-section-title">Players in Room</div>
              {sortedPlayers.length === 0 && (
                <p className="amongus-hint">Waiting for players to join…</p>
              )}
              {sortedPlayers.length > 0 && (
                <ul className="amongus-players-list">
                  {sortedPlayers.map((p) => (
                    <li key={p.id} className="amongus-player-pill">
                      {p.is_leader ? "👑 " : ""}
                      {p.name}
                      {p.id === session.playerId ? " (you)" : ""}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {isLeader && (
              <div className="amongus-card">
                <div className="amongus-section-title">Leader Controls</div>
                <div className="amongus-input-row" style={{ marginBottom: 12 }}>
                  <label className="amongus-label">Number of Imposters</label>
                  <input
                    type="number"
                    className="amongus-number-input"
                    min={1}
                    max={Math.max(1, players.length - 1)}
                    value={roomState?.room.num_imposters ?? 1}
                    onChange={(e) =>
                      handleUpdateImposters(
                        Math.max(1, parseInt(e.target.value || "1", 10))
                      )
                    }
                  />
                  <div className="amongus-hint">
                    You must have fewer imposters than total players.
                  </div>
                  <div className="amongus-hint">
                    Tasks per person: {TASKS_PER_PERSON}. Tasks are assigned
                    randomly when you start.
                  </div>
                </div>

                <div className="amongus-actions-column">
                  <button
                    className="amongus-button-primary"
                    onClick={handleAssignRolesAndTasks}
                    disabled={players.length < 2}
                  >
                    🎲 Assign Roles & Tasks
                  </button>
                  <button
                    className="amongus-button-secondary"
                    onClick={handleBeginGame}
                    disabled={currentRoomState !== "reveal"}
                  >
                    ▶ Begin Game
                  </button>
                  <button
                    className="amongus-button-secondary"
                    onClick={handleEndGame}
                  >
                    ⏹ End Game
                  </button>
                </div>
              </div>
            )}

            {myPlayer && (
              <div className="amongus-card">
                {currentRoomState === "lobby" && (
                  <>
                    <div className="amongus-section-title">
                      Waiting for Leader
                    </div>
                    <p className="amongus-hint">
                      Stay on this screen. Once your leader assigns roles and
                      starts the game, your role and tasks will appear here.
                    </p>
                  </>
                )}

                {currentRoomState === "reveal" && (
                  <>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <span className="amongus-section-title">Your Role</span>
                      {myPlayer.role === "imposter" ? (
                        <span className="amongus-badge amongus-role-imposter">
                          🔴 Imposter
                        </span>
                      ) : myPlayer.role === "crewmate" ? (
                        <span className="amongus-badge amongus-role-crewmate">
                          🟢 Crewmate
                        </span>
                      ) : null}
                    </div>
                    <div className="amongus-section-title">Your Tasks</div>
                    {allTasksCompleted && (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "1.5rem",
                          marginBottom: "1rem",
                          borderRadius: "0.75rem",
                          background: "rgba(34, 197, 94, 0.2)",
                          border: "2px solid rgba(34, 197, 94, 0.8)",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "1.5rem",
                            fontWeight: 700,
                            color: "#bbf7d0",
                            marginBottom: "0.5rem",
                          }}
                        >
                          🎉 Crewmates Win! 🎉
                        </div>
                        <div
                          style={{
                            fontSize: "0.9rem",
                            color: "#86efac",
                          }}
                        >
                          All crewmate tasks have been completed!
                        </div>
                      </div>
                    )}
                    {myTasks.length === 0 && (
                      <p className="amongus-hint">
                        No tasks assigned yet. Your leader may need to retry
                        starting the game.
                      </p>
                    )}
                    <div className="amongus-tasks">
                      {myTasks.map((task) => (
                        <label
                          key={task.id}
                          className="amongus-task-row"
                          style={{ opacity: task.is_completed ? 0.6 : 1 }}
                        >
                          <input
                            type="checkbox"
                            className="amongus-task-checkbox"
                            checked={task.is_completed}
                            onChange={() => handleToggleTask(task)}
                          />
                          <span className="amongus-task-text">
                            {task.task_text}
                          </span>
                        </label>
                      ))}
                    </div>
                  </>
                )}

                {currentRoomState === "playing" && (
                  <>
                    <div className="amongus-section-title">Your Tasks</div>
                    {allTasksCompleted && (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "1.5rem",
                          marginBottom: "1rem",
                          borderRadius: "0.75rem",
                          background: "rgba(34, 197, 94, 0.2)",
                          border: "2px solid rgba(34, 197, 94, 0.8)",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "1.5rem",
                            fontWeight: 700,
                            color: "#bbf7d0",
                            marginBottom: "0.5rem",
                          }}
                        >
                          🎉 Crewmates Win! 🎉
                        </div>
                        <div
                          style={{
                            fontSize: "0.9rem",
                            color: "#86efac",
                          }}
                        >
                          All crewmate tasks have been completed!
                        </div>
                      </div>
                    )}
                    <p className="amongus-hint">
                      Your role is now hidden. Complete your tasks (or pretend
                      to, if you&apos;re the imposter).
                    </p>
                    <div className="amongus-tasks">
                      {myTasks.map((task) => (
                        <label
                          key={task.id}
                          className="amongus-task-row"
                          style={{ opacity: task.is_completed ? 0.6 : 1 }}
                        >
                          <input
                            type="checkbox"
                            className="amongus-task-checkbox"
                            checked={task.is_completed}
                            onChange={() => handleToggleTask(task)}
                          />
                          <span className="amongus-task-text">
                            {task.task_text}
                          </span>
                        </label>
                      ))}
                    </div>
                  </>
                )}

                {currentRoomState === "ended" && (
                  <>
                    <div className="amongus-section-title">Game Ended</div>
                    <p className="amongus-hint">
                      This game has finished. You can return to the start screen
                      to create or join another game.
                    </p>
                    <div style={{ height: "0.75rem" }} />
                    <button
                      className="amongus-button-secondary"
                      onClick={handleResetToLanding}
                    >
                      Back to Start
                    </button>
                  </>
                )}
              </div>
            )}

            {!myPlayer && (
              <div className="amongus-card">
                <div className="amongus-section-title">
                  Player Not Found Anymore
                </div>
                <p className="amongus-hint">
                  Your player record is missing for this room. The game may have
                  been reset. You can safely return to the start screen.
                </p>
                <div style={{ height: "0.75rem" }} />
                <button
                  className="amongus-button-secondary"
                  onClick={handleResetToLanding}
                >
                  Back to Start
                </button>
              </div>
            )}
          </>
        )}

        <footer className="amongus-footer">
          Best experienced with everyone on their own phone.
        </footer>
      </div>
    </div>
  );
}

