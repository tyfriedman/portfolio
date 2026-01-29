export type RoomState = "lobby" | "reveal" | "playing" | "ended";

export interface Player {
  id: string;
  name: string;
  is_leader: boolean;
  role: "imposter" | "crewmate" | null;
  created_at?: string;
}

export interface Task {
  id: string;
  room_id: string;
  player_id: string;
  task_text: string;
  is_completed: boolean;
  counts_for_completion: boolean;
  created_at?: string;
}

export interface Room {
  id: string;
  code: string;
  leader_player_id: string | null;
  state: RoomState;
  num_imposters: number;
  created_at?: string;
}

export interface RoomViewModel {
  room: Room;
  players: Player[];
  myPlayer: Player | null;
  myTasks: Task[];
  allTasksCompleted: boolean;
  completedCrewmateTasks: number;
  totalCrewmateTasks: number;
}

function shuffleInPlace<T>(array: T[]): void {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    // Fisher–Yates using crypto.getRandomValues for better randomness
    for (let i = array.length - 1; i > 0; i--) {
      const rand = new Uint32Array(1);
      crypto.getRandomValues(rand);
      const j = rand[0] % (i + 1);
      [array[i], array[j]] = [array[j], array[i]];
    }
  } else {
    // Fallback to Math.random if crypto is not available
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}

export function chooseImposters(players: Player[], numImposters: number): Player[] {
  if (numImposters < 1) {
    throw new Error("Number of imposters must be at least 1");
  }
  if (players.length <= numImposters) {
    throw new Error("Number of imposters must be less than number of players");
  }

  const copy = [...players];
  shuffleInPlace(copy);
  return copy.slice(0, numImposters);
}

export function assignTasksToPlayers(
  players: Player[],
  tasks: string[],
  tasksPerPerson: number
): Map<string, string[]> {
  if (tasksPerPerson < 0) {
    throw new Error("Tasks per person must be >= 0");
  }
  if (tasksPerPerson === 0) {
    return new Map(players.map((p) => [p.id, []]));
  }

  if (tasks.length < tasksPerPerson) {
    throw new Error(
      `Not enough tasks available for each player. Need at least ${tasksPerPerson} unique tasks but only ${tasks.length} available.`
    );
  }

  const result = new Map<string, string[]>();

  for (const player of players) {
    const availableForPlayer = [...tasks];
    const assigned: string[] = [];

    for (let i = 0; i < tasksPerPerson; i++) {
      const randomIndex = Math.floor(Math.random() * availableForPlayer.length);
      const [task] = availableForPlayer.splice(randomIndex, 1);
      assigned.push(task);
    }

    result.set(player.id, assigned);
  }

  return result;
}

