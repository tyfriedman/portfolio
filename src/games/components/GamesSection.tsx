import {
  GAME_LABELS,
  GAME_ORDER,
  formatScore,
  todayInZone,
  type GameKey,
} from "@/games/lib/parseShareText";
import { listResults, type GameResult } from "@/games/lib/db/results";

function formatDate(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function sortByGame(a: GameResult, b: GameResult): number {
  return GAME_ORDER.indexOf(a.game) - GAME_ORDER.indexOf(b.game);
}

export default async function GamesSection() {
  let results: GameResult[] = [];
  let loadError = false;

  try {
    results = await listResults(120);
  } catch (e) {
    console.error("Failed to load game results", e);
    loadError = true;
  }

  const today = todayInZone();
  const todays = results.filter((r) => r.played_on === today).sort(sortByGame);

  const byDate = new Map<string, GameResult[]>();
  for (const r of results) {
    if (r.played_on === today) continue;
    const list = byDate.get(r.played_on) ?? [];
    list.push(r);
    byDate.set(r.played_on, list);
  }
  const history = Array.from(byDate.entries()).slice(0, 10);

  const gamesSeen = new Set<GameKey>(results.map((r) => r.game));
  const columns = GAME_ORDER.filter((g) => gamesSeen.has(g));

  return (
    <section className="pt-16">
      <h2 className="text-xs font-medium uppercase tracking-widest text-neutral-400 mb-3">
        Daily LinkedIn games
      </h2>
      <p className="text-sm text-neutral-600 leading-relaxed mb-8">
        I play the LinkedIn puzzle games most mornings and log the times here.
        This is partly for accountability and partly so I have something to
        point to when I claim I am fast at Queens.
      </p>

      {loadError && (
        <p className="text-sm text-neutral-500">
          The scoreboard is taking the day off. Try again later.
        </p>
      )}

      {!loadError && results.length === 0 && (
        <p className="text-sm text-neutral-500">
          Nothing logged yet. Either it is early, or I have been slacking.
        </p>
      )}

      {!loadError && results.length > 0 && (
        <div className="space-y-10">
          <div>
            <h3 className="text-sm text-neutral-900 mb-3">
              Today
              <span className="text-neutral-400 ml-2">{formatDate(today)}</span>
            </h3>
            {todays.length === 0 ? (
              <p className="text-sm text-neutral-500">
                Not yet. Check back after coffee.
              </p>
            ) : (
              <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {todays.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-lg border border-neutral-200 px-4 py-3"
                  >
                    <div className="text-xs text-neutral-400">
                      {GAME_LABELS[r.game]}{" "}
                      <span className="text-neutral-300">#{r.puzzle_number}</span>
                    </div>
                    <div className="text-lg text-neutral-900 tabular-nums mt-0.5">
                      {formatScore(r)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {history.length > 0 && columns.length > 0 && (
            <div>
              <h3 className="text-sm text-neutral-900 mb-3">Recently</h3>
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full text-sm tabular-nums">
                  <thead>
                    <tr className="text-left text-xs text-neutral-400">
                      <th className="font-medium pb-2 pr-4">Date</th>
                      {columns.map((g) => (
                        <th key={g} className="font-medium pb-2 pr-4">
                          {GAME_LABELS[g]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(([date, rows]) => {
                      const map = new Map(rows.map((r) => [r.game, r]));
                      return (
                        <tr key={date} className="border-t border-neutral-100">
                          <td className="py-2 pr-4 text-neutral-500 whitespace-nowrap">
                            {formatDate(date)}
                          </td>
                          {columns.map((g) => {
                            const r = map.get(g);
                            return (
                              <td key={g} className="py-2 pr-4 text-neutral-800">
                                {r ? formatScore(r) : <span className="text-neutral-300">-</span>}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
