import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/courses",
  "/programs",
  "/auth/callback",
  "/auth/auth-code-error",
  "/api/stripe/webhook",
  "/api/mux/webhook",
];

const TEAM_ROLES = new Set(["admin", "coach", "reviewer", "owner"]);

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Unauthenticated → send to login for protected routes
  if (!user && !isPublic(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user) {
    // Fetch role + deactivation from profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, deactivated_at")
      .eq("id", user.id)
      .single();

    // Deactivated users are signed out and sent to login with a notice
    if (profile?.deactivated_at) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "deactivated");
      return NextResponse.redirect(url);
    }

    const role = profile?.role ?? "student";
    const isTeam = TEAM_ROLES.has(role);

    // Admin paths guard
    if (pathname.startsWith("/admin") && !isTeam) {
      const url = request.nextUrl.clone();
      url.pathname = "/portal";
      return NextResponse.redirect(url);
    }

    // Portal paths guard — let team in too for impersonation, but redirect bare /portal if team
    if (pathname === "/login" || pathname === "/signup") {
      const url = request.nextUrl.clone();
      url.pathname = isTeam ? "/admin" : "/portal";
      return NextResponse.redirect(url);
    }
  }

  return response;
}
