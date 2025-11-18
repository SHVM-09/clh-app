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
