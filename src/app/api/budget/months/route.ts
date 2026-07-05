import { NextRequest, NextResponse } from "next/server";
import {
  listMonths,
  saveBudgetToMonth,
  deleteMonth,
} from "@/budget/lib/db/months";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const months = await listMonths();
    return NextResponse.json(months);
  } catch (error: any) {
    console.error("Error fetching months", error);
    return NextResponse.json(
      { error: "Failed to fetch months", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { month: string };

    if (!body.month || !/^\d{4}-\d{2}-01$/.test(body.month)) {
      return NextResponse.json(
        { error: "month is required in YYYY-MM-01 format" },
        { status: 400 }
      );
    }

    const month = await saveBudgetToMonth(body.month);
    return NextResponse.json(month, { status: 201 });
  } catch (error: any) {
    console.error("Error saving budget to month", error);
    return NextResponse.json(
      { error: "Failed to save budget to month", message: error.message },
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

    await deleteMonth(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting month", error);
    return NextResponse.json(
      { error: "Failed to delete month", message: error.message },
      { status: 500 }
    );
  }
}
