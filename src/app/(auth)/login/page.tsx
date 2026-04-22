import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/vanguard";
import { LoginForm } from "./login-form";

// useSearchParams() in LoginForm requires the page to be dynamic
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Card variant="editorial" className="bg-[hsl(var(--bg-1))]">
      <CardHeader className="text-center">
        <Eyebrow>Return · Sign in</Eyebrow>
        <CardTitle className="mt-2 text-[28px]">Welcome back</CardTitle>
        <CardDescription>Sign in to continue where you left off.</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<div className="h-[320px]" />}>
          <LoginForm />
        </Suspense>
        <p className="mt-8 text-center text-[13px] text-[hsl(var(--fg-3))]">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-[hsl(var(--fg-1))] underline decoration-[0.5px] decoration-[hsl(var(--gold))] underline-offset-4 hover:decoration-[hsl(var(--fg-1))]"
          >
            Request access
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
