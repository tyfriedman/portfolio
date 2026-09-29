import { supabase, supabaseWriter } from "../supabaseClient";
import type { GameKey, ParsedResult } from "../parseShareText";

export interface GameResult {
  id: string;
  game: GameKey;
  puzzle_number: number;
  played_on: string; // YYYY-MM-DD
  seconds: number | null;
  guesses: number | null;
  raw_text: string;
  created_at: string;
}

const TABLE = "game_results";

export async function upsertResults(
  results: ParsedResult[],
  playedOn: string
): Promise<GameResult[]> {
  if (results.length === 0) return [];

  const rows = results.map((r) => ({
    game: r.game,
    puzzle_number: r.puzzleNumber,
    played_on: playedOn,
    seconds: r.seconds,
    guesses: r.guesses,
    raw_text: r.rawText,
  }));

  const { data, error } = await supabaseWriter
    .from(TABLE)
    .upsert(rows, { onConflict: "game,played_on" })
    .select();

  if (error) throw error;
  return (data ?? []) as GameResult[];
}

export async function listResults(limit = 80): Promise<GameResult[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("played_on", { ascending: false })
    .order("game", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as GameResult[];
}

export async function resultsForDate(playedOn: string): Promise<GameResult[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("played_on", playedOn)
    .order("game", { ascending: true });

  if (error) throw error;
  return (data ?? []) as GameResult[];
}
