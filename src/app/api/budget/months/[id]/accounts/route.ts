import { NextRequest, NextResponse } from "next/server";
import { updateMonthAccount } from "@/budget/lib/db/months";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params;
    const body = (await req.json()) as {
      id: string;
      start_balance?: number | null;
      end_balance?: number | null;
    };

    if (!body.id) {
      return NextResponse.json(
        { error: "id (month account id) is required" },
        { status: 400 }
      );
    }

    const { id: accountId, ...updateData } = body;
    await updateMonthAccount(accountId, updateData);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating month account", error);
    return NextResponse.json(
      { error: "Failed to update month account", message: error.message },
      { status: 500 }
    );
  }
}
