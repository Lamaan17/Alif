import { redirect } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  TrendingUp,
  Users,
  Sparkles,
  CalendarHeart,
  ArrowUpRight,
  HeartHandshake,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { CityMap } from "@/components/map/CityMap";
import { getNetworkData, NETWORK_STATS } from "@/lib/data/network";

export const metadata = { title: "ALIF Community Map — alif·build" };

export default async function MapPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/map");

  const { cities, totalBuilders, mostActive } = await getNetworkData();

  // Recent collaborations (real matches → builder pairs)
  const { data: matches } = await supabase
    .from("matches")
    .select("user_a, user_b, matched_at")
    .order("matched_at", { ascending: false })
    .limit(6);
  const matchPairs: Array<{
    a_name: string;
    b_name: string;
    city: string | null;
    ts: string;
  }> = [];
  if (matches && matches.length > 0) {
    const ids = Array.from(
      new Set(
        (matches as Array<{ user_a: string; user_b: string }>).flatMap((m) => [
          m.user_a,
          m.user_b,
        ]),
      ),
    );
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, location")
      .in("id", ids);
    const map = new Map<string, { name: string; location: string | null }>();
    for (const p of profiles ?? []) {
      const pp = p as { id: string; full_name: string; location: string | null };
      map.set(pp.id, { name: pp.full_name, location: pp.location });
    }
    for (const m of matches as Array<{
      user_a: string;
      user_b: string;
      matched_at: string;
    }>) {
      const a = map.get(m.user_a);
      const b = map.get(m.user_b);
      if (!a || !b) continue;
      matchPairs.push({
        a_name: a.name.split(/\s+/)[0],
        b_name: b.name.split(/\s+/)[0],
        city: a.location?.split(",")[0]?.trim() ?? null,
        ts: m.matched_at,
      });
    }
  }

  const irlSessions = [
    { city: "Toronto", when: "Thursday · 6pm", what: "Cowork @ Ossington" },
    { city: "NYC", when: "Saturday · 11am", what: "LES Build Circle" },
    { city: "London", when: "Friday · 5pm", what: "Old Street Cowork" },
    { city: "Dubai", when: "Sunday · 7pm", what: "DIFC Builders Meet" },
    { city: "Karachi", when: "Saturday · 4pm", what: "DHA Build Circle" },
  ];

  return (
    <main className="min-h-screen bg-paper-deep">
      <AppHeader email={user.email} />

      <div className="container-prose py-12">
        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            ALIF Community Map
          </span>
          <h1
            className="mt-6 font-display font-semibold text-4xl leading-[1.02] sm:text-5xl md:text-[72px]"
            style={{ letterSpacing: "-0.045em" }}
          >
            Where ALIF is{" "}
            <em className="italic font-medium text-ink">happening</em>.
          </h1>
          <p className="lead mt-5">
            Cities, rooms, projects, and builders carrying ALIF energy beyond
            San Francisco.
          </p>
        </div>

        {/* Map */}
        <div className="mt-14">
          <CityMap cities={cities} />
        </div>

        {/* Network stats */}
        <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-xl2 border border-paper-line bg-paper-line sm:grid-cols-4">
          <NetStat
            icon={Users}
            value={NETWORK_STATS.buildersActiveNow}
            label="Builders active now"
          />
          <NetStat
            icon={TrendingUp}
            value={NETWORK_STATS.fastestGrowingCity}
            label="Fastest growing city"
            small
          />
          <NetStat
            icon={HeartHandshake}
            value={NETWORK_STATS.recentCollaborations}
            label="Recent collaborations"
          />
          <NetStat
            icon={CalendarHeart}
            value={NETWORK_STATS.upcomingIRLSessions}
            label="Upcoming IRL sessions"
          />
        </div>

        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Recent collaborations */}
          <section>
            <SectionTitle eyebrow="Recent collaborations">
              Builders who said yes to each other.
            </SectionTitle>
            <ul className="mt-6 space-y-2">
              {matchPairs.length > 0 ? (
                matchPairs.map((m, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-paper-line bg-paper px-4 py-3"
                  >
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-paper-warm text-ink-soft ring-1 ring-inset ring-paper-line">
                      <HeartHandshake
                        className="h-3.5 w-3.5"
                        strokeWidth={1.75}
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm">
                        <span className="font-medium text-ink">
                          {m.a_name}
                        </span>
                        <span className="text-ink-muted"> & </span>
                        <span className="font-medium text-ink">
                          {m.b_name}
                        </span>
                        <span className="text-ink-muted"> are building together</span>
                      </div>
                      {m.city && (
                        <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                          <MapPin className="h-3 w-3" />
                          {m.city}
                        </div>
                      )}
                    </div>
                  </li>
                ))
              ) : (
                <li className="rounded-xl border border-dashed border-paper-line bg-paper-warm/40 px-4 py-6 text-center text-sm text-ink-muted">
                  Collaborations will appear here as builders connect.
                </li>
              )}
            </ul>
          </section>

          {/* Upcoming IRL */}
          <section>
            <SectionTitle eyebrow="Upcoming IRL sessions">
              Where builders meet in person.
            </SectionTitle>
            <ul className="mt-6 space-y-2">
              {irlSessions.map((s, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 rounded-xl border border-paper-line bg-paper px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-ink">
                      {s.what}
                    </div>
                    <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                      <MapPin className="h-3 w-3" />
                      {s.city}
                    </div>
                  </div>
                  <span className="shrink-0 text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                    {s.when}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-16 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/builders" className="btn-primary">
            Explore Builders
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link href="/sprints" className="btn-secondary">
            <Sparkles className="h-4 w-4" />
            Join the next sprint
          </Link>
        </div>

        <p className="mt-6 text-center text-[11px] uppercase tracking-[0.18em] text-ink-muted">
          {mostActive.name} is the most active city this quarter ·{" "}
          {totalBuilders} builders mapped
        </p>
      </div>
    </main>
  );
}

function NetStat({
  icon: Icon,
  value,
  label,
  small,
}: {
  icon: typeof MapPin;
  value: string | number;
  label: string;
  small?: boolean;
}) {
  return (
    <div className="bg-paper px-5 py-5">
      <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-ink-muted">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div
        className={
          small
            ? "mt-2 font-display text-xl font-semibold tracking-tight text-ink"
            : "mt-2 font-display text-3xl font-semibold tracking-tight text-ink"
        }
        style={{ letterSpacing: "-0.03em" }}
      >
        {value}
      </div>
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
