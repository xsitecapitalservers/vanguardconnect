import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/utils";

export default async function TeamPage() {
  const supabase = await createClient();
  const { data: team } = await supabase
    .from("profiles")
    .select("*")
    .in("role", ["owner", "admin", "coach", "reviewer"])
    .order("role");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-4xl">Team</h1>
        <p className="mt-1 text-muted-foreground">Staff members and their roles.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {(team ?? []).map((m) => (
              <div key={m.id} className="flex items-center gap-4 px-6 py-4">
                <Avatar>
                  {m.avatar_url && <AvatarImage src={m.avatar_url} alt="" />}
                  <AvatarFallback>{initials(m.display_name ?? m.email)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{m.display_name ?? m.email}</p>
                  <p className="text-xs text-muted-foreground">{m.email}</p>
                </div>
                <Badge variant="outline" className="capitalize">{m.role}</Badge>
              </div>
            ))}
            {(!team || team.length === 0) && (
              <div className="py-16 text-center text-sm text-muted-foreground">
                No team members yet. Promote a user via Supabase → profiles.role.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
