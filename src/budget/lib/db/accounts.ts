import { supabase } from "@/budget/lib/supabaseClient";

export interface BudgetAccount {
  id: string;
  name: string;
  balance: number;
  is_loan: boolean;
  interest_rate: number | null;
  payoff_date: string | null; // ISO date (YYYY-MM-DD)
  sort_order: number;
}

export interface CreateAccountInput {
  name: string;
  balance: number;
  is_loan?: boolean;
  interest_rate?: number | null;
  payoff_date?: string | null;
  sort_order?: number;
}

export interface UpdateAccountInput {
  name?: string;
  balance?: number;
  is_loan?: boolean;
  interest_rate?: number | null;
  payoff_date?: string | null;
  sort_order?: number;
}

function mapRow(row: any): BudgetAccount {
  return {
    id: row.id,
    name: row.name,
    balance: Number(row.balance),
    is_loan: row.is_loan,
    interest_rate: row.interest_rate === null ? null : Number(row.interest_rate),
    payoff_date: row.payoff_date,
    sort_order: row.sort_order,
  };
}

export async function listAccounts(): Promise<BudgetAccount[]> {
  const { data, error } = await supabase
    .from("budget_accounts")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error loading accounts", error);
    return [];
  }

  return data?.map(mapRow) ?? [];
}

export async function createAccount(
  input: CreateAccountInput
): Promise<BudgetAccount> {
  const { data, error } = await supabase
    .from("budget_accounts")
    .insert([
      {
        name: input.name,
        balance: input.balance,
        is_loan: input.is_loan ?? false,
        interest_rate: input.interest_rate ?? null,
        payoff_date: input.payoff_date ?? null,
        sort_order: input.sort_order ?? 0,
      },
    ])
    .select("*")
    .single();

  if (error || !data) {
    throw error || new Error("Failed to insert account");
  }

  return mapRow(data);
}

export async function updateAccount(
  id: string,
  input: UpdateAccountInput
): Promise<void> {
  const { error } = await supabase
    .from("budget_accounts")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function deleteAccount(id: string): Promise<void> {
  const { error } = await supabase
    .from("budget_accounts")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}
