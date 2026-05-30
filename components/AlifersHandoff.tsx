import Link from "next/link";
import { ArrowUpRight, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Lightweight handoff between Alifers (Sessions community home) and Build
 * Together (action layer after the room). Display-only — no real integration.
 *
 * Variants:
 *  - "card"   — full card, used on /community and /dashboard
 *  - "inline" — compact link row, for tight contexts
 */
export function AlifersHandoff({
  variant = "card",
  className,
}: {
  variant?: "card" | "inline";
  className?: string;
}) {
  if (variant === "inline") {
    return (
      <Link
        href="https://alifers.app"
        target="_blank"
        rel="noreferrer noopener"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-paper-line bg-paper px-3 py-1.5 text-[12px] font-medium text-ink-soft transition-colors hover:border-ink/20 hover:text-ink",
          className,
        )}
      >
        <UsersRound className="h-3.5 w-3.5" />
        Open Alifers
        <ArrowUpRight className="h-3 w-3" />
      </Link>
    );
  }

  return (
    <aside
      className={cn(
        "rounded-xl2 border border-paper-line bg-paper p-6 shadow-card",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-paper-warm text-ink-soft ring-1 ring-inset ring-paper-line">
          <UsersRound className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink-muted">
            Already part of Alifers?
          </div>
          <h3 className="mt-1.5 font-display text-base font-semibold tracking-tight text-ink">
            Alifers is your community home.{" "}
            <span className="text-ink-soft">
              Build Together is the action layer on top.
            </span>
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
            Alifers is where Sessions members stay connected. Build Together
            turns those conversations into asks, projects, sprints, and
            trusted builder activity.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="https://alifers.app"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[12px] font-medium text-paper-deep transition-colors hover:bg-ink-soft"
            >
              Open Alifers
              <ArrowUpRight className="h-3 w-3" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full border border-paper-line bg-paper px-3 py-1.5 text-[12px] font-medium text-ink-soft transition-colors hover:border-ink/20 hover:text-ink"
            >
              Continue from Alifers
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
