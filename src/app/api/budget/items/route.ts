import { NextRequest, NextResponse } from "next/server";
import {
  listBudgetItems,
  createBudgetItem,
  updateBudgetItem,
  deleteBudgetItem,
  type CreateBudgetItemInput,
  type UpdateBudgetItemInput,
} from "@/budget/lib/db/items";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const items = await listBudgetItems();
    return NextResponse.json(items);
  } catch (error: any) {
    console.error("Error fetching budget items", error);
    return NextResponse.json(
      { error: "Failed to fetch budget items", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateBudgetItemInput;

    if (!body.section || !body.name) {
      return NextResponse.json(
        { error: "section and name are required" },
        { status: 400 }
      );
    }

    const item = await createBudgetItem(body);
    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    console.error("Error creating budget item", error);
    return NextResponse.json(
      { error: "Failed to create budget item", message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = (await req.json()) as UpdateBudgetItemInput & { id: string };

    if (!body.id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const { id, ...updateData } = body;
    await updateBudgetItem(id, updateData);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating budget item", error);
    return NextResponse.json(
      { error: "Failed to update budget item", message: error.message },
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

    await deleteBudgetItem(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting budget item", error);
    return NextResponse.json(
      { error: "Failed to delete budget item", message: error.message },
      { status: 500 }
    );
  }
}
