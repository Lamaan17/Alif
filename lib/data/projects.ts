import "server-only";
import { createClient } from "@/lib/supabase/server";

export type ProjectRow = {
  id: string;
  owner_id: string;
  title: string;
  one_liner: string;
  problem: string | null;
  industry: string | null;
  current_stage: string | null;
  skills_needed: string[];
  ideal_collaborator: string | null;
  time_commitment_hours: number | null;
  duration_weeks: number | null;
  collab_mode: "remote" | "in_person" | "hybrid" | null;
  deadline: string | null;
  created_at: string;
  owner?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    role_type: string | null;
    verified: boolean;
    level: number;
  };
  application_count?: number;
  is_open?: boolean;
};

const PROJECT_SELECT = `
  id, owner_id, title, one_liner, problem, industry, current_stage,
  skills_needed, ideal_collaborator, time_commitment_hours, duration_weeks,
  collab_mode, deadline, created_at,
  owner:profiles!projects_owner_id_fkey (
    id, full_name, avatar_url, role_type, verified, level
  )
`;

export type ProjectFilters = {
  industry?: string;
  stage?: string;
  collab?: string;
  openOnly?: boolean;
};

function withOpenFlag<T extends { deadline: string | null }>(rows: T[]) {
  const today = new Date().toISOString().slice(0, 10);
  return rows.map((r) => ({
    ...r,
    is_open: !r.deadline || r.deadline >= today,
  }));
}

export async function listProjects(
  filters: ProjectFilters = {},
): Promise<ProjectRow[]> {
  const supabase = createClient();
  let q = supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .order("created_at", { ascending: false })
    .limit(60);
  if (filters.industry) q = q.eq("industry", filters.industry);
  if (filters.stage) q = q.eq("current_stage", filters.stage);
  if (filters.collab) q = q.eq("collab_mode", filters.collab);
  if (filters.openOnly) {
    const today = new Date().toISOString().slice(0, 10);
    q = q.or(`deadline.is.null,deadline.gte.${today}`);
  }
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return withOpenFlag((data ?? []) as unknown as ProjectRow[]);
}

export async function getProject(id: string): Promise<ProjectRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const [row] = withOpenFlag([data as unknown as ProjectRow]);
  return row;
}

export async function getMyApplicationsForProjects(
  applicantId: string,
): Promise<Map<string, "pending" | "accepted" | "declined" | "withdrawn">> {
  const supabase = createClient();
  const { data } = await supabase
    .from("applications")
    .select("target_id, status")
    .eq("target_type", "project")
    .eq("applicant_id", applicantId);
  const map = new Map<
    string,
    "pending" | "accepted" | "declined" | "withdrawn"
  >();
  for (const r of data ?? [])
    map.set(
      (r as { target_id: string }).target_id,
      (r as { status: "pending" | "accepted" | "declined" | "withdrawn" })
        .status,
    );
  return map;
}

export async function getApplicationsForProject(projectId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("applications")
    .select(
      `
        id, message, status, created_at, decided_at,
        applicant:profiles!applications_applicant_id_fkey (
          id, full_name, avatar_url, role_type, location, timezone,
          verified, level, skills
        )
      `,
    )
    .eq("target_type", "project")
    .eq("target_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
