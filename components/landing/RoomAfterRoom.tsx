import {
  MessageCircle,
  Network,
  Building2,
  Mountain,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

type Card = {
  icon: LucideIcon;
  after: string;
  body: string;
};

const CARDS: Card[] = [
  {
    icon: MessageCircle,
    after: "After Sessions",
    body: "Keep building with the people you met in the room.",
  },
  {
    icon: Network,
    after: "After Network",
    body: "Prove yourself through real work — not resumes, not bios.",
  },
  {
    icon: Building2,
    after: "After HQ",
    body: "Turn coworking energy into projects that ship.",
  },
  {
    icon: Mountain,
    after: "After Summit & Tournament",
    body: "Keep the spark alive past the closing keynote.",
  },
  {
    icon: Briefcase,
    after: "After Fund",
    body: "Connect portfolio companies with builders who can help.",
  },
];

export default function RoomAfterRoom() {
  return (
    <section className="relative isolate overflow-hidden border-b border-paper-line bg-paper-deep">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-grid-faint [background-size:32px_32px] opacity-20 [mask-image:radial-gradient(ellipse_at_top,black_25%,transparent_70%)]"
      />

      <div className="container-prose py-24 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            The room after the room
          </span>
          <h2
            className="mt-6 font-display font-semibold text-4xl leading-[1.04] sm:text-5xl md:text-[64px]"
            style={{ letterSpacing: "-0.04em" }}
          >
            The room{" "}
            <em className="italic font-medium text-ink">after</em>{" "}
            the room.
          </h2>
          <p className="lead mt-5 max-w-2xl mx-auto">
            Sessions end. Events end. Intros go quiet. But the best communities
            create momentum that keeps going. Build Together gives ALIF
            builders a place to keep finding people, projects, feedback, and
            first believers after the first spark.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {CARDS.map(({ icon: Icon, after, body }, i) => (
            <article
              key={after}
              className="group flex h-full flex-col rounded-xl2 border border-paper-line bg-paper p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-cardHover"
            >
              <div className="flex items-start justify-between">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-paper-warm text-ink-soft ring-1 ring-inset ring-paper-line">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink-muted">
                  0{i + 1}
                </span>
              </div>
              <div className="mt-5 font-display text-base font-semibold tracking-tight text-ink">
                {after}
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
                {body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
