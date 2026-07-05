import { NextRequest, NextResponse } from "next/server";
import { listMonthItems, updateMonthItem } from "@/budget/lib/db/months";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const items = await listMonthItems(id);
    return NextResponse.json(items);
  } catch (error: any) {
    console.error("Error fetching month items", error);
    return NextResponse.json(
      { error: "Failed to fetch month items", message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params;
    const body = (await req.json()) as {
      id: string;
      amount?: number;
      name?: string;
      color?: string | null;
    };

    if (!body.id) {
      return NextResponse.json(
        { error: "id (month item id) is required" },
        { status: 400 }
      );
    }

    const { id: itemId, ...updateData } = body;
    await updateMonthItem(itemId, updateData);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating month item", error);
    return NextResponse.json(
      { error: "Failed to update month item", message: error.message },
      { status: 500 }
    );
  }
}
