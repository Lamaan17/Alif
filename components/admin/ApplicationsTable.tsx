"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Check, X, Loader2, Hand, Sparkles } from "lucide-react";

import { adminDecideApplication } from "@/app/actions/admin";
import { LevelPill } from "@/components/badges/LevelPill";
import { ROLE_TYPES, labelFor } from "@/lib/profile-options";
import { cn } from "@/lib/utils";

type Row = {
  id: string;
  target_type: "project" | "sprint";
  target_id: string;
  target_title?: string;
  message: string | null;
  status: "pending" | "accepted" | "declined" | "withdrawn";
  created_at: string;
  applicant: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    role_type: string | null;
    level: number;
  } | null;
};

export function ApplicationsTable({ rows }: { rows: Row[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl2 border border-dashed border-paper-line bg-paper p-12 text-center">
        <p className="text-sm text-ink-muted">No applications match.</p>
      </div>
    );
  }
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <ApplicationRow key={r.id} row={r} />
      ))}
    </ul>
  );
}

function ApplicationRow({ row }: { row: Row }) {
  const [status, setStatus] = useState(row.status);
  const [pending, startTransition] = useTransition();

  function decide(d: "accepted" | "declined") {
    const prev = status;
    setStatus(d);
    startTransition(async () => {
      const res = await adminDecideApplication(row.id, d);
      if (!res.ok) setStatus(prev);
    });
  }

  const targetHref =
    row.target_type === "project"
      ? `/projects/${row.target_id}`
      : `/sprints/${row.target_id}`;

  return (
    <li className="rounded-xl border border-paper-line bg-paper p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset",
                row.target_type === "project"
                  ? "bg-moss-50 text-moss-700 ring-moss-100"
                  : "bg-gold-50 text-gold-600 ring-gold-100",
              )}
            >
              {row.target_type === "project" ? (
                <>
                  <Hand className="h-2.5 w-2.5" /> Project
                </>
              ) : (
                <>
                  <Sparkles className="h-2.5 w-2.5" /> Sprint
                </>
              )}
            </span>
            <Link
              href={targetHref}
              className="font-medium tracking-tight text-ink hover:text-moss-700"
            >
              {row.target_title ?? row.target_id.slice(0, 8)}
            </Link>
          </div>

          {row.applicant && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-ink-soft">
              <span>Applicant:</span>
              <Link
                href={`/builders/${row.applicant.id}`}
                className="font-medium text-ink hover:text-moss-700"
              >
                {row.applicant.full_name}
              </Link>
              <LevelPill level={row.applicant.level} size="sm" />
              <span className="text-ink-muted">
                {labelFor(ROLE_TYPES, row.applicant.role_type)}
              </span>
            </div>
          )}

          {row.message && (
            <p className="mt-3 whitespace-pre-line rounded-lg border-l-2 border-moss-200 bg-paper-warm/50 px-3 py-2 text-[13px] leading-relaxed text-ink-soft">
              {row.message}
            </p>
          )}
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
                Accept
              </button>
            </div>
          ) : (
            <StatusPill status={status} />
          )}
        </div>
      </div>
    </li>
  );
}

function StatusPill({ status }: { status: Row["status"] }) {
  const map = {
    accepted: "bg-moss-50 text-moss-700 ring-moss-100",
    declined: "bg-paper-warm text-ink-muted ring-paper-line",
    withdrawn: "bg-paper-warm text-ink-muted ring-paper-line",
    pending: "bg-gold-50 text-gold-600 ring-gold-100",
  } as const;
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        map[status],
      )}
    >
      {status}
    </span>
  );
}
