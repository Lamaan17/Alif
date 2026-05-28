import Link from "next/link";
import { MessageSquare, Lock, ArrowUpRight } from "lucide-react";
import {
  ASK_KINDS,
  audienceLabel,
  meetsAudience,
} from "@/lib/profile-options";
import { LevelPill } from "@/components/badges/LevelPill";
import type { AskRow } from "@/lib/data/asks";
import { cn } from "@/lib/utils";

function kindLabel(kind: string) {
  return ASK_KINDS.find((k) => k.value === kind)?.label ?? "General";
}

export function AskCard({
  ask,
  viewerLevel,
  viewerIsAdmin,
}: {
  ask: AskRow;
  viewerLevel: number;
  viewerIsAdmin: boolean;
}) {
  const canAnswer = meetsAudience(viewerLevel, viewerIsAdmin, ask.audience);
  const gated = ask.audience !== "open";

  return (
    <article className="flex h-full flex-col rounded-xl2 border border-paper-line bg-paper p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-cardHover">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center rounded-full border border-paper-line bg-paper-warm px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-soft">
          {kindLabel(ask.kind)}
        </span>
        {gated && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset",
              canAnswer
                ? "bg-moss-50 text-moss-700 ring-moss-100"
                : "bg-paper-warm text-ink-muted ring-paper-line",
            )}
          >
            {!canAnswer && <Lock className="h-2.5 w-2.5" />}
            {audienceLabel(ask.audience)}
          </span>
        )}
      </div>

      <h3 className="mt-3 font-display text-base font-semibold leading-snug tracking-tight text-ink">
        <Link href={`/asks/${ask.id}`} className="hover:text-moss-700">
          {ask.title}
        </Link>
      </h3>
      {ask.body && (
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ink-muted">
          {ask.body}
        </p>
      )}

      <div className="mt-auto pt-4">
        {ask.author && (
          <div className="flex items-center gap-2 text-[12px]">
            <span className="text-ink-muted">Asked by</span>
            <Link
              href={`/builders/${ask.author.id}`}
              className="font-medium text-ink hover:text-moss-700"
            >
              {ask.author.full_name}
            </Link>
            <LevelPill
              level={ask.author.level}
              size="sm"
              isAdmin={ask.author.is_admin}
            />
          </div>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[11px] text-ink-muted">
            <MessageSquare className="h-3 w-3" />
            {ask.answer_count ?? 0}{" "}
            {(ask.answer_count ?? 0) === 1 ? "response" : "responses"}
          </span>
          <Link
            href={`/asks/${ask.id}`}
            className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1.5 text-[12px] font-medium text-paper-deep transition-colors hover:bg-ink-soft"
          >
            {canAnswer ? "Offer help" : "View"}
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </article>
  );
}
