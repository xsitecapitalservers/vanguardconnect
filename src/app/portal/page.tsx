import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eyebrow, HairRule } from "@/components/ui/vanguard";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Flame, Target, Trophy } from "lucide-react";
import { ProgressRings } from "@/components/portal/progress-rings";
import { initials } from "@/lib/utils";

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
    <div className="mx-auto max-w-6xl space-y-10">
      {/* Greeting — editorial masthead */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-[0.5px] border-[hsl(var(--rule))] pb-6">
        <div>
          <Eyebrow>
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Eyebrow>
          <h1 className="mt-3 font-display text-[40px] font-medium leading-[1.05] tracking-[-0.015em] md:text-[52px]">
            Welcome back,{" "}
            <span className="italic-editorial font-normal">{firstName}.</span>
          </h1>
        </div>
        <Button variant="default" asChild>
          <Link href="/portal/courses">
            Continue learning <ArrowUpRight />
          </Link>
        </Button>
      </div>

      {/* Stat cards — editorial ledger entries */}
      <div className="grid grid-cols-2 gap-px bg-[hsl(var(--rule))] md:grid-cols-4">
        <StatCard icon={Flame} label="Current streak" value={`${profile?.streak_days ?? 0}`} unit="days" />
        <StatCard icon={Trophy} label="Total XP" value={String(profile?.xp ?? 0)} unit="points" />
        <StatCard icon={BookOpen} label="Active courses" value={String(activeCourses.length)} unit="in progress" />
        <StatCard icon={Target} label="Weekly goal" value="4 / 7" unit="days met" />
      </div>

      {/* Rings + Continue */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card variant="editorial" className="lg:col-span-2">
          <CardHeader>
            <Eyebrow>Section I · Resume</Eyebrow>
            <CardTitle>Pick up where you left off</CardTitle>
            <CardDescription>Your most recent courses.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeCourses.length === 0 ? (
              <EmptyState />
            ) : (
              activeCourses.slice(0, 3).map((enrollment) => {
                const course = (enrollment as {
                  course: { slug: string; title: string; subtitle: string | null } | null;
                }).course;
                if (!course) return null;
                return (
                  <Link
                    key={enrollment.id}
                    href={`/portal/courses/${course.slug}`}
                    className="group block border-[0.5px] border-[hsl(var(--rule))] rounded-[2px] p-4 transition-colors hover:border-[hsl(var(--fg-1))]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-display text-[18px] font-medium leading-tight">
                          {course.title}
                        </h3>
                        <p className="mt-1 text-[13px] text-[hsl(var(--fg-3))]">
                          {course.subtitle}
                        </p>
                        <div className="mt-4 flex items-center gap-3">
                          <Progress value={Number(enrollment.progress_pct)} className="flex-1" />
                          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[hsl(var(--fg-3))]">
                            {Math.round(Number(enrollment.progress_pct))}%
                          </span>
                        </div>
                      </div>
                      <ArrowUpRight className="mt-1 h-4 w-4 text-[hsl(var(--fg-4))] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[hsl(var(--fg-1))]" />
                    </div>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card variant="editorial">
          <CardHeader>
            <Eyebrow>Section II · The Day</Eyebrow>
            <CardTitle>Your rings</CardTitle>
            <CardDescription>Today&apos;s activity.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressRings
              watchPct={65}
              quizPct={82}
              streakPct={((profile?.streak_days ?? 0) % 7) * 14}
            />
            <div className="mt-8 space-y-3 border-t-[0.5px] border-[hsl(var(--rule))] pt-4">
              <LedgerRow label="Watch time" value="26 / 40 min" />
              <LedgerRow label="Quiz accuracy" value="82%" />
              <LedgerRow label="Streak" value={`${profile?.streak_days ?? 0} days`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cohort feed — editorial dispatch list */}
      <Card variant="editorial">
        <CardHeader>
          <Eyebrow>Section III · The Cohort</Eyebrow>
          <CardTitle>Dispatches</CardTitle>
          <CardDescription>What classmates are up to.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-0">
          {[
            { who: "Sam", what: "earned the 30-day streak badge", when: "2m" },
            { who: "Priya", what: "completed Module 3 · Advanced Techniques", when: "12m" },
            { who: "Kai", what: "scored 100% on Quiz · Foundations", when: "1h" },
          ].map((item, i, arr) => (
            <div key={i}>
              <div className="flex items-center gap-4 py-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--bg-inverse))] font-display text-[12px] font-medium text-[hsl(var(--bg-1))]">
                  {initials(item.who)}
                </div>
                <p className="flex-1 text-[14px] leading-snug">
                  <span className="font-display font-medium">{item.who}</span>{" "}
                  <span className="text-[hsl(var(--fg-3))]">{item.what}</span>
                </p>
                <Badge variant="outline">{item.when}</Badge>
              </div>
              {i < arr.length - 1 && <HairRule />}
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
  unit,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="bg-[hsl(var(--bg-1))] p-6">
      <div className="flex items-start justify-between">
        <Icon className="h-4 w-4 text-[hsl(var(--gold-deep))]" strokeWidth={1.5} />
        <span className="font-mono text-[9px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--fg-4))]">
          {unit}
        </span>
      </div>
      <p className="mt-6 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--fg-3))]">
        {label}
      </p>
      <p className="mt-2 font-display text-[40px] font-medium leading-none tracking-[-0.02em] numerals-oldstyle">
        {value}
      </p>
    </div>
  );
}

function LedgerRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between font-mono text-[11px]">
      <span className="uppercase tracking-[0.18em] text-[hsl(var(--fg-3))]">{label}</span>
      <span className="font-medium text-[hsl(var(--fg-1))]">{value}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border-[0.5px] border-dashed border-[hsl(var(--rule))] rounded-[2px] p-10 text-center">
      <BookOpen className="mx-auto h-8 w-8 text-[hsl(var(--fg-4))]" strokeWidth={1.5} />
      <p className="mt-4 font-display text-[18px] font-medium">No courses yet</p>
      <p className="mt-1 text-[13px] text-[hsl(var(--fg-3))]">Browse the catalog to get started.</p>
      <Button asChild size="sm" variant="outline" className="mt-6">
        <Link href="/courses">Explore courses</Link>
      </Button>
    </div>
  );
}
