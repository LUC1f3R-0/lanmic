"use client";

import dynamic from "next/dynamic";

/**
 * Leaflet reads `window` when its module loads. This wrapper keeps `FreeMapInner`
 * (and `leaflet`) out of the SSR prerender graph via `ssr: false`.
 */
const FreeMapInner = dynamic(() => import("./FreeMapInner"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse rounded-2xl bg-gray-100" aria-hidden />
  ),
});

export interface FreeMapProps {
  center: [number, number];
  zoom: number;
  className?: string;
}

export default function FreeMap({ center, zoom, className }: FreeMapProps) {
  return (
    <div className={className}>
      <FreeMapInner center={center} zoom={zoom} />
    </div>
  );
}
