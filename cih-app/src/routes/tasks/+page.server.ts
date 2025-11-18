import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { tasks } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
  const rows = await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  return { tasks: rows };
};

export const actions = {
  update: async ({ request }) => {
    const fd = await request.formData();
    const id = String(fd.get('id') || '');
    const status = String(fd.get('status') || '');
    if (!id || !['new','in_progress','completed','parked'].includes(status)) return { ok:false };
    await db.update(tasks).set({ status }).where(eq(tasks.id, id));
    return { ok:true };
  },

  delete: async ({ request }) => {
    const fd = await request.formData();
    const id = String(fd.get('id') || '');
    if (!id) return { ok:false };
    await db.delete(tasks).where(eq(tasks.id, id));
    return { ok:true };
  }
};
