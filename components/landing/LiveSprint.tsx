"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Users, ArrowRight, Radio } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Sprint = {
  id: string;
  title: string;
  theme: string | null;
  description: string | null;
  start_date: string;
  end_date: string;
  status: "upcoming" | "live" | "completed";
  applicants: Array<{ id: string; full_name: string; avatar_url: string | null }>;
  applicantCount: number;
};

export function LiveSprint({ sprint }: { sprint: Sprint }) {
  // Countdown target depends on status:
  // - upcoming → countdown to start_date
  // - live     → countdown to end_date
  // - completed→ no countdown
  const targetISO =
    sprint.status === "completed"
      ? null
      : sprint.status === "live"
      ? sprint.end_date
      : sprint.start_date;

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const remaining = targetISO
    ? Math.max(0, new Date(targetISO).getTime() - now)
    : 0;
  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((remaining / (1000 * 60)) % 60);
  const seconds = Math.floor((remaining / 1000) % 60);

  const supabase = createClient();

  const heading =
    sprint.status === "live"
      ? "Live sprint right now"
      : sprint.status === "upcoming"
      ? "Next build sprint"
      : "Latest sprint";

  return (
    <section className="container-prose py-16 sm:py-20">
      <div className="relative overflow-hidden rounded-xl2 border border-paper-line bg-paper p-6 shadow-card sm:p-8">
        {/* Subtle gradient wash */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 90% 10%, rgba(122,181,143,0.10), transparent 50%), radial-gradient(circle at 10% 100%, rgba(217,185,125,0.06), transparent 50%)",
          }}
        />

        <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1fr]">
          {/* Left: sprint details */}
          <div>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] ring-1 ring-inset",
                sprint.status === "live"
                  ? "bg-moss-50 text-moss-500 ring-moss-100"
                  : "bg-paper-warm text-ink-soft ring-paper-line",
              )}
            >
              {sprint.status === "live" ? (
                <>
                  <span className="relative inline-flex h-1.5 w-1.5">
                    <span className="absolute inset-0 animate-ping rounded-full bg-moss-500/70" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-moss-500" />
                  </span>
                  Live now
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3" />
                  {heading}
                </>
              )}
            </span>

            <h2
              className="mt-5 font-display font-semibold text-3xl leading-[1.05] text-ink sm:text-4xl md:text-5xl"
              style={{ letterSpacing: "-0.035em" }}
            >
              {sprint.title}
            </h2>

            {sprint.theme && (
              <p className="mt-3 text-base italic text-ink-soft sm:text-lg">
                “{sprint.theme}”
              </p>
            )}

            {sprint.description && (
              <p className="mt-4 line-clamp-3 text-[14px] leading-relaxed text-ink-muted">
                {sprint.description}
              </p>
            )}

            {/* Applicants strip */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex -space-x-2">
                {sprint.applicants.slice(0, 5).map((a) => {
                  const avatar = a.avatar_url
                    ? supabase.storage
                        .from("avatars")
                        .getPublicUrl(a.avatar_url).data.publicUrl
                    : null;
                  const initials = a.full_name
                    .split(/\s+/)
                    .map((p) => p[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
                  return (
                    <span
                      key={a.id}
                      title={a.full_name}
                      className="relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-ink text-paper-deep ring-2 ring-paper"
                    >
                      {avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatar} alt={a.full_name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="font-display text-[10px] font-semibold">{initials}</span>
                      )}
                    </span>
                  );
                })}
                {sprint.applicantCount > sprint.applicants.length && (
                  <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-paper-warm text-[10px] font-medium text-ink-muted ring-2 ring-paper">
                    +{sprint.applicantCount - sprint.applicants.length}
                  </span>
                )}
              </div>
              <div className="text-[12px] text-ink-muted">
                <span className="font-medium text-ink">
                  {sprint.applicantCount} builder
                  {sprint.applicantCount === 1 ? "" : "s"}
                </span>{" "}
                {sprint.status === "live" ? "in this cohort" : "applied so far"}
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={`/sprints/${sprint.id}`} className="btn-primary">
                {sprint.status === "live" ? "View Sprint" : "Join Sprint"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/builders" className="btn-secondary">
                <Users className="h-4 w-4" />
                Explore Builders
              </Link>
            </div>
          </div>

          {/* Right: countdown */}
          <div className="flex flex-col justify-center">
            <div className="rounded-xl2 border border-paper-line bg-paper-warm/60 p-6 backdrop-blur sm:p-7">
              <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-muted">
                {sprint.status === "live"
                  ? "Ends in"
                  : sprint.status === "upcoming"
                  ? "Starts in"
                  : "Wrapped"}
              </div>
              {sprint.status === "completed" ? (
                <div
                  className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink"
                  style={{ letterSpacing: "-0.04em" }}
                >
                  Completed
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-3">
                  <TimeBlock value={days} label="Days" />
                  <TimeBlock value={hours} label="Hrs" />
                  <TimeBlock value={minutes} label="Min" />
                  <TimeBlock value={seconds} label="Sec" />
                </div>
              )}

              <div className="mt-6 flex items-center justify-between border-t border-paper-line pt-4 text-[11px] uppercase tracking-[0.16em] text-ink-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Radio className="h-3 w-3" />
                  Live activity
                </span>
                <span>
                  {new Date(sprint.start_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                  {" → "}
                  {new Date(sprint.end_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  const padded = value.toString().padStart(2, "0");
  return (
    <div className="rounded-xl border border-paper-line bg-paper-deep px-2 py-3 text-center">
      <div
        className="font-display text-2xl font-semibold tabular-nums tracking-tight text-ink sm:text-3xl"
        style={{ letterSpacing: "-0.04em" }}
      >
        {padded}
      </div>
      <div className="mt-1 text-[9px] uppercase tracking-[0.18em] text-ink-muted">
        {label}
      </div>
    </div>
  );
}
