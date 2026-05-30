import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { SprintCard } from "@/components/sprints/SprintCard";
import {
  listSprints,
  getMyApplicationsForSprints,
} from "@/lib/data/sprints";

export const metadata = { title: "Build Sprints — Build Together" };

export default async function SprintsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [sprints, myApps] = await Promise.all([
    listSprints(),
    getMyApplicationsForSprints(user.id),
  ]);

  const upcoming = sprints.filter((s) => s.status === "upcoming");
  const live = sprints.filter((s) => s.status === "live");
  const completed = sprints.filter((s) => s.status === "completed");

  return (
    <main className="min-h-screen bg-paper-warm/40">
      <AppHeader email={user.email} />

      <div className="container-prose py-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            Sprints
          </span>
          <h1 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">
            Seven days. One build. Real feedback.
          </h1>
          <p className="lead mt-3 text-sm">
            Time-bound rituals where ALIF builders collaborate and create
            momentum — shipping something useful together in a single week.
          </p>
        </div>

        {live.length > 0 && (
          <Section
            title="Live right now"
            accent="moss"
            sprints={live}
            myApps={myApps}
          />
        )}
        <Section
          title="Open to apply"
          subtitle="Reserve your spot before the kickoff."
          accent="gold"
          sprints={upcoming}
          myApps={myApps}
          empty="No upcoming sprints. Watch this page — a new one is announced every few weeks."
        />
        {completed.length > 0 && (
          <Section
            title="Past sprints"
            accent="ink"
            sprints={completed}
            myApps={myApps}
          />
        )}
      </div>
    </main>
  );
}

function Section({
  title,
  subtitle,
  accent,
  sprints,
  myApps,
  empty,
}: {
  title: string;
  subtitle?: string;
  accent: "moss" | "gold" | "ink";
  sprints: Awaited<ReturnType<typeof listSprints>>;
  myApps: Map<string, "pending" | "accepted" | "declined" | "withdrawn">;
  empty?: string;
}) {
  const dotTone = {
    moss: "bg-moss-500",
    gold: "bg-gold-500",
    ink: "bg-paper-line",
  }[accent];
  return (
    <section className="mt-12">
      <div className="flex items-baseline gap-2">
        <span className={`inline-block h-2 w-2 rounded-full ${dotTone}`} />
        <h2 className="font-display text-xl tracking-tight">{title}</h2>
      </div>
      {subtitle && (
        <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>
      )}
      <div className="mt-5">
        {sprints.length === 0 ? (
          <p className="rounded-xl2 border border-dashed border-paper-line bg-paper p-8 text-center text-sm text-ink-muted">
            {empty ?? "Nothing here yet."}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sprints.map((s) => (
              <SprintCard
                key={s.id}
                sprint={s}
                applicationStatus={myApps.get(s.id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// keep this import alive (it's used for the icon palette across the page set)
void Sparkles;
