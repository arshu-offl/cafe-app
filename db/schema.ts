// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const records = sqliteTable('records', { id: text('id').primaryKey(), kind: text('kind').notNull(), data: text('data').notNull() });
export const orders = sqliteTable('orders', { id: text('id').primaryKey(), token: text('token').notNull(), requestId: text('request_id').notNull().unique(), created: integer('created').notNull(), data: text('data').notNull() });
