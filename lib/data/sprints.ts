import "server-only";
import { createClient } from "@/lib/supabase/server";

export type SprintStatus = "upcoming" | "live" | "completed";

export type SprintRow = {
  id: string;
  title: string;
  theme: string | null;
  description: string | null;
  deliverable: string | null;
  start_date: string;
  end_date: string;
  max_team_size: number;
  recommended_roles: string[];
  created_at: string;
  status: SprintStatus;
  applicant_count?: number;
};

function deriveStatus(start: string, end: string): SprintStatus {
  const today = new Date().toISOString().slice(0, 10);
  if (end < today) return "completed";
  if (start <= today) return "live";
  return "upcoming";
}

function annotate(rows: Omit<SprintRow, "status">[]): SprintRow[] {
  return rows.map((r) => ({
    ...r,
    status: deriveStatus(r.start_date, r.end_date),
  }));
}

const SPRINT_SELECT = `
  id, title, theme, description, deliverable, start_date, end_date,
  max_team_size, recommended_roles, created_at
`;

export async function listSprints(): Promise<SprintRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sprints")
    .select(SPRINT_SELECT)
    .order("start_date", { ascending: false });
  if (error) throw new Error(error.message);
  return annotate((data ?? []) as Omit<SprintRow, "status">[]);
}

export async function getSprint(id: string): Promise<SprintRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sprints")
    .select(SPRINT_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return annotate([data as Omit<SprintRow, "status">])[0];
}

export async function getMyApplicationsForSprints(
  applicantId: string,
): Promise<Map<string, "pending" | "accepted" | "declined" | "withdrawn">> {
  const supabase = createClient();
  const { data } = await supabase
    .from("applications")
    .select("target_id, status")
    .eq("target_type", "sprint")
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
