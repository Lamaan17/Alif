"use client";

import { useState } from "react";
import type { CityData } from "@/lib/data/network";
import { cn } from "@/lib/utils";
import { CityPanel } from "./CityPanel";

type Connection = readonly [string, string];

const CONNECTIONS: Connection[] = [
  ["sf", "austin"],
  ["sf", "nyc"],
  ["austin", "nyc"],
  ["nyc", "toronto"],
  ["nyc", "london"],
  ["toronto", "london"],
  ["london", "dubai"],
  ["dubai", "karachi"],
  ["london", "karachi"],
];

export function CityMap({
  cities,
  compact = false,
}: {
  cities: CityData[];
  compact?: boolean;
}) {
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);

  const byId = new Map(cities.map((c) => [c.id, c]));

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-xl2 border border-paper-line bg-paper">
        {/* Faint dotted backdrop */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid-faint [background-size:24px_24px] opacity-30"
        />
        {/* Radial glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 60%, rgba(122,181,143,0.10), transparent 55%)",
          }}
        />

        <svg
          viewBox="0 0 800 400"
          className={cn(
            "relative block w-full",
            compact ? "h-[280px] sm:h-[360px]" : "h-[400px] sm:h-[520px]",
          )}
          role="img"
          aria-label="ALIF builder network map"
        >
          <defs>
            <linearGradient id="conn-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="50%" stopColor="rgba(122,181,143,0.50)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <radialGradient id="node-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(122,181,143,0.7)" />
              <stop offset="60%" stopColor="rgba(122,181,143,0.15)" />
              <stop offset="100%" stopColor="rgba(122,181,143,0)" />
            </radialGradient>
          </defs>

          {/* Connecting lines */}
          {CONNECTIONS.map(([a, b], i) => {
            const A = byId.get(a);
            const B = byId.get(b);
            if (!A || !B) return null;
            // curve control point — pull the midpoint slightly toward the top
            const cx = (A.x + B.x) / 2;
            const cy = (A.y + B.y) / 2 - Math.abs(A.x - B.x) * 0.12;
            return (
              <path
                key={i}
                d={`M ${A.x} ${A.y} Q ${cx} ${cy} ${B.x} ${B.y}`}
                fill="none"
                stroke="url(#conn-grad)"
                strokeWidth={1}
                strokeLinecap="round"
                className="connection"
                style={{ animationDelay: `${i * 0.4}s` }}
              />
            );
          })}

          {/* City nodes */}
          {cities.map((c, i) => {
            const baseR = c.isHub ? 5.5 : 4;
            const glowR = c.isHub ? 28 : 22;
            return (
              <g
                key={c.id}
                onClick={() => setSelectedCity(c)}
                className="cursor-pointer"
              >
                {/* outer glow */}
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={glowR}
                  fill="url(#node-glow)"
                  className="city-glow"
                  style={{ animationDelay: `${i * 0.25}s` }}
                />
                {/* core dot */}
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={baseR}
                  fill="#FFFFFF"
                  className="transition-transform hover:scale-125"
                  style={{ transformOrigin: `${c.x}px ${c.y}px` }}
                />
                {/* label */}
                <text
                  x={c.x}
                  y={c.y - (c.isHub ? 14 : 11)}
                  textAnchor="middle"
                  className="fill-ink-soft text-[9px] font-medium uppercase tracking-[0.14em]"
                  style={{ pointerEvents: "none" }}
                >
                  {c.name}
                </text>
                <text
                  x={c.x}
                  y={c.y + (c.isHub ? 18 : 15)}
                  textAnchor="middle"
                  className="fill-ink-muted text-[9px]"
                  style={{ pointerEvents: "none" }}
                >
                  {c.builderCount} builders
                </text>
              </g>
            );
          })}
        </svg>

        {compact && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex items-center justify-between gap-3 border-t border-paper-line bg-paper-warm/60 px-4 py-2.5 backdrop-blur">
            <span className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">
              Click any city
            </span>
            <span className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">
              {cities.length} active cities
            </span>
          </div>
        )}
      </div>

      <CityPanel
        city={selectedCity}
        onClose={() => setSelectedCity(null)}
      />

      <style jsx>{`
        @keyframes cityPulse {
          0%, 100% {
            opacity: 0.35;
            transform: scale(1);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.18);
          }
        }
        @keyframes connFlow {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.75; }
        }
        .city-glow {
          transform-origin: var(--cx) var(--cy);
          transform-box: fill-box;
          animation: cityPulse 4s ease-in-out infinite;
        }
        .connection {
          animation: connFlow 6s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .city-glow, .connection { animation: none; }
        }
      `}</style>
    </div>
  );
}
