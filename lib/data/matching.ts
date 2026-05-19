import { LOOKING_FOR, ROLE_TYPES, labelFor } from "@/lib/profile-options";
import type { BuilderRow } from "./builders";

export type ViewerProfile = {
  id: string;
  role_type: string | null;
  industries: string[];
  looking_for: string[];
  startup_stage: string | null;
  commitment_level: string | null;
  timezone: string | null;
};

export type ScoredBuilder = {
  builder: BuilderRow;
  score: number;
  reasons: string[];
};

/**
 * Score a single builder against the viewer.
 *
 * The weights are intentionally chunky (5-30) so a score is easy to reason
 * about by eye. Highest possible without relationship signals is ~50.
 */
export function scoreBuilder(
  viewer: ViewerProfile,
  builder: BuilderRow,
  ctx: {
    mutual: Set<string>;
    interestedInMe: Set<string>;
  },
): ScoredBuilder {
  let score = 0;
  const reasons: string[] = [];

  // 1. Relationship signals (strongest)
  if (ctx.mutual.has(builder.id)) {
    score += 30;
    reasons.push("Mutual interest");
  } else if (ctx.interestedInMe.has(builder.id)) {
    score += 20;
    reasons.push("They're interested in you");
  }

  // 2. Looking-for overlap — both want the same kind of collaboration
  const myLF = new Set(viewer.looking_for ?? []);
  const lfOverlap = (builder.looking_for ?? []).filter((v) => myLF.has(v));
  if (lfOverlap.length > 0) {
    score += 12;
    const labels = lfOverlap
      .slice(0, 2)
      .map((v) => labelFor(LOOKING_FOR, v).toLowerCase());
    reasons.push(`Both want ${labels.join(" + ")}`);
  }

  // 3. Role complementarity — different role types usually beat same
  if (
    viewer.role_type &&
    builder.role_type &&
    viewer.role_type !== builder.role_type
  ) {
    score += 12;
    reasons.push(
      `Complements your ${labelFor(ROLE_TYPES, viewer.role_type)}`,
    );
  }

  // 4. Industry overlap (up to 15)
  const myIndustries = new Set(viewer.industries ?? []);
  const industryOverlap = (builder.industries ?? []).filter((i) =>
    myIndustries.has(i),
  );
  if (industryOverlap.length > 0) {
    score += Math.min(15, industryOverlap.length * 5);
    reasons.push(`Shared: ${industryOverlap.slice(0, 2).join(", ")}`);
  }

  // 5. Same stage
  if (
    viewer.startup_stage &&
    builder.startup_stage &&
    viewer.startup_stage === builder.startup_stage
  ) {
    score += 4;
  }

  // 6. Same commitment level
  if (
    viewer.commitment_level &&
    builder.commitment_level &&
    viewer.commitment_level === builder.commitment_level
  ) {
    score += 4;
  }

  // 7. Timezone proximity (first 3 chars: EST/GMT/CET, plus GMT+X aware)
  if (viewer.timezone && builder.timezone) {
    const a = viewer.timezone.trim().toUpperCase();
    const b = builder.timezone.trim().toUpperCase();
    if (a === b) {
      score += 5;
      reasons.push("Same timezone");
    } else if (a.slice(0, 3) === b.slice(0, 3)) {
      score += 2;
    }
  }

  // 8. Quality boosters
  if (builder.verified) score += 4;
  if (builder.level >= 3) score += 3;

  return { builder, score, reasons };
}

export function rankBuilders(
  viewer: ViewerProfile,
  builders: BuilderRow[],
  ctx: { mutual: Set<string>; interestedInMe: Set<string> },
): ScoredBuilder[] {
  return builders
    .map((b) => scoreBuilder(viewer, b, ctx))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      // Tiebreaker: more recent profile first
      return (
        new Date(b.builder.created_at).getTime() -
        new Date(a.builder.created_at).getTime()
      );
    });
}
