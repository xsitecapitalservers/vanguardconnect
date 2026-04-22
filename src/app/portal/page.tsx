import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, BookOpen, Flame, Target, Trophy } from "lucide-react";
import { ProgressRings } from "@/components/portal/progress-rings";

export default async function PortalDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: enrollments }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
    supabase
      .from("enrollments")
      .select("*, course:courses(*)")
      .eq("user_id", user!.id)
      .order("purchased_at", { ascending: false })
      .limit(6),
  ]);

  const firstName = (profile?.display_name ?? "there").split(" ")[0];
  const activeCourses = enrollments?.filter((e) => e.status === "active") ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Greeting */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="mt-1 font-display text-4xl md:text-5xl">
            Welcome back, <span className="text-primary">{firstName}</span>.
          </h1>
        </div>
        <Button variant="gradient" asChild>
          <Link href="/portal/courses">
            Continue learning <ArrowRight />
          </Link>
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard icon={Flame} label="Current streak" value={`${profile?.streak_days ?? 0} days`} hue="amber" />
        <StatCard icon={Trophy} label="Total XP" value={profile?.xp ?? 0} hue="indigo" />
        <StatCard icon={BookOpen} label="Active courses" value={activeCourses.length} hue="emerald" />
        <StatCard icon={Target} label="Weekly goal" value="4 / 7 days" hue="rose" />
      </div>

      {/* Rings + Continue */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pick up where you left off</CardTitle>
            <CardDescription>Your most recent courses.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeCourses.length === 0 ? (
              <EmptyState />
            ) : (
              activeCourses.slice(0, 3).map((enrollment) => {
                const course = (enrollment as { course: { slug: string; title: string; subtitle: string | null } | null }).course;
                if (!course) return null;
                return (
                  <Link
                    key={enrollment.id}
                    href={`/portal/courses/${course.slug}`}
                    className="group block rounded-xl border border-border p-4 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold">{course.title}</h3>
                        <p className="mt-0.5 text-sm text-muted-foreground">{course.subtitle}</p>
                        <div className="mt-3 flex items-center gap-3">
                          <Progress value={Number(enrollment.progress_pct)} className="h-1.5 flex-1" />
                          <span className="text-xs font-medium text-muted-foreground">
                            {Math.round(Number(enrollment.progress_pct))}%
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="mt-1 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                    </div>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your rings</CardTitle>
            <CardDescription>Today&apos;s activity.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressRings watchPct={65} quizPct={82} streakPct={(profile?.streak_days ?? 0) % 7 * 14} />
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Watch time</span>
                <span className="font-medium">26 / 40 min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quiz accuracy</span>
                <span className="font-medium">82%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Streak</span>
                <span className="font-medium">{profile?.streak_days ?? 0} days</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cohort feed placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Cohort feed</CardTitle>
          <CardDescription>What classmates are up to.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { who: "Sam", what: "just earned the 30-day streak badge", when: "2m" },
            { who: "Priya", what: "completed Module 3: Advanced Techniques", when: "12m" },
            { who: "Kai", what: "scored 100% on Quiz: Foundations", when: "1h" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
              <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-primary to-brand-700" />
              <p className="flex-1 text-sm">
                <span className="font-medium">{item.who}</span>{" "}
                <span className="text-muted-foreground">{item.what}</span>
              </p>
              <Badge variant="secondary">{item.when}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hue,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  hue: "amber" | "indigo" | "emerald" | "rose";
}) {
  const hueClass = {
    amber: "from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-400",
    indigo: "from-primary/20 to-primary/5 text-primary",
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:text-emerald-400",
    rose: "from-rose-500/20 to-rose-500/5 text-rose-600 dark:text-rose-400",
  }[hue];

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${hueClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-border p-8 text-center">
      <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" />
      <p className="mt-3 text-sm font-medium">No courses yet</p>
      <p className="mt-1 text-sm text-muted-foreground">Browse the catalog to get started.</p>
      <Button asChild size="sm" className="mt-4">
        <Link href="/courses">Explore courses</Link>
      </Button>
    </div>
  );
}
