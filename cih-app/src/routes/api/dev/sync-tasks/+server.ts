import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';

export const POST: RequestHandler = async () => {
  // Minimal DDL for tasks table if it doesn't exist (SQLite)
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      insight_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      owner TEXT,
      due_at INTEGER,
      status TEXT NOT NULL DEFAULT 'new',
      created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')*1000)
    );
  `);

  return new Response('ok', { status: 200 });
};
