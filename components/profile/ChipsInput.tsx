"use client";

import { useMemo, useState } from "react";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChipsInput({
  value,
  onChange,
  presets,
  max = 20,
  placeholder = "Add another…",
}: {
  value: string[];
  onChange: (next: string[]) => void;
  presets: readonly string[];
  max?: number;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  const presetSuggestions = useMemo(() => {
    const lowerSelected = new Set(value.map((v) => v.toLowerCase()));
    const q = draft.trim().toLowerCase();
    return presets
      .filter((p) => !lowerSelected.has(p.toLowerCase()))
      .filter((p) => (q ? p.toLowerCase().includes(q) : true))
      .slice(0, 8);
  }, [presets, value, draft]);

  function add(raw: string) {
    const v = raw.trim();
    if (!v) return;
    if (value.length >= max) return;
    if (value.some((x) => x.toLowerCase() === v.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...value, v]);
    setDraft("");
  }

  function remove(v: string) {
    onChange(value.filter((x) => x !== v));
  }

  return (
    <div className="rounded-xl border border-paper-line bg-paper-warm/40 p-2.5">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pb-2">
          {value.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-full border border-moss-100 bg-moss-50 px-2.5 py-1 text-xs font-medium text-moss-700"
            >
              {v}
              <button
                type="button"
                onClick={() => remove(v)}
                className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-moss-700/70 hover:bg-moss-100 hover:text-moss-700"
                aria-label={`Remove ${v}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(draft);
            } else if (e.key === "Backspace" && !draft && value.length) {
              remove(value[value.length - 1]);
            }
          }}
          placeholder={value.length >= max ? `Max ${max} reached` : placeholder}
          disabled={value.length >= max}
          className="flex-1 bg-transparent px-1.5 py-1 text-sm text-ink placeholder:text-ink-muted/70 focus:outline-none"
        />
        {draft && (
          <button
            type="button"
            onClick={() => add(draft)}
            className="inline-flex items-center gap-1 rounded-full bg-ink px-2.5 py-1 text-[11px] font-medium text-paper hover:bg-ink-soft"
          >
            <Plus className="h-3 w-3" /> Add
          </button>
        )}
      </div>

      {presetSuggestions.length > 0 && (
        <div className="mt-2 border-t border-paper-line pt-2">
          <div className="text-[10px] uppercase tracking-wider text-ink-muted">
            Suggestions
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {presetSuggestions.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => add(p)}
                className={cn(
                  "rounded-full border border-paper-line bg-paper px-2.5 py-1 text-xs text-ink-soft transition-all hover:border-moss-500/40 hover:bg-moss-50 hover:text-moss-700",
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
