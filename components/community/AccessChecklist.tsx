import { Check, Circle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChecklistItem = {
  label: string;
  done: boolean;
};

export function AccessChecklist({
  items,
  unlocked,
}: {
  items: ChecklistItem[];
  unlocked: boolean;
}) {
  const completed = items.filter((i) => i.done).length;
  return (
    <div className="rounded-xl2 border border-paper-line bg-paper p-6 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink-muted">
            How access works
          </div>
          <h3 className="mt-2 font-display text-xl font-semibold tracking-tight text-ink">
            {unlocked
              ? "You're in the verified circle."
              : "Earn your way to the verified community."}
          </h3>
        </div>
        <div className="text-right">
          <div className="font-display text-2xl font-semibold tracking-tight text-ink">
            {completed}
            <span className="text-ink-muted">/{items.length}</span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-ink-muted">
            complete
          </div>
        </div>
      </div>

      <ul className="mt-5 space-y-2">
        {items.map((it, i) => (
          <li
            key={i}
            className={cn(
              "flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors",
              it.done
                ? "border-moss-100 bg-moss-50 text-moss-700"
                : "border-paper-line bg-paper-warm/30 text-ink-soft",
            )}
          >
            <span
              className={cn(
                "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                it.done
                  ? "border-moss-500 bg-moss-500 text-paper-deep"
                  : "border-paper-line text-ink-muted",
              )}
            >
              {it.done ? (
                <Check className="h-3 w-3" strokeWidth={2.5} />
              ) : (
                <Circle className="h-2 w-2" />
              )}
            </span>
            <span className={cn(it.done && "font-medium")}>{it.label}</span>
            {!it.done && (
              <Lock className="ml-auto h-3 w-3 text-ink-muted" />
            )}
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[11px] text-ink-muted">
        Verification is reviewed manually by ALIF. You don&rsquo;t apply — you
        earn it by being present in the work.
      </p>
    </div>
  );
}
