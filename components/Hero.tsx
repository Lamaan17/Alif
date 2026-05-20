import { ArrowRight, Sparkles, Compass } from "lucide-react";

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
            The continuity layer for ALIF builders
          </span>

          <h1
            className="mt-8 font-display font-semibold text-5xl text-ink sm:text-7xl md:text-[112px] md:leading-[0.95]"
            style={{ letterSpacing: "-0.05em" }}
          >
            Keep building{" "}
            <em className="italic font-medium text-ink">after the room</em>.
          </h1>

          <p className="mt-8 max-w-2xl text-lg text-ink-muted sm:text-xl">
            A living community layer for people moving through ALIF — Sessions,
            Network, HQ, Summit, Tournament, portfolio companies, and the
            builders looking for their first believers.
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
              href="/pulse"
              className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted underline underline-offset-4 decoration-paper-line transition-colors hover:text-ink hover:decoration-ink/40"
            >
              <Compass className="h-3.5 w-3.5" />
              See what&rsquo;s happening
            </a>
          </div>

          <p className="mt-8 text-[11px] uppercase tracking-[0.18em] text-ink-muted">
            Not a chatroom. Not a job board. A place for momentum to continue.
          </p>
        </div>

        <SocialProof />
      </div>
    </section>
  );
}

function SocialProof() {
  const stats = [
    { value: "1,400+", label: "Builders moving" },
    { value: "86",     label: "Active sprints"   },
    { value: "212",    label: "Builder connections" },
    { value: "39",     label: "Rooms forming"    },
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
