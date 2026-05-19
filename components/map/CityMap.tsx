"use client";

import { useState } from "react";
import type { CityData } from "@/lib/data/network";
import { Globe, type GlobeMarker } from "./Globe";
import { CityPanel } from "./CityPanel";
import { cn } from "@/lib/utils";

/** Real geographic coordinates for each city in the network. */
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  sf: { lat: 37.7595, lng: -122.4367 },
  austin: { lat: 30.2672, lng: -97.7431 },
  nyc: { lat: 40.7128, lng: -74.006 },
  toronto: { lat: 43.6532, lng: -79.3832 },
  london: { lat: 51.5074, lng: -0.1278 },
  dubai: { lat: 25.2048, lng: 55.2708 },
  karachi: { lat: 24.8607, lng: 67.0011 },
};

export function CityMap({
  cities,
  compact = false,
}: {
  cities: CityData[];
  compact?: boolean;
}) {
  const [selected, setSelected] = useState<CityData | null>(null);

  const markers: GlobeMarker[] = cities
    .map((c) => {
      const coord = CITY_COORDS[c.id];
      if (!coord) return null;
      return {
        id: c.id,
        name: c.name,
        lat: coord.lat,
        lng: coord.lng,
        size: c.isHub ? 0.085 : 0.055,
      };
    })
    .filter(Boolean) as GlobeMarker[];

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-xl2 border border-paper-line bg-paper-deep">
        <div
          className={cn(
            "flex items-center justify-center px-6 py-8",
            compact
              ? "min-h-[360px] sm:min-h-[440px]"
              : "min-h-[480px] sm:min-h-[640px]",
          )}
        >
          <Globe markers={markers} size={compact ? 420 : 600} />
        </div>

        <div className="relative border-t border-paper-line bg-paper-warm/40 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 pt-3">
            <span className="text-[10px] uppercase tracking-[0.18em] text-ink-muted">
              Click any city
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-ink-muted">
              {cities.length} active · drag globe to rotate
            </span>
          </div>
          <div
            className="flex gap-2 overflow-x-auto px-4 pb-3 pt-2"
            style={{ scrollbarWidth: "thin" }}
          >
            {cities
              .slice()
              .sort((a, b) => b.builderCount - a.builderCount)
              .map((c) => (
                <CityChip
                  key={c.id}
                  city={c}
                  onClick={() => setSelected(c)}
                />
              ))}
          </div>
        </div>
      </div>

      <CityPanel city={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function CityChip({
  city,
  onClick,
}: {
  city: CityData;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] transition-colors",
        city.isHub
          ? "border-moss-500/40 bg-moss-50 text-ink hover:border-moss-500/70"
          : "border-paper-line bg-paper text-ink-soft hover:border-ink/20 hover:bg-paper-warm hover:text-ink",
      )}
    >
      <span className="relative inline-flex h-1.5 w-1.5">
        <span
          className="absolute inset-0 animate-ping rounded-full bg-moss-500/40"
          style={{ animationDuration: `${(2 + city.pulse * 3).toFixed(2)}s` }}
        />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-moss-500" />
      </span>
      <span className="font-medium">{city.name}</span>
      <span className="text-ink-muted">·</span>
      <span className="tabular-nums font-medium">{city.builderCount}</span>
      <span className="text-[10px] uppercase tracking-[0.14em] text-ink-muted">
        builders
      </span>
    </button>
  );
}
