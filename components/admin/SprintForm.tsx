"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, AlertCircle, X } from "lucide-react";

import { createSprint } from "@/app/actions/admin";
import { Field, inputCls, textareaCls } from "@/components/profile/Field";
import { CheckCards } from "@/components/profile/RadioCards";
import { ROLE_TYPES } from "@/lib/profile-options";

type Values = {
  title: string;
  theme: string;
  description: string;
  deliverable: string;
  start_date: string;
  end_date: string;
  max_team_size: string;
  recommended_roles: string[];
};

const empty: Values = {
  title: "",
  theme: "",
  description: "",
  deliverable: "",
  start_date: "",
  end_date: "",
  max_team_size: "3",
  recommended_roles: ["technical", "product"],
};

export function SprintForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [v, setV] = useState<Values>(empty);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function up<K extends keyof Values>(key: K, value: Values[K]) {
    setV((s) => ({ ...s, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createSprint({
        title: v.title,
        theme: v.theme,
        description: v.description,
        deliverable: v.deliverable,
        start_date: v.start_date,
        end_date: v.end_date,
        max_team_size: Number(v.max_team_size) as 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
        recommended_roles: v.recommended_roles as (
          | "technical"
          | "business"
          | "product"
          | "design"
          | "operator"
          | "domain_expert"
        )[],
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setV(empty);
      setOpen(false);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-primary"
      >
        <Plus className="h-4 w-4" />
        Create sprint
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-xl2 border border-paper-line bg-paper p-6 shadow-card"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg tracking-tight">New build sprint</h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-ink-muted hover:bg-paper-warm hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 space-y-5">
        <Field label="Sprint title" required>
          <input
            value={v.title}
            onChange={(e) => up("title", e.target.value)}
            placeholder="7-Day Founder Chemistry Sprint"
            required
            maxLength={140}
            className={inputCls}
          />
        </Field>

        <Field label="Theme">
          <input
            value={v.theme}
            onChange={(e) => up("theme", e.target.value)}
            placeholder="Build a useful AI tool for students, founders, or small businesses."
            maxLength={200}
            className={inputCls}
          />
        </Field>

        <Field label="Description">
          <textarea
            value={v.description}
            onChange={(e) => up("description", e.target.value)}
            placeholder="What the sprint is, how it runs, what's expected."
            rows={4}
            maxLength={2000}
            className={textareaCls}
          />
        </Field>

        <Field
          label="Expected deliverable"
          hint="Comma-separated list works well: landing page, prototype, 5 customer interviews, 3-minute pitch"
        >
          <input
            value={v.deliverable}
            onChange={(e) => up("deliverable", e.target.value)}
            maxLength={500}
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Start date" required>
            <input
              type="date"
              value={v.start_date}
              onChange={(e) => up("start_date", e.target.value)}
              required
              className={inputCls}
            />
          </Field>
          <Field label="End date" required>
            <input
              type="date"
              value={v.end_date}
              onChange={(e) => up("end_date", e.target.value)}
              required
              className={inputCls}
            />
          </Field>
          <Field label="Max team size">
            <input
              type="number"
              min={2}
              max={10}
              value={v.max_team_size}
              onChange={(e) => up("max_team_size", e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Recommended roles">
          <CheckCards
            options={ROLE_TYPES}
            value={v.recommended_roles}
            onChange={(next) => up("recommended_roles", next)}
            columns={3}
          />
        </Field>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50/60 px-3 py-2 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button type="submit" disabled={pending} className="btn-accent disabled:opacity-60">
          {pending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Creating…
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" />
              Create sprint
            </>
          )}
        </button>
      </div>
    </form>
  );
}
