import { supabase } from "@/budget/lib/supabaseClient";

export interface BudgetTransaction {
  id: string;
  month_id: string;
  date: string; // ISO date (YYYY-MM-DD)
  name: string;
  amount: number;
  category_id: string | null;
}

export interface CreateTransactionInput {
  month_id: string;
  date: string;
  name: string;
  amount: number;
  category_id?: string | null;
}

export interface UpdateTransactionInput {
  date?: string;
  name?: string;
  amount?: number;
  category_id?: string | null;
}

function mapRow(row: any): BudgetTransaction {
  return {
    id: row.id,
    month_id: row.month_id,
    date: row.date,
    name: row.name,
    amount: Number(row.amount),
    category_id: row.category_id,
  };
}

export async function listTransactions(
  monthId: string
): Promise<BudgetTransaction[]> {
  const { data, error } = await supabase
    .from("budget_transactions")
    .select("*")
    .eq("month_id", monthId)
    .order("date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error loading transactions", error);
    return [];
  }

  return data?.map(mapRow) ?? [];
}

export async function createTransaction(
  input: CreateTransactionInput
): Promise<BudgetTransaction> {
  const { data, error } = await supabase
    .from("budget_transactions")
    .insert([
      {
        month_id: input.month_id,
        date: input.date,
        name: input.name,
        amount: input.amount,
        category_id: input.category_id ?? null,
      },
    ])
    .select("*")
    .single();

  if (error || !data) {
    throw error || new Error("Failed to insert transaction");
  }

  return mapRow(data);
}

export async function updateTransaction(
  id: string,
  input: UpdateTransactionInput
): Promise<void> {
  const { error } = await supabase
    .from("budget_transactions")
    .update(input)
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase
    .from("budget_transactions")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}
