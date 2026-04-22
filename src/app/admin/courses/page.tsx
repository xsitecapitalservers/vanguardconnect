import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function AdminCoursesPage() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-4xl">Courses</h1>
          <p className="mt-1 text-muted-foreground">Create, edit, and publish the catalog.</p>
        </div>
        <Button asChild variant="gradient">
          <Link href="/admin/courses/new">
            <Plus /> New course
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(courses ?? []).map((c) => (
          <Link key={c.id} href={`/admin/courses/${c.id}`}>
            <Card className="overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg">
              <div className="h-24 bg-gradient-to-br from-primary/40 via-brand-600/40 to-accent-amber/30" />
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <Badge variant={c.is_published ? "success" : "secondary"}>
                    {c.is_published ? "Published" : "Draft"}
                  </Badge>
                  <span className="font-mono text-sm">
                    {formatCurrency(c.price_cents, c.currency)}
                  </span>
                </div>
                <h3 className="mt-3 font-semibold">{c.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.subtitle}</p>
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
