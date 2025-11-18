import type { RequestHandler } from './$types';
import { verifySlack, formToObj } from '$lib/server/slack';
import { quickParse } from '$lib/server/ai';
import { db } from '$lib/server/db';
import { clients } from '$lib/server/db/schema';

export const POST: RequestHandler = async (event) => {
  if (!(await verifySlack(event))) return new Response('Bad signature', { status: 401 });

  const raw = await event.request.text();
  const fields = formToObj(raw);
  const text = (fields.text as string) || '';
  const parsed = quickParse(text);

  // fetch some clients for the selector
  const rows = await db.select().from(clients).limit(15);
  const options = rows.map((c) => ({
    text: { type: 'plain_text', text: c.name },
    value: c.id
  }));

  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text:
          `*CIH Preview*\n_${text}_\n\n` +
          `• Themes: ${parsed.themes.join(', ') || '—'}\n` +
          `• Signal: ${parsed.signal || '—'}\n` +
          `• Horizon: ${parsed.horizon || '—'}\n` +
          `• Strength: ${parsed.strength || '—'}`
      }
    },
    // client selector
    {
      type: 'actions',
      block_id: 'cih_select_client',
      elements: [
        {
          type: 'static_select',
          action_id: 'cih_choose_client',
          placeholder: { type: 'plain_text', text: 'Link to client…' },
          options
        }
      ]
    },
    // actions
    {
      type: 'actions',
      block_id: 'cih_actions',
      elements: [
        {
          type: 'button',
          action_id: 'cih_accept',
          text: { type: 'plain_text', text: '✅ Accept' },
          style: 'primary',
          value: JSON.stringify({ action: 'accept', text, parsed })
        },
        {
          type: 'button',
          action_id: 'cih_discard',
          text: { type: 'plain_text', text: '❌ Discard' },
          style: 'danger',
          value: JSON.stringify({ action: 'discard' })
        }
      ]
    }
  ];

  return new Response(JSON.stringify({ response_type: 'ephemeral', blocks }), {
    headers: { 'content-type': 'application/json' }
  });
};
