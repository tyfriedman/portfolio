"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createApartmentWithPhotos } from "@/austin/lib/db/apartments";
import { VISA_HQ_LAT, VISA_HQ_LNG } from "@/austin/lib/constants";

interface PhotoField {
  id: number;
  url: string;
  caption: string;
}

async function geocodeAddress(address: string): Promise<{
  lat: number;
  lng: number;
}> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Google Maps API key is not set. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY."
    );
  }

  const params = new URLSearchParams({
    address,
    key: apiKey,
  });

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`
  );
  const data = await res.json();

  if (data.status !== "OK" || data.results.length === 0) {
    throw new Error(
      "Could not geocode that address. Check the address formatting or your Google Maps API key."
    );
  }

  const location = data.results[0].geometry.location;
  return { lat: location.lat, lng: location.lng };
}

async function fetchCommuteEstimate(lat: number, lng: number): Promise<{
  miles: number | null;
  minutes: number | null;
}> {
  try {
    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/1e534042-e897-4ae6-b5ee-59634a9d6b11", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "pre-fix",
        hypothesisId: "H-distancematrix-fetch",
        location: "app/apartments/new/page.tsx:fetchCommuteEstimate",
        message: "Calling /api/commute",
        data: { lat, lng },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    const res = await fetch("/api/commute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lng }),
    });

    if (!res.ok) {
      // #region agent log
      fetch("http://127.0.0.1:7243/ingest/1e534042-e897-4ae6-b5ee-59634a9d6b11", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "debug-session",
          runId: "pre-fix",
          hypothesisId: "H-distancematrix-result",
          location: "app/apartments/new/page.tsx:fetchCommuteEstimate",
          message: "Commute API returned non-OK",
          data: { status: res.status },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      return { miles: null, minutes: null };
    }

    const data = await res.json();
    const miles: number | null = data.miles ?? null;
    const minutes: number | null = data.minutes ?? null;

    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/1e534042-e897-4ae6-b5ee-59634a9d6b11", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "pre-fix",
        hypothesisId: "H-distancematrix-success",
        location: "app/apartments/new/page.tsx:fetchCommuteEstimate",
        message: "Distance Matrix success",
        data: { miles, minutes },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    return { miles, minutes };
  } catch (err: any) {
    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/1e534042-e897-4ae6-b5ee-59634a9d6b11", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "pre-fix",
        hypothesisId: "H-distancematrix-error",
        location: "app/apartments/new/page.tsx:fetchCommuteEstimate",
        message: "Distance Matrix fetch failed",
        data: { error: String(err) },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    throw new Error(
      "Commute lookup failed. Check Google Maps Distance Matrix API access and network."
    );
  }
}

export default function NewApartmentPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [monthlyRent, setMonthlyRent] = useState<string>("");
  const [status, setStatus] = useState<"prospect" | "toured" | "applied" | "approved" | "rejected">("prospect");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<PhotoField[]>([
    { id: 1, url: "", caption: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddPhotoField = () => {
    setPhotos((prev) => [
      ...prev,
      { id: Date.now(), url: "", caption: "" },
    ]);
  };

  const handlePhotoChange = (
    id: number,
    field: "url" | "caption",
    value: string
  ) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!title.trim() || !address.trim()) {
        throw new Error("Title and address are required.");
      }

      const { lat, lng } = await geocodeAddress(address.trim());
      const { miles, minutes } = await fetchCommuteEstimate(lat, lng);

      const parsedRent =
        monthlyRent.trim() === "" ? null : Number(monthlyRent.trim());

      const photoInputs = photos
        .filter((p) => p.url.trim() !== "")
        .map((p) => ({
          public_url: p.url.trim(),
          caption: p.caption.trim() || null,
        }));

      await createApartmentWithPhotos({
        title: title.trim(),
        address: address.trim(),
        lat,
        lng,
        monthly_rent: parsedRent,
        notes: notes.trim() || null,
        status,
        distance_km_to_office: null,
        drive_miles_to_office: miles,
        drive_minutes_to_office: minutes,
        photos: photoInputs,
      });

      router.push("/austin");
    } catch (err: any) {
      console.error(err);
      setError(
        err.message || "Something went wrong while saving the apartment."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <h1 className="text-base sm:text-lg font-semibold text-zinc-900">
            Add apartment
          </h1>
          <button
            type="button"
            onClick={() => router.push("/austin")}
            className="text-xs sm:text-sm text-zinc-600 hover:text-zinc-900 min-h-[44px] px-2 sm:px-0"
          >
            Back to map
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 px-3 sm:px-4 py-3 sm:py-4">
        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col gap-3 sm:gap-4 rounded-xl border border-zinc-200 bg-white p-3 sm:p-4 shadow-sm"
        >
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs sm:text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-zinc-800">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-md border border-zinc-300 px-3 py-2.5 sm:py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[44px]"
                placeholder="e.g. Domain apartments – 2BR"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-zinc-800">
                Monthly rent (USD)
              </label>
              <input
                type="number"
                min={0}
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
                className="rounded-md border border-zinc-300 px-3 py-2.5 sm:py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[44px]"
                placeholder="e.g. 2300"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium text-zinc-800">
              Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="rounded-md border border-zinc-300 px-3 py-2.5 sm:py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[44px]"
              placeholder="Street, city, state"
              required
            />
            <p className="text-xs text-zinc-500 mt-1">
              Used to place the pin on the map and compute distance to Visa HQ.
            </p>
          </div>

          <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-medium text-zinc-800">
                Status
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as typeof status)
                }
                className="rounded-md border border-zinc-300 px-3 py-2.5 sm:py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[44px]"
              >
                <option value="prospect">Prospect</option>
                <option value="toured">Toured</option>
                <option value="applied">Applied</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-medium text-zinc-800">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="rounded-md border border-zinc-300 px-3 py-2.5 sm:py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-y"
              placeholder="Tour impressions, pros/cons, parking, noise, etc."
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-medium text-zinc-800">
                Photos (image URLs)
              </label>
              <button
                type="button"
                onClick={handleAddPhotoField}
                className="text-xs font-medium text-emerald-700 hover:text-emerald-800 min-h-[44px] px-2 sm:px-0"
              >
                + Add photo
              </button>
            </div>
            <p className="text-xs text-zinc-500">
              Paste full image URLs from listings for now. You can switch to file
              uploads later using Supabase Storage.
            </p>
            <div className="flex flex-col gap-2">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="grid gap-2 rounded-md border border-zinc-200 bg-zinc-50 p-2 grid-cols-1 md:grid-cols-5"
                >
                  <div className="md:col-span-3">
                    <input
                      type="url"
                      value={photo.url}
                      onChange={(e) =>
                        handlePhotoChange(photo.id, "url", e.target.value)
                      }
                      className="w-full rounded-md border border-zinc-300 px-3 py-2.5 sm:py-1.5 text-xs shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[44px] sm:min-h-0"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={photo.caption}
                      onChange={(e) =>
                        handlePhotoChange(photo.id, "caption", e.target.value)
                      }
                      className="w-full rounded-md border border-zinc-300 px-3 py-2.5 sm:py-1.5 text-xs shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[44px] sm:min-h-0"
                      placeholder="Caption (optional)"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => router.push("/austin")}
              className="rounded-full border border-zinc-300 px-4 py-2.5 sm:py-2 text-xs sm:text-xs font-medium text-zinc-700 hover:bg-zinc-100 min-h-[44px] sm:min-h-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-emerald-600 px-4 py-2.5 sm:py-2 text-xs sm:text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 min-h-[44px] sm:min-h-0"
            >
              {isSubmitting ? "Saving…" : "Save apartment"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}


