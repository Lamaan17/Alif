"use client";

import { useEffect, useState, useTransition } from "react";
import { X, Send, Loader2, CheckCircle2, Sparkles } from "lucide-react";

import { requestIntro } from "@/app/actions/intro";
import { textareaCls } from "@/components/profile/Field";

export function IntroDialog({
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
      const res = await requestIntro({ toUserId, message });
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
              Intro requested
            </h2>
            <p className="mt-1.5 text-sm text-ink-muted">
              ALIF will warm-introduce you to {toName.split(" ")[0]} if they
              accept.
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
              Founder Circle intro
            </div>
            <h2 className="mt-3 font-display text-xl leading-tight tracking-tight">
              Request a warm intro to {toName.split(" ")[0]}
            </h2>
            <p className="mt-1.5 text-sm text-ink-muted">
              Two lines: who you are and what you&rsquo;d talk about. ALIF
              forwards the request and your profile.
            </p>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hey, I'm building X and you've shipped Y — would love 20 min to compare notes."
              rows={4}
              maxLength={400}
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
                    Requesting…
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Request intro
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
