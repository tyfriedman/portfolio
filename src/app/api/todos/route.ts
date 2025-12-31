import { NextRequest, NextResponse } from "next/server";
import {
  listTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  type CreateTodoInput,
  type UpdateTodoInput,
} from "@/todo/lib/db/todos";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    const dateRange =
      startDate && endDate
        ? { start: startDate, end: endDate }
        : undefined;

    const todos = await listTodos(dateRange);
    return NextResponse.json(todos);
  } catch (error: any) {
    console.error("Error fetching todos", error);
    return NextResponse.json(
      { error: "Failed to fetch todos", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateTodoInput;

    if (!body.name || !body.due_date) {
      return NextResponse.json(
        { error: "name and due_date are required" },
        { status: 400 }
      );
    }

    const id = await createTodo(body);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating todo", error);
    return NextResponse.json(
      { error: "Failed to create todo", message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = (await req.json()) as UpdateTodoInput & { id: string };

    if (!body.id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const { id, ...updateData } = body;
    await updateTodo(id, updateData);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating todo", error);
    return NextResponse.json(
      { error: "Failed to update todo", message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await deleteTodo(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting todo", error);
    return NextResponse.json(
      { error: "Failed to delete todo", message: error.message },
      { status: 500 }
    );
  }
}

