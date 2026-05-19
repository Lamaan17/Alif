"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  Heart,
  Sparkles,
  ArrowUpRight,
  BadgeCheck,
  Mail,
  ChevronDown,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { toggleInterest } from "@/app/actions/builders";
import { LevelPill } from "@/components/badges/LevelPill";
import { ROLE_TYPES, labelFor } from "@/lib/profile-options";
import type { ScoredBuilder } from "@/lib/data/matching";
import { cn } from "@/lib/utils";

import { InviteDialog } from "./InviteDialog";

export function TopMatches({ items }: { items: ScoredBuilder[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, 3);

  if (items.length === 0) return null;

  return (
    <section className="rounded-xl2 border border-paper-line bg-paper p-5 shadow-card sm:p-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-100 bg-gold-50 px-2.5 py-1 text-[11px] font-medium text-gold-600">
            <Sparkles className="h-3 w-3" />
            People you may want to build with
          </div>
          <h2 className="mt-3 font-display text-xl tracking-tight">
            Builders worth a first conversation.
          </h2>
          <p className="mt-1 text-[13px] text-ink-muted">
            Ranked by collaboration fit across the ALIF network — your filters below stay separate.
          </p>
        </div>
        {items.length > 3 && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-paper-line bg-paper px-3 py-1.5 text-[12px] font-medium text-ink-soft transition-colors hover:bg-paper-warm"
          >
            {expanded ? "Show fewer" : `Show ${Math.min(6, items.length)}`}
            <ChevronDown
              className={cn(
                "h-3 w-3 transition-transform",
                expanded && "rotate-180",
              )}
            />
          </button>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((s, i) => (
          <MatchCard key={s.builder.id} scored={s} rank={i + 1} />
        ))}
      </div>
    </section>
  );
}

function MatchCard({
  scored,
  rank,
}: {
  scored: ScoredBuilder;
  rank: number;
}) {
  const { builder, score, reasons } = scored;
  const [interested, setInterested] = useState(false); // hydrated below
  const [pending, startTransition] = useTransition();
  const [inviteOpen, setInviteOpen] = useState(false);
  const supabase = createClient();
  const avatar = builder.avatar_url
    ? supabase.storage.from("avatars").getPublicUrl(builder.avatar_url).data
        .publicUrl
    : null;

  // We don't have isInterested passed in for compactness; toggle action is
  // idempotent server-side, so optimistic "say yes" is safe.
  function onInterested() {
    if (interested) return;
    setInterested(true);
    startTransition(async () => {
      const res = await toggleInterest(builder.id, "interested");
      if (!res.ok) setInterested(false);
    });
  }

  return (
    <article className="group relative flex flex-col rounded-xl border border-paper-line bg-paper-warm/40 p-4 transition-all hover:border-moss-500/40 hover:bg-paper">
      {/* Collaboration fit */}
      <div
        className="absolute -top-2.5 right-4 inline-flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 text-[10px] font-medium text-paper"
        title="Collaboration fit"
      >
        <Sparkles className="h-2.5 w-2.5 text-gold-500" />
        {score}
        <span className="text-paper/60">fit</span>
      </div>

      <div className="flex items-start gap-3">
        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-paper text-[11px] font-medium text-ink-muted ring-1 ring-paper-line">
          {rank}
        </span>
        <Avatar src={avatar} name={builder.full_name} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Link
              href={`/builders/${builder.id}`}
              className="truncate font-medium tracking-tight text-ink hover:text-moss-700"
            >
              {builder.full_name}
            </Link>
            {builder.verified && (
              <BadgeCheck className="h-3 w-3 shrink-0 text-moss-600" />
            )}
            <LevelPill level={builder.level} size="sm" />
          </div>
          <div className="mt-0.5 text-[11px] text-ink-muted">
            {labelFor(ROLE_TYPES, builder.role_type)}
            {builder.location && ` · ${builder.location}`}
          </div>
        </div>
      </div>

      {/* Why? */}
      {reasons.length > 0 && (
        <ul className="mt-3 space-y-1 text-[11px] text-moss-700">
          {reasons.slice(0, 3).map((r, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-moss-500" />
              {r}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto pt-4 flex items-center justify-between gap-1.5">
        <Link
          href={`/builders/${builder.id}`}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-soft hover:text-ink"
        >
          View profile
          <ArrowUpRight className="h-3 w-3" />
        </Link>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onInterested}
            disabled={pending || interested}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
              interested
                ? "bg-moss-600 text-paper"
                : "border border-paper-line bg-paper text-ink hover:border-moss-500/40 hover:bg-moss-50 hover:text-moss-700",
              pending && "opacity-60",
            )}
          >
            <Heart
              className={cn("h-3 w-3", interested && "fill-current")}
            />
            {interested ? "Started" : "Start a conversation"}
          </button>
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="inline-flex items-center gap-1 rounded-full border border-paper-line bg-paper px-2.5 py-1 text-[11px] font-medium text-ink-soft transition-colors hover:border-gold-500/40 hover:bg-gold-50 hover:text-gold-600"
          >
            <Mail className="h-3 w-3" />
            Invite to build
          </button>
        </div>
      </div>

      <InviteDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        toUserId={builder.id}
        toName={builder.full_name}
      />
    </article>
  );
}

function Avatar({ src, name }: { src: string | null; name: string }) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-paper">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="font-display text-[11px]">{initials || "•"}</span>
      )}
    </span>
  );
}
