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

export function ApartmentsPageClient({ apartments: initialApartments }: Props) {
  const [apartments, setApartments] = useState<ApartmentWithPhotos[]>(initialApartments);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialApartments[0]?.id ?? null
  );

  const selectedApartment = useMemo(
    () => apartments.find((apt) => apt.id === selectedId) ?? null,
    [apartments, selectedId]
  );

  const handleApartmentUpdate = (updatedApartment: ApartmentWithPhotos) => {
    setApartments((prev) =>
      prev.map((apt) => (apt.id === updatedApartment.id ? updatedApartment : apt))
    );
  };

  const handleApartmentDelete = (apartmentId: string) => {
    setApartments((prev) => {
      const remaining = prev.filter((apt) => apt.id !== apartmentId);
      // Clear selection if the deleted apartment was selected
      if (selectedId === apartmentId) {
        setSelectedId(remaining[0]?.id ?? null);
      }
      return remaining;
    });
  };

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
        <div className="mx-auto flex max-w-6xl flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 px-4 py-3">
          <div className="flex items-baseline gap-2">
            <h1 className="text-base sm:text-lg font-semibold text-zinc-900">
              Austin Housing Map
            </h1>
            <span className="text-xs text-zinc-500 hidden sm:inline">
              Track apartments vs Visa HQ
            </span>
          </div>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/austin"
              className="rounded-full bg-zinc-900 px-4 py-2.5 sm:py-1.5 text-xs sm:text-xs font-medium text-white shadow-sm hover:bg-zinc-800 min-h-[44px] sm:min-h-0 flex items-center justify-center"
            >
              Map
            </Link>
            <Link
              href="/austin/apartments/new"
              className="rounded-full border border-emerald-500 bg-emerald-50 px-4 py-2.5 sm:py-1.5 text-xs sm:text-xs font-medium text-emerald-700 hover:bg-emerald-100 min-h-[44px] sm:min-h-0 flex items-center justify-center"
            >
              Add apartment
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-3 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4 md:flex-row">
        <section className="h-64 sm:h-80 w-full md:h-[calc(100vh-6rem)] md:flex-1">
          <MapView
            apartments={markers}
            selectedApartmentId={selectedId}
            onSelectApartment={setSelectedId}
          />
        </section>

        <section className="flex w-full flex-col gap-3 md:h-[calc(100vh-6rem)] md:w-[380px]">
          <ApartmentDetailsPanel 
            apartment={selectedApartment} 
            onUpdate={handleApartmentUpdate}
            onDelete={handleApartmentDelete}
          />
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


