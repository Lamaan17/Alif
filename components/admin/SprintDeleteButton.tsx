"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteSprint } from "@/app/actions/admin";

export function SprintDeleteButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-full border border-paper-line bg-paper px-2 py-1 text-[10px] text-ink-muted hover:bg-paper-warm"
        >
          cancel
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await deleteSprint(id);
              setConfirming(false);
            })
          }
          className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-1 text-[10px] font-medium text-paper hover:bg-red-700 disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
          Confirm
        </button>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="inline-flex items-center gap-1 rounded-full border border-paper-line bg-paper px-2.5 py-1 text-[11px] font-medium text-ink-muted hover:border-red-200 hover:bg-red-50 hover:text-red-600"
    >
      <Trash2 className="h-3 w-3" />
      Delete
    </button>
  );
}
