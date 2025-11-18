import type { RequestHandler } from './$types';
import { verifySlack } from '$lib/server/slack';
import { db } from '$lib/server/db';
import { clients, insights, tasks } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async (event) => {
  if (!(await verifySlack(event))) return new Response('Bad signature', { status: 401 });

  const fd = await event.request.formData();
  const payloadRaw = String(fd.get('payload') || '{}');
  const payload = JSON.parse(payloadRaw);

  const action = payload?.actions?.[0];
  const responseUrl: string | undefined = payload?.response_url;

  // ---------- SELECT CLIENT: preview update ----------
  if (action?.action_id === 'cih_choose_client' && action?.type === 'static_select') {
    const clientId = action.selected_option?.value;
    const name = action.selected_option?.text?.text ?? clientId;

    const original: any[] = Array.isArray(payload.message?.blocks)
      ? (typeof structuredClone === 'function'
          ? structuredClone(payload.message.blocks)
          : JSON.parse(JSON.stringify(payload.message.blocks)))
      : [];

    const withoutNote = original.filter(
      (b) => !(b.type === 'context' && b.block_id === 'cih_client_note')
    );

    const withSelected = withoutNote.map((b) => {
      if (b.block_id === 'cih_select_client' && Array.isArray(b.elements)) {
        const sel = b.elements.find((el: any) => el?.type === 'static_select');
        if (sel) {
          sel.initial_option = { text: { type: 'plain_text', text: name }, value: clientId };
        }
      }
      return b;
    });

    let idx = withSelected.findIndex((b) => b.block_id === 'cih_select_client');
    if (idx < 0) idx = withSelected.length - 1;

    const note = {
      type: 'context',
      block_id: 'cih_client_note',
      elements: [{ type: 'mrkdwn', text: `*Linked client:* ${name}  _(id: ${clientId})_` }]
    };

    const newBlocks = [...withSelected];
    newBlocks.splice(idx + 1, 0, note);

    return new Response(
      JSON.stringify({ response_action: 'update', blocks: newBlocks }),
      { headers: { 'content-type': 'application/json' } }
    );
  }

  // ---------- DISCARD ----------
  if (action?.action_id === 'cih_discard' && action?.type === 'button' && responseUrl) {
    queueMicrotask(() =>
      fetch(responseUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          replace_original: true,
          response_type: 'ephemeral',
          blocks: [{ type: 'section', text: { type: 'mrkdwn', text: '*CIH* — Discarded.' } }]
        })
      })
    );
    return new Response('', { status: 200 });
  }

  // ---------- ACCEPT ----------
  if (action?.action_id === 'cih_accept' && action?.type === 'button' && responseUrl) {
    let val: any = null;
    try { val = action?.value ? JSON.parse(action.value) : null; } catch {}

    // (A) clientId: from state or, fallback, context note
    let clientId: string | null = null;

    const state = payload?.state?.values;
    try {
      clientId = state?.cih_select_client?.cih_choose_client?.selected_option?.value ?? null;
    } catch {}

    if (!clientId) {
      try {
        const ctx = (payload.message?.blocks || []).find(
          (b: any) => b.block_id === 'cih_client_note'
        );
        const t: string = ctx?.elements?.[0]?.text || '';
        const m = t.match(/\(id:\s*([^)]+)\)/);
        clientId = m?.[1] ?? null;
      } catch {}
    }

    if (clientId) {
      const [row] = await db.select().from(clients).where(eq(clients.id, clientId)).limit(1);
      if (!row) clientId = null;
    }

    // (B) Save insight
    const [insightRow] = await db.insert(insights).values({
      source: 'slack',
      rawText: val?.text ?? '',
      parsedJson: JSON.stringify(val?.parsed ?? {}),
      strength: val?.parsed?.strength ?? null,
      horizon: val?.parsed?.horizon ?? null,
      createdBy: payload.user?.id ?? 'unknown',
      clientId
    }).returning({ id: insights.id });

    const insightId = insightRow?.id as string | undefined;

    // (C) Create tasks from parsed.actions (if present)
    const actions: Array<{ type?: string; title?: string; dueDays?: number }> = Array.isArray(val?.parsed?.actions)
      ? val.parsed.actions
      : [];

    if (insightId && actions.length) {
      const now = Date.now();
      const toDue = (days?: number | null) =>
        typeof days === 'number' && days > 0 ? new Date(now + days * 24 * 60 * 60 * 1000) : null;

      const rows = actions.map(a => ({
        insightId,
        type: (a.type || 'follow-up') as string,
        title: a.title || (a.type ? `Suggested ${a.type}` : 'Suggested follow-up'),
        owner: null,
        dueAt: toDue((a as any).dueDays ?? null),
        status: 'new' as const
      }));

      if (rows.length) {
        await db.insert(tasks).values(rows);
      }
    }

    // (D) Ack UI
    queueMicrotask(() =>
      fetch(responseUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          replace_original: true,
          response_type: 'ephemeral',
          blocks: [{ type: 'section', text: { type: 'mrkdwn', text: '*CIH* — Saved ✅ Insight + Tasks created.' } }]
        })
      })
    );
    return new Response('', { status: 200 });
  }

  return new Response('', { status: 200 });
};
