import "server-only";
import { createClient } from "@/lib/supabase/server";

export type StreamEventKind =
  | "joined_sprint"
  | "badge_awarded"
  | "shipped_project"
  | "matched"
  | "joined_platform"
  | "city_session"
  | "summit";

export type StreamEvent = {
  kind: StreamEventKind;
  ts: string;
  text: string;
  href?: string;
};

/**
 * A curated "ecosystem activity" feed for the landing page.
 * Mixes real-data events (from applications, badges, matches) with a few
 * curated aspirational entries so the stream always reads as alive.
 */
export async function getEcosystemStream(limit = 8): Promise<StreamEvent[]> {
  const supabase = createClient();
  const items: StreamEvent[] = [];

  // Accepted sprint applications — "Joined {sprint}"
  const { data: apps } = await supabase
    .from("applications")
    .select("target_type, target_id, applicant_id, decided_at, created_at, status")
    .eq("target_type", "sprint")
    .eq("status", "accepted")
    .order("decided_at", { ascending: false })
    .limit(6);

  if (apps && apps.length > 0) {
    const sprintIds = Array.from(
      new Set(apps.map((a) => (a as { target_id: string }).target_id)),
    );
    const applicantIds = Array.from(
      new Set(apps.map((a) => (a as { applicant_id: string }).applicant_id)),
    );

    const [{ data: sprints }, { data: profiles }] = await Promise.all([
      supabase.from("sprints").select("id, title").in("id", sprintIds),
      supabase
        .from("profiles")
        .select("id, full_name, location")
        .in("id", applicantIds),
    ]);
    const sprintMap = new Map<string, string>();
    for (const s of sprints ?? [])
      sprintMap.set(
        (s as { id: string }).id,
        (s as { title: string }).title,
      );
    const profileMap = new Map<
      string,
      { name: string; location: string | null }
    >();
    for (const p of profiles ?? []) {
      const pp = p as { id: string; full_name: string; location: string | null };
      profileMap.set(pp.id, { name: pp.full_name, location: pp.location });
    }

    for (const a of apps) {
      const row = a as {
        target_id: string;
        applicant_id: string;
        decided_at: string | null;
        created_at: string;
      };
      const sprintTitle = sprintMap.get(row.target_id);
      const profile = profileMap.get(row.applicant_id);
      if (!sprintTitle || !profile) continue;
      const firstName = profile.name.split(/\s+/)[0];
      const cityHint = profile.location?.split(",")[0]?.trim();
      items.push({
        kind: "joined_sprint",
        ts: row.decided_at ?? row.created_at,
        text: cityHint
          ? `${firstName} (${cityHint}) joined ${sprintTitle}`
          : `${firstName} joined ${sprintTitle}`,
      });
    }
  }

  // Recent badge awards
  const { data: badges } = await supabase
    .from("profile_badges")
    .select("profile_id, kind, awarded_at")
    .order("awarded_at", { ascending: false })
    .limit(6);

  if (badges && badges.length > 0) {
    const ids = Array.from(
      new Set(badges.map((b) => (b as { profile_id: string }).profile_id)),
    );
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", ids);
    const nameMap = new Map<string, string>();
    for (const p of profiles ?? [])
      nameMap.set(
        (p as { id: string }).id,
        (p as { full_name: string }).full_name,
      );
    for (const b of badges) {
      const row = b as {
        profile_id: string;
        kind: string;
        awarded_at: string;
      };
      const name = nameMap.get(row.profile_id)?.split(/\s+/)[0];
      if (!name) continue;
      const badgeLabel = humanBadge(row.kind);
      items.push({
        kind: "badge_awarded",
        ts: row.awarded_at,
        text: `${name} unlocked ${badgeLabel}`,
      });
    }
  }

  // Recent mutual matches
  const { data: matches } = await supabase
    .from("matches")
    .select("user_a, user_b, matched_at")
    .order("matched_at", { ascending: false })
    .limit(4);

  if (matches && matches.length > 0) {
    const ids = Array.from(
      new Set(
        (matches as Array<{ user_a: string; user_b: string }>).flatMap(
          (m) => [m.user_a, m.user_b],
        ),
      ),
    );
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", ids);
    const nameMap = new Map<string, string>();
    for (const p of profiles ?? [])
      nameMap.set(
        (p as { id: string }).id,
        (p as { full_name: string }).full_name,
      );
    for (const m of matches as Array<{
      user_a: string;
      user_b: string;
      matched_at: string;
    }>) {
      const a = nameMap.get(m.user_a)?.split(/\s+/)[0];
      const b = nameMap.get(m.user_b)?.split(/\s+/)[0];
      if (!a || !b) continue;
      items.push({
        kind: "matched",
        ts: m.matched_at,
        text: `${a} and ${b} are building together`,
      });
    }
  }

  // Recent profile creations — "N new builders this week"
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count: newProfiles } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .gte("created_at", weekAgo);
  if (newProfiles && newProfiles > 0) {
    items.push({
      kind: "joined_platform",
      ts: new Date().toISOString(),
      text: `${newProfiles} new builder${newProfiles === 1 ? "" : "s"} joined this week`,
    });
  }

  // Curated aspirational fillers (so the feed always reads alive)
  const filler: StreamEvent[] = [
    {
      kind: "city_session",
      ts: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      text: "NYC Build Circle meets Friday at the LES Cowork",
    },
    {
      kind: "summit",
      ts: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
      text: "Ali attended the ALIF Summit cohort kickoff",
    },
    {
      kind: "city_session",
      ts: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      text: "Toronto cowork Thursday · 8 builders RSVP'd",
    },
    {
      kind: "shipped_project",
      ts: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      text: "3 new projects launched on the platform",
    },
  ];
  items.push(...filler);

  // Sort desc, take limit
  items.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
  return items.slice(0, limit);
}

