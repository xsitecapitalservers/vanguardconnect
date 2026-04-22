import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/vanguard";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <Card variant="editorial" className="bg-[hsl(var(--bg-1))]">
      <CardHeader className="text-center">
        <Eyebrow>Admission · Request access</Eyebrow>
        <CardTitle className="mt-2 text-[28px]">Create your account</CardTitle>
        <CardDescription>
          A composed workspace for the institutions that set the standard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm />
        <p className="mt-8 text-center text-[13px] text-[hsl(var(--fg-3))]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-[hsl(var(--fg-1))] underline decoration-[0.5px] decoration-[hsl(var(--gold))] underline-offset-4 hover:decoration-[hsl(var(--fg-1))]"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
