import {
  UserRoundCog,
  Handshake,
  Rocket,
  ShieldCheck,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

type Feature = {
  icon: LucideIcon;
  title: string;
  body: string;
  tag: string;
};

const features: Feature[] = [
  {
    icon: UserRoundCog,
    title: "Create builder profile",
    body:
      "A signal-rich profile: what you've shipped, what you're great at, the kind of team you want to build, and the problem you can't stop thinking about.",
    tag: "Identity",
  },
  {
    icon: Handshake,
    title: "Connect with builders",
    body:
      "Discovery tuned for collaboration fit, not keywords. Filter by skill, stage, conviction, and time available — then introduce yourself with a clear ask.",
    tag: "Discovery",
  },
  {
    icon: Rocket,
    title: "Join build sprints",
    body:
      "7-day mini projects with light structure and a real deliverable. The fastest way to feel what working with someone is actually like.",
    tag: "Sprints",
  },
  {
    icon: ShieldCheck,
    title: "Enter verified circles",
    body:
      "Earn trust signals through real work and unlock private builder circles — for deal flow, intros, and partners who already know how you ship.",
    tag: "Circles",
  },
];

export default function Features() {
  return (
    <section className="container-prose py-20 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="eyebrow">
          <span className="eyebrow-dot" />
          What lives here
        </span>
        <h2 className="mt-5 h-section">
          The missing layer after the first spark.
        </h2>
        <p className="lead mt-4">
          Momentum needs somewhere to go. Build Together is where ALIF builders
          keep finding people, projects, and proof of work — after the room
          ends.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, body, tag }) => (
          <article key={title} className="card group flex flex-col">
            <div className="flex items-start justify-between">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-moss-50 text-moss-600 ring-1 ring-inset ring-moss-100 transition-colors group-hover:bg-moss-100">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">
                {tag}
              </span>
            </div>
            <h3 className="mt-5 text-base font-semibold tracking-tight text-ink">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {body}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a href="/login" className="btn-primary">
          Join the Community
          <ArrowRight className="h-4 w-4" />
        </a>
        <a href="/builders" className="btn-secondary">
          Explore Builders
        </a>
      </div>
    </section>
  );
}
