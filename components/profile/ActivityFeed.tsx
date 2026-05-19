import Link from "next/link";
import {
  Flag,
  PackageCheck,
  BadgeCheck,
  HeartHandshake,
  Mail,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import type { ActivityItem, ActivityKind } from "@/lib/data/activity";

const ICONS: Record<ActivityKind, LucideIcon> = {
  joined_sprint: Flag,
  shipped_project: PackageCheck,
  badge_awarded: BadgeCheck,
  matched_with: HeartHandshake,
  intro_requested: Mail,
};

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}w ago`;
  const months = Math.floor(d / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <div className="text-sm text-ink-muted">
        No activity yet. Sprints completed, projects shipped, and badges earned
        will show up here.
      </div>
    );
  }
  return (
    <ol className="space-y-3">
      {items.map((it, i) => {
        const Icon = ICONS[it.kind];
        const content = (
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-paper-warm text-ink-soft ring-1 ring-inset ring-paper-line">
              <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-ink">{it.text}</span>
                <span className="shrink-0 text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                  {timeAgo(it.ts)}
                </span>
              </div>
            </div>
            {it.href && (
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
            )}
          </div>
        );
        return (
          <li key={i}>
            {it.href ? (
              <Link
                href={it.href}
                className="block rounded-lg border border-paper-line bg-paper-warm/40 px-3 py-2 transition-colors hover:border-ink/15 hover:bg-paper-warm"
              >
                {content}
              </Link>
            ) : (
              <div className="rounded-lg border border-paper-line bg-paper-warm/40 px-3 py-2">
                {content}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
