"use client";

import { useEffect, useState, useTransition } from "react";
import { X, Mail, Loader2, CheckCircle2, Sparkles } from "lucide-react";

import { sendInvitation } from "@/app/actions/builders";
import { inputCls, textareaCls } from "@/components/profile/Field";

export function InviteDialog({
  open,
  onClose,
  toUserId,
  toName,
}: {
  open: boolean;
  onClose: () => void;
  toUserId: string;
  toName: string;
}) {
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Reset on close
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setSent(false);
        setError(null);
        setTopic("");
        setMessage("");
      }, 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Esc to close
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
      const res = await sendInvitation({
        toUserId,
        projectTopic: topic,
        message,
      });
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
              Invite sent
            </h2>
            <p className="mt-1.5 text-sm text-ink-muted">
              We&rsquo;ll notify {toName.split(" ")[0]}. You&rsquo;ll see status updates
              once the sprints feature lands.
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
            <div className="inline-flex items-center gap-2 rounded-full border border-gold-100 bg-gold-50 px-2.5 py-1 text-[11px] font-medium text-gold-600">
              <Sparkles className="h-3 w-3" />
              Mini project invite
            </div>
            <h2 className="mt-3 font-display text-xl tracking-tight">
              Invite {toName.split(" ")[0]} to build with you
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Quick note about what you&rsquo;d build together over a 7-day sprint.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium tracking-wide text-ink-soft">
                  Project topic
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. AI assistant for community organizers"
                  className={inputCls + " mt-1.5"}
                  maxLength={120}
                />
              </div>
              <div>
                <label className="block text-xs font-medium tracking-wide text-ink-soft">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hey — I liked your work on X. Want to spend a week building Y together?"
                  className={textareaCls + " mt-1.5"}
                  rows={4}
                  maxLength={500}
                />
              </div>
            </div>

            {error && (
              <p className="mt-3 text-[11px] text-red-600">{error}</p>
            )}

            <div className="mt-6 flex items-center justify-end gap-2">
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
                    <Mail className="h-3.5 w-3.5" />
                    Send invite
                  </>
                )}
              </button>
            </div>

            <p className="mt-4 text-[10px] uppercase tracking-wider text-ink-muted">
              Full sprint flow lands in the next step
            </p>
          </>
        )}
      </div>
    </div>
  );
}
