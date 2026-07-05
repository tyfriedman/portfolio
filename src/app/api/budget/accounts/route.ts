import { NextRequest, NextResponse } from "next/server";
import {
  listAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  type CreateAccountInput,
  type UpdateAccountInput,
} from "@/budget/lib/db/accounts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const accounts = await listAccounts();
    return NextResponse.json(accounts);
  } catch (error: any) {
    console.error("Error fetching accounts", error);
    return NextResponse.json(
      { error: "Failed to fetch accounts", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateAccountInput;

    if (!body.name || body.balance === undefined) {
      return NextResponse.json(
        { error: "name and balance are required" },
        { status: 400 }
      );
    }

    const account = await createAccount(body);
    return NextResponse.json(account, { status: 201 });
  } catch (error: any) {
    console.error("Error creating account", error);
    return NextResponse.json(
      { error: "Failed to create account", message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = (await req.json()) as UpdateAccountInput & { id: string };

    if (!body.id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const { id, ...updateData } = body;
    await updateAccount(id, updateData);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating account", error);
    return NextResponse.json(
      { error: "Failed to update account", message: error.message },
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

    await deleteAccount(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting account", error);
    return NextResponse.json(
      { error: "Failed to delete account", message: error.message },
      { status: 500 }
    );
  }
}
