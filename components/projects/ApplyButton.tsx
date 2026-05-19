"use client";

import { useState, useTransition } from "react";
import { Send, Loader2, CheckCircle2, XCircle } from "lucide-react";

import { ApplyDialog } from "./ApplyDialog";
import { withdrawApplication } from "@/app/actions/projects";
import { cn } from "@/lib/utils";

export function ApplyButton({
  kind,
  targetId,
  targetTitle,
  myStatus,
  disabled,
}: {
  kind: "project" | "sprint";
  targetId: string;
  targetTitle: string;
  myStatus?: "pending" | "accepted" | "declined" | "withdrawn";
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  if (myStatus === "accepted") {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-moss-50 px-3 py-1.5 text-xs font-medium text-moss-700 ring-1 ring-inset ring-moss-100">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Accepted
      </div>
    );
  }
  if (myStatus === "declined") {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-paper-warm px-3 py-1.5 text-xs font-medium text-ink-muted ring-1 ring-inset ring-paper-line">
        <XCircle className="h-3.5 w-3.5" />
        Not selected
      </div>
    );
  }
  if (myStatus === "pending") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-50 px-3 py-1.5 text-xs font-medium text-gold-600 ring-1 ring-inset ring-gold-100">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Applied · pending
        </span>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              await withdrawApplication(targetId);
            });
          }}
          className="text-[11px] text-ink-muted underline underline-offset-2 hover:text-ink"
        >
          {pending ? "Withdrawing…" : "Withdraw"}
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={cn(
          "btn-accent w-full",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Send className="h-3.5 w-3.5" />
        )}
        {disabled ? "Closed" : kind === "project" ? "Offer to help" : "Join the sprint"}
      </button>
      <ApplyDialog
        open={open}
        onClose={() => setOpen(false)}
        kind={kind}
        targetId={targetId}
        targetTitle={targetTitle}
      />
    </>
  );
}
