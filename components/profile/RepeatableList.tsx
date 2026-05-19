"use client";

import { Plus, Trash2 } from "lucide-react";
import { inputCls, textareaCls } from "./Field";

type ProofItem = { label: string; url: string };
type ProjectItem = { name: string; link: string; description: string };

export function ProofOfWorkList({
  value,
  onChange,
  max = 8,
}: {
  value: ProofItem[];
  onChange: (next: ProofItem[]) => void;
  max?: number;
}) {
  function update(i: number, patch: Partial<ProofItem>) {
    const next = value.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }
  function add() {
    if (value.length >= max) return;
    onChange([...value, { label: "", url: "" }]);
  }
  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-2.5">
      {value.length === 0 && (
        <p className="text-xs text-ink-muted">
          GitHub, Dribbble, blog, deck, Twitter — anything that shows how you
          work.
        </p>
      )}

      {value.map((p, i) => (
        <div
          key={i}
          className="grid grid-cols-1 gap-2 rounded-xl border border-paper-line bg-paper-warm/40 p-2.5 sm:grid-cols-[1fr_2fr_auto]"
        >
          <input
            type="text"
            placeholder="Label (e.g. GitHub)"
            value={p.label}
            onChange={(e) => update(i, { label: e.target.value })}
            className={inputCls}
          />
          <input
            type="url"
            placeholder="https://"
            value={p.url}
            onChange={(e) => update(i, { url: e.target.value })}
            className={inputCls}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="inline-flex h-10 w-10 items-center justify-center self-start rounded-xl border border-paper-line bg-paper text-ink-muted transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            aria-label="Remove"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        disabled={value.length >= max}
        className="inline-flex items-center gap-1.5 rounded-full border border-paper-line bg-paper px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-moss-500/40 hover:bg-moss-50 hover:text-moss-700 disabled:opacity-50"
      >
        <Plus className="h-3.5 w-3.5" /> Add link
      </button>
    </div>
  );
}

export function PastProjectsList({
  value,
  onChange,
  max = 8,
}: {
  value: ProjectItem[];
  onChange: (next: ProjectItem[]) => void;
  max?: number;
}) {
  function update(i: number, patch: Partial<ProjectItem>) {
    const next = value.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }
  function add() {
    if (value.length >= max) return;
    onChange([...value, { name: "", link: "", description: "" }]);
  }
  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <p className="text-xs text-ink-muted">
          Share 1–3 things you&rsquo;ve shipped. They don&rsquo;t have to be perfect.
        </p>
      )}

      {value.map((p, i) => (
        <div
          key={i}
          className="rounded-xl border border-paper-line bg-paper-warm/40 p-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Project name"
                value={p.name}
                onChange={(e) => update(i, { name: e.target.value })}
                className={inputCls}
              />
              <input
                type="url"
                placeholder="https://"
                value={p.link}
                onChange={(e) => update(i, { link: e.target.value })}
                className={inputCls}
              />
            </div>
            <button
              type="button"
              onClick={() => remove(i)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-paper-line bg-paper text-ink-muted transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              aria-label="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <textarea
            placeholder="One sentence — what it does, your role, what you learned."
            value={p.description}
            onChange={(e) => update(i, { description: e.target.value })}
            rows={2}
            maxLength={280}
            className={textareaCls + " mt-2"}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        disabled={value.length >= max}
        className="inline-flex items-center gap-1.5 rounded-full border border-paper-line bg-paper px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-moss-500/40 hover:bg-moss-50 hover:text-moss-700 disabled:opacity-50"
      >
        <Plus className="h-3.5 w-3.5" /> Add project
      </button>
    </div>
  );
}
