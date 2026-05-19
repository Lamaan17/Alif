import Link from "next/link";
import { Sparkles, Briefcase, Users, ArrowUpRight, Radio } from "lucide-react";
import type { TickerItem, TickerKind } from "@/lib/data/ticker";

const ICONS: Record<TickerKind, typeof Sparkles> = {
  live: Radio,
  sprint: Sparkles,
  project: Briefcase,
  stat: Users,
  milestone: ArrowUpRight,
};

export function TickerBar({ items }: { items: TickerItem[] }) {
  if (items.length === 0) return null;

  // Duplicate the items so the keyframe at translateX(-50%) lines up seamlessly.
  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-b border-paper-line bg-paper-warm">
      <div className="ticker-track flex items-center py-2.5 text-[11px] uppercase tracking-[0.16em] text-ink-soft">
        {doubled.map((item, i) => (
          <Item key={i} item={item} />
        ))}
      </div>
    </div>
  );
}

function Item({ item }: { item: TickerItem }) {
  const Icon = ICONS[item.kind];
  const isLive = item.kind === "live";

  const inner = (
    <span className="inline-flex items-center gap-2">
      {isLive ? (
        <span className="relative inline-flex h-1.5 w-1.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-moss-500/60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-moss-500" />
        </span>
      ) : (
        <Icon className="h-3 w-3 text-ink-muted" strokeWidth={1.75} />
      )}
      <span>{item.text}</span>
      <span aria-hidden className="mx-8 text-ink-muted">
        ·
      </span>
    </span>
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        className="inline-flex items-center transition-colors hover:text-ink"
      >
        {inner}
      </Link>
    );
  }
  return <span className="inline-flex items-center">{inner}</span>;
}
