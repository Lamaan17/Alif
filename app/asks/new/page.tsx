import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { AskForm } from "@/components/asks/AskForm";

export const metadata = { title: "Post an ask — alif·build" };

export default async function NewAskPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/asks/new");

  const { data: profile } = await supabase
    .from("profiles")
    .select("level, is_admin")
    .eq("id", user.id)
    .maybeSingle();
  const level = (profile as { level: number } | null)?.level ?? 0;
  const isAdmin = !!(profile as { is_admin: boolean } | null)?.is_admin;
  const canPost = level >= 3 || isAdmin;

  return (
    <main className="min-h-screen bg-paper">
      <AppHeader email={user.email} />
      <div className="container-prose py-10">
        <Link
          href="/asks"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to asks
        </Link>

        <div className="mx-auto mt-6 max-w-2xl text-center">
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            Post a Community Ask
          </span>
          <h1 className="mt-4 font-display text-3xl tracking-tight sm:text-4xl">
            Ask the network for help.
          </h1>
        </div>

        <div className="mt-8">
          {canPost ? (
            <AskForm />
          ) : (
            <div className="mx-auto max-w-xl rounded-xl2 border border-paper-line bg-paper-warm/40 p-8 text-center">
              <span className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-paper text-ink-muted ring-1 ring-inset ring-paper-line">
                <Lock className="h-5 w-5" />
              </span>
              <h2 className="mt-5 font-display text-xl font-semibold tracking-tight">
                Posting unlocks at Community Member.
              </h2>
              <p className="mt-2 text-sm text-ink-muted">
                You can answer open asks right now. Posting your own opens up
                once you reach Community Member — through ALIF Sessions,
                qualifying events, contribution + community access, scholarship,
                or Core Team approval.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Link href="/asks" className="btn-secondary">
                  Browse asks
                </Link>
                <Link href="/community" className="btn-primary">
                  How access works
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
