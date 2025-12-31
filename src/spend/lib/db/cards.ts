import { supabase } from "@/spend/lib/supabaseClient";

export type CardType = "credit" | "debit";

export interface Card {
  id: string;
  name: string;
  type: CardType;
  created_at: string;
}

export interface CreateCardInput {
  name: string;
  type: CardType;
}

export interface UpdateCardInput {
  name?: string;
  type?: CardType;
}

export async function listCards(): Promise<Card[]> {
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error loading cards", error);
    return [];
  }

  return (
    data?.map((row: any) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      created_at: row.created_at,
    })) ?? []
  );
}

export async function createCard(input: CreateCardInput): Promise<string> {
  const { name, type } = input;

  const { data, error } = await supabase
    .from("cards")
    .insert([
      {
        name,
        type,
      },
    ])
    .select("id")
    .single();

  if (error || !data) {
    throw error || new Error("Failed to insert card");
  }

  return data.id as string;
}

export async function updateCard(
  id: string,
  input: UpdateCardInput
): Promise<void> {
  const { error } = await supabase
    .from("cards")
    .update(input)
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function deleteCard(id: string): Promise<void> {
  const { error } = await supabase.from("cards").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

