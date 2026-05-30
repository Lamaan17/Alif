import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Pencil,
  MapPin,
  Clock,
  Briefcase,
  Globe2,
  Users,
  Mail,
  ExternalLink,
  BadgeCheck,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { getBadgesForProfile } from "@/lib/data/badges";
import {
  ROLE_TYPES,
  STARTUP_STAGES,
  LOOKING_FOR,
  COMMITMENT_LEVELS,
  WORKING_STYLES,
  labelFor,
} from "@/lib/profile-options";
import { LevelPill } from "@/components/badges/LevelPill";
import { BadgeRow } from "@/components/badges/BadgeChip";
import { getActivityForProfile } from "@/lib/data/activity";
import { ActivityFeed } from "@/components/profile/ActivityFeed";
import { AlifersHandoff } from "@/components/AlifersHandoff";

export const metadata = { title: "Dashboard — alif·build" };

type ProofItem = { label?: string; url: string };
type ProjectItem = { name: string; link?: string; description?: string };

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/onboarding");

  const avatarPublic = profile.avatar_url
    ? supabase.storage.from("avatars").getPublicUrl(profile.avatar_url).data
        .publicUrl
    : null;

  const completion = computeCompletion(profile);
  const badges = await getBadgesForProfile(user.id);
  const activity = await getActivityForProfile(user.id, 8);

  return (
    <main className="min-h-screen bg-paper-warm/40">
      <AppHeader email={user.email} />

      <div className="container-prose py-10">
        {/* Top row */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              ALIF Passport
            </span>
            <h1 className="mt-3 font-display text-3xl tracking-tight">
              Your ALIF Passport
            </h1>
            <p className="lead mt-2 text-sm">
              {firstName(profile.full_name)}&rsquo;s proof of showing up, shipping,
              helping, and moving through the ALIF ecosystem.
            </p>
          </div>
          <Link href="/dashboard/edit" className="btn-primary">
            <Pencil className="h-4 w-4" />
            Edit profile
          </Link>
        </div>

        {/* Grid */}
        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Identity card */}
          <section className="rounded-xl2 border border-paper-line bg-paper p-6 shadow-card lg:col-span-2">
            <div className="flex items-start gap-5">
              <Avatar src={avatarPublic} name={profile.full_name} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-xl tracking-tight text-ink">
                    {profile.full_name}
                  </h2>
                  {profile.verified && (
                    <BadgeCheck className="h-4 w-4 text-moss-600" />
                  )}
                  <LevelPill level={profile.level} size="md" />
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
                  {profile.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {profile.location}
                    </span>
                  )}
                  {profile.timezone && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {profile.timezone}
                    </span>
                  )}
                  {user.email && (
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      {user.email}
                    </span>
                  )}
                </div>
                {profile.bio && (
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                    {profile.bio}
                  </p>
                )}
                <div className="mt-4">
                  <BadgeRow
                    kinds={badges}
                    verified={profile.verified}
                    hasShippedProject={
                      (profile.past_projects as unknown[] | null)?.length
                        ? true
                        : false
                    }
                    size="sm"
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <KeyBadge
                    icon={Briefcase}
                    label={labelFor(ROLE_TYPES, profile.role_type)}
                  />
                  <KeyBadge
                    label={labelFor(STARTUP_STAGES, profile.startup_stage)}
                  />
                  <KeyBadge
                    icon={Clock}
                    label={`${profile.weekly_hours ?? 0} hrs/wk`}
                  />
                  <KeyBadge
                    label={labelFor(
                      COMMITMENT_LEVELS,
                      profile.commitment_level,
                    )}
                  />
                  <KeyBadge
                    label={labelFor(WORKING_STYLES, profile.working_style)}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Completion + preferences card */}
          <aside className="space-y-5">
            <div className="rounded-xl2 border border-paper-line bg-paper p-5 shadow-card">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-ink">
                  Profile completeness
                </div>
                <div className="font-display text-lg text-moss-700">
                  {completion}%
                </div>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-paper-warm">
                <div
                  className="h-full rounded-full bg-moss-500 transition-all"
                  style={{ width: `${completion}%` }}
                />
              </div>
              {completion < 100 && (
                <p className="mt-3 text-xs text-ink-muted">
                  Fill in remaining sections to improve matches.
                </p>
              )}
            </div>

            <div className="rounded-xl2 border border-paper-line bg-paper p-5 shadow-card">
              <div className="text-sm font-medium text-ink">Looking for</div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(profile.looking_for as string[] | null)?.length ? (
                  (profile.looking_for as string[]).map((v) => (
                    <span key={v} className="badge">
                      <Users className="h-3 w-3 text-moss-600" />
                      {labelFor(LOOKING_FOR, v)}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-ink-muted">—</span>
                )}
              </div>

              <div className="mt-5 grid grid-cols-1 gap-2 text-sm">
                <PrefRow
                  icon={Globe2}
                  label="Remote collaboration"
                  on={profile.open_to_remote}
                />
                <PrefRow
                  icon={Users}
                  label="In-person ALIF events"
                  on={profile.open_to_in_person}
                />
              </div>
            </div>
          </aside>

          {/* Skills */}
          <section className="rounded-xl2 border border-paper-line bg-paper p-6 shadow-card lg:col-span-2">
            <SectionTitle>Skills</SectionTitle>
            {(profile.skills as string[])?.length ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(profile.skills as string[]).map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center rounded-full border border-moss-100 bg-moss-50 px-2.5 py-1 text-xs font-medium text-moss-700"
                  >
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <Empty>No skills added yet.</Empty>
            )}

            <SectionTitle className="mt-7">Industries</SectionTitle>
            {(profile.industries as string[])?.length ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(profile.industries as string[]).map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center rounded-full border border-paper-line bg-paper-warm px-2.5 py-1 text-xs font-medium text-ink-soft"
                  >
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <Empty>No industries selected.</Empty>
            )}
          </section>

          {/* Proof of work */}
          <section className="rounded-xl2 border border-paper-line bg-paper p-6 shadow-card">
            <SectionTitle>Proof of work</SectionTitle>
            <ul className="mt-3 space-y-2">
              {((profile.proof_of_work as ProofItem[]) ?? []).length === 0 && (
                <Empty>No links added.</Empty>
              )}
              {((profile.proof_of_work as ProofItem[]) ?? []).map((p, i) => (
                <li key={i}>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group flex items-center justify-between gap-3 rounded-lg border border-paper-line bg-paper-warm/50 px-3 py-2 text-sm transition-colors hover:border-moss-500/40 hover:bg-moss-50"
                  >
                    <span className="truncate">
                      <span className="font-medium text-ink">
                        {p.label || displayDomain(p.url)}
                      </span>
                      <span className="ml-2 text-xs text-ink-muted">
                        {displayDomain(p.url)}
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
            {((profile.past_projects as ProjectItem[]) ?? []).length === 0 ? (
              <Empty>No projects added yet.</Empty>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(profile.past_projects as ProjectItem[]).map((p, i) => (
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

          {/* Activity feed */}
          <section className="rounded-xl2 border border-paper-line bg-paper p-6 shadow-card lg:col-span-3">
            <SectionTitle>Activity</SectionTitle>
            <p className="mt-1 text-[12px] text-ink-muted">
              Sprints joined, projects shipped, badges earned, builders you&rsquo;ve connected with.
            </p>
            <div className="mt-4">
              <ActivityFeed items={activity} />
            </div>
          </section>

          {/* Alifers handoff */}
          <div className="lg:col-span-3">
            <AlifersHandoff />
          </div>
        </div>
      </div>
    </main>
  );
}

/* ---------- Helpers ---------- */

function firstName(full: string | null | undefined) {
  if (!full) return "builder";
  return full.split(/\s+/)[0];
}

function displayDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function computeCompletion(p: Record<string, unknown>): number {
  const fields = [
    !!p.full_name,
    !!p.avatar_url,
    !!p.location,
    !!p.timezone,
    !!p.bio,
    !!p.role_type,
    Array.isArray(p.skills) && (p.skills as unknown[]).length > 0,
    Array.isArray(p.industries) && (p.industries as unknown[]).length > 0,
    Array.isArray(p.proof_of_work) && (p.proof_of_work as unknown[]).length > 0,
    Array.isArray(p.past_projects) && (p.past_projects as unknown[]).length > 0,
    !!p.startup_stage,
    Array.isArray(p.looking_for) && (p.looking_for as unknown[]).length > 0,
    typeof p.weekly_hours === "number",
    !!p.working_style,
    !!p.commitment_level,
  ];
  const done = fields.filter(Boolean).length;
  return Math.round((done / fields.length) * 100);
}

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

function Avatar({
  src,
  name,
}: {
  src: string | null;
  name: string;
}) {
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
