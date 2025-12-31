import { supabase } from "@/spend/lib/supabaseClient";

export interface Transaction {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  vendor_name: string;
  description: string | null;
  amount: number;
  category_id: string;
  card_id: string;
  created_at: string;
  updated_at: string;
  // Joined data
  category?: {
    id: string;
    name: string;
    color: string;
  };
  card?: {
    id: string;
    name: string;
    type: string;
  };
}

export interface CreateTransactionInput {
  date: string; // ISO date string (YYYY-MM-DD)
  vendor_name: string;
  description?: string | null;
  amount: number;
  category_id: string;
  card_id: string;
}

export interface UpdateTransactionInput {
  date?: string;
  vendor_name?: string;
  description?: string | null;
  amount?: number;
  category_id?: string;
  card_id?: string;
}

export async function listTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select(
      `
      id,
      date,
      vendor_name,
      description,
      amount,
      category_id,
      card_id,
      created_at,
      updated_at,
      categories (
        id,
        name,
        color
      ),
      cards (
        id,
        name,
        type
      )
    `
    )
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading transactions", error);
    return [];
  }

  return (
    data?.map((row: any) => ({
      id: row.id,
      date: row.date,
      vendor_name: row.vendor_name,
      description: row.description,
      amount: parseFloat(row.amount),
      category_id: row.category_id,
      card_id: row.card_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      category: row.categories
        ? {
            id: row.categories.id,
            name: row.categories.name,
            color: row.categories.color,
          }
        : undefined,
      card: row.cards
        ? {
            id: row.cards.id,
            name: row.cards.name,
            type: row.cards.type,
          }
        : undefined,
    })) ?? []
  );
}

export async function createTransaction(
  input: CreateTransactionInput
): Promise<string> {
  const {
    date,
    vendor_name,
    description = null,
    amount,
    category_id,
    card_id,
  } = input;

  const { data, error } = await supabase
    .from("transactions")
    .insert([
      {
        date,
        vendor_name,
        description,
        amount,
        category_id,
        card_id,
      },
    ])
    .select("id")
    .single();

  if (error || !data) {
    throw error || new Error("Failed to insert transaction");
  }

  return data.id as string;
}

export async function updateTransaction(
  id: string,
  input: UpdateTransactionInput
): Promise<void> {
  const updateData: any = { ...input };
  updateData.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from("transactions")
    .update(updateData)
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from("transactions").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

