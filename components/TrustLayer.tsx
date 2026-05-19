import {
  BadgeCheck,
  Flag,
  CalendarHeart,
  HandHeart,
  PackageCheck,
  type LucideIcon,
} from "lucide-react";

type Badge = {
  icon: LucideIcon;
  label: string;
  body: string;
  tone: "moss" | "gold" | "ink";
};

const badges: Badge[] = [
  {
    icon: BadgeCheck,
    label: "ALIF Verified",
    body: "Identity confirmed and member in good standing.",
    tone: "moss",
  },
  {
    icon: Flag,
    label: "Sprint Finisher",
    body: "Completed a 7-day build sprint end-to-end.",
    tone: "moss",
  },
  {
    icon: CalendarHeart,
    label: "Event Attendee",
    body: "Showed up in person at ALIF events and gatherings.",
    tone: "ink",
  },
  {
    icon: HandHeart,
    label: "Mentor Endorsed",
    body: "Vouched for by an ALIF mentor based on real work.",
    tone: "gold",
  },
  {
    icon: PackageCheck,
    label: "Shipped Project",
    body: "Has a public, working project visible from the profile.",
    tone: "moss",
  },
];

const toneClasses: Record<Badge["tone"], string> = {
  moss: "bg-moss-50 text-moss-700 ring-moss-100",
  gold: "bg-gold-50 text-gold-600 ring-gold-100",
  ink: "bg-paper-warm text-ink ring-paper-line",
};

export default function TrustLayer() {
  return (
    <section
      id="trust"
      className="relative border-y border-paper-line bg-paper-warm"
    >
      <div className="container-prose py-20 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            Trust layer
          </span>
          <h2 className="mt-5 h-section">
            Reputation you can&rsquo;t fake — earned in public, by shipping.
          </h2>
          <p className="lead mt-4">
            Trust signals replace cold credentials. Every badge points to a
            real action someone took, not a claim they made.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {badges.map(({ icon: Icon, label, body, tone }) => (
            <div
              key={label}
              className="group rounded-xl2 border border-paper-line bg-paper p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cardHover"
            >
              <div
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-inset ${toneClasses[tone]}`}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div className="mt-4 text-[14px] font-semibold tracking-tight text-ink">
                {label}
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
                {body}
              </p>
            </div>
          ))}
        </div>

        <ProfilePreview />
      </div>
    </section>
  );
}

function ProfilePreview() {
  return (
    <div className="mx-auto mt-14 max-w-3xl rounded-xl2 border border-paper-line bg-paper p-6 shadow-card sm:p-7">
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-paper">
            <span className="font-display text-lg">YA</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="font-semibold tracking-tight text-ink">
                Yusra A.
              </div>
              <BadgeCheck className="h-4 w-4 text-moss-600" />
            </div>
            <div className="text-sm text-ink-muted">
              Full-stack · Toronto · open to cofounding
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:ml-auto">
          <span className="badge">
            <BadgeCheck className="h-3 w-3 text-moss-600" /> ALIF Verified
          </span>
          <span className="badge">
            <Flag className="h-3 w-3 text-moss-600" /> 3× Sprint Finisher
          </span>
          <span className="badge">
            <HandHeart className="h-3 w-3 text-gold-600" /> Mentor Endorsed
          </span>
          <span className="badge">
            <PackageCheck className="h-3 w-3 text-moss-600" /> Shipped Project
          </span>
        </div>
      </div>
    </div>
  );
}
