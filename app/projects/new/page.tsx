import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { ProjectForm } from "@/components/projects/ProjectForm";

export const metadata = { title: "Post a project — Build Together" };

export default async function NewProjectPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="min-h-screen bg-paper">
      <AppHeader email={user.email} />
      <div className="container-prose py-10">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to projects
        </Link>

        <div className="mx-auto mt-6 max-w-2xl text-center">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            Post a project
          </span>
          <h1 className="mt-4 font-display text-3xl tracking-tight sm:text-4xl">
            What are you building?
          </h1>
          <p className="lead mt-2 text-sm">
            Be specific. The right collaborator self-selects when the ask is
            clear.
          </p>
        </div>

        <div className="mt-8">
          <ProjectForm />
        </div>
      </div>
    </main>
  );
}
