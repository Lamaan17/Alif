"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  Heart,
  Sparkles,
  MapPin,
  Clock,
  ExternalLink,
  BadgeCheck,
  ArrowRight,
  Mail,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { toggleInterest } from "@/app/actions/builders";
import {
  ROLE_TYPES,
  LOOKING_FOR,
  labelFor,
} from "@/lib/profile-options";
import type { BuilderRow } from "@/lib/data/builders";
import { cn } from "@/lib/utils";
import { LevelPill } from "@/components/badges/LevelPill";
import { BadgeRow } from "@/components/badges/BadgeChip";

import { InviteDialog } from "./InviteDialog";

export function BuilderCard({
  builder,
  isInterested,
  isMatched,
  badgeKinds = [],
}: {
  builder: BuilderRow;
  isInterested: boolean;
  isMatched: boolean;
  badgeKinds?: string[];
}) {
  const [interested, setInterested] = useState(isInterested);
  const [matched, setMatched] = useState(isMatched);
  const [pending, startTransition] = useTransition();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [flashMatch, setFlashMatch] = useState(false);

  const supabase = createClient();
  const avatarUrl = builder.avatar_url
    ? supabase.storage.from("avatars").getPublicUrl(builder.avatar_url).data
        .publicUrl
    : null;

  const firstProof = builder.proof_of_work?.[0]?.url;
  const visibleIndustries = builder.industries.slice(0, 3);
  const extraIndustries = builder.industries.length - visibleIndustries.length;

  function handleInterested() {
    const next = !interested;
    setInterested(next); // optimistic
    startTransition(async () => {
      const res = await toggleInterest(
        builder.id,
        next ? "interested" : "uninterested",
      );
      if (!res.ok) {
        setInterested(!next); // rollback
        return;
      }
      if (next && res.matched) {
        setMatched(true);
        setFlashMatch(true);
        setTimeout(() => setFlashMatch(false), 3000);
      } else if (!next) {
        setMatched(false);
      }
    });
  }

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-xl2 border bg-paper p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-cardHover",
        matched ? "border-moss-300 ring-1 ring-moss-200" : "border-paper-line",
      )}
    >
      {/* Match badge */}
      {matched && (
        <div
          className={cn(
            "absolute -top-2 left-5 inline-flex items-center gap-1 rounded-full bg-moss-600 px-2.5 py-0.5 text-[11px] font-medium text-paper shadow-sm",
            flashMatch && "animate-pulse",
          )}
        >
          <Sparkles className="h-3 w-3" />
          {flashMatch ? "It's a match!" : "Mutual"}
        </div>
      )}

      {/* Header: avatar + name + meta */}
      <div className="flex items-start gap-3">
        <Avatar src={avatarUrl} name={builder.full_name} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="truncate font-semibold tracking-tight text-ink">
              {builder.full_name}
            </h3>
            {builder.verified && (
              <BadgeCheck className="h-3.5 w-3.5 text-moss-600" />
            )}
            <LevelPill level={builder.level} size="sm" />
          </div>
          <div className="mt-0.5 text-[12px] text-ink-muted">
            {labelFor(ROLE_TYPES, builder.role_type) !== "—" && (
              <span>{labelFor(ROLE_TYPES, builder.role_type)}</span>
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-ink-muted">
            {builder.location && (
              <span className="inline-flex items-center gap-0.5">
                <MapPin className="h-3 w-3" />
                {builder.location}
              </span>
            )}
            {builder.timezone && (
              <span className="inline-flex items-center gap-0.5">
                <Clock className="h-3 w-3" />
                {builder.timezone}
              </span>
            )}
            {typeof builder.weekly_hours === "number" && (
              <span className="inline-flex items-center gap-0.5">
                <Clock className="h-3 w-3" />
                {builder.weekly_hours} hrs/wk
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {builder.bio && (
        <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-ink-soft">
          {builder.bio}
        </p>
      )}

      {/* Looking for */}
      {builder.looking_for.length > 0 && (
        <div className="mt-3.5">
          <div className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">
            Looking for
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {builder.looking_for.map((v) => (
              <span
                key={v}
                className="inline-flex items-center rounded-full border border-moss-100 bg-moss-50 px-2 py-0.5 text-[11px] font-medium text-moss-700"
              >
                {labelFor(LOOKING_FOR, v)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Industries */}
      {visibleIndustries.length > 0 && (
        <div className="mt-3">
          <div className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">
            Industries
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {visibleIndustries.map((i) => (
              <span
                key={i}
                className="inline-flex rounded-full border border-paper-line bg-paper-warm px-2 py-0.5 text-[11px] text-ink-soft"
              >
                {i}
              </span>
            ))}
            {extraIndustries > 0 && (
              <span className="inline-flex rounded-full border border-paper-line bg-paper-warm px-2 py-0.5 text-[11px] text-ink-muted">
                +{extraIndustries}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Trust badges (admin-assigned + derived) */}
      <div className="mt-3.5">
        <BadgeRow
          kinds={badgeKinds}
          verified={builder.verified}
          hasShippedProject={(builder.past_projects?.length ?? 0) > 0}
          size="xs"
          max={3}
        />
      </div>

      {/* Proof link */}
      {firstProof && (
        <a
          href={firstProof}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-3 inline-flex items-center gap-1 text-[12px] text-ink-muted underline decoration-paper-line decoration-2 underline-offset-4 hover:text-moss-700 hover:decoration-moss-500"
        >
          {builder.proof_of_work[0].label || hostname(firstProof)}
          <ExternalLink className="h-3 w-3" />
        </a>
      )}

      {/* Actions */}
      <div className="mt-auto pt-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <Link
            href={`/builders/${builder.id}`}
            className="inline-flex items-center gap-1 rounded-full border border-paper-line bg-paper px-3 py-1.5 text-[12px] font-medium text-ink transition-colors hover:border-ink/15 hover:bg-paper-warm"
          >
            View profile
            <ArrowRight className="h-3 w-3" />
          </Link>

          <button
            type="button"
            onClick={handleInterested}
            disabled={pending}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors disabled:opacity-60",
              interested
                ? "bg-moss-600 text-paper hover:bg-moss-700"
                : "border border-paper-line bg-paper text-ink hover:border-moss-500/40 hover:bg-moss-50 hover:text-moss-700",
            )}
          >
            <Heart
              className={cn("h-3 w-3", interested && "fill-current")}
            />
            {interested ? "Conversation started" : "Start a conversation"}
          </button>

          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="inline-flex items-center gap-1 rounded-full border border-paper-line bg-paper px-3 py-1.5 text-[12px] font-medium text-ink-soft transition-colors hover:border-gold-500/40 hover:bg-gold-50 hover:text-gold-600"
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

/* ---------- bits ---------- */

function Avatar({ src, name }: { src: string | null; name: string }) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-ink text-paper ring-1 ring-paper-line">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-display text-sm">
          {initials || "•"}
        </div>
      )}
    </div>
  );
}

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
