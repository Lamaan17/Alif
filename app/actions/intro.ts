"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function requestIntro(args: {
  toUserId: string;
  message: string;
}): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };
  if (user.id === args.toUserId)
    return { ok: false, error: "Can't request from yourself" };

  // Gate: only Level >= 3 can request intros (matches the page gating).
  const { data: me } = await supabase
    .from("profiles")
    .select("level")
    .eq("id", user.id)
    .maybeSingle();
  const myLevel = (me as { level: number } | null)?.level ?? 0;
  if (myLevel < 3) {
    return {
      ok: false,
      error: "Reach Level 3 (Verified Builder) to request intros.",
    };
  }

  const { error } = await supabase.from("intro_requests").insert({
    from_user: user.id,
    to_user: args.toUserId,
    message: args.message.trim() || null,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/circle");
  return { ok: true };
}
