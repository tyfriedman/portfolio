import { notFound } from "next/navigation";
import { MonthPageClient } from "@/budget/components/MonthPageClient";
import {
  getMonthByDate,
  listMonthItems,
  listMonthAccounts,
} from "@/budget/lib/db/months";
import { listTransactions } from "@/budget/lib/db/transactions";
import { slugToMonth } from "@/budget/lib/format";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BudgetMonthPage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month: slug } = await params;

  if (!/^\d{4}-\d{2}$/.test(slug)) {
    notFound();
  }

  const monthRow = await getMonthByDate(slugToMonth(slug));

  if (!monthRow) {
    notFound();
  }

  const [items, accounts, transactions] = await Promise.all([
    listMonthItems(monthRow.id),
    listMonthAccounts(monthRow.id),
    listTransactions(monthRow.id),
  ]);

  return (
    <MonthPageClient
      month={monthRow}
      initialItems={items}
      initialAccounts={accounts}
      initialTransactions={transactions}
    />
  );
}
