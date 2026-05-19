import LoginForm from "./LoginForm";
import Link from "next/link";

export const metadata = { title: "Sign in — alif·build" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-paper-deep">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-grid-faint [background-size:28px_28px] opacity-30 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
      />
      <div className="container-prose flex min-h-screen flex-col">
        <header className="flex h-16 items-center">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="wordmark">alif</span>
            <span className="text-lg font-medium text-ink-muted">build</span>
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-md">
            <div className="text-center">
              <span className="eyebrow">
                <span className="eyebrow-dot" />
                Members only
              </span>
              <h1 className="mt-5 font-display font-semibold text-3xl tracking-tight sm:text-4xl"
                  style={{ letterSpacing: "-0.03em" }}>
                Sign in or create an account
              </h1>
              <p className="lead mt-3 text-sm">
                Email + password. That&rsquo;s it.
              </p>
            </div>

            <div className="mt-8 rounded-xl2 border border-paper-line bg-paper p-6 shadow-card">
              <LoginForm next={searchParams.next} error={searchParams.error} />
            </div>

            <p className="mt-6 text-center text-xs text-ink-muted">
              By signing in you agree to the ALIF community{" "}
              <a href="#" className="underline underline-offset-2 hover:text-ink">
                code of conduct
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
