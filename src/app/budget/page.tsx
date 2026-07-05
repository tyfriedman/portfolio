import { BudgetHomeClient } from "@/budget/components/BudgetHomeClient";
import { listBudgetItems } from "@/budget/lib/db/items";
import { listAccounts } from "@/budget/lib/db/accounts";
import { listMonths } from "@/budget/lib/db/months";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BudgetPage() {
  const [items, accounts, months] = await Promise.all([
    listBudgetItems(),
    listAccounts(),
    listMonths(),
  ]);

  return (
    <BudgetHomeClient
      initialItems={items}
      initialAccounts={accounts}
      initialMonths={months}
    />
  );
}
