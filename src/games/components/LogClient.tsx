"use client";

import { useEffect, useState } from "react";
import {
  GAME_LABELS,
  formatScore,
  parseShareText,
  type GameKey,
} from "@/games/lib/parseShareText";

const TOKEN_KEY = "games_ingest_token";

interface SavedRow {
  game: GameKey;
  puzzle_number: number;
  seconds: number | null;
  guesses: number | null;
}

interface ApiResponse {
  playedOn?: string;
  saved?: SavedRow[];
  ignored?: string[];
  error?: string;
  message?: string;
}

export default function LogClient() {
  const [token, setToken] = useState("");
  const [text, setText] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [response, setResponse] = useState<ApiResponse | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(TOKEN_KEY);
    if (stored) setToken(stored);
  }, []);

  const preview = parseShareText(text);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setResponse(null);
    window.localStorage.setItem(TOKEN_KEY, token);

    try {
      const res = await fetch("/api/games/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text, date: date || undefined }),
      });
      const json = (await res.json()) as ApiResponse;
      setResponse(json);
      setStatus(res.ok ? "done" : "error");
      if (res.ok) setText("");
    } catch (err) {
      setResponse({ error: err instanceof Error ? err.message : String(err) });
      setStatus("error");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <label className="block text-xs font-medium uppercase tracking-widest text-neutral-400 mb-2">
          Share text
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder={"Queens #784 | 0:34 and flawless\nTango #612 | 1:02\nPinpoint #512 | 2 guesses"}
          className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-400 font-mono"
        />
        {text.trim() && (
          <div className="mt-2 text-xs text-neutral-500 space-y-1">
            {preview.results.length > 0 ? (
              <p>
                Will save:{" "}
                {preview.results
                  .map((r) => `${GAME_LABELS[r.game]} ${formatScore(r)}`)
                  .join(", ")}
              </p>
            ) : (
              <p>No recognizable results yet.</p>
            )}
            {preview.ignored.length > 0 && (
              <p className="text-neutral-400">
                Ignoring {preview.ignored.length} line
                {preview.ignored.length === 1 ? "" : "s"}.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium uppercase tracking-widest text-neutral-400 mb-2">
            Date (optional)
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400"
          />
          <p className="mt-1 text-xs text-neutral-400">Defaults to today.</p>
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-widest text-neutral-400 mb-2">
            Token
          </label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            autoComplete="off"
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400"
          />
          <p className="mt-1 text-xs text-neutral-400">Remembered in this browser.</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={status === "saving" || !token || preview.results.length === 0}
        className="rounded-md px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {status === "saving" ? "Saving..." : "Save"}
      </button>

      {response && (
        <div
          className={`rounded-md border px-4 py-3 text-sm ${
            status === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-neutral-200 bg-white text-neutral-700"
          }`}
        >
          {status === "error" ? (
            <p>
              {response.error ?? "Something went wrong."}
              {response.message ? ` (${response.message})` : ""}
            </p>
          ) : (
            <div className="space-y-1">
              <p>
                Saved for {response.playedOn}:{" "}
                {(response.saved ?? [])
                  .map((r) => `${GAME_LABELS[r.game]} ${formatScore(r)}`)
                  .join(", ")}
              </p>
              {response.ignored && response.ignored.length > 0 && (
                <p className="text-neutral-400">
                  Ignored {response.ignored.length} line
                  {response.ignored.length === 1 ? "" : "s"}.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </form>
  );
}
