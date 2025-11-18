import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const clients = sqliteTable('clients', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  domains: text('domains').notNull().default(''), // comma list for starter
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(strftime('%s','now')*1000)`)
});

export const insights = sqliteTable('insights', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  clientId: text('client_id').references(() => clients.id),
  source: text('source').notNull(),                  // 'slack' | 'web' | 'email' | 'file'
  rawText: text('raw_text').notNull(),
  parsedJson: text('parsed_json'),                   // JSON string
  strength: text('strength'),                        // 'weak' | 'med' | 'strong'
  horizon: text('horizon'),                          // 'immediate' | '3-6m' | '>12m'
  createdBy: text('created_by').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(strftime('%s','now')*1000)`)
});

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  insightId: text('insight_id').notNull(),                     // FK to insights.id (soft-checked)
  type: text('type').notNull(),                                // 'follow-up' | 'meeting' | 'proposal' | 'internal' | 'research'
  title: text('title').notNull(),                              // human-friendly description
  owner: text('owner'),                                        // Slack user id or email (optional now)
  dueAt: integer('due_at', { mode: 'timestamp_ms' }),          // suggested due
  status: text('status').notNull().default('new'),             // 'new' | 'in_progress' | 'completed' | 'parked'
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(strftime('%s','now')*1000)`)
});