"use client";

import { useState, useTransition } from "react";
import { Heart, Mail, Sparkles } from "lucide-react";

import { toggleInterest } from "@/app/actions/builders";
import { cn } from "@/lib/utils";

import { InviteDialog } from "./InviteDialog";

export function ProfileActions({
  toUserId,
  toName,
  isInterested,
  isMatched,
}: {
  toUserId: string;
  toName: string;
  isInterested: boolean;
  isMatched: boolean;
}) {
  const [interested, setInterested] = useState(isInterested);
  const [matched, setMatched] = useState(isMatched);
  const [pending, startTransition] = useTransition();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [flashMatch, setFlashMatch] = useState(false);

  function handleInterested() {
    const next = !interested;
    setInterested(next);
    startTransition(async () => {
      const res = await toggleInterest(
        toUserId,
        next ? "interested" : "uninterested",
      );
      if (!res.ok) {
        setInterested(!next);
        return;
      }
      if (next && res.matched) {
        setMatched(true);
        setFlashMatch(true);
        setTimeout(() => setFlashMatch(false), 4000);
      } else if (!next) {
        setMatched(false);
      }
    });
  }

  return (
    <div className="space-y-2">
      {flashMatch && (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-moss-600 px-3 py-1 text-xs font-medium text-paper">
          <Sparkles className="h-3 w-3" />
          It&rsquo;s a match!
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleInterested}
          disabled={pending}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors disabled:opacity-60",
            interested
              ? "bg-moss-600 text-paper hover:bg-moss-700"
              : "border border-paper-line bg-paper text-ink hover:border-moss-500/40 hover:bg-moss-50 hover:text-moss-700",
          )}
        >
          <Heart className={cn("h-3.5 w-3.5", interested && "fill-current")} />
          {interested ? "Interested" : "Interested?"}
        </button>
        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-paper-line bg-paper px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-gold-500/40 hover:bg-gold-50 hover:text-gold-600"
        >
          <Mail className="h-3.5 w-3.5" />
          Invite
        </button>
      </div>

      {matched && !flashMatch && (
        <p className="text-[11px] text-moss-700">
          You both said yes. Make the intro.
        </p>
      )}

      <InviteDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        toUserId={toUserId}
        toName={toName}
      />
    </div>
  );
}
