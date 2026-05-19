"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  BadgeCheck,
  Crown,
  Loader2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";

import {
  setLevel,
  setVerified,
  setAdminFlag,
  toggleBadge,
} from "@/app/actions/admin";
import {
  LEVELS,
  BADGES,
  ROLE_TYPES,
  labelFor,
} from "@/lib/profile-options";
import { LevelPill } from "@/components/badges/LevelPill";
import { BadgeChip } from "@/components/badges/BadgeChip";
import { cn } from "@/lib/utils";

type Row = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  location: string | null;
  role_type: string | null;
  level: number;
  verified: boolean;
  is_admin: boolean;
  badges: string[];
  past_projects: unknown[];
};

export function UserRow({ row, avatarUrl }: { row: Row; avatarUrl: string | null }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState(row);
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function update(patch: Partial<Row>) {
    setState((s) => ({ ...s, ...patch }));
  }

  function onLevel(value: number) {
    const prev = state.level;
    update({ level: value });
    startTransition(async () => {
      const res = await setLevel(state.id, value);
      if (!res.ok) {
        update({ level: prev });
        setErr(res.error);
      } else setErr(null);
    });
  }

  function onVerified(value: boolean) {
    const prev = state.verified;
    update({ verified: value });
    startTransition(async () => {
      const res = await setVerified(state.id, value);
      if (!res.ok) {
        update({ verified: prev });
        setErr(res.error);
      } else setErr(null);
    });
  }

  function onAdminToggle(value: boolean) {
    const prev = state.is_admin;
    update({ is_admin: value });
    startTransition(async () => {
      const res = await setAdminFlag(state.id, value);
      if (!res.ok) {
        update({ is_admin: prev });
        setErr(res.error);
      } else setErr(null);
    });
  }

  function onBadge(kind: string, on: boolean) {
    const has = state.badges.includes(kind);
    if (on && has) return;
    if (!on && !has) return;
    const next = on
      ? [...state.badges, kind]
      : state.badges.filter((b) => b !== kind);
    update({ badges: next });
    startTransition(async () => {
      const res = await toggleBadge(state.id, kind, on);
      if (!res.ok) {
        update({ badges: state.badges }); // rollback to prior snapshot
        setErr(res.error);
      } else setErr(null);
    });
  }

  return (
    <li className="rounded-xl border border-paper-line bg-paper">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <Avatar src={avatarUrl} name={state.full_name} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="truncate font-medium tracking-tight text-ink">
              {state.full_name || "—"}
            </span>
            {state.verified && (
              <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-moss-600" />
            )}
            {state.is_admin && (
              <span className="inline-flex items-center gap-1 rounded-full border border-gold-100 bg-gold-50 px-1.5 py-0 text-[10px] font-medium text-gold-600">
                <Crown className="h-2.5 w-2.5" />
                Admin
              </span>
            )}
            <LevelPill level={state.level} size="sm" />
          </div>
          <div className="mt-0.5 text-[12px] text-ink-muted truncate">
            {labelFor(ROLE_TYPES, state.role_type)}
            {state.location && ` · ${state.location}`}
          </div>
          {state.badges.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {state.badges.slice(0, 4).map((b) => (
                <BadgeChip key={b} kind={b} size="xs" />
              ))}
              {state.badges.length > 4 && (
                <span className="text-[10px] text-ink-muted">
                  +{state.badges.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
        <span className="text-ink-muted">
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : open ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </span>
      </button>

      {open && (
        <div className="border-t border-paper-line bg-paper-warm/40 p-4">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Section title="Level">
              <div className="flex flex-wrap gap-1.5">
                {LEVELS.map((l) => (
                  <button
                    key={l.value}
                    type="button"
                    disabled={pending}
                    onClick={() => onLevel(l.value)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                      state.level === l.value
                        ? "border-ink bg-ink text-paper"
                        : "border-paper-line bg-paper text-ink-soft hover:border-moss-500/40 hover:bg-moss-50 hover:text-moss-700",
                      pending && "opacity-60",
                    )}
                  >
                    L{l.value} · {l.label}
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Flags">
              <div className="flex flex-wrap gap-2">
                <Toggle
                  label="ALIF Verified"
                  checked={state.verified}
                  onChange={onVerified}
                  pending={pending}
                />
                <Toggle
                  label="Admin"
                  checked={state.is_admin}
                  onChange={onAdminToggle}
                  pending={pending}
                />
              </div>
            </Section>

            <Section title="Badges" className="md:col-span-2">
              <div className="flex flex-wrap gap-1.5">
                {BADGES.map((b) => {
                  const on = state.badges.includes(b.value);
                  return (
                    <button
                      key={b.value}
                      type="button"
                      disabled={pending}
                      onClick={() => onBadge(b.value, !on)}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                        on
                          ? "border-moss-500 bg-moss-500 text-paper"
                          : "border-paper-line bg-paper text-ink-soft hover:border-moss-500/40 hover:bg-moss-50 hover:text-moss-700",
                        pending && "opacity-60",
                      )}
                    >
                      {b.label}
                    </button>
                  );
                })}
              </div>
            </Section>
          </div>

          <div className="mt-4 flex items-center justify-between text-[12px] text-ink-muted">
            <span>ID: <span className="font-mono">{state.id.slice(0, 8)}</span></span>
            <Link
              href={`/builders/${state.id}`}
              className="inline-flex items-center gap-1 hover:text-ink"
            >
              Open profile
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          {err && <p className="mt-2 text-[11px] text-red-600">{err}</p>}
        </div>
      )}
    </li>
  );
}

function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">
        {title}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  pending,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  pending: boolean;
}) {
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => onChange(!checked)}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors",
        checked
          ? "border-moss-500 bg-moss-50 text-moss-700"
          : "border-paper-line bg-paper text-ink-soft hover:bg-paper-warm",
      )}
    >
      <span
        className={cn(
          "inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border",
          checked
            ? "border-moss-500 bg-moss-500 text-paper"
            : "border-paper-line bg-paper",
        )}
      >
        {checked && "✓"}
      </span>
      {label}
    </button>
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
        <span className="font-display text-[12px]">{initials || "•"}</span>
      )}
    </span>
  );
}
