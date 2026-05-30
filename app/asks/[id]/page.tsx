import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { getAsk, getAnswers } from "@/lib/data/asks";
import {
  ASK_KINDS,
  audienceLabel,
  meetsAudience,
} from "@/lib/profile-options";
import { LevelPill } from "@/components/badges/LevelPill";
import { AnswerSection } from "@/components/asks/AnswerSection";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}) {
  const ask = await getAsk(params.id);
  return { title: ask ? `${ask.title} — alif·build` : "Ask — alif·build" };
}

export default async function AskDetail({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/asks/${params.id}`);

  const [{ data: profile }, ask] = await Promise.all([
    supabase
      .from("profiles")
      .select("level, is_admin")
      .eq("id", user.id)
      .maybeSingle(),
    getAsk(params.id),
  ]);
  if (!ask) notFound();

  const level = (profile as { level: number } | null)?.level ?? 0;
  const isAdmin = !!(profile as { is_admin: boolean } | null)?.is_admin;
  const canAnswer = meetsAudience(level, isAdmin, ask.audience);
  const answers = await getAnswers(ask.id);
  const kindLabel =
    ASK_KINDS.find((k) => k.value === ask.kind)?.label ?? "General";

  return (
    <main className="min-h-screen bg-paper-warm/40">
      <AppHeader email={user.email} />
      <div className="container-prose py-10">
        <Link
          href="/asks"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to asks
        </Link>

        <div className="mx-auto mt-6 max-w-2xl">
          {/* Ask header */}
          <div className="rounded-xl2 border border-paper-line bg-paper p-6 shadow-card sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-paper-line bg-paper-warm px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-soft">
                {kindLabel}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${
                  ask.audience === "open"
                    ? "bg-paper-warm text-ink-muted ring-paper-line"
                    : canAnswer
                    ? "bg-moss-50 text-moss-700 ring-moss-100"
                    : "bg-paper-warm text-ink-muted ring-paper-line"
                }`}
              >
                {ask.audience !== "open" && !canAnswer && (
                  <Lock className="h-2.5 w-2.5" />
                )}
                {audienceLabel(ask.audience)}
              </span>
              {typeof ask.est_minutes === "number" && (
                <span className="inline-flex items-center rounded-full border border-paper-line bg-paper-warm px-2 py-0.5 text-[10px] font-medium text-ink-soft">
                  ~{ask.est_minutes} min
                </span>
              )}
              {ask.deadline && (
                <span className="inline-flex items-center rounded-full border border-gold-100 bg-gold-50 px-2 py-0.5 text-[10px] font-medium text-gold-600">
                  by {new Date(ask.deadline).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </span>
              )}
            </div>

            <h1 className="mt-4 font-display text-2xl font-semibold leading-snug tracking-tight text-ink">
              {ask.title}
            </h1>
            {ask.body && (
              <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">
                {ask.body}
              </p>
            )}

            {/* Type-specific preview placeholder (swap with a real screenshot later) */}
            {ask.kind === "website_roast" && <WebsitePreviewPlaceholder />}
            {ask.kind === "review_post" && <LinkedInPreviewPlaceholder />}

            {ask.author && (
              <div className="mt-5 flex items-center gap-2 border-t border-paper-line pt-4 text-[13px]">
                <span className="text-ink-muted">Asked by</span>
                <Link
                  href={`/builders/${ask.author.id}`}
                  className="font-medium text-ink hover:text-moss-700"
                >
                  {ask.author.full_name}
                </Link>
                <LevelPill
                  level={ask.author.level}
                  size="sm"
                  isAdmin={ask.author.is_admin}
                />
              </div>
            )}
          </div>

          {/* Answers */}
          <div className="mt-8">
            <AnswerSection
              askId={ask.id}
              audience={ask.audience}
              answers={answers}
              canAnswer={canAnswer}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

/* ---------- preview placeholders (demo-quality, replace with real screenshots) ---------- */

function WebsitePreviewPlaceholder() {
  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-paper-line bg-paper-warm/40">
      {/* Faux browser chrome */}
      <div className="flex items-center gap-1.5 border-b border-paper-line bg-paper px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-paper-line" />
        <span className="h-2 w-2 rounded-full bg-paper-line" />
        <span className="h-2 w-2 rounded-full bg-paper-line" />
        <span className="ml-3 truncate text-[11px] text-ink-muted">
          your-prototype.com
        </span>
      </div>
      <div className="flex aspect-[16/9] items-center justify-center bg-paper-warm">
        <div className="text-center">
          <div className="font-display text-xs uppercase tracking-[0.18em] text-ink-muted">
            Site preview
          </div>
          <div className="mt-1 text-[11px] text-ink-muted/80">
            Screenshot drops in here when ready
          </div>
        </div>
      </div>
    </div>
  );
}

function LinkedInPreviewPlaceholder() {
  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-paper-line bg-paper-warm/40">
      <div className="flex aspect-[1.91/1] items-center justify-center bg-paper-warm">
        <div className="text-center">
          <div className="font-display text-xs uppercase tracking-[0.18em] text-ink-muted">
            Post preview
          </div>
          <div className="mt-1 text-[11px] text-ink-muted/80">
            Draft attaches here for review
          </div>
        </div>
      </div>
      <div className="border-t border-paper-line bg-paper px-3 py-2">
        <div className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">
          linkedin.com
        </div>
        <div className="mt-0.5 truncate text-[12px] font-medium text-ink">
          Draft: a prototype I&rsquo;ve been quietly shipping
        </div>
      </div>
    </div>
  );
}
