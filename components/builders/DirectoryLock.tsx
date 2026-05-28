import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";

/**
 * Wraps directory content in a blur + lock overlay for members who haven't
 * unlocked the full builder network yet.
 */
export function DirectoryLock({
  tier,
  children,
}: {
  tier: "new_user" | "contributor";
  children: React.ReactNode;
}) {
  const copy =
    tier === "new_user"
      ? {
          title: "The full builder network unlocks as you contribute.",
          body: "Builder access unlocks as you contribute and become part of the trusted ALIF community — through Sessions, events, helping projects, or Core Team approval.",
        }
      : {
          title: "You're contributing — full access is close.",
          body: "Contributors get curated recommendations. The full directory opens at Community Member: through ALIF Sessions, qualifying events, community access, scholarship, or approval.",
        };

  return (
    <div className="relative">
      {/* Blurred preview */}
      <div
        aria-hidden
        className="pointer-events-none select-none blur-[5px] saturate-50 opacity-60"
      >
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-start justify-center">
        <div className="sticky top-24 mt-12 w-full max-w-md rounded-xl2 border border-paper-line bg-paper/95 p-6 text-center shadow-cardHover backdrop-blur">
          <span className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-paper-warm text-ink-muted ring-1 ring-inset ring-paper-line">
            <Lock className="h-5 w-5" />
          </span>
          <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-ink">
            {copy.title}
          </h3>
          <p className="mt-2 text-sm text-ink-muted">{copy.body}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link href="/sprints" className="btn-primary">
              Join a sprint
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/community" className="btn-secondary">
              How access works
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
