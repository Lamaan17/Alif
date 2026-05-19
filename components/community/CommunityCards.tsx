import {
  Users,
  Sparkles,
  Lightbulb,
  HandHeart,
  MapPin,
  CalendarHeart,
  Coffee,
  Mountain,
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
    key: "circles",
    icon: Users,
    title: "Builder Circles",
    body: "Themed circles of high-signal builders pairing on specific verticals.",
    preview: {
      kind: "circles",
      circles: [
        { name: "AI Builders Circle", members: 42, focus: "LLM tools & inference" },
        { name: "Halal Capital Circle", members: 24, focus: "Islamic-finance native products" },
        { name: "Healthtech Circle", members: 31, focus: "Clinical workflows + AI" },
        { name: "Faith-Tech Circle", members: 37, focus: "Tools for Muslim communities" },
        { name: "Climate Circle", members: 19, focus: "Energy + climate adaptation" },
        { name: "Operators Circle", members: 28, focus: "Ex-founders, COOs, GMs" },
      ],
    },
  },
  {
    key: "sprint_rooms",
    icon: Sparkles,
    title: "Private Sprint Rooms",
    body: "Async workspaces for active sprint teams — daily logs, retro threads, peer review.",
    preview: { kind: "stat", stat: "4 active", sub: "sprint rooms running right now" },
  },
  {
    key: "projects",
    icon: Lightbulb,
    title: "Project Collaborations",
    body: "Verified-only project board with deeper, higher-trust collaborations.",
    preview: {
      kind: "list",
      items: [
        "Mosque-management platform · 2 spots",
        "AI legal-research tool · 1 spot",
        "Community lending fund · 3 spots",
      ],
    },
  },
  {
    key: "mentor_intros",
    icon: HandHeart,
    title: "Mentor Intros",
    body: "Warm intros to ALIF mentors — facilitated by the platform, never spam.",
    preview: { kind: "stat", stat: "120+", sub: "mentors open to intros this quarter" },
  },
  {
    key: "builders_near_you",
    icon: MapPin,
    title: "Builders Near You",
    body: "Discover verified builders in your city for in-person collaboration.",
    preview: {
      kind: "list",
      items: ["Toronto · 18 builders", "NYC · 24 builders", "London · 31 builders", "Karachi · 12 builders"],
    },
  },
  {
    key: "event_participants",
    icon: CalendarHeart,
    title: "ALIF Event Participants",
    body: "Who attended which events, what they worked on, and what's next.",
    preview: { kind: "stat", stat: "9 events", sub: "scheduled in the next 90 days" },
  },
  {
    key: "cowork",
    icon: Coffee,
    title: "Cowork Sessions",
    body: "Pop-up coworking days with ALIF builders in major cities.",
    preview: {
      kind: "list",
      items: ["Toronto · weekly Thursdays", "NYC · 2nd Saturday", "London · monthly Fridays"],
    },
  },
  {
    key: "summit",
    icon: Mountain,
    title: "Summit Builders",
    body: "Alumni network of every ALIF Summit cohort. Where the long-term partnerships start.",
    preview: { kind: "stat", stat: "2024 + 2025", sub: "summit cohorts active in the network" },
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
