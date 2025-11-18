import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
  const fd = await event.request.formData();
  console.log('[SLACK INTERACTIVE] payload:', fd.get('payload'));
  return new Response('', { status: 200 });
};
