import Link from "next/link";
import { CalendarDays, Users, ArrowUpRight, Sparkles } from "lucide-react";

import { ROLE_TYPES, labelFor } from "@/lib/profile-options";
import type { SprintRow } from "@/lib/data/sprints";
import { cn } from "@/lib/utils";

export function SprintCard({
  sprint,
  applicationStatus,
}: {
  sprint: SprintRow;
  applicationStatus?: "pending" | "accepted" | "declined" | "withdrawn";
}) {
  const tone = STATUS_TONES[sprint.status];
  const range = fmtRange(sprint.start_date, sprint.end_date);

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-xl2 border bg-paper p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-cardHover",
        sprint.status === "live"
          ? "border-moss-300 ring-1 ring-moss-200"
          : "border-paper-line",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset",
            tone,
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              sprint.status === "live"
                ? "bg-moss-500"
                : sprint.status === "upcoming"
                ? "bg-gold-500"
                : "bg-paper-line",
            )}
          />
          {STATUS_LABEL[sprint.status]}
        </span>
        {applicationStatus && (
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-[10px] font-medium",
              applicationStatus === "accepted" &&
                "border-moss-200 bg-moss-50 text-moss-700",
              applicationStatus === "pending" &&
                "border-gold-100 bg-gold-50 text-gold-600",
              applicationStatus === "declined" &&
                "border-paper-line bg-paper-warm text-ink-muted",
              applicationStatus === "withdrawn" &&
                "border-paper-line bg-paper-warm text-ink-muted",
            )}
          >
            {applicationStatus === "accepted"
              ? "On the team"
              : applicationStatus === "pending"
              ? "Applied"
              : applicationStatus === "declined"
              ? "Not selected"
              : "Withdrawn"}
          </span>
        )}
      </div>

      <h3 className="mt-4 font-display text-2xl tracking-tight">
        <Link
          href={`/sprints/${sprint.id}`}
          className="hover:text-moss-700"
        >
          {sprint.title}
        </Link>
      </h3>

      {sprint.theme && (
        <p className="mt-1.5 text-[13px] italic text-ink-soft">
          “{sprint.theme}”
        </p>
      )}

      {sprint.description && (
        <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-ink-soft">
          {sprint.description}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-ink-muted">
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="h-3 w-3" />
          {range}
        </span>
        <span className="inline-flex items-center gap-1">
          <Users className="h-3 w-3" />
          Teams of {sprint.max_team_size}
        </span>
      </div>

      {sprint.recommended_roles.length > 0 && (
        <div className="mt-4">
          <div className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">
            Recommended roles
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {sprint.recommended_roles.map((r) => (
              <span
                key={r}
                className="inline-flex rounded-full border border-paper-line bg-paper-warm px-2 py-0.5 text-[11px] text-ink-soft"
              >
                {labelFor(ROLE_TYPES, r)}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto pt-5 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-[11px] text-ink-muted">
          {sprint.deliverable && (
            <>
              <Sparkles className="h-3 w-3 text-moss-600" />
              <span className="truncate max-w-[180px]">{sprint.deliverable.split(",")[0].split(".")[0]}</span>
            </>
          )}
        </span>
        <Link
          href={`/sprints/${sprint.id}`}
          className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1.5 text-[12px] font-medium text-paper transition-colors hover:bg-ink-soft"
        >
          Open
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </article>
  );
}

const STATUS_LABEL: Record<SprintRow["status"], string> = {
  upcoming: "Upcoming",
  live: "Live now",
  completed: "Completed",
};

const STATUS_TONES: Record<SprintRow["status"], string> = {
  upcoming: "bg-gold-50 text-gold-600 ring-gold-100",
  live: "bg-moss-50 text-moss-700 ring-moss-100",
  completed: "bg-paper-warm text-ink-muted ring-paper-line",
};

function fmtRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const sm = s.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const em = e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${sm} → ${em}`;
}
