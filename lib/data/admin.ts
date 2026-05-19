import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .maybeSingle();
  return !!(data as { is_admin: boolean } | null)?.is_admin;
}

export type AdminProfileRow = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  location: string | null;
  role_type: string | null;
  level: number;
  verified: boolean;
  is_admin: boolean;
  created_at: string;
  past_projects: unknown[];
  badges: string[];
};

export async function listAllProfiles({
  search,
}: {
  search?: string;
}): Promise<AdminProfileRow[]> {
  const supabase = createClient();
  let q = supabase
    .from("profiles")
    .select(
      `
        id, full_name, avatar_url, location, role_type, level, verified,
        is_admin, created_at, past_projects
      `,
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (search && search.trim()) {
    q = q.ilike("full_name", `%${search.trim()}%`);
  }
  const { data, error } = await q;
  if (error) throw new Error(error.message);

  const ids = (data ?? []).map((r) => (r as { id: string }).id);
  const badges = await getBadgesMap(ids);
  return (data ?? []).map((r) => {
    const row = r as Omit<AdminProfileRow, "badges">;
    return { ...row, badges: badges.get(row.id) ?? [] };
  });
}

async function getBadgesMap(ids: string[]): Promise<Map<string, string[]>> {
  if (ids.length === 0) return new Map();
  const supabase = createClient();
  const { data } = await supabase
    .from("profile_badges")
    .select("profile_id, kind")
    .in("profile_id", ids);
  const map = new Map<string, string[]>();
  for (const r of data ?? []) {
    const row = r as { profile_id: string; kind: string };
    const arr = map.get(row.profile_id) ?? [];
    arr.push(row.kind);
    map.set(row.profile_id, arr);
  }
  return map;
}

export type AdminProjectRow = {
  id: string;
  title: string;
  one_liner: string;
  industry: string | null;
  current_stage: string | null;
  collab_mode: string | null;
  deadline: string | null;
  created_at: string;
  owner_id: string;
  owner: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    verified: boolean;
    level: number;
  } | null;
  application_count: number;
};

export async function listAllProjects(): Promise<AdminProjectRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      `
        id, title, one_liner, industry, current_stage, collab_mode, deadline,
        created_at, owner_id,
        owner:profiles!projects_owner_id_fkey (
          id, full_name, avatar_url, verified, level
        )
      `,
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);

  // Get application counts in one shot
  const ids = (data ?? []).map((r) => (r as { id: string }).id);
  const counts = await getApplicationCountsForTargets("project", ids);
  return (data ?? []).map((r) => {
    const row = r as unknown as Omit<AdminProjectRow, "application_count"> & {
      owner: AdminProjectRow["owner"] | AdminProjectRow["owner"][];
    };
    const owner = Array.isArray(row.owner) ? row.owner[0] ?? null : row.owner;
    return {
      ...row,
      owner: owner as AdminProjectRow["owner"],
      application_count: counts.get(row.id) ?? 0,
    };
  });
}

async function getApplicationCountsForTargets(
  targetType: "project" | "sprint",
  ids: string[],
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (ids.length === 0) return map;
  const supabase = createClient();
  const { data } = await supabase
    .from("applications")
    .select("target_id")
    .eq("target_type", targetType)
    .in("target_id", ids);
  for (const r of data ?? []) {
    const id = (r as { target_id: string }).target_id;
    map.set(id, (map.get(id) ?? 0) + 1);
  }
  return map;
}

export type AdminSprintRow = {
  id: string;
  title: string;
  theme: string | null;
  description: string | null;
  deliverable: string | null;
  start_date: string;
  end_date: string;
  max_team_size: number;
  recommended_roles: string[];
  application_count: number;
  status: "upcoming" | "live" | "completed";
};

export async function listAllSprints(): Promise<AdminSprintRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sprints")
    .select(
      `
        id, title, theme, description, deliverable, start_date, end_date,
        max_team_size, recommended_roles
      `,
    )
    .order("start_date", { ascending: false });
  if (error) throw new Error(error.message);

  const ids = (data ?? []).map((r) => (r as { id: string }).id);
  const counts = await getApplicationCountsForTargets("sprint", ids);
  const today = new Date().toISOString().slice(0, 10);
  return (data ?? []).map((r) => {
    const row = r as Omit<AdminSprintRow, "application_count" | "status">;
    return {
      ...row,
      application_count: counts.get(row.id) ?? 0,
      status:
        row.end_date < today
          ? "completed"
          : row.start_date <= today
          ? "live"
          : "upcoming",
    };
  });
}

