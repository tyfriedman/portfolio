import { supabase } from "@/spend/lib/supabaseClient";

export interface Category {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface CreateCategoryInput {
  name: string;
  color: string;
}

export interface UpdateCategoryInput {
  name?: string;
  color?: string;
}

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error loading categories", error);
    return [];
  }

  return (
    data?.map((row: any) => ({
      id: row.id,
      name: row.name,
      color: row.color,
      created_at: row.created_at,
    })) ?? []
  );
}

export async function createCategory(input: CreateCategoryInput): Promise<string> {
  const { name, color } = input;

  const { data, error } = await supabase
    .from("categories")
    .insert([
      {
        name,
        color,
      },
    ])
    .select("id")
    .single();

  if (error || !data) {
    throw error || new Error("Failed to insert category");
  }

  return data.id as string;
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput
): Promise<void> {
  const { error } = await supabase
    .from("categories")
    .update(input)
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

