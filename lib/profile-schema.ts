import { z } from "zod";
import {
  ROLE_TYPES,
  STARTUP_STAGES,
  LOOKING_FOR,
  COMMITMENT_LEVELS,
  WORKING_STYLES,
} from "./profile-options";

const enumValues = <T extends readonly { value: string }[]>(opts: T) =>
  opts.map((o) => o.value) as [T[number]["value"], ...T[number]["value"][]];

const urlOrEmpty = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\//i.test(v), {
    message: "Must start with http:// or https://",
  });

export const proofItemSchema = z.object({
  label: z.string().trim().max(80).optional().default(""),
  url: urlOrEmpty,
});

export const projectItemSchema = z.object({
  name: z.string().trim().min(1, "Required").max(120),
  link: urlOrEmpty.optional().default(""),
  description: z.string().trim().max(280).optional().default(""),
});

export const profileSchema = z.object({
  // Step 1 — Identity
  full_name: z.string().trim().min(2, "Tell us your name").max(80),
  avatar_url: z.string().nullable().optional(),
  location: z.string().trim().max(80).optional().default(""),
  timezone: z.string().trim().max(80).optional().default(""),
  bio: z.string().trim().max(280).optional().default(""),

  // Step 2 — Builder details
  role_type: z.enum(enumValues(ROLE_TYPES), {
    errorMap: () => ({ message: "Pick one" }),
  }),
  skills: z.array(z.string().trim().min(1).max(40)).max(20, "Max 20"),
  industries: z.array(z.string().trim().min(1).max(40)).max(15, "Max 15"),
  proof_of_work: z.array(proofItemSchema).max(8).default([]),
  past_projects: z.array(projectItemSchema).max(8).default([]),

  // Step 3 — Preferences
  startup_stage: z.enum(enumValues(STARTUP_STAGES)),
  looking_for: z
    .array(z.enum(enumValues(LOOKING_FOR)))
    .min(1, "Pick at least one"),
  weekly_hours: z.coerce
    .number()
    .int()
    .min(0, "Must be ≥ 0")
    .max(80, "Max 80"),
  working_style: z.enum(enumValues(WORKING_STYLES)),
  commitment_level: z.enum(enumValues(COMMITMENT_LEVELS)),
  open_to_remote: z.boolean(),
  open_to_in_person: z.boolean(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const profileDefaults: ProfileFormValues = {
  full_name: "",
  avatar_url: null,
  location: "",
  timezone: "",
  bio: "",
  role_type: "technical",
  skills: [],
  industries: [],
  proof_of_work: [],
  past_projects: [],
  startup_stage: "exploring",
  looking_for: [],
  weekly_hours: 10,
  working_style: "mixed",
  commitment_level: "side_project",
  open_to_remote: true,
  open_to_in_person: false,
};

// Strip empty rows before sending to the DB.
export function normalizeForSave(values: ProfileFormValues) {
  return {
    ...values,
    location: values.location?.trim() || null,
    timezone: values.timezone?.trim() || null,
    bio: values.bio?.trim() || null,
    proof_of_work: (values.proof_of_work ?? []).filter((p) => p.url.trim()),
    past_projects: (values.past_projects ?? []).filter((p) => p.name.trim()),
  };
}
