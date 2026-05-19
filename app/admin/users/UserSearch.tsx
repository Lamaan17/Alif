"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export function UserSearch({ initial }: { initial: string }) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [pending, startTransition] = useTransition();

  function go(value: string) {
    startTransition(() => {
      const url = value.trim()
        ? `/admin/users?q=${encodeURIComponent(value.trim())}`
        : "/admin/users";
      router.replace(url, { scroll: false });
    });
  }

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
      <input
        type="search"
        value={v}
        placeholder="Search by name…"
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") go(v);
        }}
        onBlur={() => go(v)}
        className="w-full rounded-full border border-paper-line bg-paper px-9 py-2 text-sm focus:border-moss-500/50 focus:bg-paper focus:outline-none focus:ring-4 focus:ring-moss-500/10"
      />
      {v && (
        <button
          type="button"
          onClick={() => {
            setV("");
            go("");
          }}
          className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted hover:bg-paper-warm"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      {pending && (
        <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] text-ink-muted">
          …
        </span>
      )}
    </div>
  );
}
