import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Lock, MessageSquare } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { listAsks } from "@/lib/data/asks";
import { AskCard } from "@/components/asks/AskCard";

export const metadata = { title: "Community Asks — alif·build" };

export default async function AsksPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/asks");

  const [{ data: profile }, asks] = await Promise.all([
    supabase
      .from("profiles")
      .select("level, is_admin")
      .eq("id", user.id)
      .maybeSingle(),
    listAsks(),
  ]);
  const level = (profile as { level: number } | null)?.level ?? 0;
  const isAdmin = !!(profile as { is_admin: boolean } | null)?.is_admin;
  const canPost = level >= 3 || isAdmin;

  return (
    <main className="min-h-screen bg-paper-warm/40">
      <AppHeader email={user.email} />

      <div className="container-prose py-10">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              Community Asks
            </span>
            <h1 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">
              What the community needs help with.
            </h1>
            <p className="lead mt-2 text-sm">
              Website roasts, pitch feedback, MVP testers, intros. Offer help
              where you can — it&rsquo;s how trust gets built.
            </p>
          </div>
          {canPost ? (
            <Link href="/asks/new" className="btn-primary">
              <Plus className="h-4 w-4" />
              Post an ask
            </Link>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full border border-paper-line bg-paper px-3.5 py-2 text-[12px] text-ink-muted">
              <Lock className="h-3.5 w-3.5" />
              Posting unlocks at Community Member
            </div>
          )}
        </div>

        {asks.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center rounded-xl2 border border-dashed border-paper-line bg-paper p-12 text-center">
            <MessageSquare className="h-5 w-5 text-ink-muted" />
            <h3 className="mt-4 font-display text-lg tracking-tight">
              No asks yet.
            </h3>
            <p className="mt-2 max-w-sm text-sm text-ink-muted">
              When Community Members post what they need, it shows up here for
              the whole network to help with.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {asks.map((a) => (
              <AskCard
                key={a.id}
                ask={a}
                viewerLevel={level}
                viewerIsAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
