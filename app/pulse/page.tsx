import { redirect } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp,
  Users,
  Lightbulb,
  Flag,
  BadgeCheck,
  CalendarHeart,
  Sparkles,
  MapPin,
  ArrowUpRight,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { getPulseSnapshot } from "@/lib/data/pulse";
import { Sparkline } from "@/components/charts/Sparkline";
import { BarChart } from "@/components/charts/BarChart";

export const metadata = { title: "ALIF Pulse — alif·build" };

export default async function PulsePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/pulse");

  const s = await getPulseSnapshot();

  // Recent shipped projects (from profiles with past_projects)
  const { data: shippers } = await supabase
    .from("profiles")
    .select("id, full_name, location, past_projects, avatar_url")
    .order("created_at", { ascending: false })
    .limit(40);
  const shipping = (shippers ?? [])
    .map((r) => {
      const row = r as {
        id: string;
        full_name: string;
        location: string | null;
        past_projects: Array<{ name: string; description?: string }> | null;
        avatar_url: string | null;
      };
      const first = row.past_projects?.[0];
      if (!first) return null;
      return {
        id: row.id,
        name: row.full_name,
        location: row.location,
        avatar_url: row.avatar_url,
        project: first.name,
        description: first.description ?? "",
      };
    })
    .filter(Boolean)
    .slice(0, 4) as Array<{
    id: string;
    name: string;
    location: string | null;
    avatar_url: string | null;
    project: string;
    description: string;
  }>;

  return (
    <main className="min-h-screen bg-paper-deep">
      <AppHeader email={user.email} />

      <div className="container-prose py-12">
        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            ALIF Pulse · ecosystem report
          </span>
          <h1
            className="mt-6 font-display font-semibold text-4xl leading-[1.02] sm:text-5xl md:text-[72px]"
            style={{ letterSpacing: "-0.045em" }}
          >
            The shape of the network,{" "}
            <em className="italic font-medium text-ink">in motion</em>.
          </h1>
          <p className="lead mt-5">
            Builders shipping, cities growing, collaborations forming. A live
            read on the ALIF ecosystem.
          </p>
        </div>

        {/* Headline metrics */}
        <section className="mt-14">
          <SectionLabel>This week in ALIF</SectionLabel>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <BigStat
              icon={Users}
              value={s.activeBuilders}
              label="Active builders"
              trend={s.builderGrowth}
            />
            <BigStat
              icon={Flag}
              value={s.sprintCompletions}
              label="Sprint completions"
              trend={s.sprintGrowth}
            />
            <BigStat
              icon={Lightbulb}
              value={s.activeProjects}
              label="Active projects"
            />
            <BigStat
              icon={BadgeCheck}
              value={s.verifiedBuilders}
              label="Verified builders"
            />
          </div>
        </section>

        {/* Two-col: growing cities + trending industries */}
        <section className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <SectionTitle eyebrow="Growing cities">
              Where builders are concentrating.
            </SectionTitle>
            <div className="mt-6 rounded-xl2 border border-paper-line bg-paper p-6 shadow-card">
              <BarChart data={s.cityBreakdown} />
            </div>
          </div>

          <div>
            <SectionTitle eyebrow="Trending industries">
              What this cohort is building toward.
            </SectionTitle>
            <div className="mt-6 rounded-xl2 border border-paper-line bg-paper p-6 shadow-card">
              <BarChart data={s.industryBreakdown} />
            </div>
          </div>
        </section>

        {/* Builders shipping */}
        <section className="mt-16">
          <SectionTitle eyebrow="Builders shipping">
            Recent work from across the network.
          </SectionTitle>
          {shipping.length > 0 ? (
            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {shipping.map((b) => (
                <li
                  key={b.id}
                  className="rounded-xl border border-paper-line bg-paper p-5 transition-colors hover:border-ink/15"
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-paper-deep">
                      <span className="font-display text-[11px] font-semibold">
                        {b.name
                          .split(/\s+/)
                          .map((p) => p[0])
                          .filter(Boolean)
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                        {b.name} · {b.location ?? "—"}
                      </div>
                      <div className="mt-1 font-display text-lg font-semibold tracking-tight text-ink">
                        {b.project}
                      </div>
                      {b.description && (
                        <p className="mt-1.5 line-clamp-2 text-[13px] text-ink-muted">
                          {b.description}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/builders/${b.id}`}
                      className="text-ink-muted hover:text-ink"
                      aria-label="Open builder"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 rounded-xl border border-dashed border-paper-line bg-paper-warm/40 px-4 py-6 text-center text-sm text-ink-muted">
              Shipped projects will surface here as builders update their
              profiles.
            </p>
          )}
        </section>

        {/* Community highlights — curated */}
        <section className="mt-16">
          <SectionTitle eyebrow="Community highlights">
            Moments worth marking.
          </SectionTitle>
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            {HIGHLIGHTS.map((h) => (
              <article
                key={h.title}
                className="rounded-xl border border-paper-line bg-paper p-5"
              >
                <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink-muted">
                  {h.tag}
                </div>
                <h3 className="mt-2 font-display text-lg font-semibold tracking-tight text-ink">
                  {h.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
                  {h.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Upcoming events */}
        <section className="mt-16">
          <SectionTitle eyebrow="Upcoming events">
            On the calendar.
          </SectionTitle>
          <ul className="mt-6 space-y-2">
            {EVENTS.map((e) => (
              <li
                key={e.title}
                className="flex items-center justify-between gap-3 rounded-xl border border-paper-line bg-paper px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-ink">{e.title}</div>
                  <div className="mt-0.5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                    <CalendarHeart className="h-3 w-3" />
                    {e.when}
                    <span>·</span>
                    <MapPin className="h-3 w-3" />
                    {e.where}
                  </div>
                </div>
                <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-paper-line bg-paper-warm px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                  <Sparkles className="h-2.5 w-2.5" />
                  {e.type}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Closing CTA */}
        <div className="mt-16 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/map" className="btn-primary">
            <MapPin className="h-4 w-4" />
            See the Community Map
          </Link>
          <Link href="/builders" className="btn-secondary">
            Explore Builders
          </Link>
        </div>

        <p className="mt-6 text-center text-[11px] uppercase tracking-[0.18em] text-ink-muted">
          <TrendingUp className="inline h-3 w-3 mr-1" />
          Most active city this quarter: {s.mostActiveCity}
        </p>
      </div>
    </main>
  );
}

/* ---------- editorial content ---------- */

const HIGHLIGHTS = [
  {
    tag: "Cohort win",
    title: "Two sprint teams turned into real cofounding pairs",
    body: "Both came out of last quarter's chemistry sprints, both kept building together, both are now applying to ALIF Fund.",
  },
  {
    tag: "City spotlight",
    title: "Dubai is the fastest-growing ALIF builder hub",
    body: "Three IRL events ran in DIFC this quarter, and Dubai builders shipped 4 new projects to the platform.",
  },
  {
    tag: "Mentor moment",
    title: "Six builders received mentor endorsements this month",
    body: "Mentor endorsements only land after working sessions — never just a coffee chat.",
  },
  {
    tag: "Initiative",
    title: "Faith-Tech Circle launched with 37 founding builders",
    body: "Dedicated circle for builders working at the intersection of technology and Muslim community needs.",
  },
];

const EVENTS = [
  {
    title: "ALIF Toronto Cowork",
    when: "Thursday · 6pm",
    where: "Toronto",
    type: "Cowork",
  },
  {
    title: "Faith-Tech Builder Roundtable",
    when: "Friday · 7pm",
    where: "Virtual",
    type: "Roundtable",
  },
  {
    title: "ALIF NYC Build Circle",
    when: "Saturday · 11am",
    where: "New York",
    type: "Build session",
  },
  {
    title: "Founder × Operator Sprint kickoff",
    when: "Monday · 9am",
    where: "Virtual",
    type: "Sprint",
  },
  {
    title: "ALIF Summit 2026 · Day 1",
    when: "Jun 14 · all day",
    where: "Toronto",
    type: "Summit",
  },
];

/* ---------- bits ---------- */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">
      {children}
    </div>
  );
}

function SectionTitle({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span className="eyebrow">
        <span className="eyebrow-dot" />
        {eyebrow}
      </span>
      <h2
        className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl"
        style={{ letterSpacing: "-0.03em" }}
      >
        {children}
      </h2>
    </div>
  );
}

function BigStat({
  icon: Icon,
  value,
  label,
  trend,
}: {
  icon: typeof TrendingUp;
  value: string | number;
  label: string;
  trend?: number[];
}) {
  return (
    <div className="bg-paper px-5 py-5 rounded-xl border border-paper-line">
      <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-ink-muted">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <div
          className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
          style={{ letterSpacing: "-0.04em" }}
        >
          {value}
        </div>
        {trend && (
          <div className="text-ink-soft">
            <Sparkline
              values={trend}
              width={70}
              height={32}
              stroke="currentColor"
              fill="currentColor"
              fillOpacity={0.12}
            />
          </div>
        )}
      </div>
    </div>
  );
}
