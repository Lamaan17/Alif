import Link from "next/link";
import { ExternalLink, Users, CalendarDays } from "lucide-react";

import { listAllSprints } from "@/lib/data/admin";
import { ROLE_TYPES, labelFor } from "@/lib/profile-options";
import { SprintForm } from "@/components/admin/SprintForm";
import { SprintDeleteButton } from "@/components/admin/SprintDeleteButton";
import { cn } from "@/lib/utils";

export const metadata = { title: "Admin · Sprints — Build Together" };

const TONE: Record<string, string> = {
  upcoming: "bg-gold-50 text-gold-600 ring-gold-100",
  live: "bg-moss-50 text-moss-700 ring-moss-100",
  completed: "bg-paper-warm text-ink-muted ring-paper-line",
};

export default async function AdminSprints() {
  const sprints = await listAllSprints();
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            Admin · Sprints
          </span>
          <h1 className="mt-3 font-display text-2xl tracking-tight">
            Build sprints.
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Create new sprints. Status is derived from start/end dates
            automatically.
          </p>
        </div>
        <SprintForm />
      </div>

      <p className="text-xs text-ink-muted">
        {sprints.length} {sprints.length === 1 ? "sprint" : "sprints"}
      </p>

      <ul className="space-y-2">
        {sprints.map((s) => (
          <li
            key={s.id}
            className="rounded-xl border border-paper-line bg-paper p-4"
          >
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/sprints/${s.id}`}
                    className="font-medium tracking-tight text-ink hover:text-moss-700"
                  >
                    {s.title}
                  </Link>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset",
                      TONE[s.status],
                    )}
                  >
                    {s.status}
                  </span>
                  <span className="badge">
                    <CalendarDays className="h-3 w-3" />
                    {new Date(s.start_date).toLocaleDateString()} →{" "}
                    {new Date(s.end_date).toLocaleDateString()}
                  </span>
                  <span className="badge">
                    <Users className="h-3 w-3" />
                    Teams of {s.max_team_size}
                  </span>
                </div>
                {s.theme && (
                  <p className="mt-1.5 line-clamp-1 text-[13px] italic text-ink-soft">
                    “{s.theme}”
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-ink-muted">
                  <span>
                    {s.application_count}{" "}
                    {s.application_count === 1 ? "applicant" : "applicants"}
                  </span>
                  {s.recommended_roles.length > 0 && (
                    <span>
                      Roles:{" "}
                      {s.recommended_roles
                        .map((r) => labelFor(ROLE_TYPES, r))
                        .join(", ")}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-1.5">
                <Link
                  href={`/sprints/${s.id}`}
                  className="inline-flex items-center gap-1 rounded-full border border-paper-line bg-paper-warm px-2.5 py-1 text-[11px] font-medium text-ink-soft hover:border-ink/15 hover:text-ink"
                >
                  View <ExternalLink className="h-3 w-3" />
                </Link>
                <SprintDeleteButton id={s.id} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
