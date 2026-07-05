import { NextRequest, NextResponse } from "next/server";
import {
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  type CreateTransactionInput,
  type UpdateTransactionInput,
} from "@/budget/lib/db/transactions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const monthId = req.nextUrl.searchParams.get("month_id");

    if (!monthId) {
      return NextResponse.json(
        { error: "month_id is required" },
        { status: 400 }
      );
    }

    const transactions = await listTransactions(monthId);
    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error("Error fetching transactions", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateTransactionInput;

    if (!body.month_id || !body.date || !body.name || body.amount === undefined) {
      return NextResponse.json(
        { error: "month_id, date, name and amount are required" },
        { status: 400 }
      );
    }

    const transaction = await createTransaction(body);
    return NextResponse.json(transaction, { status: 201 });
  } catch (error: any) {
    console.error("Error creating transaction", error);
    return NextResponse.json(
      { error: "Failed to create transaction", message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = (await req.json()) as UpdateTransactionInput & { id: string };

    if (!body.id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const { id, ...updateData } = body;
    await updateTransaction(id, updateData);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating transaction", error);
    return NextResponse.json(
      { error: "Failed to update transaction", message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await deleteTransaction(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting transaction", error);
    return NextResponse.json(
      { error: "Failed to delete transaction", message: error.message },
      { status: 500 }
    );
  }
}
