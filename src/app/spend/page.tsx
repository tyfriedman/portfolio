import { SpendPageClient } from "@/spend/components/SpendPageClient";
import { listTransactions } from "@/spend/lib/db/transactions";
import { listCategories } from "@/spend/lib/db/categories";
import { listCards } from "@/spend/lib/db/cards";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SpendPage() {
  const [transactions, categories, cards] = await Promise.all([
    listTransactions(),
    listCategories(),
    listCards(),
  ]);

  return (
    <SpendPageClient
      initialTransactions={transactions}
      initialCategories={categories}
      initialCards={cards}
    />
  );
}