export type AdminApplicationRow = {
  id: string;
  target_type: "project" | "sprint";
  target_id: string;
  message: string | null;
  status: "pending" | "accepted" | "declined" | "withdrawn";
  created_at: string;
  applicant: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    role_type: string | null;
    level: number;
  } | null;
  target_title?: string;
};

export async function listAllApplications(filter?: {
  type?: "project" | "sprint";
  status?: "pending" | "accepted" | "declined" | "withdrawn";
}): Promise<AdminApplicationRow[]> {
  const supabase = createClient();
  let q = supabase
    .from("applications")
    .select(
      `
        id, target_type, target_id, message, status, created_at,
        applicant:profiles!applications_applicant_id_fkey (
          id, full_name, avatar_url, role_type, level
        )
      `,
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (filter?.type) q = q.eq("target_type", filter.type);
  if (filter?.status) q = q.eq("status", filter.status);
  const { data, error } = await q;
  if (error) throw new Error(error.message);

  // Resolve target titles
  const rows = (data ?? []) as unknown as Array<
    AdminApplicationRow & { applicant: AdminApplicationRow["applicant"] | AdminApplicationRow["applicant"][] }
  >;
  const projectIds = rows
    .filter((r) => r.target_type === "project")
    .map((r) => r.target_id);
  const sprintIds = rows
    .filter((r) => r.target_type === "sprint")
    .map((r) => r.target_id);

  const titles = new Map<string, string>();
  if (projectIds.length) {
    const { data: ps } = await supabase
      .from("projects")
      .select("id, title")
      .in("id", projectIds);
    for (const p of ps ?? [])
      titles.set(
        (p as { id: string }).id,
        (p as { title: string }).title,
      );
  }
  if (sprintIds.length) {
    const { data: ss } = await supabase
      .from("sprints")
      .select("id, title")
      .in("id", sprintIds);
    for (const s of ss ?? [])
      titles.set(
        (s as { id: string }).id,
        (s as { title: string }).title,
      );
  }

  return rows.map((r) => ({
    ...r,
    applicant: Array.isArray(r.applicant) ? r.applicant[0] ?? null : r.applicant,
    target_title: titles.get(r.target_id),
  }));
}

export type AdminIntroRow = {
  id: string;
  message: string | null;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  from_user: string;
  to_user: string;
  from_profile: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    level: number;
  } | null;
  to_profile: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    level: number;
  } | null;
};

export async function listAllIntros(): Promise<AdminIntroRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("intro_requests")
    .select(
      `
        id, message, status, created_at, from_user, to_user,
        from_profile:profiles!intro_requests_from_user_fkey (
          id, full_name, avatar_url, level
        ),
        to_profile:profiles!intro_requests_to_user_fkey (
          id, full_name, avatar_url, level
        )
      `,
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as unknown as Array<
    AdminIntroRow & {
      from_profile: AdminIntroRow["from_profile"] | AdminIntroRow["from_profile"][];
      to_profile: AdminIntroRow["to_profile"] | AdminIntroRow["to_profile"][];
    }
  >;
  return rows.map((r) => ({
    ...r,
    from_profile: Array.isArray(r.from_profile)
      ? r.from_profile[0] ?? null
      : r.from_profile,
    to_profile: Array.isArray(r.to_profile)
      ? r.to_profile[0] ?? null
      : r.to_profile,
  }));
}

export async function getAdminOverviewCounts() {
  const supabase = createClient();
  const [
    profiles,
    verified,
    admins,
    l3plus,
    projects,
    sprints,
    appsPending,
    appsAccepted,
    intros,
    matches,
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("verified", true),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_admin", true),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("level", 3),
    supabase.from("projects").select("id", { count: "exact", head: true }),
    supabase.from("sprints").select("id", { count: "exact", head: true }),
    supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "accepted"),
    supabase
      .from("intro_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("matches")
      .select("user_a", { count: "exact", head: true }),
  ]);
  return {
    profiles: profiles.count ?? 0,
    verified: verified.count ?? 0,
    admins: admins.count ?? 0,
    l3plus: l3plus.count ?? 0,
    projects: projects.count ?? 0,
    sprints: sprints.count ?? 0,
    apps_pending: appsPending.count ?? 0,
    apps_accepted: appsAccepted.count ?? 0,
    intros_pending: intros.count ?? 0,
    matches: matches.count ?? 0,
  };
}
