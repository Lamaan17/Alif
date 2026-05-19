"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";

import { createProject } from "@/app/actions/projects";
import { Field, inputCls, textareaCls } from "@/components/profile/Field";
import { RadioCards } from "@/components/profile/RadioCards";
import { ChipsInput } from "@/components/profile/ChipsInput";
import {
  STARTUP_STAGES,
  ROLE_TYPES,
  COLLAB_MODES,
  INDUSTRY_PRESETS,
  SKILL_PRESETS,
} from "@/lib/profile-options";

type Values = {
  title: string;
  one_liner: string;
  problem: string;
  industry: string;
  current_stage: string;
  skills_needed: string[];
  ideal_collaborator: string;
  time_commitment_hours: string;
  duration_weeks: string;
  collab_mode: string;
  deadline: string;
};

const empty: Values = {
  title: "",
  one_liner: "",
  problem: "",
  industry: "",
  current_stage: "has_idea",
  skills_needed: [],
  ideal_collaborator: "technical",
  time_commitment_hours: "8",
  duration_weeks: "4",
  collab_mode: "remote",
  deadline: "",
};

export function ProjectForm() {
  const router = useRouter();
  const [v, setV] = useState<Values>(empty);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function up<K extends keyof Values>(key: K, value: Values[K]) {
    setV((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createProject({
        title: v.title,
        one_liner: v.one_liner,
        problem: v.problem,
        industry: v.industry,
        current_stage: v.current_stage as Values["current_stage"] as
          | "exploring"
          | "has_idea"
          | "building"
          | "launched",
        skills_needed: v.skills_needed,
        ideal_collaborator: v.ideal_collaborator as
          | "technical"
          | "business"
          | "product"
          | "design"
          | "operator"
          | "domain_expert",
        time_commitment_hours: v.time_commitment_hours
          ? Number(v.time_commitment_hours)
          : undefined,
        duration_weeks: v.duration_weeks ? Number(v.duration_weeks) : undefined,
        collab_mode: v.collab_mode as "remote" | "in_person" | "hybrid",
        deadline: v.deadline,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push(`/projects/${res.data!.id}`);
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto w-full max-w-2xl space-y-6 rounded-xl2 border border-paper-line bg-paper p-6 shadow-card sm:p-8"
    >
      <Field label="Project title" required>
        <input
          value={v.title}
          onChange={(e) => up("title", e.target.value)}
          placeholder="Halal supply chain transparency tool"
          required
          minLength={3}
          maxLength={120}
          className={inputCls}
        />
      </Field>

      <Field label="One-line description" required hint="Max 160 chars">
        <input
          value={v.one_liner}
          onChange={(e) => up("one_liner", e.target.value)}
          placeholder="Help small importers track and certify halal supply chains end-to-end."
          required
          minLength={10}
          maxLength={160}
          className={inputCls}
        />
      </Field>

      <Field label="The problem you're solving" hint="2–3 sentences">
        <textarea
          value={v.problem}
          onChange={(e) => up("problem", e.target.value)}
          placeholder="What's broken? Who feels it? Why does it matter?"
          maxLength={800}
          rows={4}
          className={textareaCls}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Industry">
          <select
            value={v.industry}
            onChange={(e) => up("industry", e.target.value)}
            className={inputCls}
          >
            <option value="">Pick one…</option>
            {INDUSTRY_PRESETS.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Current stage">
          <select
            value={v.current_stage}
            onChange={(e) => up("current_stage", e.target.value)}
            className={inputCls}
          >
            {STARTUP_STAGES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label} — {s.hint}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Skills needed" hint="Up to 20">
        <ChipsInput
          value={v.skills_needed}
          onChange={(next) => up("skills_needed", next)}
          presets={SKILL_PRESETS}
          placeholder="Add a skill…"
          max={20}
        />
      </Field>

      <Field label="Ideal collaborator type">
        <RadioCards
          name="ideal_collaborator"
          options={ROLE_TYPES}
          value={v.ideal_collaborator}
          onChange={(val) => up("ideal_collaborator", val)}
          columns={3}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Time / week" hint="Hours">
          <input
            type="number"
            min={1}
            max={80}
            value={v.time_commitment_hours}
            onChange={(e) => up("time_commitment_hours", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Duration" hint="Weeks">
          <input
            type="number"
            min={1}
            max={52}
            value={v.duration_weeks}
            onChange={(e) => up("duration_weeks", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Application deadline" hint="Optional">
          <input
            type="date"
            value={v.deadline}
            onChange={(e) => up("deadline", e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Collaboration mode">
        <RadioCards
          name="collab_mode"
          options={COLLAB_MODES}
          value={v.collab_mode}
          onChange={(val) => up("collab_mode", val)}
          columns={3}
        />
      </Field>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50/60 px-3 py-2 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="btn-primary disabled:opacity-60"
        >
          {pending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Posting…
            </>
          ) : (
            <>
              Post project
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
