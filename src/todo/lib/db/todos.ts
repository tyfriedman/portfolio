import { supabase } from "@/todo/lib/supabaseClient";

export type TodoStatus = "done" | "started" | "not_started";

export interface Todo {
  id: string;
  name: string;
  due_date: string; // ISO date string (YYYY-MM-DD)
  due_time: string | null; // Time string (HH:MM:SS)
  status: TodoStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateTodoInput {
  name: string;
  due_date: string; // ISO date string (YYYY-MM-DD)
  due_time?: string | null; // Time string (HH:MM:SS)
  status?: TodoStatus;
}

export interface UpdateTodoInput {
  name?: string;
  due_date?: string;
  due_time?: string | null;
  status?: TodoStatus;
}

export interface DateRange {
  start: string; // ISO date string
  end: string; // ISO date string
}

export async function listTodos(dateRange?: DateRange): Promise<Todo[]> {
  let query = supabase
    .from("todos")
    .select("*")
    .order("due_date", { ascending: true })
    .order("due_time", { ascending: true, nullsFirst: false });

  if (dateRange) {
    query = query
      .gte("due_date", dateRange.start)
      .lte("due_date", dateRange.end);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error loading todos", error);
    return [];
  }

  return (
    data?.map((row: any) => ({
      id: row.id,
      name: row.name,
      due_date: row.due_date,
      due_time: row.due_time,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
    })) ?? []
  );
}

export async function createTodo(input: CreateTodoInput): Promise<string> {
  const { name, due_date, due_time = null, status = "not_started" } = input;

  const { data, error } = await supabase
    .from("todos")
    .insert([
      {
        name,
        due_date,
        due_time,
        status,
      },
    ])
    .select("id")
    .single();

  if (error || !data) {
    throw error || new Error("Failed to insert todo");
  }

  return data.id as string;
}

export async function updateTodo(
  id: string,
  input: UpdateTodoInput
): Promise<void> {
  const updateData: any = { ...input };
  updateData.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from("todos")
    .update(updateData)
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function deleteTodo(id: string): Promise<void> {
  const { error } = await supabase.from("todos").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

