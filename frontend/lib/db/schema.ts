import { pgTable, serial, text, numeric, timestamp } from 'drizzle-orm/pg-core'

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull().default(''),
  imageUrl: text('image_url').notNull().default(''),
  notes: text('notes').notNull().default(''),
  price: numeric('price', { precision: 10, scale: 2 }).notNull().default('0'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
