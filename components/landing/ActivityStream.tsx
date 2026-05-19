import Link from "next/link";
import {
  Flag,
  BadgeCheck,
  HandHeart,
  Users,
  Coffee,
  Mountain,
  Sparkles,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import type { StreamEvent, StreamEventKind } from "@/lib/data/stream";

const ICONS: Record<StreamEventKind, LucideIcon> = {
  joined_sprint: Flag,
  badge_awarded: BadgeCheck,
  shipped_project: Sparkles,
  matched: HandHeart,
  joined_platform: Users,
  city_session: Coffee,
  summit: Mountain,
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
  return `${w}w ago`;
}

export function ActivityStream({ items }: { items: StreamEvent[] }) {
  if (items.length === 0) return null;
  return (
    <section className="container-prose py-20 sm:py-24">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_2fr]">
        <div>
          <span className="eyebrow">
            <span className="eyebrow-dot" />
            Live Builder Activity
          </span>
          <h2 className="mt-5 h-section">
            What&rsquo;s happening{" "}
            <em className="italic font-medium text-ink">right now</em>.
          </h2>
          <p className="lead mt-4">
            A calm signal of momentum. Curated, never noisy.
          </p>
          <Link
            href="/map"
            className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-ink-muted underline underline-offset-4 decoration-paper-line transition-colors hover:text-ink hover:decoration-ink/40"
          >
            See the network
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <ol className="space-y-2">
          {items.map((it, i) => {
            const Icon = ICONS[it.kind];
            return (
              <li
                key={i}
                className="group flex items-center gap-3 rounded-xl border border-paper-line bg-paper px-4 py-3 transition-colors hover:border-ink/15 hover:bg-paper-warm"
                style={{ animation: `fadeUp 700ms ease-out ${i * 60}ms both` }}
              >
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper-warm text-ink-soft ring-1 ring-inset ring-paper-line">
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-ink">{it.text}</div>
                </div>
                <span className="shrink-0 text-[10px] uppercase tracking-[0.16em] text-ink-muted">
                  {timeAgo(it.ts)}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          ol li { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
