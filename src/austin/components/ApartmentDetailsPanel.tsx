"use client";

import { useState } from "react";
import Image from "next/image";
import type { ApartmentWithPhotos, ApartmentStatus } from "@/austin/lib/db/apartments";

interface Props {
  apartment: ApartmentWithPhotos | null;
  onUpdate?: (apartment: ApartmentWithPhotos) => void;
  onDelete?: (apartmentId: string) => void;
}

async function fetchCommuteEstimate(lat: number, lng: number): Promise<{
  miles: number | null;
  minutes: number | null;
}> {
  try {
    const res = await fetch("/api/commute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lng }),
    });

    if (!res.ok) {
      return { miles: null, minutes: null };
    }

    const data = await res.json();
    return { miles: data.miles ?? null, minutes: data.minutes ?? null };
  } catch (err: any) {
    throw new Error(
      "Commute lookup failed. Check Google Maps Distance Matrix API access and network."
    );
  }
}

export function ApartmentDetailsPanel({ apartment, onUpdate, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshingCommute, setIsRefreshingCommute] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [editRent, setEditRent] = useState("");
  const [editStatus, setEditStatus] = useState<ApartmentStatus>("prospect");

  if (!apartment) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-sm text-zinc-500">
        Select a pin on the map or an apartment from the list.
      </div>
    );
  }

  const handleEditClick = () => {
    setEditNotes(apartment.notes || "");
    setEditRent(apartment.monthly_rent?.toString() || "");
    setEditStatus(apartment.status);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditNotes(apartment.notes || "");
    setEditRent(apartment.monthly_rent?.toString() || "");
    setEditStatus(apartment.status);
  };

  const handleSave = async () => {
    if (!onUpdate) return;
    
    setIsSaving(true);
    try {
      const { updateApartment } = await import("@/austin/lib/db/apartments");
      
      const parsedRent = editRent.trim() === "" ? null : Number(editRent.trim());
      
      await updateApartment(apartment.id, {
        notes: editNotes.trim() || null,
        monthly_rent: parsedRent,
        status: editStatus,
      });

      const updatedApartment: ApartmentWithPhotos = {
        ...apartment,
        notes: editNotes.trim() || null,
        monthly_rent: parsedRent,
        status: editStatus,
      };

      onUpdate(updatedApartment);
      setIsEditing(false);
    } catch (err: any) {
      console.error("Failed to update apartment:", err);
      alert("Failed to update apartment. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefreshCommute = async () => {
    if (!onUpdate) return;
    
    setIsRefreshingCommute(true);
    try {
      const { miles, minutes } = await fetchCommuteEstimate(apartment.lat, apartment.lng);
      
      const { updateApartment } = await import("@/austin/lib/db/apartments");
      await updateApartment(apartment.id, {
        drive_miles_to_office: miles,
        drive_minutes_to_office: minutes,
      });

      const updatedApartment: ApartmentWithPhotos = {
        ...apartment,
        drive_miles_to_office: miles,
        drive_minutes_to_office: minutes,
      };

      onUpdate(updatedApartment);
    } catch (err: any) {
      console.error("Failed to refresh commute:", err);
      alert("Failed to refresh commute. Please try again.");
    } finally {
      setIsRefreshingCommute(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete "${apartment.title}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    setIsDeleting(true);
    try {
      const { deleteApartment } = await import("@/austin/lib/db/apartments");
      await deleteApartment(apartment.id);
      onDelete(apartment.id);
    } catch (err: any) {
      console.error("Failed to delete apartment:", err);
      alert("Failed to delete apartment. Please try again.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-2.5 sm:gap-3 rounded-xl border border-zinc-200 bg-white p-3 sm:p-4 shadow-sm overflow-y-auto">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-lg font-semibold text-zinc-900 break-words">{apartment.title}</h2>
          <p className="text-xs sm:text-sm text-zinc-600 break-words mt-0.5">{apartment.address}</p>
        </div>
        {!isEditing ? (
          <button
            onClick={handleEditClick}
            className="flex-shrink-0 text-xs sm:text-sm font-medium text-emerald-700 hover:text-emerald-800 px-2 py-1.5 sm:px-3 sm:py-2 flex items-center justify-center rounded-md hover:bg-emerald-50 transition-colors"
            title="Edit apartment details"
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="text-xs sm:text-sm font-medium text-zinc-600 hover:text-zinc-900 px-2 py-1.5 sm:px-3 sm:py-2 flex items-center justify-center rounded-md hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="text-xs sm:text-sm font-medium text-emerald-700 hover:text-emerald-800 px-2 py-1.5 sm:px-3 sm:py-2 flex items-center justify-center rounded-md hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs sm:text-sm">
        {isEditing ? (
          <>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-1.5">
                Rent
              </label>
              <input
                type="number"
                min={0}
                value={editRent}
                onChange={(e) => setEditRent(e.target.value)}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="e.g. 2300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-1.5">
                Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as ApartmentStatus)}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="prospect">Prospect</option>
                <option value="toured">Toured</option>
                <option value="applied">Applied</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </>
        ) : (
          <>
            {apartment.monthly_rent != null && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-0.5">
                  Rent
                </div>
                <div className="text-zinc-700">${apartment.monthly_rent.toLocaleString()}</div>
              </div>
            )}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-0.5">
                Status
              </div>
              <div className="capitalize text-zinc-700">{apartment.status}</div>
            </div>
          </>
        )}
        {(apartment.drive_miles_to_office != null ||
          apartment.drive_minutes_to_office != null ||
          isEditing) && (
          <div className={isEditing ? "sm:col-span-2" : ""}>
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-1.5">
              Commute (driving)
            </div>
            {apartment.drive_miles_to_office != null || apartment.drive_minutes_to_office != null ? (
              <div className="flex items-center gap-2 flex-wrap">
                <div className="text-zinc-700">
                  {apartment.drive_miles_to_office != null && (
                    <span>{apartment.drive_miles_to_office.toFixed(1)} mi</span>
                  )}
                  {apartment.drive_minutes_to_office != null && (
                    <span>
                      {apartment.drive_miles_to_office != null ? " · " : ""}
                      {Math.round(apartment.drive_minutes_to_office)} min
                    </span>
                  )}
                </div>
                <button
                  onClick={handleRefreshCommute}
                  disabled={isRefreshingCommute}
                  className="text-xs sm:text-sm font-medium text-emerald-700 hover:text-emerald-800 disabled:opacity-50 px-2 py-1 rounded-md hover:bg-emerald-50 transition-colors disabled:cursor-not-allowed flex items-center justify-center"
                  title="Refresh commute"
                >
                  {isRefreshingCommute ? (
                    <span className="inline-block animate-spin">↻</span>
                  ) : (
                    "↻"
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={handleRefreshCommute}
                disabled={isRefreshingCommute}
                className="text-xs sm:text-sm font-medium text-emerald-700 hover:text-emerald-800 disabled:opacity-50 px-3 py-2 rounded-md border border-emerald-300 hover:bg-emerald-50 transition-colors disabled:cursor-not-allowed w-full sm:w-auto"
                title="Calculate commute"
              >
                {isRefreshingCommute ? "Calculating..." : "Calculate commute"}
              </button>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-1.5">
              Notes
            </label>
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-y"
              placeholder="Tour impressions, pros/cons, parking, noise, etc."
            />
          </div>
          <div className="pt-2 border-t border-zinc-200">
            <button
              onClick={handleDelete}
              disabled={isDeleting || isSaving}
              className="w-full text-xs sm:text-sm font-medium text-red-700 hover:text-red-800 disabled:opacity-50 px-3 py-2 rounded-md border border-red-300 hover:bg-red-50 transition-colors disabled:cursor-not-allowed"
            >
              {isDeleting ? "Deleting..." : "Delete Apartment"}
            </button>
          </div>
        </>
      ) : (
        apartment.notes && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-1">
              Notes
            </div>
            <p className="whitespace-pre-line text-xs sm:text-sm text-zinc-700 break-words">
              {apartment.notes}
            </p>
          </div>
        )
      )}

      {apartment.photos.length > 0 && (
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-2">
            Photos
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory">
            {apartment.photos.map((photo) => (
              <div key={photo.id} className="relative h-20 w-28 sm:h-28 sm:w-40 flex-shrink-0 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 snap-start">
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


