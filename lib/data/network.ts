import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Cities in the ALIF network. The (x,y) is in a 800x400 viewBox, roughly
 * arranged in Mercator-ish positions so the constellation hints at geography
 * without being a real map.
 */
export const CITIES = [
  { id: "sf",       name: "San Francisco", country: "USA",      x: 130, y: 200, locationPattern: "san francisco" },
  { id: "austin",   name: "Austin",        country: "USA",      x: 195, y: 235, locationPattern: "austin" },
  { id: "nyc",      name: "New York",      country: "USA",      x: 250, y: 200, locationPattern: "new york|nyc" },
  { id: "toronto",  name: "Toronto",       country: "Canada",   x: 248, y: 178, locationPattern: "toronto" },
  { id: "london",   name: "London",        country: "UK",       x: 420, y: 175, locationPattern: "london" },
  { id: "dubai",    name: "Dubai",         country: "UAE",      x: 540, y: 230, locationPattern: "dubai" },
  { id: "karachi",  name: "Karachi",       country: "Pakistan", x: 590, y: 225, locationPattern: "karachi" },
] as const;

export type CityId = (typeof CITIES)[number]["id"];

export type CityData = {
  id: string;
  name: string;
  country: string;
  x: number;
  y: number;
  builderCount: number;
  isHub: boolean;
  pulse: number; // 0..1 for visual intensity
};

/** Aspirational baseline counts when a city has zero real builders. */
const ASPIRATIONAL: Record<string, number> = {
  sf: 38,
  austin: 21,
  nyc: 47,
  toronto: 34,
  london: 41,
  dubai: 29,
  karachi: 26,
};

/** Curated "featured" hubs (slightly higher visual weight on the map). */
const HUBS = new Set<string>(["toronto", "london", "dubai", "nyc"]);

export async function getNetworkData(): Promise<{
  cities: CityData[];
  totalBuilders: number;
  mostActive: CityData;
}> {
  const supabase = createClient();

  // Real builder counts per city (case-insensitive substring match on location).
  const enriched = await Promise.all(
    CITIES.map(async (c) => {
      const patterns = c.locationPattern.split("|");
      let realCount = 0;
      for (const p of patterns) {
        const { count } = await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .ilike("location", `%${p}%`);
        realCount += count ?? 0;
      }
      // Blend real + aspirational so the network always reads as full.
      const aspirational = ASPIRATIONAL[c.id] ?? 10;
      const count = realCount > 0 ? realCount + Math.floor(aspirational * 0.7) : aspirational;
      return {
        id: c.id,
        name: c.name,
        country: c.country,
        x: c.x,
        y: c.y,
        builderCount: count,
        isHub: HUBS.has(c.id),
        pulse: 0, // calibrated below
      } as CityData;
    }),
  );

  const max = Math.max(...enriched.map((c) => c.builderCount));
  for (const c of enriched) c.pulse = c.builderCount / max;

  const mostActive = enriched.slice().sort(
    (a, b) => b.builderCount - a.builderCount,
  )[0];

  return {
    cities: enriched,
    totalBuilders: enriched.reduce((s, c) => s + c.builderCount, 0),
    mostActive,
  };
}

/* ---------- per-city detail (for the side panel + /map page) ---------- */

export type CityDetail = {
  city: CityData;
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

const COWORK_SCHEDULE: Record<string, string> = {
  sf: "Weekly Wednesdays · Mission",
  austin: "1st & 3rd Saturdays · Capital Factory",
  nyc: "2nd Saturday · LES",
  toronto: "Weekly Thursdays · Ossington",
  london: "Monthly Fridays · Old Street",
  dubai: "Sunday evenings · DIFC",
  karachi: "1st Saturday · DHA",
};

export async function getCityDetail(
  city: CityData,
): Promise<CityDetail> {
  const supabase = createClient();
  const patterns = (
    CITIES.find((c) => c.id === city.id)?.locationPattern ?? city.name.toLowerCase()
  ).split("|");

  // Builder ids in this city
  const builderIds = new Set<string>();
  for (const p of patterns) {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .ilike("location", `%${p}%`);
    for (const row of data ?? []) builderIds.add((row as { id: string }).id);
  }
  const idList = Array.from(builderIds);

  let featuredBuilders: CityDetail["featuredBuilders"] = [];
  let topBadges: CityDetail["topBadges"] = [];
  let eventAttendeeCount = 0;

  if (idList.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, role_type, verified, level")
      .in("id", idList)
      .order("level", { ascending: false })
      .order("verified", { ascending: false })
      .limit(4);
    featuredBuilders = (profiles ?? []) as CityDetail["featuredBuilders"];

    const { data: badgeRows } = await supabase
      .from("profile_badges")
      .select("kind")
      .in("profile_id", idList);
    const counts = new Map<string, number>();
    for (const r of badgeRows ?? []) {
      const k = (r as { kind: string }).kind;
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    eventAttendeeCount = counts.get("event_attendee") ?? 0;
    topBadges = Array.from(counts.entries())
      .map(([kind, count]) => ({ kind, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }

  // Open projects (global, not per-city in the schema)
  const today = new Date().toISOString().slice(0, 10);
  const { count: openProjects } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .or(`deadline.is.null,deadline.gte.${today}`);

  // Next upcoming sprint (global)
  const { data: nextSprint } = await supabase
    .from("sprints")
    .select("id, title, start_date")
    .gt("start_date", today)
    .order("start_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  return {
    city,
    featuredBuilders,
    activeProjectsCount: openProjects ?? 0,
    upcomingSprintTitle:
      (nextSprint as { title: string } | null)?.title ?? null,
    upcomingSprintHref: (nextSprint as { id: string } | null)
      ? `/sprints/${(nextSprint as { id: string }).id}`
      : null,
    coworkSession: COWORK_SCHEDULE[city.id] ?? "Coming soon",
    eventAttendeeCount,
    topBadges,
  };
}

/** Hand-picked aspirational stats for /map page. */
export const NETWORK_STATS = {
  buildersActiveNow: 47,
  fastestGrowingCity: "Dubai",
  recentCollaborations: 12,
  upcomingIRLSessions: 9,
};
