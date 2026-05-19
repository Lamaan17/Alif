"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const ProjectInput = z.object({
  title: z.string().trim().min(3, "Title is too short").max(120),
  one_liner: z.string().trim().min(10, "Tell us a bit more").max(160),
  problem: z.string().trim().max(800).optional().default(""),
  industry: z.string().trim().max(60).optional().default(""),
  current_stage: z
    .enum(["exploring", "has_idea", "building", "launched"])
    .optional(),
  skills_needed: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  ideal_collaborator: z
    .enum([
      "technical",
      "business",
      "product",
      "design",
      "operator",
      "domain_expert",
    ])
    .optional(),
  time_commitment_hours: z.coerce.number().int().min(1).max(80).optional(),
  duration_weeks: z.coerce.number().int().min(1).max(52).optional(),
  collab_mode: z.enum(["remote", "in_person", "hybrid"]).default("remote"),
  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .optional()
    .or(z.literal("")),
});

export type ProjectInput = z.infer<typeof ProjectInput>;

type ActionResult<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

function blankToNull<T extends string | number | undefined>(
  v: T,
): T | null {
  if (typeof v === "string" && v.trim() === "") return null as never;
  if (v === undefined) return null as never;
  return v;
}

export async function createProject(
  raw: ProjectInput,
): Promise<ActionResult<{ id: string }>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const parsed = ProjectInput.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  const v = parsed.data;

  const { data, error } = await supabase
    .from("projects")
    .insert({
      owner_id: user.id,
      title: v.title.trim(),
      one_liner: v.one_liner.trim(),
      problem: blankToNull(v.problem),
      industry: blankToNull(v.industry),
      current_stage: v.current_stage ?? null,
      skills_needed: v.skills_needed,
      ideal_collaborator: v.ideal_collaborator ?? null,
      time_commitment_hours: v.time_commitment_hours ?? null,
      duration_weeks: v.duration_weeks ?? null,
      collab_mode: v.collab_mode,
      deadline: v.deadline ? v.deadline : null,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  revalidatePath("/projects");
  return { ok: true, data: { id: data.id as string } };
}

export async function applyToProject(args: {
  projectId: string;
  message: string;
}): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  // Don't let the owner apply to their own project.
  const { data: proj } = await supabase
    .from("projects")
    .select("owner_id")
    .eq("id", args.projectId)
    .maybeSingle();
  if (proj && (proj as { owner_id: string }).owner_id === user.id) {
    return { ok: false, error: "You can't apply to your own project" };
  }

  const { error } = await supabase.from("applications").upsert(
    {
      target_type: "project",
      target_id: args.projectId,
      applicant_id: user.id,
      message: args.message.trim() || null,
      status: "pending",
    },
    { onConflict: "target_type,target_id,applicant_id" },
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/projects");
  revalidatePath(`/projects/${args.projectId}`);
  return { ok: true };
}

export async function decideApplication(args: {
  applicationId: string;
  decision: "accepted" | "declined";
}): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const { error, data } = await supabase
    .from("applications")
    .update({
      status: args.decision,
      decided_at: new Date().toISOString(),
    })
    .eq("id", args.applicationId)
    .select("target_id, target_type")
    .single();

  if (error) return { ok: false, error: error.message };

  if (data?.target_type === "project") {
    revalidatePath(`/projects/${data.target_id}`);
  }
  return { ok: true };
}

export async function withdrawApplication(
  applicationId: string,
): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const { error } = await supabase
    .from("applications")
    .update({
      status: "withdrawn",
      decided_at: new Date().toISOString(),
    })
    .eq("id", applicationId)
    .eq("applicant_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/projects");
  return { ok: true };
}

// Server-side redirect helper used after createProject to land on the new page.
export async function goTo(path: string): Promise<never> {
  redirect(path);
}
