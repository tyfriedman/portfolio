import { TodoPageClient } from "@/todo/components/TodoPageClient";
import { listTodos } from "@/todo/lib/db/todos";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TodoPage() {
  // Fetch todos for 30 days before today through 60 days after (to support scrolling)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 30);
  
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 60);

  const dateRange = {
    start: startDate.toISOString().split("T")[0],
    end: endDate.toISOString().split("T")[0],
  };

  const todos = await listTodos(dateRange);

  return <TodoPageClient initialTodos={todos} />;
}

