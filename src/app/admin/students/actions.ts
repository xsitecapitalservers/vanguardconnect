"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const TEAM_ROLES = new Set(["owner", "admin", "coach", "reviewer"]);

/**
 * Guard: caller must be signed in AND have a team role (owner/admin/coach/reviewer).
 * Returns the caller's role on success, throws on failure.
 */
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
  if (!role || !TEAM_ROLES.has(role)) {
    throw new Error("Forbidden");
  }
  return { role, userId: user.id };
}

export async function updateStudent(
  studentId: string,
  values: {
    display_name?: string | null;
    email?: string | null;
    role?: "student" | "applicant" | "coach" | "reviewer" | "admin" | "owner" | null;
    bio?: string | null;
    timezone?: string | null;
  }
) {
  const { role: callerRole } = await assertAdmin();

  // Only owners/admins can change a role — coaches/reviewers can only edit display info
  const canChangeRole = callerRole === "owner" || callerRole === "admin";

  const admin = createAdminClient();
  const patch: Record<string, unknown> = {};
  if (values.display_name !== undefined) patch.display_name = values.display_name;
  if (values.email !== undefined && values.email !== null) patch.email = values.email;
  if (values.bio !== undefined) patch.bio = values.bio;
  if (values.timezone !== undefined) patch.timezone = values.timezone;
  if (canChangeRole && values.role !== undefined && values.role !== null) {
    patch.role = values.role;
  }

  if (Object.keys(patch).length === 0) {
    return { ok: true };
  }

  const { error } = await admin.from("profiles").update(patch).eq("id", studentId);
  if (error) throw new Error(error.message);

  // Keep auth.users.email in sync if the email changed
  if (patch.email) {
    const { error: authErr } = await admin.auth.admin.updateUserById(studentId, {
      email: patch.email as string,
    });
    if (authErr) {
      // Don't fail — profile email updated; surface a warning back
      return { ok: true, warning: `Auth email sync failed: ${authErr.message}` };
    }
  }

  revalidatePath("/admin/students");
  return { ok: true };
}

export async function deactivateStudent(studentId: string) {
  await assertAdmin();
  const admin = createAdminClient();

  // Mark deactivated in profiles
  const { error } = await admin
    .from("profiles")
    .update({ deactivated_at: new Date().toISOString() })
    .eq("id", studentId);
  if (error) throw new Error(error.message);

  // Revoke all existing sessions by updating auth.users.banned_until far in the future.
  // 100 years should be sufficient as a "deactivated" state.
  const banUntil = new Date();
  banUntil.setFullYear(banUntil.getFullYear() + 100);
  await admin.auth.admin.updateUserById(studentId, {
    ban_duration: "876000h", // 100 years
  });

  revalidatePath("/admin/students");
  return { ok: true };
}

export async function reactivateStudent(studentId: string) {
  await assertAdmin();
  const admin = createAdminClient();

  const { error } = await admin
    .from("profiles")
    .update({ deactivated_at: null })
    .eq("id", studentId);
  if (error) throw new Error(error.message);

  // Lift the ban
  await admin.auth.admin.updateUserById(studentId, {
    ban_duration: "none",
  });

  revalidatePath("/admin/students");
  return { ok: true };
}

export async function deleteStudent(studentId: string) {
  const { role: callerRole, userId } = await assertAdmin();

  // Only owners/admins can delete users
  if (callerRole !== "owner" && callerRole !== "admin") {
    throw new Error("Only owners and admins can delete users");
  }
  if (userId === studentId) {
    throw new Error("You cannot delete your own account");
  }

  const admin = createAdminClient();

  // Deleting the auth user cascades to profiles (FK: on delete cascade)
  const { error } = await admin.auth.admin.deleteUser(studentId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/students");
  return { ok: true };
}
