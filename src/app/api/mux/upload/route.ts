import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createDirectUpload } from "@/lib/mux/client";

const TEAM_ROLES = new Set(["owner", "admin", "coach"]);

/**
 * Returns a single-use Mux direct-upload URL.
 * Team-only — students can't hit this.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !TEAM_ROLES.has(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const upload = await createDirectUpload();
  return NextResponse.json({ uploadUrl: upload.url, uploadId: upload.id });
}
