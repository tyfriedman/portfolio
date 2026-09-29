import { NextRequest, NextResponse } from "next/server";
import { parseShareText, todayInZone } from "@/games/lib/parseShareText";
import { listResults, upsertResults } from "@/games/lib/db/results";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isAuthorized(req: NextRequest): boolean {
  const expected = process.env.GAMES_INGEST_TOKEN;
  if (!expected) return false;
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  return token.length > 0 && token === expected;
}

export async function GET(req: NextRequest) {
  try {
    const limitParam = req.nextUrl.searchParams.get("limit");
    const limit = Math.min(Math.max(parseInt(limitParam ?? "80", 10) || 80, 1), 500);
    const results = await listResults(limit);
    return NextResponse.json(results);
  } catch (error: unknown) {
    console.error("Error fetching game results", error);
    return NextResponse.json(
      { error: "Failed to fetch game results" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { text?: unknown; date?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }

  if (typeof body.text !== "string" || body.text.trim().length === 0) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  let playedOn = todayInZone();
  if (body.date !== undefined && body.date !== null && body.date !== "") {
    if (typeof body.date !== "string" || !DATE_RE.test(body.date)) {
      return NextResponse.json(
        { error: "date must be YYYY-MM-DD" },
        { status: 400 }
      );
    }
    playedOn = body.date;
  }

  const { results, ignored } = parseShareText(body.text);
  if (results.length === 0) {
    return NextResponse.json(
      { error: "No game results found in text", ignored },
      { status: 422 }
    );
  }

  try {
    const saved = await upsertResults(results, playedOn);
    return NextResponse.json({ playedOn, saved, ignored }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error saving game results", error);
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null && "message" in error
          ? String((error as { message: unknown }).message)
          : String(error);
    return NextResponse.json(
      { error: "Failed to save game results", message },
      { status: 500 }
    );
  }
}
