export function BarChart({
  data,
  maxBars = 8,
  className,
}: {
  data: Array<{ name: string; count: number }>;
  maxBars?: number;
  className?: string;
}) {
  const items = data.slice(0, maxBars);
  const max = Math.max(1, ...items.map((d) => d.count));

  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      {items.map((d) => {
        const pct = (d.count / max) * 100;
        return (
          <div key={d.name} className="grid grid-cols-[1fr_auto] items-center gap-3">
            <div>
              <div className="flex items-baseline justify-between text-[12px]">
                <span className="truncate text-ink">{d.name}</span>
                <span className="ml-2 shrink-0 font-medium text-ink-muted">
                  {d.count}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-paper-warm">
                <div
                  className="h-full rounded-full bg-ink/80 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
