import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Nav() {
  let signedIn = false;
  let hasProfile = false;

  // Safe-fail when env vars aren't set yet
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      signedIn = true;
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();
      hasProfile = !!profile;
    }
  } catch {
    // Not configured yet — treat as signed out.
  }

  const primaryHref = signedIn
    ? hasProfile
      ? "/dashboard"
      : "/onboarding"
    : "/login";
  const primaryLabel = signedIn
    ? hasProfile
      ? "Open dashboard"
      : "Finish profile"
    : "Join the Community";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-paper-line/70 bg-paper/80 backdrop-blur supports-[backdrop-filter]:bg-paper/60">
      <div className="container-prose flex h-16 items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="wordmark">alif</span>
          <span className="text-lg font-medium text-ink-muted">build</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-ink-muted md:flex">
          <a href="#how" className="transition-colors hover:text-ink">
            How it works
          </a>
          <a href="#sprints" className="transition-colors hover:text-ink">
            Sprints
          </a>
          <a href="#journey" className="transition-colors hover:text-ink">
            Journey
          </a>
          <a href="/community" className="transition-colors hover:text-ink">
            Community
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {!signedIn && (
            <Link
              href="/login"
              className="hidden text-sm text-ink-muted transition-colors hover:text-ink sm:inline-flex"
            >
              Sign in
            </Link>
          )}
          <Link href={primaryHref} className="btn-primary">
            {primaryLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}
