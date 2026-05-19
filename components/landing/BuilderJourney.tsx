import { Compass, Hammer, Flag, ShieldCheck, Rocket } from "lucide-react";

const STEPS = [
  {
    n: "01",
    icon: Compass,
    title: "Explore",
    body: "Discover ambitious builders and the projects they're shipping.",
  },
  {
    n: "02",
    icon: Hammer,
    title: "Build",
    body: "Join sprints and collaborate on real work — not coffee chats.",
  },
  {
    n: "03",
    icon: Flag,
    title: "Contribute",
    body: "Attend ALIF events, ship projects, and show up consistently.",
  },
  {
    n: "04",
    icon: ShieldCheck,
    title: "Verify",
    body: "Unlock trusted builder circles and deeper access through real participation.",
  },
  {
    n: "05",
    icon: Rocket,
    title: "Build bigger things",
    body: "Start companies, ship long-term collaborations, and find the people you take with you.",
  },
];

export default function BuilderJourney() {
  return (
    <section
      id="journey"
      className="relative isolate overflow-hidden border-b border-paper-line bg-paper-deep"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-grid-faint [background-size:32px_32px] opacity-20 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
      />

      <div className="container-prose py-24 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            The Builder Journey
          </span>
          <h2 className="mt-5 h-section">
            Five stages.{" "}
            <em className="italic font-medium text-ink">
              One trajectory.
            </em>
          </h2>
          <p className="lead mt-4">
            A clear path from showing up to shipping companies — earned in
            public, step by step.
          </p>
        </div>

        <ol className="relative mt-16 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-5">
          {/* connecting line on desktop */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-6 right-6 top-[2.75rem] hidden h-px bg-gradient-to-r from-transparent via-paper-line to-transparent lg:block"
          />

          {STEPS.map(({ n, icon: Icon, title, body }, i) => (
            <li
              key={n}
              className="relative rounded-xl2 border border-paper-line bg-paper p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cardHover"
            >
              <div className="flex items-start justify-between">
                <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-paper-line bg-paper-warm font-display text-sm font-semibold text-ink">
                  {n}
                </span>
                <Icon
                  className="h-4 w-4 text-ink-muted"
                  strokeWidth={1.75}
                />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold tracking-tight text-ink">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {body}
              </p>

              {i === STEPS.length - 1 && (
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-moss-50 px-2 py-0.5 text-[10px] font-medium text-moss-700 ring-1 ring-inset ring-moss-100">
                  The whole point
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
