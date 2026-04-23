import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/vanguard";
import { Download } from "lucide-react";
import { StudentsTable } from "./students-table";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const callerRole = callerProfile?.role ?? "student";
  const callerCanManageRole = callerRole === "owner" || callerRole === "admin";
  const callerCanDelete = callerRole === "owner" || callerRole === "admin";

  const { data: students } = await supabase
    .from("profiles")
    .select("id, email, display_name, avatar_url, role, bio, timezone, deactivated_at, created_at")
    .in("role", ["student", "applicant"])
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-[0.5px] border-[hsl(var(--rule))] pb-6">
        <div>
          <Eyebrow>Directory · Students</Eyebrow>
          <h1 className="mt-3 font-display text-[40px] font-medium leading-[1.05] tracking-[-0.015em]">
            Students
          </h1>
          <p className="mt-2 text-[14px] text-[hsl(var(--fg-3))]">
            All learners in the system. Edit, deactivate, or remove accounts.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <StudentsTable
        students={(students ?? []) as never}
        callerCanManageRole={callerCanManageRole}
        callerCanDelete={callerCanDelete}
        callerId={user!.id}
      />
    </div>
  );
}
