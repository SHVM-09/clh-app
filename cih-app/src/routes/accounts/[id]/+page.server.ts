import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { clients, insights, tasks } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params }) => {
  const id = params.id;
  const [client] = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  const ins = await db.select().from(insights).where(eq(insights.clientId, id)).orderBy(desc(insights.createdAt));
  const tks = ins.length
    ? await db.select().from(tasks).where(eq(tasks.insightId, ins[0]?.id)) // simple fetch; you can enrich to all later
    : [];
  return { client, insights: ins, tasks: tks };
};
