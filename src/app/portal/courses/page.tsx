import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/vanguard";
import { BookOpen, Clock } from "lucide-react";

export default async function MyCoursesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*, course:courses(*)")
    .eq("user_id", user!.id)
    .order("purchased_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="border-b-[0.5px] border-[hsl(var(--rule))] pb-6">
        <Eyebrow>Portal · My Record</Eyebrow>
        <h1 className="mt-3 font-display text-[40px] font-medium leading-[1.05] tracking-[-0.015em]">
          My Curriculum
        </h1>
        <p className="mt-2 text-[14px] text-[hsl(var(--fg-3))]">
          Everything you&apos;ve purchased, all in one place.
        </p>
      </div>

      {!enrollments || enrollments.length === 0 ? (
        <Card variant="editorial">
          <CardContent className="p-12 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-[hsl(var(--fg-4))]" strokeWidth={1.5} />
            <p className="mt-4 font-display text-[20px] font-medium">No courses yet</p>
            <p className="mt-1 text-[13px] text-[hsl(var(--fg-3))]">
              Browse the catalog to find your next course.
            </p>
            <Button asChild variant="outline" className="mt-6">
              <Link href="/courses">Explore catalog</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment, i) => {
            const course = (enrollment as {
              course: {
                slug: string;
                title: string;
                subtitle: string | null;
                cover_image: string | null;
                duration_minutes: number | null;
              } | null;
            }).course;
            if (!course) return null;
            return (
              <Link
                key={enrollment.id}
                href={`/portal/courses/${course.slug}`}
                className="group"
              >
                <Card variant="editorial" className="overflow-hidden transition-colors hover:border-t-[hsl(var(--fg-1))]">
                  <div className="relative h-28 bg-[hsl(var(--bg-2))] border-b-[0.5px] border-[hsl(var(--rule))]">
                    {course.cover_image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={course.cover_image}
                        alt=""
                        className="h-full w-full object-cover opacity-90"
                      />
                    )}
                    <span className="absolute left-5 top-4 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--gold-deep))]">
                      №&nbsp;{String(i + 1).padStart(2, "0")}
                    </span>
                    <Badge variant="outline" className="absolute right-3 top-3 bg-[hsl(var(--bg-1))]">
                      {enrollment.status}
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-display text-[18px] font-medium leading-tight">
                      {course.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-[13px] text-[hsl(var(--fg-3))]">
                      {course.subtitle}
                    </p>
                    <div className="mt-5 space-y-2">
                      <Progress value={Number(enrollment.progress_pct)} />
                      <div className="flex items-center justify-between font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--fg-3))]">
                        <span>{Math.round(Number(enrollment.progress_pct))}% complete</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {course.duration_minutes ?? 0}m
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
