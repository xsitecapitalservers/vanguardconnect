import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/vanguard";

export const dynamic = "force-dynamic";

export default async function AuthCodeErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const params = await searchParams;
  const reason = params?.reason;

  return (
    <Card variant="editorial" className="bg-[hsl(var(--bg-1))]">
      <CardHeader className="text-center">
        <Eyebrow>Verification · Issue detected</Eyebrow>
        <CardTitle className="mt-2 text-[28px]">This link couldn&apos;t be verified</CardTitle>
        <CardDescription>
          The confirmation link is invalid or has already been used.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {reason && (
          <div className="rounded-[2px] border-[0.5px] border-[hsl(var(--rule))] bg-[hsl(var(--bg-2))] p-4">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--fg-3))]">
              Details
            </p>
            <p className="mt-1 text-[13px] text-[hsl(var(--fg-2))]">{reason}</p>
          </div>
        )}

        <div className="space-y-2 text-[13px] text-[hsl(var(--fg-3))]">
          <p>Common causes:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>The link has expired (links are valid for a limited time).</li>
            <li>The link has already been used.</li>
            <li>You opened the link in a different browser than the one you signed up in.</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="flex-1">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/signup">Request a new link</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