function humanBadge(kind: string): string {
  const m: Record<string, string> = {
    alif_verified: "Verified Builder",
    event_attendee: "ALIF Event Attendee",
    summit_participant: "Summit Participant",
    cohort_member: "Cohort Member",
    sprint_finisher: "Sprint Finisher",
    shipped_project: "Shipped Project",
    mentor_endorsed: "Mentor Endorsed",
    active_collaborator: "Active Builder",
  };
  return m[kind] ?? kind;
}

/** Lighter helper for the homepage Live Sprint section. */
export async function getNextOrLiveSprint(): Promise<{
  id: string;
  title: string;
  theme: string | null;
  description: string | null;
  start_date: string;
  end_date: string;
  status: "upcoming" | "live" | "completed";
  applicants: Array<{
    id: string;
    full_name: string;
    avatar_url: string | null;
  }>;
  applicantCount: number;
} | null> {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  // Prefer upcoming → live → most recent completed
  const tryQuery = async (
    op: "upcoming" | "live" | "completed",
  ): Promise<{ id: string; title: string; theme: string | null; description: string | null; start_date: string; end_date: string } | null> => {
    let q = supabase
      .from("sprints")
      .select("id, title, theme, description, start_date, end_date")
      .limit(1);
    if (op === "upcoming") {
      q = q.gt("start_date", today).order("start_date", { ascending: true });
    } else if (op === "live") {
      q = q.lte("start_date", today).gte("end_date", today).order("end_date", { ascending: true });
    } else {
      q = q.lt("end_date", today).order("end_date", { ascending: false });
    }
    const { data } = await q.maybeSingle();
    return data as never;
  };

  let sprint =
    (await tryQuery("upcoming")) ||
    (await tryQuery("live")) ||
    (await tryQuery("completed"));

  if (!sprint) return null;

  const todayDate = today;
  const status: "upcoming" | "live" | "completed" =
    sprint.end_date < todayDate
      ? "completed"
      : sprint.start_date <= todayDate
      ? "live"
      : "upcoming";

  // Applicants
  const { data: apps, count } = await supabase
    .from("applications")
    .select("applicant_id", { count: "exact" })
    .eq("target_type", "sprint")
    .eq("target_id", sprint.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const ids = (apps ?? []).map((a) => (a as { applicant_id: string }).applicant_id);
  let applicants: Array<{
    id: string;
    full_name: string;
    avatar_url: string | null;
  }> = [];
  if (ids.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", ids);
    applicants = (profiles ?? []) as typeof applicants;
  }

  return {
    ...sprint,
    status,
    applicants,
    applicantCount: count ?? 0,
  };
}
