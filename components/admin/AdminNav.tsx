"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Lightbulb,
  Sparkles,
  Hand,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/projects", label: "Projects", icon: Lightbulb },
  { href: "/admin/sprints", label: "Sprints", icon: Sparkles },
  { href: "/admin/applications", label: "Applications", icon: Hand },
  { href: "/admin/intros", label: "Intros", icon: Mail },
];

export function AdminNav({ counts }: { counts: Record<string, number> }) {
  const pathname = usePathname();
  return (
    <nav className="sticky top-20 space-y-1">
      <div className="mb-3 px-3 text-[10px] font-medium uppercase tracking-wider text-ink-muted">
        Admin
      </div>
      {ITEMS.map((it) => {
        const active =
          pathname === it.href ||
          (it.href !== "/admin" && pathname.startsWith(it.href + "/"));
        const Icon = it.icon;
        const badge = counts[it.href];
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "group flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-ink text-paper"
                : "text-ink-soft hover:bg-paper-warm hover:text-ink",
            )}
          >
            <span className="inline-flex items-center gap-2">
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              {it.label}
            </span>
            {typeof badge === "number" && badge > 0 && (
              <span
                className={cn(
                  "inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-medium",
                  active
                    ? "bg-paper text-ink"
                    : "bg-gold-500 text-paper",
                )}
              >
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
