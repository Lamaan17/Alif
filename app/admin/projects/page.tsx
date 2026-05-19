import Link from "next/link";
import { ExternalLink, Users } from "lucide-react";

import { listAllProjects } from "@/lib/data/admin";
import { STARTUP_STAGES, labelFor } from "@/lib/profile-options";
import { LevelPill } from "@/components/badges/LevelPill";
import { ProjectDeleteButton } from "@/components/admin/ProjectDeleteButton";

export const metadata = { title: "Admin · Projects — Build Together" };

export default async function AdminProjects() {
  const projects = await listAllProjects();
  return (
    <div className="space-y-6">
      <div>
        <span className="eyebrow">
          <span className="eyebrow-dot" />
          Admin · Projects
        </span>
        <h1 className="mt-3 font-display text-2xl tracking-tight">
          Posted projects.
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Every project posted by a builder. Owners handle their own
          applications; admins can remove projects that don&rsquo;t fit.
        </p>
      </div>

      <p className="text-xs text-ink-muted">
        {projects.length} {projects.length === 1 ? "project" : "projects"}
      </p>

      {projects.length === 0 ? (
        <div className="rounded-xl2 border border-dashed border-paper-line bg-paper p-12 text-center">
          <p className="text-sm text-ink-muted">No projects posted yet.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {projects.map((p) => (
            <li
              key={p.id}
              className="rounded-xl border border-paper-line bg-paper p-4"
            >
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/projects/${p.id}`}
                      className="font-medium tracking-tight text-ink hover:text-moss-700"
                    >
                      {p.title}
                    </Link>
                    {p.current_stage && (
                      <span className="badge">
                        {labelFor(STARTUP_STAGES, p.current_stage)}
                      </span>
                    )}
                    {p.industry && (
                      <span className="badge">{p.industry}</span>
                    )}
                    {p.deadline && (
                      <span className="badge">
                        deadline {new Date(p.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-[13px] text-ink-soft">
                    {p.one_liner}
                  </p>
                  {p.owner && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-ink-muted">
                      <span>Posted by</span>
                      <Link
                        href={`/builders/${p.owner.id}`}
                        className="font-medium text-ink hover:text-moss-700"
                      >
                        {p.owner.full_name}
                      </Link>
                      <LevelPill level={p.owner.level} size="sm" />
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {p.application_count}{" "}
                        {p.application_count === 1
                          ? "applicant"
                          : "applicants"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 flex-col gap-1.5">
                  <Link
                    href={`/projects/${p.id}`}
                    className="inline-flex items-center gap-1 rounded-full border border-paper-line bg-paper-warm px-2.5 py-1 text-[11px] font-medium text-ink-soft hover:border-ink/15 hover:text-ink"
                  >
                    View <ExternalLink className="h-3 w-3" />
                  </Link>
                  <ProjectDeleteButton id={p.id} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
