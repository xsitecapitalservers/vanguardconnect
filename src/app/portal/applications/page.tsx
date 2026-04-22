import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ApplicationStageTracker } from "@/components/portal/application-stage-tracker";

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: applications } = await supabase
    .from("applications")
    .select("*, program:programs(*)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="font-display text-4xl">My Applications</h1>
        <p className="mt-1 text-muted-foreground">
          Track progress through high-ticket programs.
        </p>
      </div>

      {!applications || applications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-semibold">No applications yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Ready for an invite-only program?
            </p>
            <Button asChild className="mt-4">
              <Link href="/programs/vanguard-mentorship/apply">
                Apply for Vanguard Mentorship
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const program = (app as { program: { name: string; description: string | null } | null }).program;
            return (
              <Card key={app.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle>{program?.name ?? "Program"}</CardTitle>
                      <CardDescription>{program?.description}</CardDescription>
                    </div>
                    <Badge variant={app.stage === "approved" ? "success" : app.stage === "rejected" ? "destructive" : "warning"}>
                      {app.stage}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ApplicationStageTracker stage={app.stage} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
