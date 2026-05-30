import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Lightbulb } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { ProjectCard } from "@/components/projects/ProjectCard";
import {
  listProjects,
  getMyApplicationsForProjects,
  type ProjectFilters,
} from "@/lib/data/projects";
import { ProjectFilters as Filters } from "./ProjectFilters";

export const metadata = { title: "Things Worth Building — alif·build" };

function parseFilters(sp: Record<string, string | undefined>): ProjectFilters {
  return {
    industry: sp.industry || undefined,
    stage: sp.stage || undefined,
    collab: sp.collab || undefined,
    openOnly: sp.open === "1",
  };
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const filters = parseFilters(searchParams);
  const [projects, myApps] = await Promise.all([
    listProjects(filters),
    getMyApplicationsForProjects(user.id),
  ]);

  return (
    <main className="min-h-screen bg-paper-warm/40">
      <AppHeader email={user.email} />

      <div className="container-prose py-10">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              Things to build
            </span>
            <h1 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">
              Things Worth Building.
            </h1>
            <p className="lead mt-2 text-sm">
              Ongoing things worth building that need useful help — from ALIF
              builders, portfolio companies, partners, and community members.
            </p>
          </div>
          <Link href="/projects/new" className="btn-primary">
            <Plus className="h-4 w-4" />
            Post a call to build
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          <aside>
            <Filters initial={filters} />
          </aside>

          <section>
            {projects.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {projects.map((p) => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    applicationStatus={myApps.get(p.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-paper-line bg-paper p-12 text-center">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-paper-warm text-ink-muted ring-1 ring-inset ring-paper-line">
        <Lightbulb className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-display text-lg tracking-tight">
        No projects match these filters.
      </h3>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        Loosen the filters, or post the first one yourself — the network grows
        when builders share what they&rsquo;re working on.
      </p>
    </div>
  );
}
