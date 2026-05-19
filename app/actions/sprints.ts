"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function applyToSprint(args: {
  sprintId: string;
  message: string;
}): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  // Don't allow applying to a completed sprint.
  const { data: sprint } = await supabase
    .from("sprints")
    .select("end_date")
    .eq("id", args.sprintId)
    .maybeSingle();
  if (sprint) {
    const today = new Date().toISOString().slice(0, 10);
    if ((sprint as { end_date: string }).end_date < today) {
      return { ok: false, error: "This sprint has already ended" };
    }
  }

  const { error } = await supabase.from("applications").upsert(
    {
      target_type: "sprint",
      target_id: args.sprintId,
      applicant_id: user.id,
      message: args.message.trim() || null,
      status: "pending",
    },
    { onConflict: "target_type,target_id,applicant_id" },
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/sprints");
  revalidatePath(`/sprints/${args.sprintId}`);
  return { ok: true };
}
