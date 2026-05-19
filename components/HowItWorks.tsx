type Step = {
  n: string;
  title: string;
  body: string;
};

const steps: Step[] = [
  {
    n: "01",
    title: "Create your builder profile",
    body:
      "Tell us what you've shipped, what you want to work on, and how much time you can give. Two minutes, no resume.",
  },
  {
    n: "02",
    title: "Connect or apply to collaborate",
    body:
      "Browse builders by craft and conviction. Send a clear ask, or apply to projects others have posted.",
  },
  {
    n: "03",
    title: "Build a mini project together",
    body:
      "Run a 7-day sprint with a real deliverable. See how someone thinks, decides, and ships before you commit.",
  },
  {
    n: "04",
    title: "Earn trust signals, unlock circles",
    body:
      "Finish sprints, get endorsed, and graduate into verified builder circles with private intros and deal flow.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="relative border-y border-paper-line bg-paper-warm">
      <div className="container-prose py-20 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            How it works
          </span>
          <h2 className="mt-5 h-section">
            From profile to verified builder — in four steps.
          </h2>
        </div>

        <ol className="relative mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {/* connecting line on desktop */}
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
                <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-paper-line bg-paper-warm font-display text-sm text-ink-soft">
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
