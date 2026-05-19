"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";

export default function LoginForm({
  next,
  error: initialError,
}: {
  next?: string;
  error?: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "working">("idle");
  const [error, setError] = useState<string | null>(
    initialError ? decodeURIComponent(initialError) : null,
  );
  const [notice, setNotice] = useState<string | null>(null);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setNotice(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setStatus("working");

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setStatus("idle");
        const m = error.message.toLowerCase();
        if (m.includes("invalid") || m.includes("credentials")) {
          setError(
            "Wrong email or password. If you don't have an account yet, switch to Create account.",
          );
        } else {
          setError(error.message);
        }
        return;
      }
      router.push(next ?? "/dashboard");
      router.refresh();
      return;
    }

    // sign up
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setStatus("idle");
      const m = error.message.toLowerCase();
      if (m.includes("already")) {
        setError("An account already exists for this email — switch to Sign in.");
      } else {
        setError(error.message);
      }
      return;
    }
    if (data.session) {
      router.push("/onboarding");
      router.refresh();
      return;
    }
    // No session means email confirmation is on — surface that clearly.
    setStatus("idle");
    setNotice(
      "Account created. Check your email to confirm, then come back and sign in.",
    );
  }

  return (
    <div>
      {/* Tab toggle */}
      <div className="mb-5 flex rounded-full border border-paper-line bg-paper p-1">
        <Tab on={mode === "signin"} onClick={() => switchMode("signin")}>
          Sign in
        </Tab>
        <Tab on={mode === "signup"} onClick={() => switchMode("signup")}>
          Create account
        </Tab>
      </div>

      <form onSubmit={submit} className="space-y-3">
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
            className="w-full rounded-full border border-paper-line bg-paper-warm/60 px-10 py-2.5 text-sm text-ink placeholder:text-ink-muted/70 focus:border-ink/30 focus:bg-paper focus:outline-none focus:ring-4 focus:ring-ink/10"
          />
        </div>

        <label className="block text-xs font-medium tracking-wide text-ink-muted">
          Password
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="password"
            required
            minLength={6}
            autoComplete={
              mode === "signin" ? "current-password" : "new-password"
            }
            placeholder={mode === "signup" ? "At least 6 characters" : ""}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-full border border-paper-line bg-paper-warm/60 px-10 py-2.5 text-sm text-ink placeholder:text-ink-muted/70 focus:border-ink/30 focus:bg-paper focus:outline-none focus:ring-4 focus:ring-ink/10"
          />
        </div>

        <button
          type="submit"
          disabled={
            status === "working" || !email || password.length < 6
          }
          className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "working" ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Working…
            </>
          ) : (
            <>
              {mode === "signin" ? "Sign in" : "Create account"}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <div className="mt-4 rounded-xl border border-paper-line bg-paper-warm px-3 py-2 text-xs text-ink-soft">
          {notice}
        </div>
      )}
    </div>
  );
}

function Tab({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
        on
          ? "bg-ink text-paper-deep"
          : "text-ink-muted hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
