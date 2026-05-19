import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import {
  LogOut,
  LayoutDashboard,
  Users,
  Lightbulb,
  Sparkles,
  CircleDot,
  Shield,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { TickerBar } from "@/components/TickerBar";
import { getTickerItems } from "@/lib/data/ticker";

export async function AppHeader({ email }: { email?: string | null }) {
  // Read the viewer's level + admin flag so we know which links to expose.
  let level = 0;
  let isAdmin = false;
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("level, is_admin")
        .eq("id", user.id)
        .maybeSingle();
      const row = data as { level: number; is_admin: boolean } | null;
      level = row?.level ?? 0;
      isAdmin = !!row?.is_admin;
    }
  } catch {
    // not configured, default to 0
  }

  let tickerItems: Awaited<ReturnType<typeof getTickerItems>> = [];
  try {
    tickerItems = await getTickerItems();
  } catch {
    // tolerate fetch failure — header still renders
  }

  return (
    <>
      <TickerBar items={tickerItems} />
      <header className="sticky top-0 z-40 w-full border-b border-paper-line/70 bg-paper/80 backdrop-blur supports-[backdrop-filter]:bg-paper/60">
      <div className="container-prose flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-baseline gap-2" title="Back to landing">
          <span className="wordmark">alif</span>
          <span className="text-lg font-medium text-ink-muted">build</span>
        </Link>

        <nav className="flex items-center gap-0.5 text-sm">
          <NavLink href="/dashboard" icon={LayoutDashboard}>
            Dashboard
          </NavLink>
          <NavLink href="/builders" icon={Users}>
            Builders
          </NavLink>
          <NavLink href="/projects" icon={Lightbulb}>
            Projects
          </NavLink>
          <NavLink href="/sprints" icon={Sparkles}>
            Sprints
          </NavLink>
          {level >= 3 && (
            <NavLink href="/circle" icon={CircleDot}>
              Circle
            </NavLink>
          )}
          {isAdmin && (
            <NavLink href="/admin" icon={Shield} accent>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {email && (
            <span className="hidden text-xs text-ink-muted xl:inline">
              {email}
            </span>
          )}
          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-full border border-paper-line bg-paper px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-ink/15 hover:bg-paper-warm hover:text-ink"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </form>
        </div>
      </div>
    </header>
    </>
  );
}

function NavLink({
  href,
  icon: Icon,
  children,
  accent,
}: {
  href: string;
  icon: typeof Users;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        accent
          ? "inline-flex items-center gap-1.5 rounded-full bg-gold-50 px-2.5 py-1.5 text-gold-600 ring-1 ring-inset ring-gold-100 transition-colors hover:bg-gold-100"
          : "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-ink-muted transition-colors hover:bg-paper-warm hover:text-ink"
      }
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden md:inline">{children}</span>
    </Link>
  );
}
