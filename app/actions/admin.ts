"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/data/admin";

type ActionResult<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

async function requireAdmin(): Promise<
  | { ok: true; userId: string }
  | { ok: false; error: string }
> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const admin = await isAdmin(user.id);
  if (!admin) return { ok: false, error: "Admin access required" };
  return { ok: true, userId: user.id };
}

/* ---------- profile mutations ---------- */

export async function setLevel(
  targetUserId: string,
  level: number,
): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;
  if (level < 0 || level > 4) return { ok: false, error: "Level must be 0–4" };

  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ level })
    .eq("id", targetUserId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin", "layout");
  revalidatePath(`/builders/${targetUserId}`);
  return { ok: true };
}

export async function setVerified(
  targetUserId: string,
  verified: boolean,
): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ verified })
    .eq("id", targetUserId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin", "layout");
  revalidatePath(`/builders/${targetUserId}`);
  return { ok: true };
}

export async function setAdminFlag(
  targetUserId: string,
  isAdminFlag: boolean,
): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  // Soft safeguard: don't let someone demote themselves if they're the only admin.
  if (gate.userId === targetUserId && !isAdminFlag) {
    const supabase = createClient();
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_admin", true);
    if ((count ?? 0) <= 1) {
      return { ok: false, error: "Can't remove the last admin." };
    }
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_admin: isAdminFlag })
    .eq("id", targetUserId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin", "layout");
  return { ok: true };
}

/* ---------- badge mutations ---------- */

const BADGE_KIND = z.enum([
  "alif_verified",
  "event_attendee",
  "cohort_member",
  "sprint_finisher",
  "shipped_project",
  "mentor_endorsed",
  "active_collaborator",
]);

export async function toggleBadge(
  targetUserId: string,
  kind: string,
  on: boolean,
): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const parsed = BADGE_KIND.safeParse(kind);
  if (!parsed.success) return { ok: false, error: "Unknown badge" };

  const supabase = createClient();
  if (on) {
    const { error } = await supabase
      .from("profile_badges")
      .upsert(
        { profile_id: targetUserId, kind: parsed.data },
        { onConflict: "profile_id,kind" },
      );
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase
      .from("profile_badges")
      .delete()
      .eq("profile_id", targetUserId)
      .eq("kind", parsed.data);
    if (error) return { ok: false, error: error.message };
  }
  revalidatePath("/admin", "layout");
  revalidatePath(`/builders/${targetUserId}`);
  return { ok: true };
}

/* ---------- sprint CRUD ---------- */

const SprintInput = z.object({
  title: z.string().trim().min(3, "Title too short").max(140),
  theme: z.string().trim().max(200).optional().default(""),
  description: z.string().trim().max(2000).optional().default(""),
  deliverable: z.string().trim().max(500).optional().default(""),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD"),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD"),
  max_team_size: z.coerce.number().int().min(2).max(10).default(3),
  recommended_roles: z
    .array(
      z.enum([
        "technical",
        "business",
        "product",
        "design",
        "operator",
        "domain_expert",
      ]),
    )
    .default([]),
});

export type SprintInput = z.infer<typeof SprintInput>;

export async function createSprint(
  raw: SprintInput,
): Promise<ActionResult<{ id: string }>> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;
  const parsed = SprintInput.safeParse(raw);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0].message };
  const v = parsed.data;
  if (v.end_date < v.start_date)
    return { ok: false, error: "End date must be on or after start date." };

  const supabase = createClient();
  const { data, error } = await supabase
    .from("sprints")
    .insert({
      title: v.title,
      theme: v.theme || null,
      description: v.description || null,
      deliverable: v.deliverable || null,
      start_date: v.start_date,
      end_date: v.end_date,
      max_team_size: v.max_team_size,
      recommended_roles: v.recommended_roles,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin", "layout");
  revalidatePath("/sprints");
  return { ok: true, data: { id: (data as { id: string }).id } };
}

export async function deleteSprint(id: string): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;
  const supabase = createClient();
  const { error } = await supabase.from("sprints").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin", "layout");
  revalidatePath("/sprints");
  return { ok: true };
}

/* ---------- application & intro decisions (admin override) ---------- */

export async function adminDecideApplication(
  applicationId: string,
  decision: "accepted" | "declined",
): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;
  const supabase = createClient();
  const { error } = await supabase
    .from("applications")
    .update({
      status: decision,
      decided_at: new Date().toISOString(),
    })
    .eq("id", applicationId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function adminDecideIntro(
  introId: string,
  decision: "accepted" | "declined",
): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;
  const supabase = createClient();
  const { error } = await supabase
    .from("intro_requests")
    .update({ status: decision })
    .eq("id", introId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin", "layout");
  return { ok: true };
}

/* ---------- project moderation ---------- */

export async function adminDeleteProject(
  projectId: string,
): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;
  const supabase = createClient();
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin", "layout");
  revalidatePath("/projects");
  return { ok: true };
}
