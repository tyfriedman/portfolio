import type { ApartmentWithPhotos } from "@/austin/lib/db/apartments";

interface Props {
  apartments: ApartmentWithPhotos[];
  selectedApartmentId?: string | null;
  onSelectApartment?: (id: string) => void;
}

export function ApartmentList({
  apartments,
  selectedApartmentId,
  onSelectApartment,
}: Props) {
  if (apartments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-500">
        No apartments yet. Use the “Add apartment” button above to create one.
      </div>
    );
  }

  return (
    <div className="flex max-h-64 flex-col gap-2 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-2 text-sm shadow-sm">
      {apartments.map((apt) => {
        const isSelected = apt.id === selectedApartmentId;
        return (
          <button
            key={apt.id}
            type="button"
            onClick={() => onSelectApartment?.(apt.id)}
            className={`flex w-full items-start justify-between rounded-lg px-3 py-2 text-left transition ${
              isSelected
                ? "bg-emerald-50 ring-1 ring-emerald-400"
                : "hover:bg-zinc-50"
            }`}
          >
            <div>
              <div className="text-sm font-medium text-zinc-900">
                {apt.title}
              </div>
              <div className="text-xs text-zinc-600">{apt.address}</div>
            </div>
            <div className="flex flex-col items-end gap-1 text-xs text-zinc-700">
              {apt.monthly_rent != null && (
                <span>${apt.monthly_rent.toLocaleString()}</span>
              )}
              {apt.drive_miles_to_office != null && (
                <span>{apt.drive_miles_to_office.toFixed(1)} mi</span>
              )}
              {apt.drive_minutes_to_office != null && (
                <span>{Math.round(apt.drive_minutes_to_office)} min</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}


