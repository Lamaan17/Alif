import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/dashboard";

  if (!code) {
    const err = encodeURIComponent("Missing auth code");
    return NextResponse.redirect(new URL(`/login?error=${err}`, url.origin));
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const err = encodeURIComponent(error.message);
    return NextResponse.redirect(new URL(`/login?error=${err}`, url.origin));
  }

  // After session is set, decide where to land based on profile existence.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", url.origin));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  const target = profile ? next : "/onboarding";
  return NextResponse.redirect(new URL(target, url.origin));
}
