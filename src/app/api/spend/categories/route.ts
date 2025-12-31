import { NextRequest, NextResponse } from "next/server";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "@/spend/lib/db/categories";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const categories = await listCategories();
    return NextResponse.json(categories);
  } catch (error: any) {
    console.error("Error fetching categories", error);
    return NextResponse.json(
      { error: "Failed to fetch categories", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateCategoryInput;

    if (!body.name || !body.color) {
      return NextResponse.json(
        { error: "name and color are required" },
        { status: 400 }
      );
    }

    const id = await createCategory(body);
    return NextResponse.json({ id }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating category", error);
    return NextResponse.json(
      { error: "Failed to create category", message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = (await req.json()) as UpdateCategoryInput & { id: string };

    if (!body.id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const { id, ...updateData } = body;
    await updateCategory(id, updateData);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating category", error);
    return NextResponse.json(
      { error: "Failed to update category", message: error.message },
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

    await deleteCategory(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting category", error);
    return NextResponse.json(
      { error: "Failed to delete category", message: error.message },
      { status: 500 }
    );
  }
}

