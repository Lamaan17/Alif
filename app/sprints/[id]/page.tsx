import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Users,
  Target,
  Sparkles,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import {
  getSprint,
  getMyApplicationsForSprints,
} from "@/lib/data/sprints";
import { ROLE_TYPES, labelFor } from "@/lib/profile-options";
import { ApplyButton } from "@/components/projects/ApplyButton";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}) {
  const s = await getSprint(params.id);
  return {
    title: s ? `${s.title} — Build Together` : "Sprint — Build Together",
  };
}

const STATUS_LABEL = {
  upcoming: "Upcoming",
  live: "Live now",
  completed: "Completed",
} as const;

export default async function SprintPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const sprint = await getSprint(params.id);
  if (!sprint) notFound();
  const myApps = await getMyApplicationsForSprints(user.id);
  const myStatus = myApps.get(sprint.id);

  const days = Math.max(
    1,
    Math.ceil(
      (new Date(sprint.end_date).getTime() -
        new Date(sprint.start_date).getTime()) /
        (1000 * 60 * 60 * 24),
    ) + 1,
  );

  // Parse the deliverable into bullets if it's a comma list.
  const deliverables = sprint.deliverable
    ? sprint.deliverable
        .split(/,|•/g)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return (
    <main className="min-h-screen bg-paper-warm/40">
      <AppHeader email={user.email} />

      <div className="container-prose py-10">
        <Link
          href="/sprints"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sprints
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <section className="rounded-xl2 border border-paper-line bg-paper p-7 shadow-card lg:col-span-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ${
                sprint.status === "live"
                  ? "bg-moss-50 text-moss-700 ring-moss-100"
                  : sprint.status === "upcoming"
                  ? "bg-gold-50 text-gold-600 ring-gold-100"
                  : "bg-paper-warm text-ink-muted ring-paper-line"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  sprint.status === "live"
                    ? "bg-moss-500"
                    : sprint.status === "upcoming"
                    ? "bg-gold-500"
                    : "bg-paper-line"
                }`}
              />
              {STATUS_LABEL[sprint.status]}
            </span>

            <h1 className="mt-5 font-display text-3xl tracking-tight sm:text-4xl">
              {sprint.title}
            </h1>

            {sprint.theme && (
              <p className="mt-3 text-lg italic text-ink-soft">
                “{sprint.theme}”
              </p>
            )}

            {sprint.description && (
              <p className="mt-5 whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">
                {sprint.description}
              </p>
            )}

            <section className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat
                icon={CalendarDays}
                label="Duration"
                value={`${days} days`}
              />
              <Stat
                icon={Users}
                label="Team size"
                value={`Up to ${sprint.max_team_size}`}
              />
              <Stat
                icon={CalendarDays}
                label="Starts"
                value={new Date(sprint.start_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              />
              <Stat
                icon={CalendarDays}
                label="Ends"
                value={new Date(sprint.end_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              />
            </section>

            {deliverables.length > 0 && (
              <section className="mt-7">
                <SectionTitle>Expected deliverable</SectionTitle>
                <ul className="mt-3 space-y-2">
                  {deliverables.map((d, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-[14px] leading-relaxed text-ink-soft"
                    >
                      <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-moss-600" />
                      <span className="capitalize-first">{d}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {sprint.recommended_roles.length > 0 && (
              <section className="mt-7">
                <SectionTitle>Recommended roles</SectionTitle>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {sprint.recommended_roles.map((r) => (
                    <span
                      key={r}
                      className="inline-flex rounded-full border border-moss-100 bg-moss-50 px-2.5 py-1 text-xs font-medium text-moss-700"
                    >
                      {labelFor(ROLE_TYPES, r)}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </section>

          <aside className="space-y-5">
            <div className="rounded-xl2 border border-paper-line bg-paper p-5 shadow-card">
              <div className="text-sm font-medium text-ink">Join this sprint</div>
              <p className="mt-1.5 text-[12px] text-ink-muted">
                {sprint.status === "completed"
                  ? "This sprint has wrapped — see what was built."
                  : "Applications are reviewed by ALIF before kickoff."}
              </p>
              <div className="mt-4">
                <ApplyButton
                  kind="sprint"
                  targetId={sprint.id}
                  targetTitle={sprint.title}
                  myStatus={myStatus}
                  disabled={sprint.status === "completed"}
                />
              </div>
            </div>

            <div className="rounded-xl2 border border-paper-line bg-paper p-5 shadow-card">
              <div className="text-sm font-medium text-ink">How sprints work</div>
              <ol className="mt-3 space-y-2 text-[13px] text-ink-soft">
                <li className="flex gap-2">
                  <span className="font-display text-moss-600">1.</span>
                  Apply with one short message.
                </li>
                <li className="flex gap-2">
                  <span className="font-display text-moss-600">2.</span>
                  ALIF pairs accepted builders into teams of {sprint.max_team_size}.
                </li>
                <li className="flex gap-2">
                  <span className="font-display text-moss-600">3.</span>
                  You ship, write a retro, get a peer review.
                </li>
                <li className="flex gap-2">
                  <span className="font-display text-moss-600">4.</span>
                  Sprint Finisher badge + path to Verified Builder.
                </li>
              </ol>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
      {children}
    </h3>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Target;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-paper-line bg-paper-warm/40 p-3">
      <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-ink-muted">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-1.5 font-display text-base tracking-tight text-ink">
        {value}
      </div>
    </div>
  );
}

void Sparkles;
