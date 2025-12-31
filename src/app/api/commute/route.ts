import { NextRequest, NextResponse } from "next/server";
import { VISA_HQ_LAT, VISA_HQ_LNG } from "@/austin/lib/constants";

export async function POST(req: NextRequest) {
  const { lat, lng } = (await req.json()) as {
    lat?: number;
    lng?: number;
  };

  if (typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json(
      { error: "lat and lng are required numbers" },
      { status: 400 }
    );
  }

  const apiKey =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Google Maps API key not configured" },
      { status: 500 }
    );
  }

  const origin = `${VISA_HQ_LAT},${VISA_HQ_LNG}`;
  const destination = `${lat},${lng}`;

  const params = new URLSearchParams({
    origins: origin,
    destinations: destination,
    mode: "driving",
    departure_time: "now",
    key: apiKey,
  });

  try {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?${params.toString()}`;

    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/1e534042-e897-4ae6-b5ee-59634a9d6b11", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "pre-fix",
        hypothesisId: "H-commute-api-call",
        location: "app/api/commute/route.ts:POST",
        message: "Calling Google Distance Matrix from server",
        data: { origin, destination },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    const res = await fetch(url);

    if (!res.ok) {
      return NextResponse.json(
        { error: "Google Distance Matrix request failed", status: res.status },
        { status: 502 }
      );
    }

    const data = await res.json();
    const element = data?.rows?.[0]?.elements?.[0];
    if (!element || element.status !== "OK") {
      return NextResponse.json(
        {
          error: "No valid commute result",
          elementStatus: element?.status,
          apiStatus: data?.status,
        },
        { status: 200 }
      );
    }

    const distanceMeters: number | undefined = element.distance?.value;
    const durationSeconds: number | undefined =
      element.duration_in_traffic?.value ?? element.duration?.value;

    const miles =
      distanceMeters != null ? distanceMeters * 0.000621371 : null;
    const minutes =
      durationSeconds != null ? durationSeconds / 60 : null;

    return NextResponse.json({ miles, minutes });
  } catch (error: any) {
    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/1e534042-e897-4ae6-b5ee-59634a9d6b11", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "pre-fix",
        hypothesisId: "H-commute-api-error",
        location: "app/api/commute/route.ts:POST",
        message: "Server commute API failed",
        data: { error: String(error) },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    return NextResponse.json(
      { error: "Internal error while fetching commute" },
      { status: 500 }
    );
  }
}


