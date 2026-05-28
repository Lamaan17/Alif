"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { meetsAudience } from "@/lib/profile-options";

type ActionResult<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const AskInput = z.object({
  title: z.string().trim().min(5, "Give your ask a clear title").max(140),
  body: z.string().trim().max(1200).optional().default(""),
  kind: z.enum([
    "general",
    "website_roast",
    "pitch_feedback",
    "mvp_testing",
    "intro",
    "feedback",
  ]),
  audience: z.enum(["open", "contributors", "community", "trusted"]),
});

export type AskInput = z.infer<typeof AskInput>;

async function viewer() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("level, is_admin")
    .eq("id", user.id)
    .maybeSingle();
  return {
    id: user.id,
    level: (data as { level: number } | null)?.level ?? 0,
    isAdmin: !!(data as { is_admin: boolean } | null)?.is_admin,
  };
}

export async function createAsk(
  raw: AskInput,
): Promise<ActionResult<{ id: string }>> {
  const v = await viewer();
  if (!v) return { ok: false, error: "Not signed in" };

  // Posting Community Asks is a Community Member (level 3) privilege.
  if (v.level < 3 && !v.isAdmin) {
    return {
      ok: false,
      error:
        "Posting asks unlocks at Community Member. Keep contributing to unlock deeper access.",
    };
  }

  const parsed = AskInput.safeParse(raw);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0].message };

  const supabase = createClient();
  const { data, error } = await supabase
    .from("asks")
    .insert({
      author_id: v.id,
      title: parsed.data.title,
      body: parsed.data.body || null,
      kind: parsed.data.kind,
      audience: parsed.data.audience,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  revalidatePath("/asks");
  return { ok: true, data: { id: (data as { id: string }).id } };
}

export async function answerAsk(args: {
  askId: string;
  body: string;
}): Promise<ActionResult> {
  const v = await viewer();
  if (!v) return { ok: false, error: "Not signed in" };

  const body = args.body.trim();
  if (body.length < 2) return { ok: false, error: "Write a response first" };

  const supabase = createClient();
  // Load the ask's audience to enforce the answer gate.
  const { data: ask } = await supabase
    .from("asks")
    .select("audience")
    .eq("id", args.askId)
    .maybeSingle();
  if (!ask) return { ok: false, error: "Ask not found" };

  const audience = (ask as { audience: string }).audience;
  if (!meetsAudience(v.level, v.isAdmin, audience)) {
    return {
      ok: false,
      error:
        "This ask is open to a higher tier. Keep contributing to unlock deeper access.",
    };
  }

  const { error } = await supabase.from("ask_answers").insert({
    ask_id: args.askId,
    author_id: v.id,
    body,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/asks/${args.askId}`);
  revalidatePath("/asks");
  return { ok: true };
}
