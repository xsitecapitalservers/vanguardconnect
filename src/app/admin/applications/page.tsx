import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eyebrow } from "@/components/ui/vanguard";
import { initials, formatRelativeTime } from "@/lib/utils";

const STAGES = ["submitted", "screening", "interview", "approved", "rejected"] as const;
type Stage = (typeof STAGES)[number];

export const dynamic = "force-dynamic";

type AppRow = {
  id: string;
  stage: Stage;
  user_id: string | null;
  program_id: string | null;
  score: number | string | null;
  answers: Record<string, unknown> | null;
  created_at: string;
};

type ProfileLite = {
  id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
};

type ProgramLite = { id: string; name: string };

export default async function ApplicationsQueuePage() {
  // Use admin client so we always see joined data even if RLS gets odd through
  // the new automation insert path. This page is gated by middleware.
  const admin = createAdminClient();

  const { data: applicationsRaw } = await admin
    .from("applications")
    .select("id, stage, user_id, program_id, score, answers, created_at")
    .order("created_at", { ascending: false });

  const applications = (applicationsRaw ?? []) as AppRow[];

  const userIds = Array.from(
    new Set(applications.map((a) => a.user_id).filter(Boolean) as string[])
  );
  const programIds = Array.from(
    new Set(applications.map((a) => a.program_id).filter(Boolean) as string[])
  );

  // Hydrate users (profiles) — fall back to auth.users for any orphans.
  const profilesById = new Map<string, ProfileLite>();
  if (userIds.length) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, display_name, email, avatar_url")
      .in("id", userIds);
    (profiles ?? []).forEach((p) => profilesById.set(p.id as string, p as ProfileLite));
  }
  // For any user_id with no profile row, fetch the auth user as a fallback
  const missing = userIds.filter((id) => !profilesById.has(id));
  for (const id of missing) {
    try {
      const { data } = await admin.auth.admin.getUserById(id);
      if (data?.user) {
        profilesById.set(id, {
          id,
          display_name:
            (data.user.user_metadata?.display_name as string | undefined) ?? null,
          email: data.user.email ?? null,
          avatar_url: null,
        });
      }
    } catch {
      // ignore
    }
  }

  const programsById = new Map<string, ProgramLite>();
  if (programIds.length) {
    const { data: programs } = await admin
      .from("programs")
      .select("id, name")
      .in("id", programIds);
    (programs ?? []).forEach((p) => programsById.set(p.id as string, p as ProgramLite));
  }

  const byStage = STAGES.reduce<Record<Stage, AppRow[]>>((acc, s) => {
    acc[s] = applications.filter((a) => a.stage === s);
    return acc;
  }, {} as Record<Stage, AppRow[]>);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="border-b-[0.5px] border-[hsl(var(--rule))] pb-6">
        <Eyebrow>Editorial Desk · Applications</Eyebrow>
        <h1 className="mt-3 font-display text-[40px] font-medium leading-[1.05] tracking-[-0.015em]">
          Applications
        </h1>
        <p className="mt-2 text-[14px] text-[hsl(var(--fg-3))]">
          Vet, review, and approve candidates. Click any card to see the full submission.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {STAGES.map((stage) => (
          <Card key={stage} variant="editorial" className="flex min-h-[400px] flex-col">
            <CardHeader className="border-b-[0.5px] border-[hsl(var(--rule))] pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm capitalize">{stage}</CardTitle>
                <Badge variant="outline" className="text-[10px]">
                  {byStage[stage]?.length ?? 0}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-2 p-3">
              {(byStage[stage] ?? []).map((app) => {
                const user = app.user_id ? profilesById.get(app.user_id) : null;
                const program = app.program_id ? programsById.get(app.program_id) : null;
                const headline =
                  user?.display_name ||
                  user?.email ||
                  // Last-ditch: pull a name out of answers if the form embedded one
                  (typeof app.answers?.full_name === "string"
                    ? (app.answers.full_name as string)
                    : null) ||
                  (typeof app.answers?.email === "string"
                    ? (app.answers.email as string)
                    : null) ||
                  "Unknown applicant";
                const seed = (user?.display_name || user?.email || headline) ?? "";
                return (
                  <Link
                    key={app.id}
                    href={`/admin/applications/${app.id}`}
                    className="group block rounded-[2px] border-[0.5px] border-[hsl(var(--rule))] bg-[hsl(var(--bg-1))] p-3 transition-all hover:-translate-y-0.5 hover:border-[hsl(var(--fg-1))]"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        {user?.avatar_url && <AvatarImage src={user.avatar_url} alt="" />}
                        <AvatarFallback className="text-[10px]">
                          {initials(seed) || "—"}
                        </AvatarFallback>
                      </Avatar>
                      <p className="truncate text-sm font-medium">{headline}</p>
                    </div>
                    {user?.email && user?.display_name && (
                      <p className="mt-1 truncate text-[11px] text-[hsl(var(--fg-3))]">
                        {user.email}
                      </p>
                    )}
                    {program?.name && (
                      <p className="mt-2 truncate text-xs text-[hsl(var(--fg-3))]">
                        {program.name}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between text-[10px] text-[hsl(var(--fg-3))]">
                      <span>{formatRelativeTime(app.created_at)}</span>
                      {app.score != null && (
                        <Badge variant="outline" className="text-[10px]">
                          {Number(app.score).toFixed(0)} / 100
                        </Badge>
                      )}
                    </div>
                  </Link>
                );
              })}
              {(byStage[stage]?.length ?? 0) === 0 && (
                <div className="py-8 text-center text-[11px] text-[hsl(var(--fg-3))]">
                  Nothing here.
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
