type Step = {
  n: string;
  title: string;
  body: string;
};

const steps: Step[] = [
  {
    n: "01",
    title: "Show up",
    body:
      "Join Sessions, Network, HQ, Summit, Tournament, Jumuah, or a sprint. Be in the room.",
  },
  {
    n: "02",
    title: "Build",
    body:
      "Contribute to projects, sprints, and community work. Do the thing that's hard.",
  },
  {
    n: "03",
    title: "Be seen",
    body:
      "Earn trust through participation and proof of work. Get noticed by the people who matter.",
  },
  {
    n: "04",
    title: "Enter the room",
    body:
      "Unlock deeper community, intros, and opportunities that come from doing the work.",
  },
  {
    n: "05",
    title: "Build bigger things",
    body:
      "Form teams, join companies, start projects. Keep going past the first spark.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how"
      className="relative border-y border-paper-line bg-paper-warm"
    >
      <div className="container-prose py-20 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            The path
          </span>
          <h2 className="mt-5 h-section">
            From showing up to being trusted.
          </h2>
        </div>

        <ol className="relative mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-5">
          <div
            aria-hidden
            className="pointer-events-none absolute left-6 right-6 top-[2.25rem] hidden h-px bg-gradient-to-r from-transparent via-paper-line to-transparent lg:block"
          />
          {steps.map((s, i) => (
            <li
              key={s.n}
              className="relative rounded-xl2 border border-paper-line bg-paper p-6 shadow-card"
            >
              <div className="flex items-center gap-3">
                <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-paper-line bg-paper-warm font-display text-sm font-semibold text-ink">
                  {s.n}
                  {i < steps.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute left-full top-1/2 hidden h-px w-3 -translate-y-1/2 bg-paper-line lg:block"
                    />
                  )}
                </span>
                <h3 className="text-[15px] font-semibold tracking-tight text-ink">
                  {s.title}
                </h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
