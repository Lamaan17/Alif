import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Sparkles,
  Calendar,
  BadgeCheck,
  Users,
  Briefcase,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import {
  getProject,
  getApplicationsForProject,
  getMyApplicationsForProjects,
} from "@/lib/data/projects";
import {
  STARTUP_STAGES,
  ROLE_TYPES,
  COLLAB_MODES,
  labelFor,
} from "@/lib/profile-options";
import { LevelPill } from "@/components/badges/LevelPill";
import { ApplyButton } from "@/components/projects/ApplyButton";
import { ApplicationsList } from "@/components/projects/ApplicationsList";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}) {
  const p = await getProject(params.id);
  return { title: p ? `${p.title} — Build Together` : "Project — Build Together" };
}

export default async function ProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const project = await getProject(params.id);
  if (!project) notFound();

  const isOwner = project.owner_id === user.id;
  const [applications, myApps] = await Promise.all([
    isOwner
      ? getApplicationsForProject(project.id)
      : Promise.resolve([]),
    isOwner
      ? Promise.resolve(new Map())
      : getMyApplicationsForProjects(user.id),
  ]);
  const myStatus = myApps.get(project.id);

  const owner = project.owner;
  const ownerAvatar =
    owner?.avatar_url
      ? supabase.storage.from("avatars").getPublicUrl(owner.avatar_url).data
          .publicUrl
      : null;
  const closes = project.deadline ? new Date(project.deadline) : null;
  const daysLeft = closes
    ? Math.max(
        0,
        Math.ceil(
          (closes.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        ),
      )
    : null;

  return (
    <main className="min-h-screen bg-paper-warm/40">
      <AppHeader email={user.email} />
      <div className="container-prose py-10">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to projects
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <section className="rounded-xl2 border border-paper-line bg-paper p-7 shadow-card lg:col-span-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  project.is_open
                    ? "bg-moss-50 text-moss-700 ring-1 ring-inset ring-moss-100"
                    : "bg-paper-warm text-ink-muted ring-1 ring-inset ring-paper-line"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${project.is_open ? "bg-moss-500" : "bg-paper-line"}`}
                />
                {project.is_open ? "Open to apply" : "Closed"}
              </span>
              {project.industry && (
                <span className="badge">
                  <Sparkles className="h-3 w-3 text-moss-600" />
                  {project.industry}
                </span>
              )}
              {project.current_stage && (
                <span className="badge">
                  {labelFor(STARTUP_STAGES, project.current_stage)}
                </span>
              )}
            </div>

            <h1 className="mt-5 font-display text-3xl tracking-tight sm:text-4xl">
              {project.title}
            </h1>
            <p className="mt-3 text-lg text-ink-soft">{project.one_liner}</p>

            {project.problem && (
              <section className="mt-7">
                <SectionTitle>The problem</SectionTitle>
                <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">
                  {project.problem}
                </p>
              </section>
            )}

            <section className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat
                icon={Briefcase}
                label="Seeking"
                value={labelFor(ROLE_TYPES, project.ideal_collaborator)}
              />
              <Stat
                icon={Clock}
                label="Per week"
                value={
                  project.time_commitment_hours
                    ? `~${project.time_commitment_hours} hrs`
                    : "—"
                }
              />
              <Stat
                icon={Calendar}
                label="Duration"
                value={
                  project.duration_weeks
                    ? `${project.duration_weeks} weeks`
                    : "—"
                }
              />
              <Stat
                icon={MapPin}
                label="Mode"
                value={labelFor(COLLAB_MODES, project.collab_mode)}
              />
            </section>

            {project.skills_needed.length > 0 && (
              <section className="mt-7">
                <SectionTitle>Skills needed</SectionTitle>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {project.skills_needed.map((s) => (
                    <span
                      key={s}
                      className="inline-flex rounded-full border border-moss-100 bg-moss-50 px-2.5 py-1 text-xs font-medium text-moss-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </section>

          {/* Side: owner + apply */}
          <aside className="space-y-5">
            {owner && (
              <div className="rounded-xl2 border border-paper-line bg-paper p-5 shadow-card">
                <div className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                  Posted by
                </div>
                <Link
                  href={`/builders/${owner.id}`}
                  className="mt-3 flex items-center gap-3 rounded-lg -m-1 p-1 transition-colors hover:bg-paper-warm"
                >
                  <Avatar src={ownerAvatar} name={owner.full_name} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium tracking-tight text-ink">
                        {owner.full_name}
                      </span>
                      {owner.verified && (
                        <BadgeCheck className="h-3.5 w-3.5 text-moss-600" />
                      )}
                    </div>
                    <div className="mt-0.5 text-[12px] text-ink-muted">
                      {labelFor(ROLE_TYPES, owner.role_type)}
                    </div>
                    <div className="mt-1.5">
                      <LevelPill level={owner.level} size="sm" />
                    </div>
                  </div>
                </Link>
              </div>
            )}

            <div className="rounded-xl2 border border-paper-line bg-paper p-5 shadow-card">
              {isOwner ? (
                <>
                  <div className="text-sm font-medium text-ink">
                    Your project
                  </div>
                  <p className="mt-1.5 text-[12px] text-ink-muted">
                    Review applicants below.
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-paper-warm px-2.5 py-1 text-[11px] font-medium text-ink-soft">
                    <Users className="h-3 w-3" />
                    {applications.length}{" "}
                    {applications.length === 1
                      ? "applicant"
                      : "applicants"}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-sm font-medium text-ink">
                    Want to collaborate?
                  </div>
                  <p className="mt-1.5 text-[12px] text-ink-muted">
                    {project.is_open
                      ? "Send a short application — the owner sees your profile too."
                      : "This project has closed applications."}
                  </p>
                  {closes && project.is_open && (
                    <p className="mt-2 text-[11px] text-ink-muted">
                      Closes in {daysLeft} day{daysLeft === 1 ? "" : "s"}
                    </p>
                  )}
                  <div className="mt-4">
                    <ApplyButton
                      kind="project"
                      targetId={project.id}
                      targetTitle={project.title}
                      myStatus={myStatus}
                      disabled={!project.is_open}
                    />
                  </div>
                </>
              )}
            </div>
          </aside>

          {isOwner && (
            <section className="rounded-xl2 border border-paper-line bg-paper p-6 shadow-card lg:col-span-3">
              <h2 className="font-display text-xl tracking-tight">
                Applications
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                Builders who&rsquo;ve raised their hand. Click a profile to
                review their full work.
              </p>
              <div className="mt-5">
                <ApplicationsList applications={applications} />
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">
      {children}
    </h3>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Briefcase;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-paper-line bg-paper-warm/40 p-3">
      <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-ink-muted">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-1.5 font-display text-base tracking-tight text-ink">
        {value}
      </div>
    </div>
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
    <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-paper">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="font-display text-sm">{initials || "•"}</span>
      )}
    </span>
  );
}
