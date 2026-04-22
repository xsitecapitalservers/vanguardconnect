import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplyForm } from "./apply-form";
import Link from "next/link";

type Params = { params: Promise<{ slug: string }> };

export default async function ProgramApplyPage({ params }: Params) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: program } = await supabase
    .from("programs")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!program) notFound();

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-spotlight" aria-hidden />
      <div className="relative z-10 mx-auto max-w-2xl px-6 py-16">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Home
        </Link>
        <div className="mt-6 text-center">
          <h1 className="font-display text-5xl">{program.name}</h1>
          <p className="mt-3 text-muted-foreground">{program.description}</p>
        </div>

        <Card className="mt-10 border-border/60 bg-card/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Apply</CardTitle>
            <CardDescription>
              We read every application. Expect a response in 3–5 business days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ApplyForm programId={program.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
