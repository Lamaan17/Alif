import { cn } from "@/lib/utils";

export function Label({
  children,
  required,
  className,
}: {
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "block text-xs font-medium tracking-wide text-ink-soft",
        className,
      )}
    >
      {children}
      {required && <span className="ml-0.5 text-moss-600">*</span>}
    </label>
  );
}

export function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-[11px] text-ink-muted">{children}</p>;
}

export function ErrorText({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return <p className="mt-1 text-[11px] text-red-600">{children}</p>;
}

export const inputCls =
  "w-full rounded-xl border border-paper-line bg-paper-warm/60 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/70 transition-colors focus:border-moss-500/50 focus:bg-paper focus:outline-none focus:ring-4 focus:ring-moss-500/10";

export const textareaCls = inputCls + " min-h-[88px] resize-y leading-relaxed";

export function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <div className="mt-1.5">{children}</div>
      {hint && !error && <Hint>{hint}</Hint>}
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}
