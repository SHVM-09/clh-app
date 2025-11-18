import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { insights } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
  const rows = await db.select().from(insights).orderBy(desc(insights.createdAt));
  return { insights: rows };
};

export const actions: Actions = {
  update: async ({ request }) => {
    const fd = await request.formData();
    const id = String(fd.get('id') || '');
    const strength = String(fd.get('strength') || '');
    const horizon  = String(fd.get('horizon') || '');
    await db.update(insights).set({ strength, horizon }).where(eq(insights.id, id));
    return { ok:true };
  },
  delete: async ({ request }) => {
    const fd = await request.formData();
    const id = String(fd.get('id') || '');
    await db.delete(insights).where(eq(insights.id, id));
    return { ok:true };
  }
};
