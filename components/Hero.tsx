import { ArrowRight, Sparkles, UserPlus } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-paper-deep">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-grid-faint [background-size:32px_32px] opacity-30 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-paper-line" />

      <div className="container-prose pt-28 pb-28 sm:pt-36 md:pt-40">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            High-trust builder ecosystem · invite-earned
          </span>

          <h1
            className="mt-8 font-display font-semibold text-5xl text-ink sm:text-7xl md:text-[96px] md:leading-[0.98]"
            style={{ letterSpacing: "-0.045em" }}
          >
            Find people to build{" "}
            <em className="italic font-medium text-ink">meaningful</em>{" "}
            things with.
          </h1>

          <p className="mt-8 max-w-2xl text-lg text-ink-muted sm:text-xl">
            A high-trust ecosystem for ambitious builders to collaborate on
            projects, join build sprints, and unlock deeper community access
            through real participation.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <a href="/login" className="btn-primary">
              Join the Community
              <ArrowRight className="h-4 w-4" />
            </a>
            <a href="/sprints" className="btn-secondary">
              <Sparkles className="h-4 w-4" />
              Join a Sprint
            </a>
            <a
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted underline underline-offset-4 decoration-paper-line transition-colors hover:text-ink hover:decoration-ink/40"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Create builder profile
            </a>
          </div>

          <p className="mt-8 text-[11px] uppercase tracking-[0.18em] text-ink-muted">
            Not a chatroom. A structured layer for builders who actually ship.
          </p>
        </div>

        <SocialProof />
      </div>
    </section>
  );
}

function SocialProof() {
  const stats = [
    { value: "1,400+", label: "Verified builders" },
    { value: "86", label: "Active sprints" },
    { value: "212", label: "Builder connections" },
    { value: "39", label: "Verified circles" },
  ];
  return (
    <div className="mx-auto mt-28 max-w-4xl">
      <div className="grid grid-cols-2 divide-x divide-paper-line border-y border-paper-line sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-transparent px-5 py-8 text-center">
            <div
              className="font-display font-semibold text-4xl text-ink"
              style={{ letterSpacing: "-0.03em" }}
            >
              {s.value}
            </div>
            <div className="mt-2 text-[11px] uppercase tracking-[0.18em] text-ink-muted">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
