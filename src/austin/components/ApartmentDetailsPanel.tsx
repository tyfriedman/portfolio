import Image from "next/image";
import type { ApartmentWithPhotos } from "@/austin/lib/db/apartments";

interface Props {
  apartment: ApartmentWithPhotos | null;
}

export function ApartmentDetailsPanel({ apartment }: Props) {
  if (!apartment) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-sm text-zinc-500">
        Select a pin on the map or an apartment from the list.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">{apartment.title}</h2>
        <p className="text-sm text-zinc-600">{apartment.address}</p>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-zinc-700">
        {apartment.monthly_rent != null && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Rent
            </div>
            <div>${apartment.monthly_rent.toLocaleString()}</div>
          </div>
        )}
        {(apartment.drive_miles_to_office != null ||
          apartment.drive_minutes_to_office != null) && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Commute (driving)
            </div>
            <div>
              {apartment.drive_miles_to_office != null && (
                <span>{apartment.drive_miles_to_office.toFixed(1)} mi</span>
              )}
              {apartment.drive_minutes_to_office != null && (
                <span>
                  {" "}
                  · {Math.round(apartment.drive_minutes_to_office)} min
                </span>
              )}
            </div>
          </div>
        )}
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Status
          </div>
          <div className="capitalize">{apartment.status}</div>
        </div>
      </div>

      {apartment.notes && (
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Notes
          </div>
          <p className="whitespace-pre-line text-sm text-zinc-700">
            {apartment.notes}
          </p>
        </div>
      )}

      {apartment.photos.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Photos
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {apartment.photos.map((photo) => (
              <div key={photo.id} className="relative h-32 w-44 flex-shrink-0 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100">
                <Image
                  src={photo.public_url}
                  alt={photo.caption || apartment.title}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


