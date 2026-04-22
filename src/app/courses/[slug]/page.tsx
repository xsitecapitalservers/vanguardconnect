import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BuyButton } from "./buy-button";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

type Params = { params: Promise<{ slug: string }> };

export default async function PublicCoursePage({ params }: Params) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*, modules(title, lessons(title, is_free_preview))")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!course) notFound();

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-spotlight" aria-hidden />
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-16">
        <Link href="/courses" className="text-sm text-muted-foreground hover:text-foreground">
          ← All courses
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-[1fr_320px]">
          <div>
            <Badge className="capitalize">{course.difficulty}</Badge>
            <h1 className="mt-3 font-display text-5xl leading-tight">{course.title}</h1>
            <p className="mt-3 text-lg text-muted-foreground">{course.subtitle}</p>
            {course.description && (
              <p className="mt-6 whitespace-pre-wrap text-foreground/80">{course.description}</p>
            )}

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Curriculum</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {((course as { modules?: Array<{ title: string; lessons?: Array<{ title: string; is_free_preview: boolean }> }> }).modules ?? []).map((m, i) => (
                  <div key={i}>
                    <p className="text-sm font-semibold">
                      {i + 1}. {m.title}
                    </p>
                    <ul className="mt-1 ml-4 space-y-0.5 text-sm text-muted-foreground">
                      {(m.lessons ?? []).map((l, j) => (
                        <li key={j} className="flex items-center gap-2">
                          <span>{l.title}</span>
                          {l.is_free_preview && (
                            <Badge variant="secondary" className="text-[10px]">Preview</Badge>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <aside className="md:sticky md:top-8 md:h-fit">
            <Card className="border-primary/40">
              <CardContent className="p-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Price</p>
                <p className="mt-1 font-display text-4xl">
                  {formatCurrency(course.price_cents, course.currency)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">One-time. Yours forever.</p>
                <BuyButton courseId={course.id} />
                <ul className="mt-5 space-y-1.5 text-sm text-muted-foreground">
                  <li>✓ Lifetime access</li>
                  <li>✓ Downloadable resources</li>
                  <li>✓ Completion certificate</li>
                  <li>✓ 14-day money-back guarantee</li>
                </ul>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
