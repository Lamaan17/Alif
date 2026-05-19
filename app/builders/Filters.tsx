"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, RotateCcw, BadgeCheck } from "lucide-react";

import {
  ROLE_TYPES,
  LOOKING_FOR,
  INDUSTRY_PRESETS,
} from "@/lib/profile-options";
import type { BuilderFilters } from "@/lib/data/builders";
import { cn } from "@/lib/utils";

export function Filters({ initial }: { initial: BuilderFilters }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
    startTransition(() => {
      router.replace(`/builders?${next.toString()}`, { scroll: false });
    });
  }

  function toggleInArray(key: string, value: string) {
    const current = (params.get(key) ?? "").split(",").filter(Boolean);
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setParam(key, next.length ? next.join(",") : null);
  }

  function clearAll() {
    startTransition(() => router.replace("/builders", { scroll: false }));
  }

  const hasAny =
    !!initial.role ||
    !!initial.looking?.length ||
    !!initial.industries?.length ||
    !!initial.timezone ||
    (initial.minHours ?? 0) > 0 ||
    !!initial.verifiedOnly;

  return (
    <div
      className={cn(
        "rounded-xl2 border border-paper-line bg-paper p-5 shadow-card transition-opacity",
        pending && "opacity-70",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-sm font-medium text-ink">
          <Filter className="h-3.5 w-3.5" />
          Filters
        </div>
        {hasAny && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 text-[11px] text-ink-muted hover:text-ink"
          >
            <RotateCcw className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      <div className="mt-5 space-y-5">
        <Block label="Role">
          <Pills
            value={initial.role ?? null}
            options={ROLE_TYPES}
            onPick={(v) => setParam("role", initial.role === v ? null : v)}
            single
          />
        </Block>

        <Block label="Looking for">
          <Pills
            value={initial.looking ?? []}
            options={LOOKING_FOR}
            onPick={(v) => toggleInArray("looking", v)}
          />
        </Block>

        <Block label="Industries">
          <ChipList
            selected={initial.industries ?? []}
            options={INDUSTRY_PRESETS}
            onToggle={(v) => toggleInArray("industries", v)}
          />
        </Block>

        <Block label="Timezone contains">
          <input
            type="text"
            defaultValue={initial.timezone ?? ""}
            placeholder="EST, GMT+3, …"
            onBlur={(e) =>
              setParam("tz", e.target.value.trim() || null)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            className="w-full rounded-xl border border-paper-line bg-paper-warm/60 px-3 py-2 text-sm text-ink placeholder:text-ink-muted/70 focus:border-moss-500/50 focus:bg-paper focus:outline-none focus:ring-4 focus:ring-moss-500/10"
          />
        </Block>

        <Block label="Min weekly hours">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={40}
              step={5}
              defaultValue={initial.minHours ?? 0}
              onChange={(e) =>
                setParam(
                  "hours",
                  Number(e.target.value) > 0 ? e.target.value : null,
                )
              }
              className="flex-1 accent-moss-600"
            />
            <span className="w-14 text-right text-xs tabular-nums text-ink-muted">
              {initial.minHours ?? 0}+ hrs
            </span>
          </div>
        </Block>

        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-paper-line bg-paper-warm/40 px-3.5 py-2.5">
          <span className="inline-flex items-center gap-2 text-sm text-ink">
            <BadgeCheck className="h-3.5 w-3.5 text-moss-600" />
            Verified only
          </span>
          <input
            type="checkbox"
            defaultChecked={!!initial.verifiedOnly}
            onChange={(e) => setParam("verified", e.target.checked ? "1" : null)}
            className="h-4 w-4 accent-moss-600"
          />
        </label>
      </div>
    </div>
  );
}

function Block({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">
        {label}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

type Option = { value: string; label: string };

function Pills({
  options,
  value,
  onPick,
  single,
}: {
  options: readonly Option[];
  value: string | string[] | null;
  onPick: (v: string) => void;
  single?: boolean;
}) {
  function isOn(v: string) {
    if (single) return value === v;
    return Array.isArray(value) && value.includes(v);
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const on = isOn(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onPick(opt.value)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
              on
                ? "border-moss-500 bg-moss-500 text-paper"
                : "border-paper-line bg-paper text-ink-soft hover:border-moss-500/40 hover:bg-moss-50 hover:text-moss-700",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function ChipList({
  options,
  selected,
  onToggle,
}: {
  options: readonly string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="max-h-44 overflow-y-auto rounded-xl border border-paper-line bg-paper-warm/30 p-2">
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const on = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                on
                  ? "border-moss-500 bg-moss-50 text-moss-700"
                  : "border-paper-line bg-paper text-ink-soft hover:border-moss-500/40 hover:text-moss-700",
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
