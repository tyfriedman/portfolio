import { supabase } from "@/budget/lib/supabaseClient";

export type BudgetSection = "income" | "savings" | "expense";

export interface BudgetItem {
  id: string;
  section: BudgetSection;
  name: string;
  amount: number;
  color: string | null;
  sort_order: number;
}

export interface CreateBudgetItemInput {
  section: BudgetSection;
  name: string;
  amount: number;
  color?: string | null;
  sort_order?: number;
}

export interface UpdateBudgetItemInput {
  name?: string;
  amount?: number;
  color?: string | null;
  sort_order?: number;
}

function mapRow(row: any): BudgetItem {
  return {
    id: row.id,
    section: row.section,
    name: row.name,
    amount: Number(row.amount),
    color: row.color,
    sort_order: row.sort_order,
  };
}

export async function listBudgetItems(): Promise<BudgetItem[]> {
  const { data, error } = await supabase
    .from("budget_items")
    .select("*")
    .order("section", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error loading budget items", error);
    return [];
  }

  return data?.map(mapRow) ?? [];
}

export async function createBudgetItem(
  input: CreateBudgetItemInput
): Promise<BudgetItem> {
  const { data, error } = await supabase
    .from("budget_items")
    .insert([
      {
        section: input.section,
        name: input.name,
        amount: input.amount,
        color: input.color ?? null,
        sort_order: input.sort_order ?? 0,
      },
    ])
    .select("*")
    .single();

  if (error || !data) {
    throw error || new Error("Failed to insert budget item");
  }

  return mapRow(data);
}

export async function updateBudgetItem(
  id: string,
  input: UpdateBudgetItemInput
): Promise<void> {
  const { error } = await supabase
    .from("budget_items")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function deleteBudgetItem(id: string): Promise<void> {
  const { error } = await supabase.from("budget_items").delete().eq("id", id);

  if (error) {
    throw error;
  }
}
