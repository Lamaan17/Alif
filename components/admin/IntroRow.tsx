"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Check, X, Loader2, ArrowRight } from "lucide-react";

import { adminDecideIntro } from "@/app/actions/admin";
import { LevelPill } from "@/components/badges/LevelPill";
import { cn } from "@/lib/utils";

type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  level: number;
} | null;

type Row = {
  id: string;
  message: string | null;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  from_profile: Profile;
  to_profile: Profile;
};

export function IntroRow({ row }: { row: Row }) {
  const [status, setStatus] = useState(row.status);
  const [pending, startTransition] = useTransition();

  function decide(d: "accepted" | "declined") {
    const prev = status;
    setStatus(d);
    startTransition(async () => {
      const res = await adminDecideIntro(row.id, d);
      if (!res.ok) setStatus(prev);
    });
  }

  return (
    <li className="rounded-xl border border-paper-line bg-paper p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <ProfileChip p={row.from_profile} />
            <ArrowRight className="h-3.5 w-3.5 text-ink-muted" />
            <ProfileChip p={row.to_profile} />
          </div>
          {row.message && (
            <p className="mt-3 whitespace-pre-line rounded-lg border-l-2 border-moss-200 bg-paper-warm/50 px-3 py-2 text-[13px] leading-relaxed text-ink-soft">
              {row.message}
            </p>
          )}
          <p className="mt-2 text-[11px] text-ink-muted">
            {new Date(row.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex shrink-0 items-center">
          {status === "pending" ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={pending}
                onClick={() => decide("declined")}
                className="inline-flex h-7 items-center gap-1 rounded-full border border-paper-line bg-paper px-2.5 text-[11px] font-medium text-ink-muted hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                <X className="h-3 w-3" />
                Decline
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => decide("accepted")}
                className="inline-flex h-7 items-center gap-1 rounded-full bg-moss-600 px-2.5 text-[11px] font-medium text-paper hover:bg-moss-700 disabled:opacity-50"
              >
                {pending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
                Facilitate intro
              </button>
            </div>
          ) : (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
                status === "accepted"
                  ? "bg-moss-50 text-moss-700 ring-moss-100"
                  : "bg-paper-warm text-ink-muted ring-paper-line",
              )}
            >
              {status}
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

function ProfileChip({ p }: { p: Profile }) {
  if (!p) return <span className="text-[12px] text-ink-muted">—</span>;
  return (
    <Link
      href={`/builders/${p.id}`}
      className="inline-flex items-center gap-1.5 rounded-full border border-paper-line bg-paper-warm px-2 py-1 text-[12px] text-ink hover:border-moss-500/40 hover:text-moss-700"
    >
      <span className="font-medium">{p.full_name}</span>
      <LevelPill level={p.level} size="sm" />
    </Link>
  );
}
