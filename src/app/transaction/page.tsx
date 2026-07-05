import { QuickTransactionClient } from "@/budget/components/QuickTransactionClient";
import { listMonths, listMonthItems } from "@/budget/lib/db/months";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function QuickTransactionPage() {
  const months = await listMonths();

  // Default to the current calendar month if saved, otherwise the most recent
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const defaultMonth =
    months.find((m) => m.month === currentMonth) ?? months[0] ?? null;

  const items = defaultMonth ? await listMonthItems(defaultMonth.id) : [];

  return (
    <QuickTransactionClient
      months={months}
      initialMonthId={defaultMonth?.id ?? null}
      initialItems={items}
    />
  );
}
