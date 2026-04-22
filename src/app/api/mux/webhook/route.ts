import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Mux webhook — called when an asset is ready.
 * Configure at: https://dashboard.mux.com → Settings → Webhooks
 * Point it at /api/mux/webhook.
 *
 * We use this to update the lesson's mux_playback_id once encoding completes.
 * NOTE: for production, verify the Mux-Signature header.
 */
export async function POST(request: Request) {
  const payload = await request.json();
  const admin = createAdminClient();

  if (payload.type === "video.asset.ready") {
    const assetId = payload.data.id;
    const playbackId = payload.data.playback_ids?.[0]?.id;
    if (assetId && playbackId) {
      await admin
        .from("lessons")
        .update({ mux_playback_id: playbackId })
        .eq("mux_asset_id", assetId);
    }
  }

  return NextResponse.json({ received: true });
}
