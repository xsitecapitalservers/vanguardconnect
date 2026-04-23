import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Unified auth callback that handles BOTH flows Supabase can use:
 *   1. PKCE code exchange      — `?code=...`
 *   2. Email OTP verification  — `?token_hash=...&type=signup|email|recovery|invite|magiclink|email_change`
 *
 * Newer Supabase projects send the OTP format by default for signup confirmations,
 * so we must handle both to avoid silent failures / 404s after verification.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const { searchParams, origin } = url;

  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/portal";

  // Normalize `next` so it's always a safe relative path
  const safeNext = next.startsWith("/") ? next : `/${next}`;

  const supabase = await createClient();

  // Flow 1: PKCE code exchange (server-side auth, magic link w/ PKCE)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
    console.error("[auth/callback] exchangeCodeForSession failed:", error.message);
    return NextResponse.redirect(
      `${origin}/auth/auth-code-error?reason=${encodeURIComponent(error.message)}`
    );
  }

  // Flow 2: Email OTP verification (email confirmation, password recovery, invite)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
    console.error("[auth/callback] verifyOtp failed:", error.message);
    return NextResponse.redirect(
      `${origin}/auth/auth-code-error?reason=${encodeURIComponent(error.message)}`
    );
  }

  // No usable params present
  return NextResponse.redirect(
    `${origin}/auth/auth-code-error?reason=${encodeURIComponent("Missing auth parameters")}`
  );
}
