import { CalendarClock, Users, Target, CheckCircle2 } from "lucide-react";

const days = [
  { day: "Mon", label: "Kickoff & scope" },
  { day: "Tue", label: "Research" },
  { day: "Wed", label: "Build v1" },
  { day: "Thu", label: "Internal demo" },
  { day: "Fri", label: "Iterate" },
  { day: "Sat", label: "Polish" },
  { day: "Sun", label: "Ship & retro" },
];

export default function Sprints() {
  return (
    <section id="sprints" className="container-prose py-20 sm:py-24">
      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            Build sprints
          </span>
          <h2 className="mt-5 h-section">
            A 7-day project. A real answer to <em className="italic font-medium text-ink">“should we start a company together?”</em>
          </h2>
          <p className="lead mt-5">
            Sprints are tiny, time-boxed builds with a clear deliverable. They&rsquo;re not
            hackathons and they&rsquo;re not interviews — they&rsquo;re the lightest possible
            way to feel what working with someone is actually like.
          </p>

          <ul className="mt-8 space-y-3 text-sm">
            {[
              {
                icon: CalendarClock,
                title: "7 days, ~10 hours",
                body:
                  "Designed for working builders. Enough time to ship, not enough to procrastinate.",
              },
              {
                icon: Users,
                title: "Teams of 2–3",
                body:
                  "Small enough that there's nowhere to hide. You'll see how someone handles tradeoffs.",
              },
              {
                icon: Target,
                title: "Real deliverable",
                body:
                  "A working prototype, a landing page with signups, or a user-tested concept doc.",
              },
              {
                icon: CheckCircle2,
                title: "Structured retro",
                body:
                  "Honest written feedback both ways. Goes into your trust profile if you opt in.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-3">
                <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-moss-50 text-moss-600 ring-1 ring-inset ring-moss-100">
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div>
                  <div className="font-medium text-ink">{title}</div>
                  <div className="text-ink-muted">{body}</div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex gap-3">
            <a href="/login" className="btn-accent">
              Join the next sprint
            </a>
            <a href="#how" className="btn-secondary">
              See past sprints
            </a>
          </div>
        </div>

        <div className="lg:col-span-7">
          <SprintCard />
        </div>
      </div>
    </section>
  );
}

function SprintCard() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-3 -z-10 rounded-[1.75rem] bg-gradient-to-br from-moss-100/40 via-transparent to-gold-100/30 blur-2xl opacity-60"
      />
      <div className="rounded-xl2 border border-paper-line bg-paper p-7 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="badge">
              <span className="h-1.5 w-1.5 rounded-full bg-moss-500" />
              Sprint #14
            </span>
            <span className="badge">Open to apply</span>
          </div>
          <span className="text-xs text-ink-muted">Starts Mon, May 26</span>
        </div>

        <h3 className="mt-5 font-display text-2xl tracking-tight text-ink">
          Tools for community organizers
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Build a working prototype that helps small communities run weekly
          programming with less friction. Ship a landing page with 10 real
          signups by Sunday.
        </p>

        <div className="mt-6 overflow-hidden rounded-xl border border-paper-line">
          <div className="grid grid-cols-7 divide-x divide-paper-line bg-paper-warm text-center text-[11px] font-medium text-ink-muted">
            {days.map((d) => (
              <div key={d.day} className="py-2">
                {d.day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 divide-x divide-paper-line">
            {days.map((d, i) => (
              <div
                key={d.day}
                className="px-2 py-4 text-center text-[11px] text-ink-soft"
              >
                <div
                  className={`mx-auto mb-2 h-1.5 w-1.5 rounded-full ${
                    i < 3
                      ? "bg-moss-500"
                      : i === 3
                      ? "bg-gold-500"
                      : "bg-paper-line"
                  }`}
                />
                {d.label}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-paper-line pt-5">
          <div className="flex -space-x-2">
            {["A", "M", "Y", "+"].map((n, i) => (
              <span
                key={i}
                className={`inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-paper text-[11px] font-medium ${
                  i === 3
                    ? "bg-paper-warm text-ink-muted"
                    : "bg-ink text-paper"
                }`}
              >
                {n}
              </span>
            ))}
          </div>
          <div className="text-xs text-ink-muted">
            <span className="font-medium text-ink">9 builders</span> applied ·
            2 spots left
          </div>
        </div>
      </div>
    </div>
  );
}
