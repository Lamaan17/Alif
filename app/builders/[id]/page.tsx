import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Briefcase,
  BadgeCheck,
  PackageCheck,
  Globe2,
  Users,
  ExternalLink,
  Sparkles,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import {
  getBuilder,
  getMyInterestsSet,
  getMyMatchesSet,
} from "@/lib/data/builders";
import { getBadgesForProfile } from "@/lib/data/badges";
import {
  ROLE_TYPES,
  STARTUP_STAGES,
  LOOKING_FOR,
  COMMITMENT_LEVELS,
  WORKING_STYLES,
  labelFor,
} from "@/lib/profile-options";
import { ProfileActions } from "@/components/builders/ProfileActions";
import { LevelPill } from "@/components/badges/LevelPill";
import { BadgeRow } from "@/components/badges/BadgeChip";

export default async function PublicBuilderPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // If they navigate to their own id, send them to dashboard instead.
  if (user.id === params.id) redirect("/dashboard");

  const builder = await getBuilder(params.id);
  if (!builder) notFound();

  const [interestsSet, matchesSet, badges] = await Promise.all([
    getMyInterestsSet(user.id),
    getMyMatchesSet(user.id),
    getBadgesForProfile(builder.id),
  ]);
  const isInterested = interestsSet.has(builder.id);
  const isMatched = matchesSet.has(builder.id);

  const avatarUrl = builder.avatar_url
    ? supabase.storage.from("avatars").getPublicUrl(builder.avatar_url).data
        .publicUrl
    : null;

  return (
    <main className="min-h-screen bg-paper-warm/40">
      <AppHeader email={user.email} />

      <div className="container-prose py-10">
        <Link
          href="/builders"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to builders
        </Link>

        {isMatched && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-moss-100 bg-moss-50 px-3.5 py-1.5 text-xs font-medium text-moss-700">
            <Sparkles className="h-3.5 w-3.5" />
            You&rsquo;re a mutual match
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Header / identity */}
          <section className="rounded-xl2 border border-paper-line bg-paper p-6 shadow-card lg:col-span-2">
            <div className="flex items-start gap-5">
              <Avatar src={avatarUrl} name={builder.full_name} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-2xl tracking-tight text-ink">
                    {builder.full_name}
                  </h1>
                  {builder.verified && (
                    <BadgeCheck className="h-4 w-4 text-moss-600" />
                  )}
                  <LevelPill level={builder.level} size="md" />
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
                  {builder.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {builder.location}
                    </span>
                  )}
                  {builder.timezone && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {builder.timezone}
                    </span>
                  )}
                </div>
                {builder.bio && (
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                    {builder.bio}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <KeyBadge
                    icon={Briefcase}
                    label={labelFor(ROLE_TYPES, builder.role_type)}
                  />
                  <KeyBadge
                    label={labelFor(STARTUP_STAGES, builder.startup_stage)}
                  />
                  <KeyBadge
                    icon={Clock}
                    label={`${builder.weekly_hours ?? 0} hrs/wk`}
                  />
                  <KeyBadge
                    label={labelFor(
                      COMMITMENT_LEVELS,
                      builder.commitment_level,
                    )}
                  />
                  <KeyBadge
                    label={labelFor(WORKING_STYLES, builder.working_style)}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Actions + preferences */}
          <aside className="space-y-5">
            <div className="rounded-xl2 border border-paper-line bg-paper p-5 shadow-card">
              <div className="text-sm font-medium text-ink">Connect</div>
              <p className="mt-1 text-[12px] text-ink-muted">
                Express interest. If they say the same about you, you&rsquo;ll
                both see a match.
              </p>
              <div className="mt-4">
                <ProfileActions
                  toUserId={builder.id}
                  toName={builder.full_name}
                  isInterested={isInterested}
                  isMatched={isMatched}
                />
              </div>
            </div>

            <div className="rounded-xl2 border border-paper-line bg-paper p-5 shadow-card">
              <div className="text-sm font-medium text-ink">Looking for</div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {builder.looking_for.length ? (
                  builder.looking_for.map((v) => (
                    <span key={v} className="badge">
                      <Users className="h-3 w-3 text-moss-600" />
                      {labelFor(LOOKING_FOR, v)}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-ink-muted">—</span>
                )}
              </div>

              <div className="mt-5 space-y-2 text-sm">
                <PrefRow
                  icon={Globe2}
                  label="Remote collaboration"
                  on={builder.open_to_remote}
                />
                <PrefRow
                  icon={Users}
                  label="In-person ALIF events"
                  on={builder.open_to_in_person}
                />
              </div>
            </div>

            <div className="rounded-xl2 border border-paper-line bg-paper p-5 shadow-card">
              <div className="text-sm font-medium text-ink">Trust signals</div>
              <div className="mt-3">
                <BadgeRow
                  kinds={badges}
                  verified={builder.verified}
                  hasShippedProject={builder.past_projects.length > 0}
                  size="sm"
                />
                {!builder.verified &&
                  badges.length === 0 &&
                  builder.past_projects.length === 0 && (
                    <span className="text-xs text-ink-muted">
                      No badges yet
                    </span>
                  )}
              </div>
            </div>
          </aside>

          {/* Skills + industries */}
          <section className="rounded-xl2 border border-paper-line bg-paper p-6 shadow-card lg:col-span-2">
            <SectionTitle>Skills</SectionTitle>
            {builder.skills.length ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {builder.skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex rounded-full border border-moss-100 bg-moss-50 px-2.5 py-1 text-xs font-medium text-moss-700"
                  >
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <Empty>No skills listed.</Empty>
            )}

            <SectionTitle className="mt-7">Industries</SectionTitle>
            {builder.industries.length ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {builder.industries.map((s) => (
                  <span
                    key={s}
                    className="inline-flex rounded-full border border-paper-line bg-paper-warm px-2.5 py-1 text-xs font-medium text-ink-soft"
                  >
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <Empty>No industries listed.</Empty>
            )}
          </section>

          {/* Proof of work */}
          <section className="rounded-xl2 border border-paper-line bg-paper p-6 shadow-card">
            <SectionTitle>Proof of work</SectionTitle>
            <ul className="mt-3 space-y-2">
              {builder.proof_of_work.length === 0 && <Empty>No links.</Empty>}
              {builder.proof_of_work.map((p, i) => (
                <li key={i}>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group flex items-center justify-between gap-3 rounded-lg border border-paper-line bg-paper-warm/50 px-3 py-2 text-sm transition-colors hover:border-moss-500/40 hover:bg-moss-50"
                  >
                    <span className="truncate">
                      <span className="font-medium text-ink">
                        {p.label || hostname(p.url)}
                      </span>
                      <span className="ml-2 text-xs text-ink-muted">
                        {hostname(p.url)}
                      </span>
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-ink-muted group-hover:text-moss-700" />
                  </a>
                </li>
              ))}
            </ul>
          </section>

          {/* Past projects */}
          <section className="rounded-xl2 border border-paper-line bg-paper p-6 shadow-card lg:col-span-3">
            <SectionTitle>Past projects</SectionTitle>
            {builder.past_projects.length === 0 ? (
              <Empty>No projects added.</Empty>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {builder.past_projects.map((p, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-paper-line bg-paper-warm/40 p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium tracking-tight text-ink">
                        {p.name}
                      </div>
                      {p.link && (
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-ink-muted hover:text-moss-700"
                          aria-label="Open project"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                    {p.description && (
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                        {p.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}) {
  const builder = await getBuilder(params.id);
  return {
    title: builder
      ? `${builder.full_name} — Build Together`
      : "Builder — Build Together",
  };
}

/* ---------- helpers ---------- */

function SectionTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={
        "text-[11px] font-medium uppercase tracking-wider text-ink-muted " +
        (className ?? "")
      }
    >
      {children}
    </h3>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-sm text-ink-muted">{children}</p>;
}

function PrefRow({
  icon: Icon,
  label,
  on,
}: {
  icon: typeof Globe2;
  label: string;
  on: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-paper-warm/50 px-3 py-2">
      <span className="inline-flex items-center gap-2 text-ink-soft">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <span
        className={
          "text-xs font-medium " + (on ? "text-moss-700" : "text-ink-muted")
        }
      >
        {on ? "Yes" : "No"}
      </span>
    </div>
  );
}

function KeyBadge({
  icon: Icon,
  label,
}: {
  icon?: typeof Briefcase;
  label: string;
}) {
  if (label === "—") return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-paper-line bg-paper-warm px-2.5 py-1 text-xs font-medium text-ink-soft">
      {Icon && <Icon className="h-3 w-3 text-moss-600" />}
      {label}
    </span>
  );
}

function Avatar({ src, name }: { src: string | null; name: string }) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-ink text-paper ring-1 ring-paper-line">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-display text-lg">
          {initials || "•"}
        </div>
      )}
    </div>
  );
}

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
