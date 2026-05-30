"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";

import { createAsk } from "@/app/actions/asks";
import { Field, inputCls, textareaCls } from "@/components/profile/Field";
import { RadioCards } from "@/components/profile/RadioCards";
import { ASK_KINDS, ASK_AUDIENCES } from "@/lib/profile-options";

export function AskForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [kind, setKind] = useState("general");
  const [audience, setAudience] = useState("open");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createAsk({
        title,
        body,
        kind: kind as AskKind,
        audience: audience as AskAudienceValue,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push(`/asks/${res.data!.id}`);
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto w-full max-w-2xl space-y-6 rounded-xl2 border border-paper-line bg-paper p-6 shadow-card sm:p-8"
    >
      <Field label="What do you need?" required>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Roast my landing page for a halal-finance app"
          required
          minLength={5}
          maxLength={140}
          className={inputCls}
        />
      </Field>

      <Field label="Details" hint="Context, links, what 'helpful' looks like.">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Here's the link… I'm specifically unsure about the hero and pricing."
          rows={4}
          maxLength={1200}
          className={textareaCls}
        />
      </Field>

      <Field label="Type of ask">
        <RadioCards
          name="kind"
          options={ASK_KINDS}
          value={kind}
          onChange={setKind}
          columns={3}
        />
      </Field>

      <Field
        label="Who can respond?"
        hint="Restrict to a tier if you want higher-signal help only."
      >
        <RadioCards
          name="audience"
          options={ASK_AUDIENCES.map((a) => ({
            value: a.value,
            label: a.label,
          }))}
          value={audience}
          onChange={setAudience}
          columns={2}
        />
      </Field>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-end">
        <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
          {pending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Posting…
            </>
          ) : (
            <>
              Post ask
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

type AskKind =
  | "website_roast"
  | "review_post"
  | "idea_feedback"
  | "pitch_feedback"
  | "mvp_testing"
  | "find_users"
  | "design_help"
  | "code_help"
  | "pricing_check"
  | "intro"
  | "feedback"
  | "general";
type AskAudienceValue = "open" | "contributors" | "community" | "trusted";
