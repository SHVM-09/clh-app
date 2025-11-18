import crypto from "node:crypto";
import type { RequestEvent } from "@sveltejs/kit";

export async function verifySlack(event: RequestEvent) {
  const ts = event.request.headers.get("x-slack-request-timestamp");
  const sig = event.request.headers.get("x-slack-signature");
  if (!ts || !sig) return false;

  // Reject old timestamps (>5 min)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(ts)) > 300) return false;

  // Slack sends x-www-form-urlencoded; read raw body
  const body = await event.request.clone().text();

  const base = `v0:${ts}:${body}`;
  const mac = crypto
    .createHmac("sha256", process.env.SLACK_SIGNING_SECRET || "")
    .update(base)
    .digest("hex");
  const expected = `v0=${mac}`;

  // Avoid throw if lengths differ
  if (expected.length !== sig.length) return false;

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  } catch {
    return false;
  }
}

export const formToObj = (s: string) => Object.fromEntries(new URLSearchParams(s));
