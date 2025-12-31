import { NextRequest, NextResponse } from "next/server";
import {
  listCards,
  createCard,
  updateCard,
  deleteCard,
  type CreateCardInput,
  type UpdateCardInput,
} from "@/spend/lib/db/cards";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const cards = await listCards();
    return NextResponse.json(cards);
  } catch (error: any) {
    console.error("Error fetching cards", error);
    return NextResponse.json(
      { error: "Failed to fetch cards", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateCardInput;

    if (!body.name || !body.type) {
      return NextResponse.json(
        { error: "name and type are required" },
        { status: 400 }
      );
    }

    if (body.type !== "credit" && body.type !== "debit") {
      return NextResponse.json(
        { error: "type must be 'credit' or 'debit'" },
        { status: 400 }
      );
    }

    const id = await createCard(body);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating card", error);
    return NextResponse.json(
      { error: "Failed to create card", message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = (await req.json()) as UpdateCardInput & { id: string };

    if (!body.id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    if (body.type && body.type !== "credit" && body.type !== "debit") {
      return NextResponse.json(
        { error: "type must be 'credit' or 'debit'" },
        { status: 400 }
      );
    }

    const { id, ...updateData } = body;
    await updateCard(id, updateData);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating card", error);
    return NextResponse.json(
      { error: "Failed to update card", message: error.message },
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

    await deleteCard(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting card", error);
    return NextResponse.json(
      { error: "Failed to delete card", message: error.message },
      { status: 500 }
    );
  }
}

