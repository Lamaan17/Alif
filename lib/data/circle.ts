import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { BuilderRow } from "./builders";

const SELECT = `
  id, full_name, avatar_url, location, timezone, role_type,
  skills, industries, startup_stage, looking_for, weekly_hours, bio,
  proof_of_work, past_projects, working_style, commitment_level,
  open_to_remote, open_to_in_person, verified, created_at, level, is_admin
`;

/** List members at Level >= 3 (Verified Builder + Founder Circle). */
export async function listCircleMembers(
  excludeUserId: string,
): Promise<(BuilderRow & { level: number })[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(SELECT)
    .gte("level", 3)
    .neq("id", excludeUserId)
    .order("level", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as (BuilderRow & { level: number })[];
}

export async function getMyIntroRequestsSet(
  fromUserId: string,
): Promise<Set<string>> {
  const supabase = createClient();
  const { data } = await supabase
    .from("intro_requests")
    .select("to_user")
    .eq("from_user", fromUserId);
  return new Set((data ?? []).map((r) => (r as { to_user: string }).to_user));
}
