import { NextRequest, NextResponse } from "next/server";
import {
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  type CreateTransactionInput,
  type UpdateTransactionInput,
} from "@/spend/lib/db/transactions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const transactions = await listTransactions();
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

    if (
      !body.date ||
      !body.vendor_name ||
      !body.amount ||
      !body.category_id ||
      !body.card_id
    ) {
      return NextResponse.json(
        {
          error:
            "date, vendor_name, amount, category_id, and card_id are required",
        },
        { status: 400 }
      );
    }

    if (body.amount <= 0) {
      return NextResponse.json(
        { error: "amount must be positive" },
        { status: 400 }
      );
    }

    const id = await createTransaction(body);
    return NextResponse.json({ id }, { status: 201 });
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

    if (body.amount !== undefined && body.amount <= 0) {
      return NextResponse.json(
        { error: "amount must be positive" },
        { status: 400 }
      );
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
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");

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

