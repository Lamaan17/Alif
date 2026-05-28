import { redirect } from "next/navigation";
import { Sparkles, Users } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import {
  listBuilders,
  getMyInterestsSet,
  getMyMatchesSet,
  getMatchCount,
  getIncomingInterestsSet,
  type BuilderFilters,
} from "@/lib/data/builders";
import { getBadgesForMany } from "@/lib/data/badges";
import { rankBuilders } from "@/lib/data/matching";

import { Filters } from "./Filters";
import { BuilderCard } from "@/components/builders/BuilderCard";
import { TopMatches } from "@/components/builders/TopMatches";
import { DirectoryLock } from "@/components/builders/DirectoryLock";

export const metadata = { title: "People — alif·build" };

function parseFilters(sp: Record<string, string | undefined>): BuilderFilters {
  const csv = (v?: string) =>
    v ? v.split(",").map((s) => s.trim()).filter(Boolean) : undefined;
  const minHours = sp.hours ? Number(sp.hours) : undefined;
  return {
    role: sp.role || undefined,
    looking: csv(sp.looking),
    industries: csv(sp.industries),
    timezone: sp.tz || undefined,
    minHours: Number.isFinite(minHours) ? minHours : undefined,
    verifiedOnly: sp.verified === "1",
  };
}

export default async function BuildersPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const filters = parseFilters(searchParams);

  const [
    builders,
    allBuilders,
    interestsSet,
    matchesSet,
    incomingSet,
    matchCount,
    viewerProfile,
  ] = await Promise.all([
    listBuilders({ excludeUserId: user.id, filters }),
    listBuilders({ excludeUserId: user.id, filters: {}, limit: 100 }),
    getMyInterestsSet(user.id),
    getMyMatchesSet(user.id),
    getIncomingInterestsSet(user.id),
    getMatchCount(user.id),
    supabase
      .from("profiles")
      .select(
        "id, role_type, industries, looking_for, startup_stage, commitment_level, timezone, level, is_admin",
      )
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  const viewerLevel =
    (viewerProfile.data as { level: number } | null)?.level ?? 0;
  const viewerIsAdmin =
    !!(viewerProfile.data as { is_admin: boolean } | null)?.is_admin;
  // Access ladder: Community Member (3) and up get the full directory.
  // Contributor (2) gets curated recommendations only. New User (<2) gets
  // blurred previews behind a lock.
  const fullAccess = viewerLevel >= 3 || viewerIsAdmin;
  const contributorAccess = viewerLevel === 2;

  const badgeMap = await getBadgesForMany(builders.map((b) => b.id));

  // Compute top matches across ALL builders (filters don't apply here).
  const viewer = viewerProfile.data
    ? {
        id: user.id,
        role_type: (viewerProfile.data as { role_type: string | null }).role_type,
        industries:
          (viewerProfile.data as { industries: string[] | null }).industries ?? [],
        looking_for:
          (viewerProfile.data as { looking_for: string[] | null }).looking_for ?? [],
        startup_stage: (viewerProfile.data as { startup_stage: string | null })
          .startup_stage,
        commitment_level: (viewerProfile.data as { commitment_level: string | null })
          .commitment_level,
        timezone: (viewerProfile.data as { timezone: string | null }).timezone,
      }
    : null;

  const ranked = viewer
    ? rankBuilders(viewer, allBuilders, {
        mutual: matchesSet,
        interestedInMe: incomingSet,
      })
    : [];

  // Only surface "interesting" matches (some signal in there).
  const topMatches = ranked.filter((r) => r.score > 0).slice(0, 6);

  return (
    <main className="min-h-screen bg-paper-warm/40">
      <AppHeader email={user.email} />

      <div className="container-prose py-10">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              People
            </span>
            <h1 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">
              People moving through ALIF.
            </h1>
            <p className="lead mt-2 text-sm">
              Sessions alumni, Network members, HQ regulars, sprint finishers,
              founders, operators, engineers, designers, and first believers.{" "}
              <span className="text-ink/80">
                {builders.length} {builders.length === 1 ? "person" : "people"} match your filters.
              </span>
            </p>
          </div>
          {matchCount > 0 && (
            <a
              href="#matches"
              className="inline-flex items-center gap-2 rounded-full border border-moss-100 bg-moss-50 px-3.5 py-1.5 text-xs font-medium text-moss-700"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {matchCount} mutual {matchCount === 1 ? "match" : "matches"}
            </a>
          )}
        </div>

        {/* Curated recommendations: Contributor+ (and full-access members) */}
        {topMatches.length > 0 && (fullAccess || contributorAccess) && (
          <div className="mt-8">
            <TopMatches items={topMatches} />
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          <aside>
            <Filters initial={filters} />
          </aside>

          <section>
            {builders.length === 0 ? (
              <EmptyState />
            ) : fullAccess ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {builders.map((b) => (
                  <BuilderCard
                    key={b.id}
                    builder={b}
                    isInterested={interestsSet.has(b.id)}
                    isMatched={matchesSet.has(b.id)}
                    badgeKinds={badgeMap.get(b.id) ?? []}
                  />
                ))}
              </div>
            ) : (
              <DirectoryLock
                tier={contributorAccess ? "contributor" : "new_user"}
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {builders.slice(0, 6).map((b) => (
                    <BuilderCard
                      key={b.id}
                      builder={b}
                      isInterested={false}
                      isMatched={false}
                      badgeKinds={badgeMap.get(b.id) ?? []}
                    />
                  ))}
                </div>
              </DirectoryLock>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-paper-line bg-paper p-12 text-center">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-paper-warm text-ink-muted ring-1 ring-inset ring-paper-line">
        <Users className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-display text-lg tracking-tight">
        No builders match those filters.
      </h3>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        Try widening the role or clearing some filters. New builders join every week.
      </p>
    </div>
  );
}
