import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { ProfileWizard } from "@/components/profile/ProfileWizard";
import type { ProfileFormValues } from "@/lib/profile-schema";

export const metadata = { title: "Edit profile — Build Together" };

export default async function EditProfilePage() {
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

  const initial: Partial<ProfileFormValues> = {
    full_name: profile.full_name ?? "",
    avatar_url: profile.avatar_url ?? null,
    location: profile.location ?? "",
    timezone: profile.timezone ?? "",
    bio: profile.bio ?? "",
    role_type: profile.role_type ?? "technical",
    skills: profile.skills ?? [],
    industries: profile.industries ?? [],
    proof_of_work: profile.proof_of_work ?? [],
    past_projects: profile.past_projects ?? [],
    startup_stage: profile.startup_stage ?? "exploring",
    looking_for: profile.looking_for ?? [],
    weekly_hours: profile.weekly_hours ?? 10,
    working_style: profile.working_style ?? "mixed",
    commitment_level: profile.commitment_level ?? "side_project",
    open_to_remote: profile.open_to_remote ?? true,
    open_to_in_person: profile.open_to_in_person ?? false,
  };

  return (
    <main className="min-h-screen bg-paper">
      <AppHeader email={user.email} />

      <div className="container-prose py-10 sm:py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </Link>

        <div className="mx-auto mt-6 max-w-2xl text-center">
          <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
            Edit your profile
          </h1>
          <p className="lead mt-2 text-sm">
            Changes save when you finish the last step.
          </p>
        </div>

        <div className="mt-8">
          <ProfileWizard userId={user.id} initial={initial} mode="edit" />
        </div>
      </div>
    </main>
  );
}
