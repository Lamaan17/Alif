"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Mode = "magic" | "password";

export default function LoginForm({
  next,
  error: initialError,
}: {
  next?: string;
  error?: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "working" | "sent">("idle");
  const [error, setError] = useState<string | null>(
    initialError ? decodeURIComponent(initialError) : null,
  );

  const redirectTo = (() => {
    if (typeof window === "undefined") return undefined;
    const base = `${window.location.origin}/auth/callback`;
    return next ? `${base}?next=${encodeURIComponent(next)}` : base;
  })();

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("working");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: true,
      },
    });
    if (error) {
      setStatus("idle");
      setError(error.message);
      return;
    }
    setStatus("sent");
  }

  async function passwordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("working");

    // Try sign-in first, fall back to sign-up if user doesn't exist.
    const signIn = await supabase.auth.signInWithPassword({ email, password });
    if (!signIn.error) {
      router.push(next ?? "/dashboard");
      router.refresh();
      return;
    }

    // Heuristic: "Invalid login credentials" — try sign-up.
    const msg = signIn.error.message.toLowerCase();
    if (msg.includes("invalid") || msg.includes("credentials")) {
      const signUp = await supabase.auth.signUp({ email, password });
      if (signUp.error) {
        setStatus("idle");
        setError(signUp.error.message);
        return;
      }
      // If "Confirm email" is OFF in Supabase, session is set immediately.
      if (signUp.data.session) {
        router.push("/onboarding");
        router.refresh();
        return;
      }
      // Otherwise, user must confirm via email.
      setStatus("idle");
      setError(
        "Account created — check your email to confirm, then sign in again. (Or turn off email confirmation in Supabase → Auth → Providers → Email for instant access.)",
      );
      return;
    }

    setStatus("idle");
    setError(signIn.error.message);
  }

  async function signInWithGoogle() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) setError(error.message);
  }

  if (status === "sent") {
    return (
      <div className="text-center">
        <div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-moss-50 text-moss-600 ring-1 ring-inset ring-moss-100">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-base font-semibold tracking-tight text-ink">
          Check your email
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          We sent a magic link to <span className="font-medium text-ink">{email}</span>.
          Click it to finish signing in.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-5 text-xs text-ink-muted underline underline-offset-2 hover:text-ink"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div>
      <form
        onSubmit={mode === "magic" ? sendMagicLink : passwordSubmit}
        className="space-y-3"
      >
        <label className="block text-xs font-medium tracking-wide text-ink-muted">
          Email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-full border border-paper-line bg-paper-warm/60 px-10 py-2.5 text-sm text-ink placeholder:text-ink-muted/70 focus:border-moss-500/50 focus:bg-paper focus:outline-none focus:ring-4 focus:ring-moss-500/10"
          />
        </div>

        {mode === "password" && (
          <>
            <label className="block text-xs font-medium tracking-wide text-ink-muted">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
              <input
                type="password"
                required
                minLength={6}
                autoComplete="current-password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-full border border-paper-line bg-paper-warm/60 px-10 py-2.5 text-sm text-ink placeholder:text-ink-muted/70 focus:border-moss-500/50 focus:bg-paper focus:outline-none focus:ring-4 focus:ring-moss-500/10"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={
            status === "working" ||
            !email ||
            (mode === "password" && password.length < 6)
          }
          className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "working"
            ? mode === "magic"
              ? "Sending…"
              : "Working…"
            : mode === "magic"
            ? "Send magic link"
            : "Continue"}
          {status !== "working" && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>

      <div className="my-4 text-center">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setMode(mode === "magic" ? "password" : "magic");
          }}
          className="text-xs text-ink-muted underline underline-offset-2 hover:text-ink"
        >
          {mode === "magic"
            ? "Or use email + password"
            : "Or use a magic link"}
        </button>
      </div>

      <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wider text-ink-muted">
        <div className="h-px flex-1 bg-paper-line" />
        or
        <div className="h-px flex-1 bg-paper-line" />
      </div>

      <button
        type="button"
        onClick={signInWithGoogle}
        className="btn-secondary w-full"
      >
        <GoogleIcon className="h-4 w-4" />
        Continue with Google
      </button>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50/60 px-3 py-2 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.22-4.74 3.22-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.28-1.93-6.15-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.85 14.12A6.6 6.6 0 0 1 5.5 12c0-.74.13-1.45.35-2.12V7.04H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.96l3.67-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.4c1.62 0 3.06.56 4.2 1.65l3.15-3.15C17.45 2.16 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.67 2.84C6.72 7.34 9.14 5.4 12 5.4z"
      />
    </svg>
  );
}
