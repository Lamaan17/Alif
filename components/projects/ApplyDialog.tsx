"use client";

import { useEffect, useState, useTransition } from "react";
import {
  X,
  Send,
  Loader2,
  CheckCircle2,
  Sparkles,
  Hand,
} from "lucide-react";

import { applyToProject } from "@/app/actions/projects";
import { applyToSprint } from "@/app/actions/sprints";
import { textareaCls } from "@/components/profile/Field";

export function ApplyDialog({
  open,
  onClose,
  kind,
  targetId,
  targetTitle,
}: {
  open: boolean;
  onClose: () => void;
  kind: "project" | "sprint";
  targetId: string;
  targetTitle: string;
}) {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setMessage("");
        setSent(false);
        setError(null);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function submit() {
    setError(null);
    startTransition(async () => {
      const res =
        kind === "project"
          ? await applyToProject({ projectId: targetId, message })
          : await applyToSprint({ sprintId: targetId, message });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSent(true);
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md rounded-xl2 border border-paper-line bg-paper p-6 shadow-cardHover">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-7 w-7 items-center justify-center rounded-full text-ink-muted hover:bg-paper-warm hover:text-ink"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {sent ? (
          <div className="py-4 text-center">
            <div className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-moss-50 text-moss-600 ring-1 ring-inset ring-moss-100">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-display text-xl tracking-tight">
              Application sent
            </h2>
            <p className="mt-1.5 text-sm text-ink-muted">
              {kind === "project"
                ? "The project owner will see this and decide."
                : "The sprint coordinator will review and reach out."}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="btn-primary mt-6"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="inline-flex items-center gap-2 rounded-full border border-moss-100 bg-moss-50 px-2.5 py-1 text-[11px] font-medium text-moss-700">
              {kind === "project" ? (
                <>
                  <Hand className="h-3 w-3" /> Apply to collaborate
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3" /> Apply to sprint
                </>
              )}
            </div>
            <h2 className="mt-3 font-display text-xl leading-tight tracking-tight">
              Apply to {kind === "project" ? "join" : "join the"}{" "}
              <span className="text-moss-700">{targetTitle}</span>
            </h2>
            <p className="mt-1.5 text-sm text-ink-muted">
              {kind === "project"
                ? "One short message. What you'd bring, what excites you, anything relevant you've shipped."
                : "What do you want to build during this sprint? Who would you bring? (Optional.)"}
            </p>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="A few lines."
              rows={5}
              maxLength={800}
              className={textareaCls + " mt-4"}
            />

            {error && (
              <p className="mt-3 text-[11px] text-red-600">{error}</p>
            )}

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={pending}
                className="btn-accent disabled:opacity-60"
              >
                {pending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Send application
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
