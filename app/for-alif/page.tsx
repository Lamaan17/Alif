import Link from "next/link";
import {
  ArrowRight,
  Network,
  Users,
  Target,
  TrendingUp,
  ShieldCheck,
  Briefcase,
  LineChart,
  Sparkles,
} from "lucide-react";

import { ASPIRATIONAL_METRICS } from "@/lib/data/metrics";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "For ALIF — Build Together",
  description:
    "How Build Together turns ALIF's community into a sustained engine for startup formation, talent pipelines, and ecosystem capital.",
};

export default function ForALIFPage() {
  return (
    <main className="min-h-screen bg-paper">
      <Nav />
      <Hero />
      <MetricsStrip />
      <Pillars />
      <SponsoredCallout />
      <ClosingCTA />
      <Footer />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-paper-line bg-paper-deep">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-grid-faint [background-size:28px_28px] opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
      />
      <div className="container-prose py-24 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            For ALIF leadership
          </span>
          <h1
            className="mt-8 font-display font-semibold text-5xl leading-[1.0] sm:text-6xl md:text-[88px]"
            style={{ letterSpacing: "-0.045em" }}
          >
            The continuity layer{" "}
            <em className="italic font-medium text-ink">for ALIF</em>.
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-ink-muted">
            ALIF already creates powerful moments: Sessions, Network, HQ,
            Summit, Tournament, Jumuah, Fund, and portfolio support. Build
            Together turns those moments into an always-on ecosystem where
            builders keep finding each other, shipping together, and becoming
            visible through real participation.
          </p>
        </div>
      </div>
    </section>
  );
}

function MetricsStrip() {
  const m = ASPIRATIONAL_METRICS;
  const items = [
    { label: "Startups formed", value: m.startups_formed },
    { label: "Projects launched", value: m.projects_launched },
    { label: "Sprint completions", value: m.sprint_completions },
    { label: "Verified builders", value: m.verified_builders },
    { label: "Successful matches", value: m.successful_matches },
    { label: "Active collaborators", value: m.active_collaborators },
  ];
  return (
    <section className="container-prose py-12 sm:py-16">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl2 border border-paper-line bg-paper-line sm:grid-cols-3 lg:grid-cols-6">
        {items.map((it) => (
          <div
            key={it.label}
            className="bg-paper px-5 py-6 text-center"
          >
            <div className="font-display text-3xl tracking-tight text-ink">
              {it.value}
            </div>
            <div className="mt-1 text-[11px] uppercase tracking-wider text-ink-muted">
              {it.label}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] text-ink-muted">
        Illustrative targets for an ALIF deployment at scale. Live numbers
        appear in the admin dashboard once activity begins.
      </p>
    </section>
  );
}

const PILLARS = [
  {
    icon: Network,
    title: "The gap",
    body:
      "After the event, cohort, intro, or application, momentum needs somewhere to go. Today it goes nowhere — DMs go quiet, alumni groups drift, intros expire. Build Together is the place that catches the spark.",
  },
  {
    icon: ShieldCheck,
    title: "The answer",
    body:
      "A community layer that connects people, projects, sprints, rooms, and proof of work — so the moments ALIF already creates compound instead of evaporate.",
  },
  {
    icon: Users,
    title: "Why it matters",
    body:
      "Higher community retention. Stronger Network talent signal. More value for Sessions alumni. More help for portfolio companies. More proof of who actually builds. More first believers for early founders. Stronger ALIF ecosystem gravity.",
  },
  {
    icon: Briefcase,
    title: "What this is not",
    body:
      "Not cofounder assignment. Not a job board. Not a Discord. Not social media. Build Together does not endorse, assign, or guarantee outcomes.",
  },
  {
    icon: Sparkles,
    title: "What this is",
    body:
      "A place to keep building. A proof-of-work layer. A trust graph. A bridge between ALIF products — Sessions, Network, HQ, Summit, Tournament, Jumuah, Fund. A way to make San Francisco energy continuous, everywhere.",
  },
  {
    icon: LineChart,
    title: "Measurable output",
    body:
      "Sprints completed. Projects shipped. Connections formed. Builders graduating into Verified. Every signal becomes data — defensible to boards, funders, and partners.",
  },
];

function Pillars() {
  return (
    <section className="border-t border-paper-line bg-paper-warm/40">
      <div className="container-prose py-20 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            The thesis
          </span>
          <h2 className="mt-5 h-section">
            Catch the spark. Make momentum continuous.
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
          {PILLARS.map(({ icon: Icon, title, body }, i) => (
            <article
              key={title}
              className="group relative rounded-xl2 border border-paper-line bg-paper p-7 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-cardHover"
            >
              <div className="flex items-start gap-4">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-moss-50 text-moss-700 ring-1 ring-inset ring-moss-100">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                    Pillar 0{i + 1}
                  </div>
                  <h3 className="mt-1 font-display text-xl tracking-tight">
                    {title}
                  </h3>
                </div>
              </div>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
                {body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SponsoredCallout() {
  return (
    <section className="container-prose py-16">
      <div className="rounded-xl2 border border-gold-100 bg-gold-50/40 p-8 sm:p-10">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-500 text-paper shadow-sm">
            <Target className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <div className="text-[11px] font-medium uppercase tracking-wider text-gold-600">
              Revenue pathway
            </div>
            <h3 className="mt-1 font-display text-2xl tracking-tight">
              Sponsored sprints, premium circles, and ecosystem reports — three
              recurring revenue lines, none of them ticketed events.
            </h3>
            <p className="mt-3 text-sm text-ink-soft">
              When the community produces measurable output, that output
              becomes the product. Sponsors fund themed sprints. Partners pay
              for verified talent access. Foundations underwrite cohorts. The
              platform is the receipt.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ClosingCTA() {
  return (
    <section className="container-prose pb-24 pt-4">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-paper-line bg-paper-warm px-6 py-14 text-center sm:px-10 sm:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(122,181,143,0.20), transparent 50%), radial-gradient(circle at 80% 70%, rgba(217,185,125,0.15), transparent 50%)",
          }}
        />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="font-display font-semibold text-3xl leading-[1.05] tracking-tight sm:text-4xl"
              style={{ letterSpacing: "-0.025em" }}>
            The community is already here. Give it a place to ship.
          </h2>
          <p className="mt-4 text-base text-ink-muted sm:text-lg">
            Build Together is ready to launch inside ALIF. Three founder cohorts
            in the first quarter, one sponsored sprint, one premium circle.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/login" className="btn-primary">
              Try the product
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/" className="btn-secondary">
              See the member view
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
