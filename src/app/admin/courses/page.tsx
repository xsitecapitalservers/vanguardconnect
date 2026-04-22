import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/vanguard";
import { Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function AdminCoursesPage() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex items-end justify-between border-b-[0.5px] border-[hsl(var(--rule))] pb-6">
        <div>
          <Eyebrow>Editorial Desk · Curriculum</Eyebrow>
          <h1 className="mt-3 font-display text-[40px] font-medium leading-[1.05] tracking-[-0.015em]">
            Courses
          </h1>
          <p className="mt-2 text-[14px] text-[hsl(var(--fg-3))]">
            Create, edit, and publish the catalog.
          </p>
        </div>
        <Button asChild variant="default">
          <Link href="/admin/courses/new">
            <Plus /> New course
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(courses ?? []).map((c, i) => (
          <Link key={c.id} href={`/admin/courses/${c.id}`}>
            <Card variant="editorial" className="overflow-hidden transition-colors hover:border-t-[hsl(var(--fg-1))]">
              <div className="relative h-24 bg-[hsl(var(--bg-2))] border-b-[0.5px] border-[hsl(var(--rule))]">
                <span className="absolute left-5 top-4 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--gold-deep))]">
                  №&nbsp;{String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <Badge variant={c.is_published ? "success" : "muted"}>
                    {c.is_published ? "Published" : "Draft"}
                  </Badge>
                  <span className="font-mono text-[12px] font-medium numerals-tabular">
                    {formatCurrency(c.price_cents, c.currency)}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-[18px] font-medium leading-tight">{c.title}</h3>
                <p className="mt-1 line-clamp-2 text-[13px] text-[hsl(var(--fg-3))]">{c.subtitle}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
        {(!courses || courses.length === 0) && (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center">
              <h3 className="text-lg font-semibold">No courses yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">Create your first course to get started.</p>
              <Button asChild className="mt-4">
                <Link href="/admin/courses/new">
                  <Plus /> New course
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
