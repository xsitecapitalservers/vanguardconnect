import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials, formatRelativeTime } from "@/lib/utils";

const STAGES = ["submitted", "screening", "interview", "approved", "rejected"] as const;

export default async function ApplicationsQueuePage() {
  const supabase = await createClient();
  const { data: applications } = await supabase
    .from("applications")
    .select("*, user:profiles!applications_user_id_fkey(display_name, email, avatar_url), program:programs(name)")
    .order("created_at", { ascending: false });

  const byStage = STAGES.reduce<Record<string, typeof applications>>((acc, s) => {
    acc[s] = (applications ?? []).filter((a) => a.stage === s) as typeof applications;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="font-display text-4xl">Applications</h1>
        <p className="mt-1 text-muted-foreground">
          Vet, review, and approve candidates for high-ticket programs.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {STAGES.map((stage) => (
          <Card key={stage} className="flex min-h-[400px] flex-col">
            <CardHeader className="border-b border-border/60 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm capitalize">{stage}</CardTitle>
                <Badge variant="secondary" className="text-[10px]">
                  {byStage[stage]?.length ?? 0}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-2 p-3">
              {(byStage[stage] ?? []).map((app) => {
                const user = (app as { user: { display_name: string | null; email: string; avatar_url: string | null } | null }).user;
                const program = (app as { program: { name: string } | null }).program;
                return (
                  <div
                    key={app.id}
                    className="group cursor-pointer rounded-lg border border-border bg-background p-3 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-[10px]">
                          {initials(user?.display_name ?? user?.email ?? "")}
                        </AvatarFallback>
                      </Avatar>
                      <p className="truncate text-sm font-medium">
                        {user?.display_name ?? user?.email ?? "Applicant"}
                      </p>
                    </div>
                    <p className="mt-2 truncate text-xs text-muted-foreground">
                      {program?.name}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{formatRelativeTime(app.created_at)}</span>
                      {app.score != null && (
                        <Badge variant="outline" className="text-[10px]">
                          {Number(app.score).toFixed(0)} / 100
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
              {(byStage[stage]?.length ?? 0) === 0 && (
                <div className="py-8 text-center text-[11px] text-muted-foreground">
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
