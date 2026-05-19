"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  X,
  MapPin,
  Users,
  Sparkles,
  Coffee,
  CalendarHeart,
  BadgeCheck,
  ArrowUpRight,
  Loader2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import type { CityData } from "@/lib/data/network";
import { BadgeChip } from "@/components/badges/BadgeChip";
import { LevelPill } from "@/components/badges/LevelPill";
import { ROLE_TYPES, labelFor } from "@/lib/profile-options";
import { cn } from "@/lib/utils";

type Detail = {
  featuredBuilders: Array<{
    id: string;
    full_name: string;
    avatar_url: string | null;
    role_type: string | null;
    verified: boolean;
    level: number;
  }>;
  activeProjectsCount: number;
  upcomingSprintTitle: string | null;
  upcomingSprintHref: string | null;
  coworkSession: string;
  eventAttendeeCount: number;
  topBadges: Array<{ kind: string; count: number }>;
};

export function CityPanel({
  city,
  onClose,
}: {
  city: CityData | null;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(false);

  // Esc to close
  useEffect(() => {
    if (!city) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [city, onClose]);

  // Fetch detail when a city opens
  useEffect(() => {
    if (!city) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/city/${city.id}`);
        if (!res.ok) throw new Error("fetch failed");
        const data = (await res.json()) as Detail;
        if (!cancelled) setDetail(data);
      } catch {
        if (!cancelled) setDetail(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [city]);

  const supabase = createClient();
  const open = !!city;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 transition-opacity",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!open}
    >
      {/* backdrop */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute inset-0 bg-paper-deep/50 backdrop-blur-sm"
      />

      {/* side panel */}
      <aside
        role="dialog"
        aria-modal="true"
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-paper-line bg-paper-deep p-6 shadow-cardHover transition-transform sm:p-7",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {city && (
          <>
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-paper-line bg-paper-warm px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-ink-soft">
                  <MapPin className="h-3 w-3" />
                  {city.country}
                </div>
                <h2
                  className="mt-3 font-display text-3xl font-semibold tracking-tight"
                  style={{ letterSpacing: "-0.03em" }}
                >
                  {city.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:bg-paper-warm hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-paper-line bg-paper-line">
              <Stat label="Builders" value={city.builderCount} />
              <Stat
                label="Open projects"
                value={detail?.activeProjectsCount ?? "—"}
              />
            </div>

            {/* Featured builders */}
            <Section title="Featured builders">
              {loading ? (
                <Loading />
              ) : detail && detail.featuredBuilders.length > 0 ? (
                <ul className="space-y-2">
                  {detail.featuredBuilders.map((b) => {
                    const avatar = b.avatar_url
                      ? supabase.storage.from("avatars").getPublicUrl(b.avatar_url).data.publicUrl
                      : null;
                    const initials = b.full_name
                      .split(/\s+/)
                      .map((p) => p[0])
                      .filter(Boolean)
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();
                    return (
                      <li key={b.id}>
                        <Link
                          href={`/builders/${b.id}`}
                          onClick={onClose}
                          className="flex items-center gap-3 rounded-lg border border-paper-line bg-paper-warm/40 px-3 py-2 transition-colors hover:border-ink/15 hover:bg-paper-warm"
                        >
                          <span className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-paper-deep">
                            {avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={avatar} alt={b.full_name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="font-display text-[12px] font-semibold">{initials}</span>
                            )}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate text-sm font-medium text-ink">{b.full_name}</span>
                              {b.verified && <BadgeCheck className="h-3 w-3 text-moss-500" />}
                            </div>
                            <div className="text-[11px] text-ink-muted">
                              {labelFor(ROLE_TYPES, b.role_type)}
                            </div>
                          </div>
                          <LevelPill level={b.level} size="sm" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <Empty>Builders are forming in this city. Be among the first.</Empty>
              )}
            </Section>

            {/* Upcoming sprint */}
            <Section title="Upcoming sprint">
              {detail?.upcomingSprintTitle ? (
                <Link
                  href={detail.upcomingSprintHref ?? "/sprints"}
                  onClick={onClose}
                  className="group flex items-center justify-between gap-3 rounded-lg border border-paper-line bg-paper-warm/40 px-3 py-2.5 transition-colors hover:border-ink/15 hover:bg-paper-warm"
                >
                  <span className="inline-flex items-center gap-2 text-sm">
                    <Sparkles className="h-3.5 w-3.5 text-moss-500" />
                    <span className="font-medium text-ink">{detail.upcomingSprintTitle}</span>
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-ink-muted group-hover:text-ink" />
                </Link>
              ) : (
                <Empty>No upcoming sprint right now.</Empty>
              )}
            </Section>

            {/* Cowork session */}
            <Section title="Cowork / build session">
              <div className="flex items-center gap-2 rounded-lg border border-paper-line bg-paper-warm/40 px-3 py-2.5 text-sm">
                <Coffee className="h-3.5 w-3.5 text-ink-muted" />
                <span className="text-ink">{detail?.coworkSession ?? "—"}</span>
              </div>
            </Section>

            {/* Event participation */}
            <Section title="ALIF event participation">
              <div className="flex items-center justify-between rounded-lg border border-paper-line bg-paper-warm/40 px-3 py-2.5 text-sm">
                <span className="inline-flex items-center gap-2 text-ink-soft">
                  <CalendarHeart className="h-3.5 w-3.5 text-ink-muted" />
                  Event attendees in {city.name}
                </span>
                <span className="font-display text-base font-semibold text-ink">
                  {detail?.eventAttendeeCount ?? 0}
                </span>
              </div>
            </Section>

            {/* Top badges */}
            <Section title="Top badges in this city">
              {detail && detail.topBadges.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {detail.topBadges.map((b) => (
                    <span key={b.kind} className="inline-flex items-center gap-1.5">
                      <BadgeChip kind={b.kind} size="sm" />
                      <span className="text-[10px] text-ink-muted">×{b.count}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <Empty>Badges will appear here as builders earn them.</Empty>
              )}
            </Section>

            <div className="mt-auto pt-6 flex flex-col gap-2 sm:flex-row">
              <Link href={`/builders?tz=${encodeURIComponent("")}`} onClick={onClose} className="btn-primary flex-1">
                <Users className="h-4 w-4" />
                See all builders
              </Link>
              <Link href="/sprints" onClick={onClose} className="btn-secondary flex-1">
                Join a sprint
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink-muted">
        {title}
      </div>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-paper-warm px-4 py-3">
      <div className="font-display text-2xl font-semibold tracking-tight text-ink">{value}</div>
      <div className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-ink-muted">{label}</div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] text-ink-muted">{children}</p>;
}

function Loading() {
  return (
    <div className="inline-flex items-center gap-2 text-[12px] text-ink-muted">
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
      Loading…
    </div>
  );
}
