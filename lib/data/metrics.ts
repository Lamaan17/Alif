import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Aspirational metrics for the "For ALIF" strategic page.
 * These are baseline demo numbers — real counts are added on top so the page
 * grows as the platform grows.
 *
 * Source of truth for the "live counts" row on the admin dashboard:
 * use getLiveMetrics() — it queries the real DB.
 */
export const ASPIRATIONAL_METRICS = {
  startups_formed: 47,
  projects_launched: 312,
  sprint_completions: 28,
  verified_builders: 156,
  successful_matches: 89,
  active_collaborators: 412,
} as const;

export type LiveMetrics = {
  total_profiles: number;
  verified_profiles: number;
  total_projects: number;
  total_sprints: number;
  total_applications: number;
  total_matches: number;
};

export async function getLiveMetrics(): Promise<LiveMetrics> {
  const supabase = createClient();
  const [
    { count: profiles },
    { count: verified },
    { count: projects },
    { count: sprints },
    { count: applications },
    { count: matches },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("verified", true),
    supabase.from("projects").select("id", { count: "exact", head: true }),
    supabase.from("sprints").select("id", { count: "exact", head: true }),
    supabase
      .from("applications")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("matches")
      .select("user_a", { count: "exact", head: true }),
  ]);
  return {
    total_profiles: profiles ?? 0,
    verified_profiles: verified ?? 0,
    total_projects: projects ?? 0,
    total_sprints: sprints ?? 0,
    total_applications: applications ?? 0,
    total_matches: matches ?? 0,
  };
}
