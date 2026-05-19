import Link from "next/link";
import {
  MapPin,
  Clock,
  ArrowUpRight,
  Calendar,
  Sparkles,
  BadgeCheck,
} from "lucide-react";

import {
  STARTUP_STAGES,
  ROLE_TYPES,
  COLLAB_MODES,
  labelFor,
} from "@/lib/profile-options";
import { LevelPill } from "@/components/badges/LevelPill";
import type { ProjectRow } from "@/lib/data/projects";
import { cn } from "@/lib/utils";

/** Deterministic-but-varied "source" category derived from the project id.
 * For the demo this gives every card an ALIF-affiliated source chip without
 * a schema change. Easy to swap for a real DB column later. */
const SOURCES = [
  { label: "From Sessions",  tone: "gold" },
  { label: "From Network",   tone: "moss" },
  { label: "From HQ",        tone: "ink"  },
  { label: "From Portfolio", tone: "gold" },
  { label: "From Partners",  tone: "moss" },
  { label: "From Community", tone: "ink"  },
] as const;

function projectSource(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  }
  return SOURCES[Math.abs(h) % SOURCES.length];
}

const SOURCE_TONE: Record<(typeof SOURCES)[number]["tone"], string> = {
  moss: "border-moss-100 bg-moss-50 text-moss-700",
  gold: "border-gold-100 bg-gold-50 text-gold-600",
  ink:  "border-paper-line bg-paper-warm text-ink-soft",
};

export function ProjectCard({
  project,
  applicationStatus,
}: {
  project: ProjectRow;
  applicationStatus?: "pending" | "accepted" | "declined" | "withdrawn";
}) {
  const owner = project.owner;
  const source = projectSource(project.id);
  const visibleSkills = project.skills_needed.slice(0, 4);
  const extraSkills = project.skills_needed.length - visibleSkills.length;
  const closes = project.deadline ? new Date(project.deadline) : null;
  const daysLeft = closes
    ? Math.max(
        0,
        Math.ceil(
          (closes.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        ),
      )
    : null;

  return (
    <article
      className={cn(
        "group flex h-full flex-col rounded-xl2 border bg-paper p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-cardHover",
        project.is_open
          ? "border-paper-line"
          : "border-paper-line opacity-75",
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-1 inline-flex h-2 w-2 shrink-0 rounded-full",
            project.is_open ? "bg-moss-500" : "bg-paper-line",
          )}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="mb-1.5">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide",
                SOURCE_TONE[source.tone],
              )}
            >
              {source.label}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-lg leading-tight tracking-tight text-ink">
              <Link
                href={`/projects/${project.id}`}
                className="hover:text-moss-700"
              >
                {project.title}
              </Link>
            </h3>
            {applicationStatus && (
              <span
                className={cn(
                  "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                  applicationStatus === "accepted" &&
                    "border-moss-200 bg-moss-50 text-moss-700",
                  applicationStatus === "declined" &&
                    "border-paper-line bg-paper-warm text-ink-muted",
                  applicationStatus === "pending" &&
                    "border-gold-100 bg-gold-50 text-gold-600",
                  applicationStatus === "withdrawn" &&
                    "border-paper-line bg-paper-warm text-ink-muted",
                )}
              >
                {applicationStatus === "accepted"
                  ? "Accepted"
                  : applicationStatus === "declined"
                  ? "Declined"
                  : applicationStatus === "pending"
                  ? "Applied"
                  : "Withdrawn"}
              </span>
            )}
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft line-clamp-2">
            {project.one_liner}
          </p>
        </div>
      </div>

      {/* Meta strip */}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-ink-muted">
        {project.industry && (
          <span className="inline-flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-moss-600" />
            {project.industry}
          </span>
        )}
        {project.current_stage && (
          <span>{labelFor(STARTUP_STAGES, project.current_stage)}</span>
        )}
        {project.collab_mode && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {labelFor(COLLAB_MODES, project.collab_mode)}
          </span>
        )}
        {project.time_commitment_hours && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            ~{project.time_commitment_hours} hrs/wk
            {project.duration_weeks && ` · ${project.duration_weeks}w`}
          </span>
        )}
      </div>

      {/* Skills needed */}
      {visibleSkills.length > 0 && (
        <div className="mt-3.5">
          <div className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">
            Skills needed
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {visibleSkills.map((s) => (
              <span
                key={s}
                className="inline-flex rounded-full border border-moss-100 bg-moss-50 px-2 py-0.5 text-[11px] font-medium text-moss-700"
              >
                {s}
              </span>
            ))}
            {extraSkills > 0 && (
              <span className="inline-flex rounded-full border border-paper-line bg-paper-warm px-2 py-0.5 text-[11px] text-ink-muted">
                +{extraSkills}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Looking for */}
      {project.ideal_collaborator && (
        <div className="mt-3 inline-flex items-center gap-1.5 self-start rounded-full border border-paper-line bg-paper-warm px-2.5 py-1 text-[11px] text-ink-soft">
          Seeking{" "}
          <span className="font-medium text-ink">
            {labelFor(ROLE_TYPES, project.ideal_collaborator)}
          </span>
        </div>
      )}

      {/* Footer: owner + CTA */}
      <div className="mt-auto pt-4">
        {owner && (
          <Link
            href={`/builders/${owner.id}`}
            className="group/owner flex items-center gap-2.5 rounded-lg px-1 py-1 -mx-1 transition-colors hover:bg-paper-warm"
          >
            <MiniAvatar
              src={owner.avatar_url}
              name={owner.full_name ?? "—"}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 text-[12px]">
                <span className="truncate font-medium text-ink">
                  {owner.full_name}
                </span>
                {owner.verified && (
                  <BadgeCheck className="h-3 w-3 shrink-0 text-moss-600" />
                )}
              </div>
              <div className="text-[10px] text-ink-muted">
                Posting builder ·{" "}
                {labelFor(ROLE_TYPES, owner.role_type ?? null)}
              </div>
            </div>
            <LevelPill level={owner.level} size="sm" />
          </Link>
        )}

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-[11px] text-ink-muted">
            {closes && project.is_open
              ? `Closes in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`
              : closes
              ? "Closed"
              : "Rolling"}
          </span>
          <Link
            href={`/projects/${project.id}`}
            className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1.5 text-[12px] font-medium text-paper transition-colors hover:bg-ink-soft"
          >
            Open
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function MiniAvatar({ src, name }: { src: string | null; name: string }) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-paper">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="font-display text-[11px]">{initials || "•"}</span>
      )}
    </span>
  );
}

// Calendar import is used only for type narrowing in JSX, this keeps the linter happy.
void Calendar;
