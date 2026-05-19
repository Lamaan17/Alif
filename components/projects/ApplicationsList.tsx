"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Check, X, Loader2 } from "lucide-react";

import { decideApplication } from "@/app/actions/projects";
import { LevelPill } from "@/components/badges/LevelPill";
import { ROLE_TYPES, labelFor } from "@/lib/profile-options";
import { cn } from "@/lib/utils";

type Applicant = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role_type: string | null;
  location: string | null;
  timezone: string | null;
  verified: boolean;
  level: number;
  skills: string[];
};

type App = {
  id: string;
  message: string | null;
  status: "pending" | "accepted" | "declined" | "withdrawn";
  created_at: string;
  decided_at: string | null;
  applicant: Applicant | Applicant[]; // join shape from Supabase can vary
};

export function ApplicationsList({ applications }: { applications: App[] }) {
  if (applications.length === 0) {
    return (
      <p className="text-sm text-ink-muted">
        No applicants yet — share the link or wait, builders find these
        organically.
      </p>
    );
  }
  return (
    <ul className="space-y-3">
      {applications.map((a) => (
        <ApplicationRow key={a.id} app={a} />
      ))}
    </ul>
  );
}

function ApplicationRow({ app }: { app: App }) {
  const applicant = (
    Array.isArray(app.applicant) ? app.applicant[0] : app.applicant
  ) as Applicant | undefined;
  const [status, setStatus] = useState(app.status);
  const [pending, startTransition] = useTransition();

  function decide(decision: "accepted" | "declined") {
    const prev = status;
    setStatus(decision);
    startTransition(async () => {
      const res = await decideApplication({
        applicationId: app.id,
        decision,
      });
      if (!res.ok) setStatus(prev);
    });
  }

  if (!applicant) return null;

  return (
    <li className="rounded-xl border border-paper-line bg-paper-warm/40 p-4">
      <div className="flex items-start gap-3">
        <Link
          href={`/builders/${applicant.id}`}
          className="flex items-start gap-3 min-w-0 flex-1"
        >
          <MiniAvatar src={applicant.avatar_url} name={applicant.full_name} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate font-medium tracking-tight text-ink">
                {applicant.full_name}
              </span>
              <LevelPill level={applicant.level} size="sm" />
            </div>
            <div className="mt-0.5 text-[12px] text-ink-muted">
              {labelFor(ROLE_TYPES, applicant.role_type)}
              {applicant.location && ` · ${applicant.location}`}
              {applicant.timezone && ` · ${applicant.timezone}`}
            </div>
            {applicant.skills?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {applicant.skills.slice(0, 5).map((s) => (
                  <span
                    key={s}
                    className="inline-flex rounded-full border border-paper-line bg-paper px-2 py-0.5 text-[10px] text-ink-soft"
                  >
                    {s}
                  </span>
                ))}
                {applicant.skills.length > 5 && (
                  <span className="inline-flex rounded-full border border-paper-line bg-paper px-2 py-0.5 text-[10px] text-ink-muted">
                    +{applicant.skills.length - 5}
                  </span>
                )}
              </div>
            )}
          </div>
        </Link>

        <StatusActions
          status={status}
          pending={pending}
          onAccept={() => decide("accepted")}
          onDecline={() => decide("declined")}
        />
      </div>

      {app.message && (
        <p className="mt-3 whitespace-pre-line rounded-lg border-l-2 border-moss-200 bg-paper px-3 py-2 text-[13px] leading-relaxed text-ink-soft">
          {app.message}
        </p>
      )}
    </li>
  );
}

function StatusActions({
  status,
  pending,
  onAccept,
  onDecline,
}: {
  status: App["status"];
  pending: boolean;
  onAccept: () => void;
  onDecline: () => void;
}) {
  if (status === "accepted")
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-moss-50 px-2.5 py-1 text-[11px] font-medium text-moss-700 ring-1 ring-inset ring-moss-100">
        <Check className="h-3 w-3" /> Accepted
      </span>
    );
  if (status === "declined")
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-paper-warm px-2.5 py-1 text-[11px] font-medium text-ink-muted ring-1 ring-inset ring-paper-line">
        Declined
      </span>
    );
  if (status === "withdrawn")
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-paper-warm px-2.5 py-1 text-[11px] font-medium text-ink-muted ring-1 ring-inset ring-paper-line">
        Withdrawn
      </span>
    );
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <button
        type="button"
        disabled={pending}
        onClick={onDecline}
        className={cn(
          "inline-flex h-7 items-center gap-1 rounded-full border border-paper-line bg-paper px-2.5 text-[11px] font-medium text-ink-muted transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50",
        )}
      >
        <X className="h-3 w-3" />
        Decline
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={onAccept}
        className={cn(
          "inline-flex h-7 items-center gap-1 rounded-full bg-moss-600 px-2.5 text-[11px] font-medium text-paper transition-colors hover:bg-moss-700 disabled:opacity-50",
        )}
      >
        {pending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Check className="h-3 w-3" />
        )}
        Accept
      </button>
    </div>
  );
}

function MiniAvatar({ src, name }: { src: string | null; name: string }) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-paper">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="font-display text-sm">{initials || "•"}</span>
      )}
    </span>
  );
}
