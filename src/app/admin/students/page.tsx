import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download } from "lucide-react";
import { initials, formatRelativeTime } from "@/lib/utils";

export default async function StudentsPage() {
  const supabase = await createClient();
  const { data: students } = await supabase
    .from("profiles")
    .select("*")
    .in("role", ["student", "applicant"])
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Students</h1>
          <p className="mt-1 text-muted-foreground">All learners in the system.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download /> Export CSV
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name or email…" className="pl-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{students?.length ?? 0} total</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {(students ?? []).map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-accent/50"
              >
                <Avatar>
                  {s.avatar_url && <AvatarImage src={s.avatar_url} alt="" />}
                  <AvatarFallback>{initials(s.display_name ?? s.email)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{s.display_name ?? s.email}</p>
                  <p className="truncate text-xs text-muted-foreground">{s.email}</p>
                </div>
                <div className="hidden flex-col items-end md:flex">
                  <Badge variant="outline" className="capitalize">{s.role}</Badge>
                  <span className="mt-1 text-[11px] text-muted-foreground">
                    Joined {formatRelativeTime(s.created_at)}
                  </span>
                </div>
              </div>
            ))}
            {(!students || students.length === 0) && (
              <div className="px-6 py-16 text-center text-sm text-muted-foreground">
                No students yet — sign-ups will appear here.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
