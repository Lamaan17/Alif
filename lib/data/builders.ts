import "server-only";
import { createClient } from "@/lib/supabase/server";

export type BuilderRow = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  location: string | null;
  timezone: string | null;
  role_type: string | null;
  skills: string[];
  industries: string[];
  startup_stage: string | null;
  looking_for: string[];
  weekly_hours: number | null;
  bio: string | null;
  proof_of_work: Array<{ label?: string; url: string }>;
  past_projects: Array<{ name: string; link?: string; description?: string }>;
  working_style: string | null;
  commitment_level: string | null;
  open_to_remote: boolean;
  open_to_in_person: boolean;
  verified: boolean;
  level: number;
  created_at: string;
};

export type BuilderFilters = {
  role?: string;
  looking?: string[];
  industries?: string[];
  timezone?: string;
  minHours?: number;
  verifiedOnly?: boolean;
};

const SELECT = `
  id, full_name, avatar_url, location, timezone, role_type,
  skills, industries, startup_stage, looking_for, weekly_hours, bio,
  proof_of_work, past_projects, working_style, commitment_level,
  open_to_remote, open_to_in_person, verified, level, created_at
`;

export async function listBuilders(opts: {
  excludeUserId: string;
  filters: BuilderFilters;
  limit?: number;
}): Promise<BuilderRow[]> {
  const supabase = createClient();
  let q = supabase
    .from("profiles")
    .select(SELECT)
    .neq("id", opts.excludeUserId)
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 48);

  const f = opts.filters;
  if (f.role) q = q.eq("role_type", f.role);
  if (f.looking?.length) q = q.overlaps("looking_for", f.looking);
  if (f.industries?.length) q = q.overlaps("industries", f.industries);
  if (f.timezone) q = q.ilike("timezone", `%${f.timezone}%`);
  if (typeof f.minHours === "number" && f.minHours > 0) {
    q = q.gte("weekly_hours", f.minHours);
  }
  if (f.verifiedOnly) q = q.eq("verified", true);

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as BuilderRow[];
}

export async function getBuilder(id: string): Promise<BuilderRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as BuilderRow | null) ?? null;
}

/**
 * Map of `to_user` → true for everyone the current viewer has expressed
 * interest in. Used to render the "Interested" button as toggled.
 */
export async function getMyInterestsSet(viewerId: string): Promise<Set<string>> {
  const supabase = createClient();
  const { data } = await supabase
    .from("interests")
    .select("to_user")
    .eq("from_user", viewerId);
  return new Set((data ?? []).map((r) => r.to_user as string));
}

/**
 * Set of user ids who have expressed interest in *me*.
 */
export async function getIncomingInterestsSet(
  viewerId: string,
): Promise<Set<string>> {
  const supabase = createClient();
  const { data } = await supabase
    .from("interests")
    .select("from_user")
    .eq("to_user", viewerId);
  return new Set((data ?? []).map((r) => (r as { from_user: string }).from_user));
}

/**
 * Set of user ids where the viewer has a *mutual* match (the matches view
 * stores pairs as (least, greatest), so we just collect every partner).
 */
export async function getMyMatchesSet(viewerId: string): Promise<Set<string>> {
  const supabase = createClient();
  const { data } = await supabase
    .from("matches")
    .select("user_a, user_b")
    .or(`user_a.eq.${viewerId},user_b.eq.${viewerId}`);
  const set = new Set<string>();
  for (const m of data ?? []) {
    const a = (m as { user_a: string }).user_a;
    const b = (m as { user_b: string }).user_b;
    set.add(a === viewerId ? b : a);
  }
  return set;
}

export async function getMatchCount(viewerId: string): Promise<number> {
  const supabase = createClient();
  const { count } = await supabase
    .from("matches")
    .select("user_a", { count: "exact", head: true })
    .or(`user_a.eq.${viewerId},user_b.eq.${viewerId}`);
  return count ?? 0;
}
