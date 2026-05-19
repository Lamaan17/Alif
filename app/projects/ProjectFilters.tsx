"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, RotateCcw } from "lucide-react";

import {
  STARTUP_STAGES,
  COLLAB_MODES,
  INDUSTRY_PRESETS,
} from "@/lib/profile-options";
import type { ProjectFilters as PF } from "@/lib/data/projects";
import { cn } from "@/lib/utils";

export function ProjectFilters({ initial }: { initial: PF }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
    startTransition(() =>
      router.replace(`/projects?${next.toString()}`, { scroll: false }),
    );
  }

  function clearAll() {
    startTransition(() => router.replace("/projects", { scroll: false }));
  }

  const hasAny =
    !!initial.industry || !!initial.stage || !!initial.collab || !!initial.openOnly;

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
        <Block label="Stage">
          <Pills
            value={initial.stage ?? null}
            options={STARTUP_STAGES}
            onPick={(v) =>
              setParam("stage", initial.stage === v ? null : v)
            }
          />
        </Block>

        <Block label="Collaboration">
          <Pills
            value={initial.collab ?? null}
            options={COLLAB_MODES}
            onPick={(v) =>
              setParam("collab", initial.collab === v ? null : v)
            }
          />
        </Block>

        <Block label="Industry">
          <select
            value={initial.industry ?? ""}
            onChange={(e) => setParam("industry", e.target.value || null)}
            className="w-full rounded-xl border border-paper-line bg-paper-warm/60 px-3 py-2 text-sm text-ink focus:border-moss-500/50 focus:bg-paper focus:outline-none focus:ring-4 focus:ring-moss-500/10"
          >
            <option value="">Any industry</option>
            {INDUSTRY_PRESETS.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </Block>

        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-paper-line bg-paper-warm/40 px-3.5 py-2.5">
          <span className="text-sm text-ink">Open to apply only</span>
          <input
            type="checkbox"
            defaultChecked={!!initial.openOnly}
            onChange={(e) => setParam("open", e.target.checked ? "1" : null)}
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

function Pills({
  options,
  value,
  onPick,
}: {
  options: readonly { value: string; label: string }[];
  value: string | null;
  onPick: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const on = value === opt.value;
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
