import {
  BadgeCheck,
  CalendarHeart,
  GraduationCap,
  Flag,
  PackageCheck,
  HandHeart,
  Users,
  Mountain,
  MessageCircle,
  Network,
  Building2,
  Moon,
  Swords,
  Briefcase,
  Beaker,
  Flame,
  HelpCircle,
  Wrench,
  Mic,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { badgeMeta, type BadgeTone } from "@/lib/profile-options";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  // Canonical 11
  sessions_participant: MessageCircle,
  alifers_member: UsersRound,
  hq_visitor: Building2,
  sprint_finisher: Flag,
  event_attendee: CalendarHeart,
  mvp_tester: Beaker,
  website_roasted: Flame,
  community_ask_answered: HelpCircle,
  project_helper: Wrench,
  mentor_endorsed: HandHeart,
  build_sprint_host: Mic,
  // Legacy
  alif_verified: BadgeCheck,
  cohort_member: GraduationCap,
  shipped_project: PackageCheck,
  active_collaborator: Users,
  network_member: Network,
  jumuah_attendee: Moon,
  summit_participant: Mountain,
  tournament_builder: Swords,
  portfolio_contributor: Briefcase,
};

const TONES: Record<BadgeTone, string> = {
  moss: "bg-moss-50 text-moss-700 ring-moss-100",
  gold: "bg-gold-50 text-gold-600 ring-gold-100",
  ink: "bg-paper-warm text-ink-soft ring-paper-line",
};

export function BadgeChip({
  kind,
  size = "sm",
}: {
  kind: string;
  size?: "xs" | "sm" | "md";
}) {
  const meta = badgeMeta(kind);
  if (!meta) return null;
  const Icon = ICONS[kind] ?? BadgeCheck;
  const tone = TONES[meta.tone];

  const sizes = {
    xs: "px-1.5 py-0.5 text-[10px] gap-0.5",
    sm: "px-2 py-0.5 text-[11px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
  }[size];
  const iconSize = {
    xs: "h-2.5 w-2.5",
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
  }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium ring-1 ring-inset",
        tone,
        sizes,
      )}
    >
      <Icon className={iconSize} strokeWidth={1.75} />
      {meta.label}
    </span>
  );
}

/** Render an array of badge kinds, optionally deriving alif_verified/shipped_project. */
export function BadgeRow({
  kinds,
  verified,
  hasShippedProject,
  size = "sm",
  max,
}: {
  kinds: string[];
  verified?: boolean;
  hasShippedProject?: boolean;
  size?: "xs" | "sm" | "md";
  max?: number;
}) {
  const set = new Set(kinds);
  if (verified) set.add("alif_verified");
  if (hasShippedProject) set.add("shipped_project");
  const ordered = Array.from(set);
  const visible = max ? ordered.slice(0, max) : ordered;
  const hidden = ordered.length - visible.length;

  if (ordered.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((k) => (
        <BadgeChip key={k} kind={k} size={size} />
      ))}
      {hidden > 0 && (
        <span className="inline-flex items-center rounded-full border border-paper-line bg-paper px-2 py-0.5 text-[10px] text-ink-muted">
          +{hidden}
        </span>
      )}
    </div>
  );
}
