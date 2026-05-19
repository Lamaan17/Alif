import { redirect } from "next/navigation";
import { Lock, Sparkles, ShieldCheck } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { listCircleMembers, getMyIntroRequestsSet } from "@/lib/data/circle";
import { getBadgesForMany } from "@/lib/data/badges";
import { CircleMemberCard } from "@/components/circle/CircleMemberCard";

export const metadata = { title: "Founder Circle — Build Together" };

export default async function CirclePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles")
    .select("level, full_name")
    .eq("id", user.id)
    .maybeSingle();
  const myLevel = (me as { level: number } | null)?.level ?? 0;
  const viewerCanRequest = myLevel >= 3;

  return (
    <main className="min-h-screen bg-paper-warm/40">
      <AppHeader email={user.email} />

      <div className="container-prose py-12">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-100 bg-gold-50 px-3 py-1 text-xs font-medium text-gold-600">
            <Sparkles className="h-3 w-3" />
            Founder Circle · invite-earned
          </span>
          <h1 className="mt-5 font-display text-3xl tracking-tight sm:text-5xl">
            A private network of builders who actually ship.
          </h1>
          <p className="lead mt-4">
            Verified Builders and Founder Circle members only. Curated, quiet,
            high-signal. Reach out, get warm intros, find co-founders worth
            committing to.
          </p>
        </div>

        {!viewerCanRequest && <LockedNotice level={myLevel} />}

        <CircleList viewerId={user.id} viewerCanRequest={viewerCanRequest} />
      </div>
    </main>
  );
}

function LockedNotice({ level }: { level: number }) {
  return (
    <div className="mx-auto mt-10 max-w-2xl rounded-xl2 border border-paper-line bg-paper p-6 shadow-card">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-paper-warm text-ink-muted ring-1 ring-inset ring-paper-line">
          <Lock className="h-4 w-4" />
        </span>
        <div>
          <div className="font-semibold tracking-tight text-ink">
            You can see the Circle. Intro requests unlock at Level 3.
          </div>
          <p className="mt-1.5 text-sm text-ink-muted">
            You&rsquo;re currently Level {level}. Complete a Build Sprint and
            collect a positive peer review to reach Verified Builder.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[12px]">
            <a
              href="/sprints"
              className="inline-flex items-center gap-1 rounded-full border border-paper-line bg-paper-warm px-3 py-1.5 font-medium text-ink-soft hover:border-moss-500/40 hover:bg-moss-50 hover:text-moss-700"
            >
              <ShieldCheck className="h-3 w-3" />
              See sprints
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

async function CircleList({
  viewerId,
  viewerCanRequest,
}: {
  viewerId: string;
  viewerCanRequest: boolean;
}) {
  const members = await listCircleMembers(viewerId);
  if (members.length === 0) {
    return (
      <div className="mx-auto mt-12 max-w-xl rounded-xl2 border border-dashed border-paper-line bg-paper p-12 text-center">
        <Sparkles className="mx-auto h-5 w-5 text-ink-muted" />
        <h3 className="mt-4 font-display text-lg tracking-tight">
          The Circle is forming.
        </h3>
        <p className="mt-2 text-sm text-ink-muted">
          Verified Builders graduate in here as sprints complete. Check back
          soon.
        </p>
      </div>
    );
  }

  const [badgeMap, requested] = await Promise.all([
    getBadgesForMany(members.map((m) => m.id)),
    getMyIntroRequestsSet(viewerId),
  ]);

  return (
    <div className="mx-auto mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {members.map((m) => (
        <CircleMemberCard
          key={m.id}
          member={m}
          badges={badgeMap.get(m.id) ?? []}
          alreadyRequested={requested.has(m.id)}
          viewerCanRequest={viewerCanRequest}
        />
      ))}
    </div>
  );
}
