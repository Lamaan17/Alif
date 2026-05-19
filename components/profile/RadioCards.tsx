"use client";

import { cn } from "@/lib/utils";

type Option = { value: string; label: string; hint?: string };

export function RadioCards({
  name,
  options,
  value,
  onChange,
  columns = 3,
}: {
  name: string;
  options: readonly Option[];
  value: string | undefined;
  onChange: (v: string) => void;
  columns?: 2 | 3 | 4;
}) {
  const grid = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <div className={`grid gap-2.5 ${grid}`}>
      {options.map((opt) => {
        const checked = value === opt.value;
        return (
          <label
            key={opt.value}
            className={cn(
              "group relative flex cursor-pointer flex-col rounded-xl border bg-paper px-3.5 py-3 text-sm transition-all",
              checked
                ? "border-moss-500 bg-moss-50/50 shadow-ring"
                : "border-paper-line hover:border-ink/15 hover:bg-paper-warm",
            )}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={checked}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            <span
              className={cn(
                "font-medium tracking-tight",
                checked ? "text-moss-700" : "text-ink",
              )}
            >
              {opt.label}
            </span>
            {opt.hint && (
              <span className="mt-0.5 text-[11px] text-ink-muted">
                {opt.hint}
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}

export function CheckCards({
  options,
  value,
  onChange,
  columns = 2,
}: {
  options: readonly Option[];
  value: string[];
  onChange: (v: string[]) => void;
  columns?: 2 | 3 | 4;
}) {
  const grid = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
  }[columns];

  function toggle(v: string) {
    if (value.includes(v)) onChange(value.filter((x) => x !== v));
    else onChange([...value, v]);
  }

  return (
    <div className={`grid gap-2.5 ${grid}`}>
      {options.map((opt) => {
        const checked = value.includes(opt.value);
        return (
          <label
            key={opt.value}
            className={cn(
              "group relative flex cursor-pointer flex-col rounded-xl border bg-paper px-3.5 py-3 text-sm transition-all",
              checked
                ? "border-moss-500 bg-moss-50/50 shadow-ring"
                : "border-paper-line hover:border-ink/15 hover:bg-paper-warm",
            )}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(opt.value)}
              className="sr-only"
            />
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  "font-medium tracking-tight",
                  checked ? "text-moss-700" : "text-ink",
                )}
              >
                {opt.label}
              </span>
              <span
                className={cn(
                  "inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px] transition-all",
                  checked
                    ? "border-moss-500 bg-moss-500 text-paper"
                    : "border-paper-line bg-paper",
                )}
                aria-hidden
              >
                {checked ? "✓" : ""}
              </span>
            </div>
            {opt.hint && (
              <span className="mt-0.5 text-[11px] text-ink-muted">
                {opt.hint}
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}
