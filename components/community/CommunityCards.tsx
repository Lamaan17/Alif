import {
  MessageCircle,
  Network,
  Building2,
  Flag,
  Briefcase,
  HandHeart,
  GraduationCap,
  MapPin,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- types ---------- */

type Section = {
  key: string;
  icon: LucideIcon;
  title: string;
  body: string;
  preview: SectionPreview;
};

type SectionPreview =
  | { kind: "circles"; circles: { name: string; members: number; focus: string }[] }
  | { kind: "list"; items: string[] }
  | { kind: "stat"; stat: string; sub: string };

const SECTIONS: Section[] = [
  {
    key: "sessions_alumni",
    icon: MessageCircle,
    title: "Sessions Alumni",
    body: "Stay connected with the people you met in the room — past the closing keynote.",
    preview: {
      kind: "list",
      items: [
        "Sessions Spring '25 · 84 alumni active",
        "Sessions Fall '24 · 67 alumni active",
        "Sessions Summer '24 · 41 alumni active",
      ],
    },
  },
  {
    key: "network_builders",
    icon: Network,
    title: "Network Builders",
    body: "ALIF Network members shipping in public, vetted for what they actually build.",
    preview: { kind: "stat", stat: "312 members", sub: "with public proof of work" },
  },
  {
    key: "hq_regulars",
    icon: Building2,
    title: "HQ Regulars",
    body: "Builders who show up at ALIF HQ to work, ship, and find collaborators in person.",
    preview: {
      kind: "list",
      items: [
        "Mon–Fri · open hours",
        "Thu · weekly cowork night",
        "Sat · build sessions",
      ],
    },
  },
  {
    key: "sprint_finishers",
    icon: Flag,
    title: "Sprint Finishers",
    body: "Builders who have completed a 7-day sprint and have peer reviews to show for it.",
    preview: { kind: "stat", stat: "18 cohorts", sub: "shipped end-to-end" },
  },
  {
    key: "portfolio_contributors",
    icon: Briefcase,
    title: "Portfolio Contributors",
    body: "Builders helping ALIF portfolio companies ship — and getting first-look opportunities.",
    preview: { kind: "stat", stat: "9 companies", sub: "actively seeking contributors" },
  },
  {
    key: "first_believers",
    icon: HandHeart,
    title: "First Believers",
    body: "Early builders who back the most ambitious ideas before anyone else does.",
    preview: {
      kind: "list",
      items: [
        "Pre-revenue founders raising signal",
        "Solo builders looking for first collaborators",
        "Pre-launch projects seeking feedback",
      ],
    },
  },
  {
    key: "mentor_rooms",
    icon: GraduationCap,
    title: "Mentor Rooms",
    body: "Quiet rooms where ALIF mentors offer time to builders doing the work.",
    preview: { kind: "stat", stat: "120+", sub: "mentors open to intros this quarter" },
  },
  {
    key: "city_circles",
    icon: MapPin,
    title: "City Circles",
    body: "Local circles where ALIF energy stays continuous in your city.",
    preview: {
      kind: "list",
      items: [
        "Toronto · weekly Thursdays",
        "NYC · 2nd Saturday",
        "London · monthly Fridays",
        "Karachi · 1st Saturday",
      ],
    },
  },
];

/* ---------- card grid ---------- */

export function CommunityCards({ unlocked }: { unlocked: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {SECTIONS.map((s) => (
        <CommunityCard key={s.key} section={s} unlocked={unlocked} />
      ))}
    </div>
  );
}

function CommunityCard({
  section,
  unlocked,
}: {
  section: Section;
  unlocked: boolean;
}) {
  const Icon = section.icon;
  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-xl2 border border-paper-line bg-paper p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-cardHover">
      {/* Lock overlay for unverified viewers */}
      {!unlocked && (
        <div className="pointer-events-none absolute right-4 top-4 z-10">
          <span className="inline-flex items-center gap-1 rounded-full border border-paper-line bg-paper-warm px-2 py-0.5 text-[10px] font-medium text-ink-muted">
            <Lock className="h-2.5 w-2.5" />
            Locked
          </span>
        </div>
      )}

      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-paper-warm text-ink-soft ring-1 ring-inset ring-paper-line">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-semibold tracking-tight text-ink">
            {section.title}
          </h3>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
            {section.body}
          </p>
        </div>
      </div>

      {/* Preview content — blurred if not unlocked */}
      <div
        className={cn(
          "mt-5 transition-all",
          !unlocked && "select-none pointer-events-none",
        )}
      >
        <div
          className={cn(
            "rounded-lg border border-paper-line bg-paper-warm/40 p-3",
            !unlocked && "blur-[3px] opacity-70",
          )}
          aria-hidden={!unlocked}
        >
          {section.preview.kind === "circles" && (
            <ul className="space-y-1.5 text-[12px]">
              {section.preview.circles.slice(0, 4).map((c) => (
                <li
                  key={c.name}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="truncate font-medium text-ink">
                    {c.name}
                  </span>
                  <span className="shrink-0 text-ink-muted">
                    {c.members} builders
                  </span>
                </li>
              ))}
            </ul>
          )}
          {section.preview.kind === "list" && (
            <ul className="space-y-1.5 text-[12px] text-ink-soft">
              {section.preview.items.map((it) => (
                <li key={it} className="flex items-center gap-1.5">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-ink-muted" />
                  <span className="truncate">{it}</span>
                </li>
              ))}
            </ul>
          )}
          {section.preview.kind === "stat" && (
            <div>
              <div
                className="font-display text-2xl font-semibold tracking-tight text-ink"
                style={{ letterSpacing: "-0.02em" }}
              >
                {section.preview.stat}
              </div>
              <div className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                {section.preview.sub}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
