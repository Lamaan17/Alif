import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getBadgesForProfile(profileId: string): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("profile_badges")
    .select("kind")
    .eq("profile_id", profileId)
    .order("awarded_at", { ascending: false });
  return (data ?? []).map((r) => (r as { kind: string }).kind);
}

export async function getBadgesForMany(
  profileIds: string[],
): Promise<Map<string, string[]>> {
  const supabase = createClient();
  if (profileIds.length === 0) return new Map();
  const { data } = await supabase
    .from("profile_badges")
    .select("profile_id, kind")
    .in("profile_id", profileIds);
  const map = new Map<string, string[]>();
  for (const r of data ?? []) {
    const row = r as { profile_id: string; kind: string };
    const arr = map.get(row.profile_id) ?? [];
    arr.push(row.kind);
    map.set(row.profile_id, arr);
  }
  return map;
}
