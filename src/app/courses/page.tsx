import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function PublicCoursesPage() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-spotlight" aria-hidden />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <header className="mb-10 flex items-end justify-between">
          <div>
            <Link href="/" className="mb-4 inline-flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-brand-700" />
              <span className="font-display text-xl">Vanguard</span>
            </Link>
            <h1 className="font-display text-5xl md:text-6xl">Course catalog</h1>
            <p className="mt-2 text-muted-foreground">Self-paced, deeply crafted, outcome-focused.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/login">Sign in</Link>
          </Button>
        </header>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {(courses ?? []).map((c) => (
            <Link key={c.id} href={`/courses/${c.slug}`} className="group">
              <Card className="h-full overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className="relative h-40 bg-gradient-to-br from-primary/40 via-brand-600/40 to-accent-amber/30">
                  {c.cover_image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.cover_image} alt="" className="h-full w-full object-cover" />
                  )}
                  <Badge className="absolute right-3 top-3 bg-black/60 text-white capitalize backdrop-blur">
                    {c.difficulty}
                  </Badge>
                </div>
                <CardContent className="p-5">
                  <h3 className="font-semibold group-hover:text-primary">{c.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.subtitle}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-mono text-sm">{formatCurrency(c.price_cents, c.currency)}</span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary">
                      View <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {(!courses || courses.length === 0) && (
            <Card className="col-span-full">
              <CardContent className="p-12 text-center">
                <p className="text-sm text-muted-foreground">
                  Courses are publishing soon. Check back!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
