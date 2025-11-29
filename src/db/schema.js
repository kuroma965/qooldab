// db/schema.js
import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';

// existing users table (unchanged other than import integer added)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  password_hash: text('password_hash').notNull(),
  name: varchar('name', { length: 100 }),
  role: varchar('role', { length: 50 }).notNull().default('user'),
  is_active: boolean('is_active').notNull().default(true),
  sign_up: varchar('sign_up', { length: 50 }).notNull().default('qooldab'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 150 }).notNull(),
  slug: varchar('slug', { length: 150 }).notNull(), // unique index in migration
  description: text('description'),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 250 }).notNull(),
  slug: varchar('slug', { length: 250 }).notNull(), // unique index recommended
  description: text('description'),
  price: integer('price').notNull().default(0),
  stock: integer('stock').notNull().default(0),
  category_id: integer('category_id').references(() => categories.id),
  image: text('image'),
  metadata: text('metadata'), // optional JSON string for extensible fields
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
