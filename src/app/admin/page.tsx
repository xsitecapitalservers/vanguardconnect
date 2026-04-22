import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowUpRight, TrendingUp, Users, DollarSign, ClipboardCheck, GraduationCap } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: studentCount },
    { count: activeApplications },
    { data: recentOrders },
    { count: publishedCourses },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).in("role", ["student", "applicant"]),
    supabase.from("applications").select("*", { count: "exact", head: true }).in("stage", ["submitted", "screening", "interview"]),
    supabase.from("orders").select("*").eq("status", "succeeded").order("created_at", { ascending: false }).limit(5),
    supabase.from("courses").select("*", { count: "exact", head: true }).eq("is_published", true),
  ]);

  const mrr = (recentOrders ?? []).reduce((sum, o) => sum + (o.amount_cents ?? 0), 0);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-4xl md:text-5xl">Control Center</h1>
          <p className="mt-1 text-muted-foreground">Everything that matters, at a glance.</p>
        </div>
        <Button asChild variant="gradient">
          <Link href="/admin/applications">
            Review queue <ArrowUpRight />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard
          icon={Users}
          label="Students"
          value={studentCount ?? 0}
          trend="+12% MoM"
          tone="indigo"
        />
        <KpiCard
          icon={ClipboardCheck}
          label="Applications in queue"
          value={activeApplications ?? 0}
          trend="3 new today"
          tone="amber"
        />
        <KpiCard
          icon={DollarSign}
          label="Recent revenue"
          value={formatCurrency(mrr)}
          trend="+18% WoW"
          tone="emerald"
        />
        <KpiCard
          icon={GraduationCap}
          label="Published courses"
          value={publishedCourses ?? 0}
          trend="2 in draft"
          tone="rose"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Revenue trend</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </div>
              <Badge variant="success" className="gap-1">
                <TrendingUp className="h-3 w-3" /> 18.4%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-end gap-1">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-gradient-to-t from-primary/20 to-primary"
                  style={{ height: `${30 + Math.sin(i / 3) * 30 + i * 1.3}%` }}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review queue</CardTitle>
            <CardDescription>Applications awaiting your decision.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { name: "Jordan Reese", stage: "screening" },
              { name: "Mira Chen", stage: "interview" },
              { name: "Eli Navarro", stage: "submitted" },
            ].map((a) => (
              <Link
                key={a.name}
                href="/admin/applications"
                className="flex items-center justify-between rounded-lg border border-border p-3 text-sm transition-colors hover:bg-accent"
              >
                <span className="font-medium">{a.name}</span>
                <Badge variant="warning" className="capitalize">{a.stage}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  trend,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend: string;
  tone: "indigo" | "amber" | "emerald" | "rose";
}) {
  const toneClass = {
    indigo: "from-primary/20 to-primary/5 text-primary",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-400",
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:text-emerald-400",
    rose: "from-rose-500/20 to-rose-500/5 text-rose-600 dark:text-rose-400",
  }[tone];

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${toneClass}`}>
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-[11px] text-muted-foreground">{trend}</span>
        </div>
        <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
