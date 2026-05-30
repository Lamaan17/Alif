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

// Freemium trust ladder. Public-facing tier names mapped onto the
// internal `level` column (0–4). Core Team is the is_admin flag, not a level.
export const LEVELS = [
  { value: 0, label: "New User",         hint: "Account created" },
  { value: 1, label: "New User",         hint: "Builder Passport started" },
  { value: 2, label: "Contributor",      hint: "Helping projects, answering asks" },
  { value: 3, label: "Community Member", hint: "Full builder network access" },
  { value: 4, label: "Trusted Builder",  hint: "Private rooms, hosting, mentoring" },
] as const;

export type Level = (typeof LEVELS)[number]["value"];

/** Public tier name for a given internal level. */
export function tierName(level: number | null | undefined): string {
  const lv = typeof level === "number" ? level : 0;
  if (lv <= 1) return "New User";
  if (lv === 2) return "Contributor";
  if (lv === 3) return "Community Member";
  return "Trusted Builder";
}

export function levelLabel(level: number | null | undefined) {
  return tierName(level);
}

/** Access tiers as a constant for "how access works" UIs. */
export const ACCESS_TIERS = [
  {
    key: "new_user",
    name: "New User",
    minLevel: 0,
    blurb: "Create your Builder Passport and start contributing.",
  },
  {
    key: "contributor",
    name: "Contributor",
    minLevel: 2,
    blurb: "Help projects, answer asks, join sprints, and build trust.",
  },
  {
    key: "community_member",
    name: "Community Member",
    minLevel: 3,
    blurb:
      "Unlock the main ALIF builder network through Sessions, events, contribution + community access, scholarship, or approval.",
  },
  {
    key: "trusted_builder",
    name: "Trusted Builder",
    minLevel: 4,
    blurb:
      "Apply for deeper access after consistent contribution and community trust.",
  },
  {
    key: "core_team",
    name: "Core Team",
    minLevel: 99,
    blurb: "ALIF operators who curate, verify, and protect the ecosystem.",
  },
] as const;

/** Who can answer a Community Ask, by audience. */
export const ASK_AUDIENCES = [
  { value: "open",         label: "Open to all",          minLevel: 0 },
  { value: "contributors", label: "Contributors and up",  minLevel: 2 },
  { value: "community",    label: "Community Members only",minLevel: 3 },
  { value: "trusted",      label: "Trusted Builders only", minLevel: 4 },
] as const;

export type AskAudience = (typeof ASK_AUDIENCES)[number]["value"];

export function audienceMinLevel(audience: string): number {
  return ASK_AUDIENCES.find((a) => a.value === audience)?.minLevel ?? 0;
}

export function audienceLabel(audience: string): string {
  return ASK_AUDIENCES.find((a) => a.value === audience)?.label ?? "Open to all";
}

/** Does a member meet an ask's answer-audience requirement? Admins always do. */
export function meetsAudience(
  level: number | null | undefined,
  isAdmin: boolean,
  audience: string,
): boolean {
  if (isAdmin) return true;
  return (level ?? 0) >= audienceMinLevel(audience);
}

export const ASK_KINDS = [
  { value: "website_roast",   label: "Roast my website" },
  { value: "review_post",     label: "Review my post" },
  { value: "idea_feedback",   label: "Idea feedback" },
  { value: "pitch_feedback",  label: "Pitch feedback" },
  { value: "mvp_testing",     label: "MVP testing" },
  { value: "find_users",      label: "Find early users" },
  { value: "design_help",     label: "Design help" },
  { value: "code_help",       label: "Code help" },
  { value: "pricing_check",   label: "Pricing check" },
  { value: "intro",           label: "Intro request" },
  { value: "feedback",        label: "Feedback" },
  { value: "general",         label: "General" },
] as const;

// Canonical participation-badge family (11). Order is display order on
// admin pickers, profile pages, etc.
//
// Note: badges are *participation/trust signals only*. They do NOT control
// what someone can do — that's the access ladder (LEVELS / tierName).
export const BADGES = [
  { value: "sessions_participant",     label: "Sessions Alumni",          tone: "gold" },
  { value: "alifers_member",           label: "Alifers Member",           tone: "moss" },
  { value: "hq_visitor",               label: "HQ Regular",               tone: "ink"  },
  { value: "sprint_finisher",          label: "Sprint Finisher",          tone: "moss" },
  { value: "event_attendee",           label: "Event Attendee",           tone: "ink"  },
  { value: "mvp_tester",               label: "MVP Tester",               tone: "moss" },
  { value: "website_roasted",          label: "Website Roasted",          tone: "gold" },
  { value: "community_ask_answered",   label: "Community Ask Answered",   tone: "moss" },
  { value: "project_helper",           label: "Project Helper",           tone: "moss" },
  { value: "mentor_endorsed",          label: "Mentor Endorsed",          tone: "gold" },
  { value: "build_sprint_host",        label: "Build Sprint Host",        tone: "gold" },
  // Legacy kinds — still in the enum, kept available so existing seed data
  // and historical assignments render correctly. Hidden from new admin
  // picker order but BadgeChip handles them via the icon map.
  { value: "alif_verified",            label: "Verified Builder (legacy)",tone: "moss" },
  { value: "shipped_project",          label: "Project Shipped",          tone: "moss" },
  { value: "active_collaborator",      label: "Active Builder",           tone: "ink"  },
  { value: "network_member",           label: "Network Member",           tone: "moss" },
  { value: "jumuah_attendee",          label: "Jumuah Attendee",          tone: "gold" },
  { value: "summit_participant",       label: "Summit Participant",       tone: "gold" },
  { value: "tournament_builder",       label: "Tournament Builder",       tone: "moss" },
  { value: "portfolio_contributor",    label: "Portfolio Contributor",    tone: "gold" },
  { value: "cohort_member",            label: "Cohort Member",            tone: "gold" },
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
