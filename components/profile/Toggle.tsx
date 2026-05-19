"use client";

import { cn } from "@/lib/utils";

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-paper-line bg-paper px-4 py-3.5 transition-colors hover:bg-paper-warm">
      <div className="flex-1">
        <div className="text-sm font-medium tracking-tight text-ink">
          {label}
        </div>
        {description && (
          <div className="mt-0.5 text-[12px] text-ink-muted">{description}</div>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-moss-500/20",
          checked ? "bg-moss-500" : "bg-paper-line",
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-paper shadow-sm transition-transform",
            checked ? "translate-x-4" : "translate-x-0.5",
          )}
        />
      </button>
    </label>
  );
}
