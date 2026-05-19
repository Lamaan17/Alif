import Link from "next/link";
import {
  Users,
  BadgeCheck,
  Crown,
  Lightbulb,
  Sparkles,
  Hand,
  Mail,
  HeartHandshake,
} from "lucide-react";

import { getAdminOverviewCounts } from "@/lib/data/admin";
import { ASPIRATIONAL_METRICS } from "@/lib/data/metrics";

export default async function AdminOverview() {
  const c = await getAdminOverviewCounts();

  const live = [
    { label: "Total profiles", value: c.profiles, icon: Users },
    { label: "Verified", value: c.verified, icon: BadgeCheck },
    { label: "Level ≥ 3", value: c.l3plus, icon: Crown },
    { label: "Admins", value: c.admins, icon: Crown },
    { label: "Projects", value: c.projects, icon: Lightbulb },
    { label: "Sprints", value: c.sprints, icon: Sparkles },
    { label: "Pending apps", value: c.apps_pending, icon: Hand },
    { label: "Accepted apps", value: c.apps_accepted, icon: Hand },
    { label: "Pending intros", value: c.intros_pending, icon: Mail },
    { label: "Mutual matches", value: c.matches, icon: HeartHandshake },
  ];

  const aspirational = [
    { label: "Startups formed", value: ASPIRATIONAL_METRICS.startups_formed },
    { label: "Projects launched", value: ASPIRATIONAL_METRICS.projects_launched },
    { label: "Sprint completions", value: ASPIRATIONAL_METRICS.sprint_completions },
    { label: "Verified builders", value: ASPIRATIONAL_METRICS.verified_builders },
    { label: "Successful matches", value: ASPIRATIONAL_METRICS.successful_matches },
    { label: "Active collaborators", value: ASPIRATIONAL_METRICS.active_collaborators },
  ];

  return (
    <div className="space-y-8">
      <div>
        <span className="eyebrow">
          <span className="eyebrow-dot" />
          Admin overview
        </span>
        <h1 className="mt-3 font-display text-3xl tracking-tight">
          What&rsquo;s happening on Build Together.
        </h1>
        <p className="lead mt-2 text-sm">
          Live counts from the database. Use the tabs to drill in.
        </p>
      </div>

      {/* Live counts */}
      <section>
        <h2 className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
          Live counts
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-xl2 border border-paper-line bg-paper-line sm:grid-cols-3 lg:grid-cols-5">
          {live.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-paper p-5">
                <Icon className="h-4 w-4 text-ink-muted" strokeWidth={1.75} />
                <div className="mt-3 font-display text-2xl tracking-tight text-ink">
                  {s.value}
                </div>
                <div className="mt-1 text-[11px] text-ink-muted">
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pending work */}
      {(c.apps_pending > 0 || c.intros_pending > 0) && (
        <section className="rounded-xl2 border border-gold-100 bg-gold-50/40 p-5">
          <h2 className="text-sm font-medium text-ink">Needs attention</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {c.apps_pending > 0 && (
              <Link
                href="/admin/applications?status=pending"
                className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-xs font-medium text-ink ring-1 ring-paper-line hover:ring-gold-200"
              >
                <Hand className="h-3 w-3 text-gold-600" />
                {c.apps_pending} pending application
                {c.apps_pending === 1 ? "" : "s"}
              </Link>
            )}
            {c.intros_pending > 0 && (
              <Link
                href="/admin/intros"
                className="inline-flex items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-xs font-medium text-ink ring-1 ring-paper-line hover:ring-gold-200"
              >
                <Mail className="h-3 w-3 text-gold-600" />
                {c.intros_pending} pending intro
                {c.intros_pending === 1 ? "" : "s"}
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Aspirational vs reality (for the For ALIF page numbers) */}
      <section>
        <h2 className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
          For-ALIF aspirational targets
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-xl2 border border-paper-line bg-paper-line sm:grid-cols-3 lg:grid-cols-6">
          {aspirational.map((s) => (
            <div key={s.label} className="bg-paper-warm/40 p-5">
              <div className="font-display text-2xl tracking-tight text-ink">
                {s.value}
              </div>
              <div className="mt-1 text-[11px] text-ink-muted">{s.label}</div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-ink-muted">
          These are the numbers shown on{" "}
          <Link href="/for-alif" className="underline">
            /for-alif
          </Link>
          . Adjust in <code>lib/data/metrics.ts</code> as you have real data.
        </p>
      </section>
    </div>
  );
}
