export type GameKey =
  | "queens"
  | "tango"
  | "zip"
  | "pinpoint"
  | "crossclimb"
  | "mini_sudoku"
  | "patches"
  | "wend";

export const GAME_LABELS: Record<GameKey, string> = {
  queens: "Queens",
  tango: "Tango",
  zip: "Zip",
  pinpoint: "Pinpoint",
  crossclimb: "Crossclimb",
  mini_sudoku: "Mini Sudoku",
  patches: "Patches",
  wend: "Wend",
};

export const GAME_ORDER: GameKey[] = [
  "queens",
  "tango",
  "zip",
  "crossclimb",
  "pinpoint",
  "mini_sudoku",
  "patches",
  "wend",
];

export interface ParsedResult {
  game: GameKey;
  puzzleNumber: number;
  seconds: number | null;
  guesses: number | null;
  rawText: string;
}

export interface ParseOutput {
  results: ParsedResult[];
  ignored: string[];
}

const NAME_TO_KEY: Record<string, GameKey> = {
  queens: "queens",
  tango: "tango",
  zip: "zip",
  pinpoint: "pinpoint",
  crossclimb: "crossclimb",
  "mini sudoku": "mini_sudoku",
  minisudoku: "mini_sudoku",
  "mini-sudoku": "mini_sudoku",
  patches: "patches",
  wend: "wend",
};

// Matches the first line of LinkedIn's share text, e.g.
//   Queens #784 | 0:34 and flawless
//   Pinpoint #512 | 2 guesses
//   Zip #45 | 0:31 with 0 backtracks
//   Mini Sudoku #12 | 12:05
const LINE_RE =
  /^\s*(Queens|Tango|Zip|Pinpoint|Crossclimb|Mini[\s-]?Sudoku|Patches|Wend)\s*#\s*(\d+)\s*[|\-–]\s*(?:(\d+):(\d{2})|(\d+)\s*guess(?:es)?)/i;

export function parseShareText(text: string): ParseOutput {
  const results: ParsedResult[] = [];
  const ignored: string[] = [];

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const m = LINE_RE.exec(line);
    if (!m) {
      ignored.push(line);
      continue;
    }

    const game = NAME_TO_KEY[m[1].toLowerCase().replace(/\s+/g, " ")];
    if (!game) {
      ignored.push(line);
      continue;
    }

    const puzzleNumber = parseInt(m[2], 10);
    let seconds: number | null = null;
    let guesses: number | null = null;

    if (m[3] !== undefined && m[4] !== undefined) {
      seconds = parseInt(m[3], 10) * 60 + parseInt(m[4], 10);
    } else if (m[5] !== undefined) {
      guesses = parseInt(m[5], 10);
    }

    results.push({ game, puzzleNumber, seconds, guesses, rawText: line });
  }

  return { results, ignored };
}

export function formatSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatScore(r: { seconds: number | null; guesses: number | null }): string {
  if (r.seconds !== null) return formatSeconds(r.seconds);
  if (r.guesses !== null) return `${r.guesses} ${r.guesses === 1 ? "guess" : "guesses"}`;
  return "-";
}

/** Today's date as YYYY-MM-DD in the given IANA time zone. */
export function todayInZone(timeZone = "America/Chicago"): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
