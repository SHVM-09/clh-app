import crypto from 'node:crypto';
import type { RequestEvent } from '@sveltejs/kit';
import { env } from '$env/dynamic/private'; // ✅ read .env at runtime

export async function verifySlack(event: RequestEvent) {
  const ts = event.request.headers.get('x-slack-request-timestamp');
  const sig = event.request.headers.get('x-slack-signature');
  const secret = env.SLACK_SIGNING_SECRET || '';    // <- from .env

  if (!secret) {
    console.warn('[SLACK VERIFY] missing SLACK_SIGNING_SECRET');
    return false;
  }
  if (!ts || !sig) {
    console.warn('[SLACK VERIFY] missing headers ts/sig');
    return false;
  }

  // reject if older than 5 minutes
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(ts)) > 300) {
    console.warn('[SLACK VERIFY] timestamp skew too large');
    return false;
  }

  // IMPORTANT: use the exact raw body Slack sent
  const raw = await event.request.clone().text();
  const base = `v0:${ts}:${raw}`;
  const mac = crypto.createHmac('sha256', secret).update(base).digest('hex');
  const expected = `v0=${mac}`;

  if (expected.length !== sig.length) {
    console.warn('[SLACK VERIFY] length mismatch', { expectedLen: expected.length, sigLen: sig.length });
    return false;
  }
  try {
    const ok = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
    if (!ok) console.warn('[SLACK VERIFY] signature mismatch');
    return ok;
  } catch (e) {
    console.warn('[SLACK VERIFY] timingSafeEqual error', e);
    return false;
  }
}

export const formToObj = (s: string) => Object.fromEntries(new URLSearchParams(s));
