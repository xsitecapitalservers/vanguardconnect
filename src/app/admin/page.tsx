import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eyebrow, HairRule } from "@/components/ui/vanguard";
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
    <div className="mx-auto max-w-7xl space-y-10">
      <div className="flex items-end justify-between border-b-[0.5px] border-[hsl(var(--rule))] pb-6">
        <div>
          <Eyebrow>Editorial Desk · The Standard</Eyebrow>
          <h1 className="mt-3 font-display text-[40px] font-medium leading-[1.05] tracking-[-0.015em] md:text-[52px]">
            Control Center
          </h1>
          <p className="mt-2 text-[14px] text-[hsl(var(--fg-3))]">
            Everything that matters, at a glance.
          </p>
        </div>
        <Button asChild variant="default">
          <Link href="/admin/applications">
            Review queue <ArrowUpRight />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-px bg-[hsl(var(--rule))] md:grid-cols-4">
        <KpiCard icon={Users} label="Students" value={String(studentCount ?? 0)} trend="+12% MoM" />
        <KpiCard icon={ClipboardCheck} label="Applications · queue" value={String(activeApplications ?? 0)} trend="3 new today" />
        <KpiCard icon={DollarSign} label="Recent revenue" value={formatCurrency(mrr)} trend="+18% WoW" />
        <KpiCard icon={GraduationCap} label="Published courses" value={String(publishedCourses ?? 0)} trend="2 in draft" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card variant="editorial" className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <Eyebrow>Section I · Ledger</Eyebrow>
                <CardTitle>Revenue trend</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </div>
              <Badge variant="success" className="gap-1">
                <TrendingUp className="h-3 w-3" /> 18.4%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-end gap-[3px] border-b-[0.5px] border-[hsl(var(--rule))]">
              {Array.from({ length: 30 }).map((_, i) => {
                const h = 30 + Math.sin(i / 3) * 30 + i * 1.3;
                const emphasize = i === 29;
                return (
                  <div
                    key={i}
                    className={
                      emphasize
                        ? "flex-1 bg-[hsl(var(--gold))]"
                        : "flex-1 bg-[hsl(var(--bg-inverse))]"
                    }
                    style={{ height: `${Math.min(100, h)}%`, opacity: emphasize ? 1 : 0.85 }}
                  />
                );
              })}
            </div>
            <div className="mt-3 flex justify-between font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--fg-4))]">
              <span>Day 1</span>
              <span>Today</span>
            </div>
          </CardContent>
        </Card>

        <Card variant="editorial">
          <CardHeader>
            <Eyebrow>Section II · Queue</Eyebrow>
            <CardTitle>Review queue</CardTitle>
            <CardDescription>Applications awaiting your decision.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-0">
            {[
              { name: "Jordan Reese", stage: "screening" },
              { name: "Mira Chen", stage: "interview" },
              { name: "Eli Navarro", stage: "submitted" },
            ].map((a, i, arr) => (
              <div key={a.name}>
                <Link
                  href="/admin/applications"
                  className="flex items-center justify-between py-3 transition-colors hover:text-[hsl(var(--fg-1))]"
                >
                  <span className="font-display text-[15px] font-medium">{a.name}</span>
                  <Badge variant="outline" className="capitalize">{a.stage}</Badge>
                </Link>
                {i < arr.length - 1 && <HairRule />}
              </div>
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
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  trend: string;
}) {
  return (
    <div className="bg-[hsl(var(--bg-1))] p-6">
      <div className="flex items-start justify-between">
        <Icon className="h-4 w-4 text-[hsl(var(--gold-deep))]" strokeWidth={1.5} />
        <span className="font-mono text-[9px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--fg-4))]">
          {trend}
        </span>
      </div>
      <p className="mt-6 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--fg-3))]">
        {label}
      </p>
      <p className="mt-2 font-display text-[36px] font-medium leading-none tracking-[-0.02em] numerals-oldstyle">
        {value}
      </p>
    </div>
  );
}
