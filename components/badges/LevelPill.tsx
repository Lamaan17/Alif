import { levelLabel } from "@/lib/profile-options";
import { cn } from "@/lib/utils";

const LEVEL_TONES: Record<number, string> = {
  0: "bg-paper-warm text-ink-muted ring-paper-line",
  1: "bg-paper-warm text-ink-soft ring-paper-line",
  2: "bg-moss-50 text-moss-700 ring-moss-100",
  3: "bg-moss-100 text-moss-700 ring-moss-200",
  4: "bg-gold-50 text-gold-600 ring-gold-100",
};

export function LevelPill({
  level,
  size = "sm",
}: {
  level: number | null | undefined;
  size?: "sm" | "md";
}) {
  const lv = typeof level === "number" ? level : 0;
  const tone = LEVEL_TONES[lv] ?? LEVEL_TONES[0];
  const sizes = {
    sm: "px-1.5 py-0.5 text-[10px] gap-1",
    md: "px-2 py-0.5 text-xs gap-1.5",
  }[size];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium ring-1 ring-inset",
        tone,
        sizes,
      )}
      title={`Level ${lv}`}
    >
      <span className="font-display tracking-tight">L{lv}</span>
      {levelLabel(lv)}
    </span>
  );
}
