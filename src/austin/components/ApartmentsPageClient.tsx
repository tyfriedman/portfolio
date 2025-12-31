"use client";

import { useMemo, useState } from "react";
import type { ApartmentWithPhotos } from "@/austin/lib/db/apartments";
import { MapView } from "@/austin/components/MapView";
import { ApartmentDetailsPanel } from "@/austin/components/ApartmentDetailsPanel";
import { ApartmentList } from "@/austin/components/ApartmentList";
import Link from "next/link";

interface Props {
  apartments: ApartmentWithPhotos[];
}

export function ApartmentsPageClient({ apartments }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(
    apartments[0]?.id ?? null
  );

  const selectedApartment = useMemo(
    () => apartments.find((apt) => apt.id === selectedId) ?? null,
    [apartments, selectedId]
  );

  const markers = useMemo(
    () =>
      apartments.map((apt) => ({
        id: apt.id,
        lat: apt.lat,
        lng: apt.lng,
        title: apt.title,
      })),
    [apartments]
  );

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-baseline gap-2">
            <h1 className="text-lg font-semibold text-zinc-900">
              Austin Housing Map
            </h1>
            <span className="text-xs text-zinc-500">
              Track apartments vs Visa HQ
            </span>
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/austin"
              className="rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-zinc-800"
            >
              Map
            </Link>
            <Link
              href="/austin/apartments/new"
              className="rounded-full border border-emerald-500 bg-emerald-50 px-4 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
            >
              Add apartment
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-4 md:flex-row">
        <section className="h-80 w-full md:h-[calc(100vh-6rem)] md:flex-1">
          <MapView
            apartments={markers}
            selectedApartmentId={selectedId}
            onSelectApartment={setSelectedId}
          />
        </section>

        <section className="flex w-full flex-col gap-3 md:h-[calc(100vh-6rem)] md:w-[380px]">
          <ApartmentDetailsPanel apartment={selectedApartment} />
          <ApartmentList
            apartments={apartments}
            selectedApartmentId={selectedId}
            onSelectApartment={setSelectedId}
          />
        </section>
      </main>
    </div>
  );
}


