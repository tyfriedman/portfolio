const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

/** Parse user-typed money input like "$1,234.56" or "-1450" into a number. */
export function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/[$,\s]/g, "");
  if (cleaned === "" || cleaned === "-") return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

/** "2026-07-01" -> "July 2026" */
export function formatMonthLabel(isoDate: string): string {
  const [year, month] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/** "2026-07-01" -> "2026-07" (URL segment) */
export function monthToSlug(isoDate: string): string {
  return isoDate.slice(0, 7);
}

/** "2026-07" -> "2026-07-01" */
export function slugToMonth(slug: string): string {
  return `${slug}-01`;
}
