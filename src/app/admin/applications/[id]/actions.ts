"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const TEAM_ROLES = new Set(["owner", "admin", "coach", "reviewer"]);

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role = profile?.role;
  if (!role || !TEAM_ROLES.has(role)) throw new Error("Forbidden");
  return { role, userId: user.id };
}

export async function setApplicationStage(
  applicationId: string,
  stage: "submitted" | "screening" | "interview" | "approved" | "rejected"
) {
  const { userId } = await assertAdmin();
  const admin = createAdminClient();

  const patch: Record<string, unknown> = { stage };
  if (stage === "approved" || stage === "rejected") {
    patch.decided_by = userId;
    patch.decided_at = new Date().toISOString();
  }

  const { error } = await admin.from("applications").update(patch).eq("id", applicationId);
  if (error) throw new Error(error.message);

  // If approving, also flip the user's role from applicant → student
  if (stage === "approved") {
    const { data: app } = await admin
      .from("applications")
      .select("user_id")
      .eq("id", applicationId)
      .single();
    if (app?.user_id) {
      await admin
        .from("profiles")
        .update({ role: "student" })
        .eq("id", app.user_id as string)
        .eq("role", "applicant");
    }
  }

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${applicationId}`);
}

export async function setApplicationScore(applicationId: string, score: number | null) {
  await assertAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from("applications")
    .update({ score })
    .eq("id", applicationId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/applications/${applicationId}`);
}

export async function addApplicationNote(applicationId: string, body: string) {
  const { userId } = await assertAdmin();
  if (!body.trim()) throw new Error("Note is empty");
  const admin = createAdminClient();
  const { error } = await admin.from("application_notes").insert({
    application_id: applicationId,
    author_id: userId,
    body: body.trim(),
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/applications/${applicationId}`);
}

export async function deleteApplication(applicationId: string) {
  const { role } = await assertAdmin();
  if (role !== "owner" && role !== "admin") {
    throw new Error("Only owners and admins can delete applications");
  }
  const admin = createAdminClient();
  const { error } = await admin.from("applications").delete().eq("id", applicationId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/applications");
  redirect("/admin/applications");
}
