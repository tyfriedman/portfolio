"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { VISA_HQ_LAT, VISA_HQ_LNG } from "@/austin/lib/constants";

export interface MapApartmentMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
}

interface MapViewProps {
  apartments: MapApartmentMarker[];
  selectedApartmentId?: string | null;
  onSelectApartment?: (id: string) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export function MapView({
  apartments,
  selectedApartmentId,
  onSelectApartment,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    const hasGoogle = typeof window !== "undefined" && !!window.google;

    // #region agent log
    fetch("http://127.0.0.1:7243/ingest/1e534042-e897-4ae6-b5ee-59634a9d6b11", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "pre-fix",
        hypothesisId: "H-map-init-timing",
        location: "components/MapView.tsx:useEffect-init",
        message: "Map init effect ran",
        data: {
          hasGoogle,
          hasMapRef: !!mapRef.current,
          hasMapInstance: !!mapInstanceRef.current,
          scriptLoaded,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    if (!scriptLoaded || !hasGoogle || !mapRef.current || mapInstanceRef.current) {
      return;
    }

    const center = { lat: VISA_HQ_LAT, lng: VISA_HQ_LNG };

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 11,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    // Office marker
    new window.google.maps.Marker({
      position: { lat: VISA_HQ_LAT, lng: VISA_HQ_LNG },
      map: mapInstanceRef.current,
      title: "Visa HQ (office)",
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: "#2563eb",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      },
    });
  }, [scriptLoaded]);

  useEffect(() => {
    const hasGoogle = typeof window !== "undefined" && !!window.google;
    if (!scriptLoaded || !hasGoogle || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      marker.setMap(null);
    });
    markersRef.current.clear();

    apartments.forEach((apt) => {
      const marker = new window.google.maps.Marker({
        position: { lat: apt.lat, lng: apt.lng },
        map,
        title: apt.title,
      });

      marker.addListener("click", () => {
        onSelectApartment?.(apt.id);
      });

      markersRef.current.set(apt.id, marker);
    });
  }, [apartments, onSelectApartment, scriptLoaded]);

  useEffect(() => {
    if (!mapInstanceRef.current || !selectedApartmentId) return;
    const marker = markersRef.current.get(selectedApartmentId);
    if (marker) {
      mapInstanceRef.current.panTo(marker.getPosition());
      mapInstanceRef.current.setZoom(13);
    }
  }, [selectedApartmentId]);

  if (!apiKey) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-sm text-zinc-700">
        Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment to see the map.
      </div>
    );
  }

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}`}
        strategy="afterInteractive"
        onError={() => {
          setScriptError("Failed to load Google Maps JS. Check your API key.");
          // #region agent log
          fetch("http://127.0.0.1:7243/ingest/1e534042-e897-4ae6-b5ee-59634a9d6b11", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: "debug-session",
              runId: "pre-fix",
              hypothesisId: "H-map-script",
              location: "components/MapView.tsx:Script",
              message: "Map script load error",
              data: {},
              timestamp: Date.now(),
            }),
          }).catch(() => {});
          // #endregion
        }}
        onLoad={() => {
          setScriptLoaded(true);
          // #region agent log
          fetch("http://127.0.0.1:7243/ingest/1e534042-e897-4ae6-b5ee-59634a9d6b11", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: "debug-session",
              runId: "pre-fix",
              hypothesisId: "H-map-script",
              location: "components/MapView.tsx:Script",
              message: "Map script loaded",
              data: {},
              timestamp: Date.now(),
            }),
          }).catch(() => {});
          // #endregion
        }}
      />
      {scriptError ? (
        <div className="flex h-full w-full items-center justify-center rounded-xl border border-red-200 bg-red-50 text-sm text-red-700">
          {scriptError}
        </div>
      ) : (
        <div
          ref={mapRef}
          className="h-full w-full rounded-xl border border-zinc-200"
        />
      )}
    </>
  );
}


