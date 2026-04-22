import Mux from "@mux/mux-node";

let _mux: Mux | null = null;

export function getMux(): Mux {
  if (_mux) return _mux;
  const tokenId = process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET;
  if (!tokenId || !tokenSecret) {
    throw new Error("MUX_TOKEN_ID / MUX_TOKEN_SECRET not set");
  }
  _mux = new Mux({ tokenId, tokenSecret });
  return _mux;
}

/**
 * Create a direct upload URL so the admin course editor can POST a video
 * directly to Mux from the browser.
 */
export async function createDirectUpload() {
  const mux = getMux();
  return mux.video.uploads.create({
    cors_origin: process.env.NEXT_PUBLIC_APP_URL ?? "*",
    new_asset_settings: {
      playback_policy: ["signed"],
      encoding_tier: "smart",
    },
  });
}

/**
 * Generate a time-limited signed JWT for a given Mux playback_id so that
 * only enrolled students can watch a paid lesson.
 */
export function signMuxPlayback(playbackId: string, expiresInSeconds = 3600) {
  const jwt = require("jsonwebtoken");
  const keyId = process.env.MUX_SIGNING_KEY_ID;
  const privateKey = process.env.MUX_SIGNING_PRIVATE_KEY;
  if (!keyId || !privateKey) {
    throw new Error("Mux signing keys not configured");
  }
  const token = jwt.sign(
    {
      sub: playbackId,
      aud: "v",
      exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
      kid: keyId,
    },
    Buffer.from(privateKey, "base64"),
    { algorithm: "RS256" }
  );
  return token;
}
