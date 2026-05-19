import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { CommunityCards } from "@/components/community/CommunityCards";
import {
  AccessChecklist,
  type ChecklistItem,
} from "@/components/community/AccessChecklist";

export const metadata = { title: "Verified Builder Community — alif·build" };

export default async function CommunityPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/community");

  // Profile + verification signals
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "level, verified, full_name, bio, skills, past_projects, looking_for",
    )
    .eq("id", user.id)
    .maybeSingle();
  const p = profile as
    | {
        level: number;
        verified: boolean;
        full_name: string;
        bio: string | null;
        skills: string[] | null;
        past_projects: unknown[] | null;
        looking_for: string[] | null;
      }
    | null;

  const level = p?.level ?? 0;
  const verified = !!p?.verified;
  const unlocked = level >= 3 || verified;

  // Has user accepted into any sprint?
  const { count: sprintAccepts } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("applicant_id", user.id)
    .eq("target_type", "sprint")
    .eq("status", "accepted");

  // Has user been accepted into any project collab?
  const { count: projectAccepts } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("applicant_id", user.id)
    .eq("target_type", "project")
    .eq("status", "accepted");

  // Has user any badges (proxy for endorsement / event attendance)
  const { data: badges } = await supabase
    .from("profile_badges")
    .select("kind")
    .eq("profile_id", user.id);
  const badgeKinds = (badges ?? []).map((b) => (b as { kind: string }).kind);

  const profileComplete =
    !!p?.full_name &&
    !!p?.bio &&
    (p?.skills?.length ?? 0) > 0 &&
    (p?.looking_for?.length ?? 0) > 0;

  const items: ChecklistItem[] = [
    { label: "Complete your builder profile", done: profileComplete },
    { label: "Join a build sprint", done: (sprintAccepts ?? 0) > 0 },
    {
      label: "Contribute to a project collaboration",
      done: (projectAccepts ?? 0) > 0,
    },
    {
      label: "Attend an ALIF event",
      done: badgeKinds.includes("event_attendee"),
    },
    {
      label: "Receive a peer or mentor endorsement",
      done:
        badgeKinds.includes("mentor_endorsed") ||
        badgeKinds.includes("active_collaborator"),
    },
    {
      label: "Ship a project publicly",
      done:
        (p?.past_projects?.length ?? 0) > 0 ||
        badgeKinds.includes("shipped_project"),
    },
    {
      label: "Receive ALIF verification",
      done: verified || level >= 3,
    },
  ];

  return (
    <main className="min-h-screen bg-paper-deep">
      <AppHeader email={user.email} />

      <div className="container-prose py-12">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-paper-line bg-paper-warm px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-soft">
            {unlocked ? (
              <>
                <ShieldCheck className="h-3 w-3 text-moss-500" />
                You&rsquo;re verified · welcome in
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3" />
                Verified builder community
              </>
            )}
          </span>
          <h1
            className="mt-6 font-display font-semibold text-4xl leading-[1.02] sm:text-5xl md:text-[64px]"
            style={{ letterSpacing: "-0.04em" }}
          >
            Verified Builder{" "}
            <em className="italic font-medium text-ink">Community</em>
          </h1>
          <p className="lead mt-5">
            A high-trust layer for builders who actively contribute,
            collaborate, and participate in the ecosystem.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-14">
          <CommunityCards unlocked={unlocked} />
        </div>

        {/* Access checklist */}
        <div className="mx-auto mt-14 max-w-2xl">
          <AccessChecklist items={items} unlocked={unlocked} />
        </div>

        {/* CTAs */}
        <div className="mt-14 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {!unlocked ? (
            <>
              <Link href="/sprints" className="btn-primary">
                Join a Sprint
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dashboard/edit" className="btn-secondary">
                Create Builder Profile
              </Link>
            </>
          ) : (
            <>
              <Link href="/circle" className="btn-primary">
                Open the Circle
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/sprints" className="btn-secondary">
                Join Next Sprint
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
