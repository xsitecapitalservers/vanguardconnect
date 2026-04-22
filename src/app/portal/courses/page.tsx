import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
      <div>
        <h1 className="font-display text-4xl">My Courses</h1>
        <p className="mt-1 text-muted-foreground">Everything you&apos;ve purchased, all in one place.</p>
      </div>

      {!enrollments || enrollments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No courses yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Browse the catalog to find your next course.</p>
            <Button asChild className="mt-4">
              <Link href="/courses">Explore catalog</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => {
            const course = (enrollment as { course: { slug: string; title: string; subtitle: string | null; cover_image: string | null; duration_minutes: number | null } | null }).course;
            if (!course) return null;
            return (
              <Link
                key={enrollment.id}
                href={`/portal/courses/${course.slug}`}
                className="group"
              >
                <Card className="overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative h-32 bg-gradient-to-br from-primary/40 via-brand-600/40 to-accent-amber/30">
                    {course.cover_image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={course.cover_image} alt="" className="h-full w-full object-cover" />
                    )}
                    <Badge
                      variant="default"
                      className="absolute right-3 top-3 bg-black/60 text-white backdrop-blur"
                    >
                      {enrollment.status}
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-semibold group-hover:text-primary">{course.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {course.subtitle}
                    </p>
                    <div className="mt-4 space-y-2">
                      <Progress value={Number(enrollment.progress_pct)} />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
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
