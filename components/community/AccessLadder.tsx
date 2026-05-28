import {
  UserPlus,
  HandHeart,
  Globe,
  ShieldCheck,
  Crown,
  type LucideIcon,
} from "lucide-react";
import { ACCESS_TIERS } from "@/lib/profile-options";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  new_user: UserPlus,
  contributor: HandHeart,
  community_member: Globe,
  trusted_builder: ShieldCheck,
  core_team: Crown,
};

/** Maps the viewer's level to the access-tier key they currently occupy. */
function currentTierKey(level: number, isAdmin: boolean): string {
  if (isAdmin) return "core_team";
  if (level >= 4) return "trusted_builder";
  if (level === 3) return "community_member";
  if (level === 2) return "contributor";
  return "new_user";
}

export function AccessLadder({
  level,
  isAdmin,
}: {
  level: number;
  isAdmin: boolean;
}) {
  const here = currentTierKey(level, isAdmin);

  return (
    <section>
      <div className="text-center">
        <span className="eyebrow">
          <span className="eyebrow-dot" />
          How access works
        </span>
        <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          You unlock the network by showing up.
        </h2>
        <p className="lead mx-auto mt-3 max-w-2xl text-sm">
          Everyone can discover the ecosystem. The full builder network unlocks
          through contribution, ALIF participation, community access, or Core
          Team approval.
        </p>
      </div>

      <ol className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {ACCESS_TIERS.map((tier, i) => {
          const Icon = ICONS[tier.key] ?? UserPlus;
          const isHere = tier.key === here;
          return (
            <li
              key={tier.key}
              className={cn(
                "relative rounded-xl2 border bg-paper p-5 shadow-card",
                isHere
                  ? "border-moss-300 ring-1 ring-moss-200"
                  : "border-paper-line",
              )}
            >
              {isHere && (
                <span className="absolute -top-2 left-5 inline-flex items-center rounded-full bg-moss-600 px-2 py-0.5 text-[10px] font-medium text-paper-deep">
                  You&rsquo;re here
                </span>
              )}
              <div className="flex items-center justify-between">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-paper-warm text-ink-soft ring-1 ring-inset ring-paper-line">
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink-muted">
                  {tier.key === "core_team" ? "Operator" : `0${i + 1}`}
                </span>
              </div>
              <div className="mt-4 font-display text-[15px] font-semibold tracking-tight text-ink">
                {tier.name}
              </div>
              <p className="mt-1.5 text-[12px] leading-relaxed text-ink-muted">
                {tier.blurb}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
