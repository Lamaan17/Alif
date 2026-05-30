import "server-only";
import { createClient } from "@/lib/supabase/server";

export type ActivityKind =
  | "joined_sprint"
  | "shipped_project"
  | "badge_awarded"
  | "matched_with"
  | "intro_requested";

export type ActivityItem = {
  kind: ActivityKind;
  ts: string; // ISO timestamp
  text: string;
  href?: string;
};

/**
 * Build a contribution timeline for a profile by aggregating across
 * existing tables. Read-only. Returns the latest 8 entries.
 */
export async function getActivityForProfile(
  profileId: string,
  limit = 8,
): Promise<ActivityItem[]> {
  const supabase = createClient();
  const items: ActivityItem[] = [];

  // Past projects from profile JSON (no timestamp — use profile created_at as fallback)
  const { data: profile } = await supabase
    .from("profiles")
    .select("created_at, past_projects")
    .eq("id", profileId)
    .maybeSingle();

  if (profile) {
    const p = profile as {
      created_at: string;
      past_projects: Array<{ name: string; link?: string }> | null;
    };
    for (const pp of p.past_projects ?? []) {
      items.push({
        kind: "shipped_project",
        ts: p.created_at, // best signal we have without per-project timestamps
        text: `Shipped ${pp.name}`,
        href: pp.link || undefined,
      });
    }
  }

  // Accepted applications — counts as "joined sprint" or "joined project"
  const { data: apps } = await supabase
    .from("applications")
    .select("target_type, target_id, status, decided_at, created_at")
    .eq("applicant_id", profileId)
    .eq("status", "accepted")
    .order("decided_at", { ascending: false })
    .limit(20);

  if (apps && apps.length > 0) {
    const sprintIds = apps
      .filter((a) => (a as { target_type: string }).target_type === "sprint")
      .map((a) => (a as { target_id: string }).target_id);
    const projectIds = apps
      .filter((a) => (a as { target_type: string }).target_type === "project")
      .map((a) => (a as { target_id: string }).target_id);

    const titleMap = new Map<string, { title: string; href: string }>();
    if (sprintIds.length) {
      const { data: sprints } = await supabase
        .from("sprints")
        .select("id, title")
        .in("id", sprintIds);
      for (const s of sprints ?? []) {
        const sp = s as { id: string; title: string };
        titleMap.set(sp.id, { title: sp.title, href: `/sprints/${sp.id}` });
      }
    }
    if (projectIds.length) {
      const { data: projs } = await supabase
        .from("projects")
        .select("id, title")
        .in("id", projectIds);
      for (const p of projs ?? []) {
        const pr = p as { id: string; title: string };
        titleMap.set(pr.id, { title: pr.title, href: `/projects/${pr.id}` });
      }
    }
    for (const a of apps) {
      const row = a as {
        target_type: "project" | "sprint";
        target_id: string;
        decided_at: string | null;
        created_at: string;
      };
      const ref = titleMap.get(row.target_id);
      if (!ref) continue;
      items.push({
        kind: "joined_sprint",
        ts: row.decided_at ?? row.created_at,
        text:
          row.target_type === "sprint"
            ? `Joined ${ref.title}`
            : `Joined the ${ref.title} project team`,
        href: ref.href,
      });
    }
  }

  // Badges awarded
  const { data: badges } = await supabase
    .from("profile_badges")
    .select("kind, awarded_at")
    .eq("profile_id", profileId)
    .order("awarded_at", { ascending: false })
    .limit(20);

  for (const b of badges ?? []) {
    const row = b as { kind: string; awarded_at: string };
    const label = humanBadge(row.kind);
    items.push({
      kind: "badge_awarded",
      ts: row.awarded_at,
      text: `Earned ${label}`,
    });
  }

  // Mutual matches
  const { data: matches } = await supabase
    .from("matches")
    .select("user_a, user_b, matched_at")
    .or(`user_a.eq.${profileId},user_b.eq.${profileId}`)
    .order("matched_at", { ascending: false })
    .limit(8);

  if (matches && matches.length > 0) {
    const partners = (matches as Array<{ user_a: string; user_b: string; matched_at: string }>).map(
      (m) => ({
        ts: m.matched_at,
        otherId: m.user_a === profileId ? m.user_b : m.user_a,
      }),
    );
    const otherIds = partners.map((p) => p.otherId);
    if (otherIds.length) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", otherIds);
      const nameMap = new Map<string, string>();
      for (const p of profiles ?? []) {
        const pr = p as { id: string; full_name: string };
        nameMap.set(pr.id, pr.full_name);
      }
      for (const m of partners) {
        const name = nameMap.get(m.otherId);
        if (!name) continue;
        items.push({
          kind: "matched_with",
          ts: m.ts,
          text: `Connected with ${name}`,
          href: `/builders/${m.otherId}`,
        });
      }
    }
  }

  // Sort by timestamp desc, take limit
  items.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
  return items.slice(0, limit);
}

function humanBadge(kind: string): string {
  const labels: Record<string, string> = {
    // Canonical 11
    sessions_participant: "Sessions Alumni",
    alifers_member: "Alifers Member",
    hq_visitor: "HQ Regular",
    sprint_finisher: "Sprint Finisher",
    event_attendee: "Event Attendee",
    mvp_tester: "MVP Tester",
    website_roasted: "Website Roasted",
    community_ask_answered: "Community Ask Answered",
    project_helper: "Project Helper",
    mentor_endorsed: "Mentor Endorsed",
    build_sprint_host: "Build Sprint Host",
    // Legacy
    alif_verified: "Verified Builder",
    summit_participant: "Summit Participant",
    cohort_member: "Cohort Member",
    shipped_project: "Project Shipped",
    active_collaborator: "Active Builder",
    network_member: "Network Member",
    jumuah_attendee: "Jumuah Attendee",
    tournament_builder: "Tournament Builder",
    portfolio_contributor: "Portfolio Contributor",
  };
  return labels[kind] ?? kind;
}
