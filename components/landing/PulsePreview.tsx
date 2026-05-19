import Link from "next/link";
import {
  ArrowRight,
  Users,
  Lightbulb,
  Flag,
  BadgeCheck,
  CalendarHeart,
  HeartHandshake,
  MapPin,
} from "lucide-react";

import { getPulseSnapshot } from "@/lib/data/pulse";
import { Sparkline } from "@/components/charts/Sparkline";

export default async function PulsePreview() {
  const s = await getPulseSnapshot();

  const cards = [
    {
      icon: Users,
      label: "Active builders",
      value: s.activeBuilders,
      trend: s.builderGrowth,
    },
    {
      icon: Lightbulb,
      label: "Active projects",
      value: s.activeProjects,
    },
    {
      icon: Flag,
      label: "Sprint completions",
      value: s.sprintCompletions,
      trend: s.sprintGrowth,
    },
    {
      icon: MapPin,
      label: "Most active city",
      value: s.mostActiveCity,
      isText: true,
    },
    {
      icon: BadgeCheck,
      label: "Verified builders",
      value: s.verifiedBuilders,
    },
    {
      icon: CalendarHeart,
      label: "IRL events this month",
      value: s.irlEventsThisMonth,
    },
    {
      icon: HeartHandshake,
      label: "New collaborations",
      value: s.newCollaborations,
    },
  ];

  return (
    <section className="container-prose py-20 sm:py-24">
      <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-[1fr_auto]">
        <div className="max-w-2xl">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            The Ecosystem Pulse
          </span>
          <h2 className="mt-5 h-section">
            Tracking the momentum of{" "}
            <em className="italic font-medium text-ink">builders, projects,</em>{" "}
            and collaboration.
          </h2>
          <p className="lead mt-4">
            Not analytics — community intelligence. The shape of the ALIF
            network in motion.
          </p>
        </div>
        <Link href="/pulse" className="btn-secondary self-start lg:self-end">
          Open ALIF Pulse
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="relative overflow-hidden rounded-xl border border-paper-line bg-paper p-5 transition-colors hover:border-ink/15"
            >
              <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-ink-muted">
                <Icon className="h-3 w-3" />
                {c.label}
              </div>
              <div className="mt-3 flex items-end justify-between gap-2">
                <div
                  className={
                    c.isText
                      ? "font-display text-xl font-semibold tracking-tight text-ink"
                      : "font-display text-3xl font-semibold tracking-tight text-ink"
                  }
                  style={{ letterSpacing: "-0.03em" }}
                >
                  {c.value}
                </div>
                {c.trend && (
                  <div className="text-ink-soft">
                    <Sparkline
                      values={c.trend}
                      width={70}
                      height={28}
                      stroke="currentColor"
                      fill="currentColor"
                      fillOpacity={0.12}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
