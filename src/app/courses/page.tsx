import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VCBrand, Eyebrow, GoldRule } from "@/components/ui/vanguard";
import { ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function PublicCoursesPage() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="relative min-h-screen bg-[hsl(var(--bg-1))] text-[hsl(var(--fg-1))]">
      <div className="pointer-events-none absolute inset-0 bg-noise" aria-hidden />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10 flex items-center justify-between">
          <Link href="/" aria-label="Vanguard Connect — Home">
            <VCBrand size="sm" />
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>

        <GoldRule />

        <header className="py-12">
          <Eyebrow>The Catalog · Spring Cohort</Eyebrow>
          <h1 className="mt-4 font-display text-[56px] font-medium leading-[1.02] tracking-[-0.015em] md:text-[72px]">
            Course catalog
          </h1>
          <p className="mt-4 max-w-2xl font-editorial text-[19px] leading-[1.55] text-[hsl(var(--fg-2))]">
            Self-paced, deeply crafted, outcome-focused. Every course is read,
            not processed.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-0 border-t-[0.5px] border-[hsl(var(--rule))] md:grid-cols-2 md:divide-x md:divide-[hsl(var(--rule))] lg:grid-cols-3">
          {(courses ?? []).map((c, i) => (
            <Link
              key={c.id}
              href={`/courses/${c.slug}`}
              className="group block border-b-[0.5px] border-[hsl(var(--rule))] p-6 transition-colors hover:bg-[hsl(var(--bg-2))]"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--gold-deep))]">
                  №&nbsp;{String(i + 1).padStart(2, "0")}
                </span>
                <Badge variant="outline" className="capitalize">
                  {c.difficulty}
                </Badge>
              </div>
              <h3 className="mt-6 font-display text-[22px] font-medium leading-tight tracking-[-0.01em]">
                {c.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-[hsl(var(--fg-3))]">
                {c.subtitle}
              </p>
              <div className="mt-8 flex items-center justify-between">
                <span className="font-mono text-[13px] font-medium numerals-tabular">
                  {formatCurrency(c.price_cents, c.currency)}
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--fg-3))] transition-colors group-hover:text-[hsl(var(--fg-1))]">
                  Review <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
          {(!courses || courses.length === 0) && (
            <Card variant="flat" className="col-span-full border-b-[0.5px] border-[hsl(var(--rule))]">
              <CardContent className="p-12 text-center">
                <p className="text-[14px] text-[hsl(var(--fg-3))]">
                  Courses are publishing soon. Check back.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
