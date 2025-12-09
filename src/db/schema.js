// db/schema.js
import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  boolean,
  numeric, 
  pgEnum,
} from 'drizzle-orm/pg-core';

export const keyStatusEnum = pgEnum('key_status', [
  'unused',
  'active',
  'expired',
  'banned',
]);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  password_hash: text('password_hash'),
  name: varchar('name', { length: 100 }),
  role: varchar('role', { length: 50 }).notNull().default('user'),
  is_active: boolean('is_active').notNull().default(true),
  sign_up: varchar('sign_up', { length: 50 }).notNull().default('qooldab'),
  credits: numeric('credits', { precision: 10, scale: 2 }).notNull().default(0.00),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 150 }).notNull(),
  slug: varchar('slug', { length: 150 }).notNull(),
  description: text('description'),
  image: text('image'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 250 }).notNull(),
  slug: varchar('slug', { length: 250 }).notNull(), 
  description: text('description'),
  price: integer('price').notNull().default(0),
  stock: integer('stock').notNull().default(0),
  sold: integer('sold').notNull().default(0),
  category_id: integer('category_id').references(() => categories.id),
  image: text('image'),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  product_id: integer('product_id').notNull().references(() => products.id, { onDelete: 'restrict' }),
  quantity: integer('quantity').notNull().default(1),
  total_price: integer('total_price').notNull().default(0),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const productKeys = pgTable('product_keys', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  product_id: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  sharing: boolean('sharing').notNull().default(false),
  device_id: varchar('device_id', { length: 255 }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  expires_at: timestamp('expires_at', { withTimezone: true }),
  status: keyStatusEnum('status').notNull().default('unused'), 
});

export const productFiles = pgTable('product_files', {
  id: serial('id').primaryKey(),
  product_id: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 150 }).notNull(),
  platform: varchar('platform', { length: 50 }),
  download_url: text('download_url').notNull(),
  version: varchar('version', { length: 50 }),
  file_size_bytes: integer('file_size_bytes'),
  file_hash: varchar('file_hash', { length: 128 }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});