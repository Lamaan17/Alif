"use client";

import { useState, useTransition } from "react";
import { Lock, Send, Loader2 } from "lucide-react";
import { answerAsk } from "@/app/actions/asks";
import { LevelPill } from "@/components/badges/LevelPill";
import { audienceLabel } from "@/lib/profile-options";
import { textareaCls } from "@/components/profile/Field";
import type { AnswerRow } from "@/lib/data/asks";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function AnswerSection({
  askId,
  audience,
  answers,
  canAnswer,
}: {
  askId: string;
  audience: string;
  answers: AnswerRow[];
  canAnswer: boolean;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await answerAsk({ askId, body });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setBody("");
      router.refresh();
    });
  }

  return (
    <div>
      <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
        {answers.length} {answers.length === 1 ? "response" : "responses"}
      </h2>

      {/* Answer composer or locked state */}
      {canAnswer ? (
        <div className="mt-4 rounded-xl2 border border-paper-line bg-paper p-4 shadow-card">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Offer something useful — a link, a take, an intro, a fix."
            rows={3}
            maxLength={1200}
            className={textareaCls}
          />
          {error && <p className="mt-2 text-[11px] text-red-400">{error}</p>}
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={submit}
              disabled={pending || body.trim().length < 2}
              className="btn-accent disabled:opacity-60"
            >
              {pending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Posting…
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Offer help
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex items-start gap-3 rounded-xl2 border border-paper-line bg-paper-warm/40 p-4">
          <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-paper text-ink-muted ring-1 ring-inset ring-paper-line">
            <Lock className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm text-ink">
              This ask is open to{" "}
              <span className="font-medium">
                {audienceLabel(audience).replace(" only", "").toLowerCase()}
              </span>{" "}
              and above.
            </p>
            <p className="mt-1 text-[13px] text-ink-muted">
              Keep contributing to unlock deeper access — join a sprint, help on
              a project, or show up at an ALIF room.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/sprints" className="btn-secondary !py-1.5 !text-xs">
                Join a sprint
              </Link>
              <Link href="/community" className="btn-secondary !py-1.5 !text-xs">
                How access works
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Answer list */}
      <ul className="mt-6 space-y-3">
        {answers.map((a) => (
          <li
            key={a.id}
            className="rounded-xl border border-paper-line bg-paper-warm/40 p-4"
          >
            <div className="flex items-center gap-2">
              {a.author && (
                <>
                  <Link
                    href={`/builders/${a.author.id}`}
                    className="text-sm font-medium text-ink hover:text-moss-700"
                  >
                    {a.author.full_name}
                  </Link>
                  <LevelPill
                    level={a.author.level}
                    size="sm"
                    isAdmin={a.author.is_admin}
                  />
                </>
              )}
              <span className="ml-auto text-[11px] text-ink-muted">
                {new Date(a.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-ink-soft">
              {a.body}
            </p>
          </li>
        ))}
        {answers.length === 0 && (
          <li className="text-sm text-ink-muted">
            No responses yet. {canAnswer ? "Be the first to help." : ""}
          </li>
        )}
      </ul>
    </div>
  );
}
