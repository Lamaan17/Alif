import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileWizard } from "@/components/profile/ProfileWizard";
import { AppHeader } from "@/components/AppHeader";

export const metadata = { title: "Create your profile — Build Together" };

export default async function OnboardingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Prefill name from auth metadata where possible
  const meta = user.user_metadata ?? {};
  const initial = {
    full_name:
      (meta.full_name as string) ||
      (meta.name as string) ||
      "",
    avatar_url: null,
  };

  return (
    <main className="min-h-screen bg-paper">
      <AppHeader email={user.email} />

      <div className="container-prose py-12 sm:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            Welcome to ALIF
          </span>
          <h1 className="mt-5 font-display text-3xl tracking-tight sm:text-4xl">
            Build your founder profile
          </h1>
          <p className="lead mt-3 text-sm">
            Three short steps. Used only to match you with the right builders.
          </p>
        </div>

        <div className="mt-10">
          <ProfileWizard userId={user.id} initial={initial} mode="onboarding" />
        </div>
      </div>
    </main>
  );
}
