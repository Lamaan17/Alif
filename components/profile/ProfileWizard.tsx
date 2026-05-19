"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";

import {
  profileSchema,
  profileDefaults,
  normalizeForSave,
  type ProfileFormValues,
} from "@/lib/profile-schema";
import {
  ROLE_TYPES,
  STARTUP_STAGES,
  LOOKING_FOR,
  COMMITMENT_LEVELS,
  WORKING_STYLES,
  SKILL_PRESETS,
  INDUSTRY_PRESETS,
} from "@/lib/profile-options";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

import { Field, inputCls, textareaCls } from "./Field";
import { RadioCards, CheckCards } from "./RadioCards";
import { ChipsInput } from "./ChipsInput";
import { ProofOfWorkList, PastProjectsList } from "./RepeatableList";
import { AvatarUpload } from "./AvatarUpload";
import { Toggle } from "./Toggle";

const STEPS = [
  { key: "identity", label: "Identity" },
  { key: "builder", label: "Builder details" },
  { key: "preferences", label: "Preferences" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

const STEP_FIELDS: Record<StepKey, (keyof ProfileFormValues)[]> = {
  identity: ["full_name", "location", "timezone", "bio"],
  builder: [
    "role_type",
    "skills",
    "industries",
    "proof_of_work",
    "past_projects",
  ],
  preferences: [
    "startup_stage",
    "looking_for",
    "weekly_hours",
    "working_style",
    "commitment_level",
    "open_to_remote",
    "open_to_in_person",
  ],
};

export function ProfileWizard({
  userId,
  initial,
  mode,
}: {
  userId: string;
  initial?: Partial<ProfileFormValues> | null;
  mode: "onboarding" | "edit";
}) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { ...profileDefaults, ...(initial ?? {}) },
    mode: "onChange",
  });

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  async function next() {
    const ok = await form.trigger(STEP_FIELDS[step.key], { shouldFocus: true });
    if (!ok) return;
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setStepIndex((i) => Math.max(0, i - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onSubmit(values: ProfileFormValues) {
    setServerError(null);
    const payload = normalizeForSave(values);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: userId, ...payload }, { onConflict: "id" });

    if (error) {
      setServerError(error.message);
      return;
    }

    startTransition(() => {
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="mx-auto w-full max-w-2xl"
    >
      <Stepper current={stepIndex} />

      <div className="mt-8 rounded-xl2 border border-paper-line bg-paper p-6 shadow-card sm:p-8">
        {step.key === "identity" && (
          <StepIdentity userId={userId} form={form} />
        )}
        {step.key === "builder" && <StepBuilder form={form} />}
        {step.key === "preferences" && <StepPreferences form={form} />}
      </div>

      {serverError && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50/60 px-3 py-2 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={back}
          disabled={stepIndex === 0}
          className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {!isLast ? (
          <button type="button" onClick={next} className="btn-primary">
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={form.formState.isSubmitting || pending}
            className="btn-accent disabled:cursor-not-allowed disabled:opacity-70"
          >
            {form.formState.isSubmitting || pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                {mode === "onboarding" ? "Create profile" : "Save changes"}
              </>
            )}
          </button>
        )}
      </div>
    </form>
  );
}

/* ---------- Stepper ---------- */

function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-3">
      {STEPS.map((s, i) => {
        const state =
          i < current ? "done" : i === current ? "active" : "upcoming";
        return (
          <li key={s.key} className="flex flex-1 items-center gap-2 sm:gap-3">
            <span
              className={cn(
                "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                state === "done" &&
                  "border-moss-500 bg-moss-500 text-paper",
                state === "active" &&
                  "border-ink bg-ink text-paper",
                state === "upcoming" &&
                  "border-paper-line bg-paper text-ink-muted",
              )}
            >
              {state === "done" ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span
              className={cn(
                "hidden truncate text-sm sm:inline",
                state === "upcoming" ? "text-ink-muted" : "text-ink",
              )}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "h-px flex-1 bg-paper-line",
                  state === "done" && "bg-moss-300",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ---------- Step 1: Identity ---------- */

function StepIdentity({
  userId,
  form,
}: {
  userId: string;
  form: ReturnType<typeof useForm<ProfileFormValues>>;
}) {
  const { register, control, formState: { errors } } = form;
  return (
    <div className="space-y-6">
      <Header
        title="Who you are"
        subtitle="The basics. We'll keep it short."
      />

      <Field label="Profile photo">
        <Controller
          control={control}
          name="avatar_url"
          render={({ field }) => (
            <AvatarUpload
              userId={userId}
              value={field.value ?? null}
              onChange={field.onChange}
            />
          )}
        />
      </Field>

      <Field
        label="Full name"
        required
        error={errors.full_name?.message}
      >
        <input
          {...register("full_name")}
          placeholder="Yusra Ahmed"
          className={inputCls}
          autoComplete="name"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Location" hint="City, country">
          <input
            {...register("location")}
            placeholder="Toronto, Canada"
            className={inputCls}
          />
        </Field>
        <Field label="Timezone" hint="e.g. EST, GMT+3">
          <input
            {...register("timezone")}
            placeholder="EST"
            className={inputCls}
          />
        </Field>
      </div>

      <Field
        label="Short bio"
        hint="280 characters. What's the one thing you can't stop thinking about?"
        error={errors.bio?.message}
      >
        <textarea
          {...register("bio")}
          maxLength={280}
          className={textareaCls}
          placeholder="Ex-Stripe eng, building tools for community organizers. Strong opinions on async-first teams."
        />
      </Field>
    </div>
  );
}

/* ---------- Step 2: Builder details ---------- */

function StepBuilder({
  form,
}: {
  form: ReturnType<typeof useForm<ProfileFormValues>>;
}) {
  const { control, formState: { errors } } = form;
  return (
    <div className="space-y-6">
      <Header
        title="What you bring"
        subtitle="Help builders find you. Specifics beat generalities."
      />

      <Field label="Role type" required error={errors.role_type?.message}>
        <Controller
          control={control}
          name="role_type"
          render={({ field }) => (
            <RadioCards
              name="role_type"
              options={ROLE_TYPES}
              value={field.value}
              onChange={field.onChange}
              columns={3}
            />
          )}
        />
      </Field>

      <Field
        label="Skills"
        hint="Add up to 20. Type your own or pick from suggestions."
        error={errors.skills?.message as string | undefined}
      >
        <Controller
          control={control}
          name="skills"
          render={({ field }) => (
            <ChipsInput
              value={field.value}
              onChange={field.onChange}
              presets={SKILL_PRESETS}
              placeholder="Add a skill…"
              max={20}
            />
          )}
        />
      </Field>

      <Field
        label="Industries interested in"
        hint="Up to 15."
        error={errors.industries?.message as string | undefined}
      >
        <Controller
          control={control}
          name="industries"
          render={({ field }) => (
            <ChipsInput
              value={field.value}
              onChange={field.onChange}
              presets={INDUSTRY_PRESETS}
              placeholder="Add an industry…"
              max={15}
            />
          )}
        />
      </Field>

      <Field label="Proof of work">
        <Controller
          control={control}
          name="proof_of_work"
          render={({ field }) => (
            <ProofOfWorkList
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </Field>

      <Field label="Past projects">
        <Controller
          control={control}
          name="past_projects"
          render={({ field }) => (
            <PastProjectsList
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </Field>
    </div>
  );
}

/* ---------- Step 3: Preferences ---------- */

function StepPreferences({
  form,
}: {
  form: ReturnType<typeof useForm<ProfileFormValues>>;
}) {
  const { control, register, formState: { errors } } = form;
  return (
    <div className="space-y-6">
      <Header
        title="How you want to work"
        subtitle="So we match you with people who fit your shape."
      />

      <Field label="Startup stage" required error={errors.startup_stage?.message}>
        <Controller
          control={control}
          name="startup_stage"
          render={({ field }) => (
            <RadioCards
              name="startup_stage"
              options={STARTUP_STAGES}
              value={field.value}
              onChange={field.onChange}
              columns={4}
            />
          )}
        />
      </Field>

      <Field
        label="Looking for"
        required
        hint="Pick one or more."
        error={errors.looking_for?.message as string | undefined}
      >
        <Controller
          control={control}
          name="looking_for"
          render={({ field }) => (
            <CheckCards
              options={LOOKING_FOR}
              value={field.value}
              onChange={field.onChange}
              columns={4}
            />
          )}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Weekly availability"
          hint="Hours per week"
          error={errors.weekly_hours?.message}
        >
          <input
            type="number"
            min={0}
            max={80}
            step={1}
            {...register("weekly_hours", { valueAsNumber: true })}
            className={inputCls}
          />
        </Field>

        <Field label="Working style" required error={errors.working_style?.message}>
          <Controller
            control={control}
            name="working_style"
            render={({ field }) => (
              <RadioCards
                name="working_style"
                options={WORKING_STYLES}
                value={field.value}
                onChange={field.onChange}
                columns={3}
              />
            )}
          />
        </Field>
      </div>

      <Field
        label="Commitment level"
        required
        error={errors.commitment_level?.message}
      >
        <Controller
          control={control}
          name="commitment_level"
          render={({ field }) => (
            <RadioCards
              name="commitment_level"
              options={COMMITMENT_LEVELS}
              value={field.value}
              onChange={field.onChange}
              columns={4}
            />
          )}
        />
      </Field>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Controller
          control={control}
          name="open_to_remote"
          render={({ field }) => (
            <Toggle
              checked={field.value}
              onChange={field.onChange}
              label="Open to remote collaboration"
              description="Work with people in other cities"
            />
          )}
        />
        <Controller
          control={control}
          name="open_to_in_person"
          render={({ field }) => (
            <Toggle
              checked={field.value}
              onChange={field.onChange}
              label="Open to in-person ALIF events"
              description="Show up at meetups and sprints"
            />
          )}
        />
      </div>
    </div>
  );
}

/* ---------- Shared ---------- */

function Header({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <h2 className="font-display text-xl tracking-tight text-ink sm:text-2xl">
        {title}
      </h2>
      <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>
    </div>
  );
}
