import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { CommunityCards } from "@/components/community/CommunityCards";
import { AccessLadder } from "@/components/community/AccessLadder";
import {
  AccessChecklist,
  type ChecklistItem,
} from "@/components/community/AccessChecklist";
import { AlifersHandoff } from "@/components/AlifersHandoff";

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
      "level, verified, is_admin, full_name, bio, skills, past_projects, looking_for",
    )
    .eq("id", user.id)
    .maybeSingle();
  const p = profile as
    | {
        level: number;
        verified: boolean;
        is_admin: boolean;
        full_name: string;
        bio: string | null;
        skills: string[] | null;
        past_projects: unknown[] | null;
        looking_for: string[] | null;
      }
    | null;

  const level = p?.level ?? 0;
  const verified = !!p?.verified;
  const isAdminViewer = !!p?.is_admin;
  const unlocked = level >= 3 || verified || isAdminViewer;

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
    {
      label: "Show up to ALIF spaces",
      done:
        badgeKinds.includes("event_attendee") ||
        badgeKinds.includes("sessions_participant") ||
        badgeKinds.includes("hq_visitor") ||
        badgeKinds.includes("jumuah_attendee") ||
        badgeKinds.includes("summit_participant") ||
        badgeKinds.includes("tournament_builder"),
    },
    { label: "Complete your profile", done: profileComplete },
    { label: "Join a sprint", done: (sprintAccepts ?? 0) > 0 },
    {
      label: "Help on a project",
      done: (projectAccepts ?? 0) > 0,
    },
    {
      label: "Attend an event or HQ session",
      done:
        badgeKinds.includes("event_attendee") ||
        badgeKinds.includes("hq_visitor"),
    },
    {
      label: "Ship something useful",
      done:
        (p?.past_projects?.length ?? 0) > 0 ||
        badgeKinds.includes("shipped_project"),
    },
    {
      label: "Receive peer or mentor signal",
      done:
        badgeKinds.includes("mentor_endorsed") ||
        badgeKinds.includes("active_collaborator"),
    },
    {
      label: "Keep building",
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
                Welcome to the room after the room
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3" />
                ALIF Community · room after the room
              </>
            )}
          </span>
          <h1
            className="mt-6 font-display font-semibold text-4xl leading-[1.02] sm:text-5xl md:text-[64px]"
            style={{ letterSpacing: "-0.04em" }}
          >
            ALIF{" "}
            <em className="italic font-medium text-ink">Community</em>
          </h1>
          <p className="lead mt-5">
            The room after the room — where people from Sessions, Network, HQ,
            Summit, Tournament, Jumuah, and ALIF companies keep building
            together.
          </p>
          {!unlocked && (
            <p className="mx-auto mt-4 max-w-2xl text-[13px] leading-relaxed text-ink-muted">
              This is not a Discord. Not a feed. Not a place to collect
              followers. It is a living directory of people who have shown up,
              shipped, helped, and contributed.
            </p>
          )}
        </div>

        {/* Access ladder */}
        <div className="mt-16">
          <AccessLadder level={level} isAdmin={isAdminViewer} />
        </div>

        {/* Badges & participation surfaces */}
        <div className="mt-20">
          <div className="text-center">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              Badges
            </span>
            <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Participation, not permission.
            </h2>
            <p className="lead mx-auto mt-3 max-w-2xl text-sm">
              Badges show <em className="italic font-medium text-ink">where you&rsquo;ve shown up</em> and{" "}
              <em className="italic font-medium text-ink">what you&rsquo;ve helped with</em>. They&rsquo;re context and trust signals
              — distinct from the access ladder above, which controls what you
              can do.
            </p>
          </div>
          <div className="mt-10">
            <CommunityCards unlocked={unlocked} />
          </div>
        </div>

        {/* Access checklist */}
        <div className="mx-auto mt-14 max-w-2xl">
          <AccessChecklist items={items} unlocked={unlocked} />
        </div>

        {/* Alifers handoff — community home ↔ action layer */}
        <div className="mx-auto mt-10 max-w-2xl">
          <AlifersHandoff />
        </div>

        {/* CTAs */}
        <div className="mt-14 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {!unlocked ? (
            <>
              <Link href="/login" className="btn-primary">
                Join the Community
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/sprints" className="btn-secondary">
                Join a Sprint
              </Link>
              <Link href="/builders" className="btn-secondary">
                Explore People
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

        {/* Liability / framing disclaimer */}
        <p className="mx-auto mt-14 max-w-2xl text-center text-[11px] leading-relaxed text-ink-muted">
          Build Together does not assign or endorse cofounders. It helps ALIF
          builders discover people, projects, and rooms where trust can form
          through real participation.
        </p>
      </div>
    </main>
  );
}
