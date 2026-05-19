// Single source of truth for selectable options.
// Keep `value` in sync with the enums in supabase/schema.sql.

export const ROLE_TYPES = [
  { value: "technical", label: "Technical", hint: "Engineering, ML, infra" },
  { value: "business", label: "Business", hint: "GTM, sales, ops, finance" },
  { value: "product", label: "Product", hint: "PM, strategy, research" },
  { value: "design", label: "Design", hint: "Product, brand, UX" },
  { value: "operator", label: "Operator", hint: "Generalist, ex-founder, COO" },
  { value: "domain_expert", label: "Domain Expert", hint: "Deep in a vertical" },
] as const;

export const STARTUP_STAGES = [
  { value: "exploring", label: "Exploring", hint: "Open to ideas" },
  { value: "has_idea", label: "Has Idea", hint: "Specific thesis, no build yet" },
  { value: "building", label: "Building", hint: "Prototype in progress" },
  { value: "launched", label: "Launched", hint: "Users in the wild" },
] as const;

export const LOOKING_FOR = [
  { value: "cofounder", label: "Cofounder" },
  { value: "collaborator", label: "Collaborator" },
  { value: "project_team", label: "Project Team" },
  { value: "sprint_team", label: "Sprint Team" },
] as const;

export const COMMITMENT_LEVELS = [
  { value: "exploring", label: "Exploring", hint: "A few hours" },
  { value: "side_project", label: "Side project", hint: "5–15 hrs/wk" },
  { value: "part_time", label: "Part time", hint: "15–30 hrs/wk" },
  { value: "full_time", label: "Full time", hint: "30+ hrs/wk" },
] as const;

export const WORKING_STYLES = [
  { value: "async_first", label: "Async-first" },
  { value: "sync_heavy", label: "Sync-heavy" },
  { value: "mixed", label: "Mixed / flexible" },
] as const;

export const SKILL_PRESETS = [
  "React / Next.js", "TypeScript", "Python", "Go", "Rust", "Node.js",
  "iOS / Swift", "Android / Kotlin", "Mobile (RN / Flutter)",
  "Backend / APIs", "Databases", "Infra / DevOps", "ML / AI", "LLM tooling",
  "Data engineering", "Computer vision",
  "Product design", "Brand design", "Motion / 3D",
  "Product management", "User research", "Growth", "SEO / content",
  "Sales", "Partnerships", "Operations", "Finance", "Legal",
  "Hardware", "Embedded", "Robotics",
] as const;

export const INDUSTRY_PRESETS = [
  "Consumer", "B2B SaaS", "Developer tools", "AI / ML",
  "Fintech", "Healthtech", "Climate / Energy", "Education",
  "Marketplaces", "Productivity", "Creator economy", "Social",
  "Hardware", "Robotics", "Biotech",
  "Media", "Gaming", "Web3 / Crypto",
  "Logistics", "Real estate", "Travel", "Food", "Faith / Community",
] as const;

export type RoleType = (typeof ROLE_TYPES)[number]["value"];
export type StartupStage = (typeof STARTUP_STAGES)[number]["value"];
export type LookingForKind = (typeof LOOKING_FOR)[number]["value"];
export type CommitmentLevel = (typeof COMMITMENT_LEVELS)[number]["value"];
export type WorkingStyle = (typeof WORKING_STYLES)[number]["value"];

/* ------------------------------------------------------------------
 * Progression & badges
 * ------------------------------------------------------------------ */

export const LEVELS = [
  { value: 0, label: "Explorer",         hint: "Joined ALIF" },
  { value: 1, label: "Builder",          hint: "Profile complete" },
  { value: 2, label: "Collaborator",     hint: "Applied to a sprint or project" },
  { value: 3, label: "Verified Builder", hint: "Completed a sprint with positive peer review" },
  { value: 4, label: "Founder Circle",   hint: "Approved trusted member" },
] as const;

export type Level = (typeof LEVELS)[number]["value"];

export function levelLabel(level: number | null | undefined) {
  return LEVELS.find((l) => l.value === level)?.label ?? "Explorer";
}

export const BADGES = [
  { value: "alif_verified",      label: "ALIF Verified",      tone: "moss" },
  { value: "event_attendee",     label: "Event Attendee",     tone: "ink"  },
  { value: "cohort_member",      label: "Cohort Member",      tone: "gold" },
  { value: "sprint_finisher",    label: "Sprint Finisher",    tone: "moss" },
  { value: "shipped_project",    label: "Shipped Project",    tone: "moss" },
  { value: "mentor_endorsed",    label: "Mentor Endorsed",    tone: "gold" },
  { value: "active_collaborator",label: "Active Collaborator",tone: "ink"  },
] as const;

export type BadgeKind = (typeof BADGES)[number]["value"];
export type BadgeTone = (typeof BADGES)[number]["tone"];

export function badgeMeta(kind: string) {
  return BADGES.find((b) => b.value === kind);
}

/* ------------------------------------------------------------------
 * Project options
 * ------------------------------------------------------------------ */

export const COLLAB_MODES = [
  { value: "remote",    label: "Remote",    hint: "Async, any location" },
  { value: "in_person", label: "In-person", hint: "Same city, regular meetups" },
  { value: "hybrid",    label: "Hybrid",    hint: "Mix of both" },
] as const;

export type CollabMode = (typeof COLLAB_MODES)[number]["value"];

export function labelFor<T extends { value: string; label: string }>(
  options: readonly T[],
  value: string | null | undefined,
): string {
  return options.find((o) => o.value === value)?.label ?? "—";
}
