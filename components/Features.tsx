import {
  UserRoundCog,
  Handshake,
  Rocket,
  ShieldCheck,
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
    title: "Create founder profile",
    body:
      "A signal-rich profile: what you've shipped, what you're great at, the kind of team you want to build, and the problem you can't stop thinking about.",
    tag: "Identity",
  },
  {
    icon: Handshake,
    title: "Match with builders",
    body:
      "Discovery tuned for chemistry, not keywords. Filter by skill, stage, conviction, and time available — then introduce yourself with a clear ask.",
    tag: "Discovery",
  },
  {
    icon: Rocket,
    title: "Join build sprints",
    body:
      "7-day mini projects with light structure and a real deliverable. The fastest way to see if you actually want to start a company with someone.",
    tag: "Sprints",
  },
  {
    icon: ShieldCheck,
    title: "Enter verified circles",
    body:
      "Earn trust signals through real work and unlock private founder circles — for deal flow, intros, and partners who already know how you ship.",
    tag: "Circles",
  },
];

export default function Features() {
  return (
    <section className="container-prose py-20 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="eyebrow">
          <span className="eyebrow-dot" />
          What you get
        </span>
        <h2 className="mt-5 h-section">
          Everything you need before the company exists.
        </h2>
        <p className="lead mt-4">
          Cofounder formation is a process, not a coffee chat. Build Together
          gives that process structure.
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
    </section>
  );
}
