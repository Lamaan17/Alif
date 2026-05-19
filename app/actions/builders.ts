"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult =
  | { ok: true; matched?: boolean }
  | { ok: false; error: string };

export async function toggleInterest(
  targetUserId: string,
  intent: "interested" | "uninterested",
): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };
  if (user.id === targetUserId)
    return { ok: false, error: "Can't add yourself" };

  if (intent === "uninterested") {
    const { error } = await supabase
      .from("interests")
      .delete()
      .eq("from_user", user.id)
      .eq("to_user", targetUserId);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/builders");
    revalidatePath(`/builders/${targetUserId}`);
    return { ok: true, matched: false };
  }

  // Insert (idempotent via PK).
  const { error } = await supabase
    .from("interests")
    .upsert(
      { from_user: user.id, to_user: targetUserId },
      { onConflict: "from_user,to_user" },
    );
  if (error) return { ok: false, error: error.message };

  // Did this create a mutual match?
  const { data: reverse } = await supabase
    .from("interests")
    .select("from_user")
    .eq("from_user", targetUserId)
    .eq("to_user", user.id)
    .maybeSingle();

  revalidatePath("/builders");
  revalidatePath(`/builders/${targetUserId}`);
  return { ok: true, matched: !!reverse };
}

export async function sendInvitation(args: {
  toUserId: string;
  projectTopic: string;
  message: string;
}): Promise<ActionResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };
  if (user.id === args.toUserId)
    return { ok: false, error: "Can't invite yourself" };

  const { error } = await supabase.from("invitations").insert({
    from_user: user.id,
    to_user: args.toUserId,
    project_topic: args.projectTopic.trim() || null,
    message: args.message.trim() || null,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/builders");
  revalidatePath(`/builders/${args.toUserId}`);
  return { ok: true };
}
