import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
  const body = await event.request.text();
  console.log('[SLACK CMD] body:', body);
  return new Response(JSON.stringify({ response_type: 'ephemeral', text: 'ok (temp)' }), {
    headers: { 'content-type': 'application/json' }
  });
};
