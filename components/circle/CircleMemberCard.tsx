"use client";

import Link from "next/link";
import { useState } from "react";
import {
  MapPin,
  Clock,
  BadgeCheck,
  Send,
  ArrowUpRight,
  Lock,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import {
  ROLE_TYPES,
  LOOKING_FOR,
  STARTUP_STAGES,
  labelFor,
} from "@/lib/profile-options";
import { LevelPill } from "@/components/badges/LevelPill";
import { BadgeRow } from "@/components/badges/BadgeChip";
import type { BuilderRow } from "@/lib/data/builders";
import { IntroDialog } from "./IntroDialog";
import { cn } from "@/lib/utils";

export function CircleMemberCard({
  member,
  badges,
  alreadyRequested,
  viewerCanRequest,
}: {
  member: BuilderRow & { level: number };
  badges: string[];
  alreadyRequested: boolean;
  viewerCanRequest: boolean;
}) {
  const [open, setOpen] = useState(false);
  const supabase = createClient();
  const avatar = member.avatar_url
    ? supabase.storage.from("avatars").getPublicUrl(member.avatar_url).data
        .publicUrl
    : null;

  return (
    <article className="group relative flex flex-col rounded-xl2 border border-paper-line bg-paper p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-cardHover">
      {/* level corner */}
      <div className="absolute -top-2 left-6">
        <LevelPill level={member.level} size="md" />
      </div>

      <div className="mt-4 flex items-start gap-4">
        <Avatar src={avatar} name={member.full_name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-display text-lg tracking-tight text-ink">
              {member.full_name}
            </h3>
            {member.verified && (
              <BadgeCheck className="h-4 w-4 shrink-0 text-moss-600" />
            )}
          </div>
          <div className="mt-0.5 text-[12px] text-ink-muted">
            {labelFor(ROLE_TYPES, member.role_type)}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-ink-muted">
            {member.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {member.location}
              </span>
            )}
            {member.timezone && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {member.timezone}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* What they're building */}
      {member.bio && (
        <div className="mt-4">
          <div className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">
            What they&rsquo;re building
          </div>
          <p className="mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-ink-soft">
            {member.bio}
          </p>
        </div>
      )}

      {/* What they want */}
      {member.looking_for.length > 0 && (
        <div className="mt-3.5">
          <div className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">
            Looking for
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {member.looking_for.map((v) => (
              <span
                key={v}
                className="inline-flex rounded-full border border-gold-100 bg-gold-50 px-2 py-0.5 text-[11px] font-medium text-gold-600"
              >
                {labelFor(LOOKING_FOR, v)}
              </span>
            ))}
            {member.startup_stage && (
              <span className="inline-flex rounded-full border border-paper-line bg-paper-warm px-2 py-0.5 text-[11px] text-ink-soft">
                {labelFor(STARTUP_STAGES, member.startup_stage)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Badges */}
      <div className="mt-4">
        <BadgeRow
          kinds={badges}
          verified={member.verified}
          hasShippedProject={(member.past_projects ?? []).length > 0}
          size="sm"
          max={4}
        />
      </div>

      <div className="mt-auto pt-5 flex items-center justify-between gap-2">
        <Link
          href={`/builders/${member.id}`}
          className="inline-flex items-center gap-1 text-[12px] text-ink-muted hover:text-ink"
        >
          Full profile
          <ArrowUpRight className="h-3 w-3" />
        </Link>
        <button
          type="button"
          disabled={!viewerCanRequest || alreadyRequested}
          onClick={() => setOpen(true)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
            alreadyRequested
              ? "border border-moss-200 bg-moss-50 text-moss-700"
              : viewerCanRequest
              ? "bg-gold-500 text-paper hover:bg-gold-600"
              : "border border-paper-line bg-paper text-ink-muted",
          )}
        >
          {alreadyRequested ? (
            <>Requested</>
          ) : viewerCanRequest ? (
            <>
              <Send className="h-3 w-3" />
              Request intro
            </>
          ) : (
            <>
              <Lock className="h-3 w-3" />
              Locked
            </>
          )}
        </button>
      </div>

      <IntroDialog
        open={open}
        onClose={() => setOpen(false)}
        toUserId={member.id}
        toName={member.full_name}
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
    <span className="relative inline-flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-paper">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="font-display text-base">{initials || "•"}</span>
      )}
    </span>
  );
}
