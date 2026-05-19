import { ArrowRight, UserPlus } from "lucide-react";

export default function CTA() {
  return (
    <section id="cta" className="container-prose py-24 sm:py-28">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-paper-line bg-paper-warm px-6 py-20 text-center sm:px-10 sm:py-24">
        <div className="relative mx-auto max-w-3xl">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            Applications reviewed weekly
          </span>
          <h2
            className="mt-6 font-display font-semibold text-4xl leading-[1.02] sm:text-5xl md:text-[72px]"
            style={{ letterSpacing: "-0.04em" }}
          >
            Build with people who actually build.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-ink-muted sm:text-lg">
            A high-trust ecosystem of ambitious ALIF builders shipping in
            public. Earn your way in.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="/login" className="btn-primary">
              Join the Community
              <ArrowRight className="h-4 w-4" />
            </a>
            <a href="/login" className="btn-secondary">
              <UserPlus className="h-4 w-4" />
              Create Builder Profile
            </a>
          </div>

          <p className="mt-6 text-[11px] uppercase tracking-[0.16em] text-ink-muted">
            Free for verified ALIF members
          </p>
        </div>
      </div>
    </section>
  );
}
