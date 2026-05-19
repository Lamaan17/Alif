import "server-only";
import { createClient } from "@/lib/supabase/server";

export type TickerKind = "sprint" | "live" | "project" | "stat" | "milestone";

export type TickerItem = {
  kind: TickerKind;
  text: string;
  href?: string;
};

export async function getTickerItems(): Promise<TickerItem[]> {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  const items: TickerItem[] = [];

  // 1. Live sprint(s)
  const { data: liveSprint } = await supabase
    .from("sprints")
    .select("id, title, end_date")
    .lte("start_date", today)
    .gte("end_date", today)
    .order("end_date", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (liveSprint) {
    const s = liveSprint as { id: string; title: string; end_date: string };
    const days = Math.max(
      0,
      Math.ceil((new Date(s.end_date).getTime() - Date.now()) / 86400000),
    );
    items.push({
      kind: "live",
      text: `Live now: ${s.title} · ${days} day${days === 1 ? "" : "s"} left`,
      href: `/sprints/${s.id}`,
    });
  }

  // 2. Next upcoming sprint
  const { data: nextSprint } = await supabase
    .from("sprints")
    .select("id, title, start_date")
    .gt("start_date", today)
    .order("start_date", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (nextSprint) {
    const s = nextSprint as { id: string; title: string; start_date: string };
    const date = new Date(s.start_date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    items.push({
      kind: "sprint",
      text: `Next sprint: ${s.title} starts ${date} — applications open`,
      href: `/sprints/${s.id}`,
    });
  }

  // 3. Open project count
  const { count: openProjects } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .or(`deadline.is.null,deadline.gte.${today}`);
  if (openProjects && openProjects > 0) {
    items.push({
      kind: "project",
      text: `${openProjects} project${openProjects === 1 ? "" : "s"} open for collaboration`,
      href: "/projects",
    });
  }

  // 4. Verified builder count
  const { count: verifiedCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("verified", true);
  if (verifiedCount && verifiedCount > 0) {
    items.push({
      kind: "stat",
      text: `${verifiedCount} verified builders in the ALIF ecosystem`,
      href: "/builders",
    });
  }

  // 5. Founder Circle count
  const { count: circleCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .gte("level", 3);
  if (circleCount && circleCount > 0) {
    items.push({
      kind: "milestone",
      text: `${circleCount} member${circleCount === 1 ? "" : "s"} now in the Founder Circle`,
    });
  }

  // Filler so ticker always reads as a feed, not empty
  if (items.length === 0) {
    items.push({
      kind: "milestone",
      text: "Build Together — founder formation for ALIF members",
    });
  }

  return items;
}
