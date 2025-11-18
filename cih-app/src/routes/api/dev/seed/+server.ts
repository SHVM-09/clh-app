import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { clients } from '$lib/server/db/schema';

export const POST: RequestHandler = async () => {
  await db.insert(clients).values([
    { id: 'acme',   name: 'Acme Bank',   domains: 'acme.com' },
    { id: 'globex', name: 'Globex Fin.', domains: 'globex.com' }
  ]).onConflictDoNothing();
  return new Response('seeded', { status: 200 });
};