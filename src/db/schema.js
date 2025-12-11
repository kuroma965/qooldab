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
  index, 
  uniqueIndex, 
} from 'drizzle-orm/pg-core';

export const keyStatusEnum = pgEnum('key_status', [
  'unused',
  'active',
  'expired',
  'banned',
]);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password_hash: text('password_hash'),
  name: varchar('name', { length: 100 }),
  role: varchar('role', { length: 50 }).notNull().default('user'),
  is_active: boolean('is_active').notNull().default(true),
  sign_up: varchar('sign_up', { length: 50 }).notNull().default('credentials'),
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
}, (table) => ({
  categoriesSlugIdx: index('categories_slug_idx').on(table.slug),
}));

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
  is_limited_per_user: boolean('is_limited_per_user').notNull().default(false),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // ใช้เปิดหน้า /products/[slug]
  productsSlugIdx: index('products_slug_idx').on(table.slug),
  // ใช้ filter ตามหมวดหมู่
  productsCategoryIdx: index('products_category_idx').on(table.category_id),
  // ใช้ filter เฉพาะสินค้าที่ active
  productsActiveIdx: index('products_active_idx').on(table.is_active),
}));

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  product_id: integer('product_id').notNull().references(() => products.id, { onDelete: 'restrict' }),
  quantity: integer('quantity').notNull().default(1),
  total_price: integer('total_price').notNull().default(0),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // หน้า “ประวัติการสั่งซื้อของฉัน”
  ordersUserIdx: index('orders_user_idx').on(table.user_id),
  // รายงานยอดขาย per product
  ordersProductIdx: index('orders_product_idx').on(table.product_id),
  // sort ตามเวลาซื้อ
  ordersCreatedIdx: index('orders_created_idx').on(table.created_at),
}));

export const keys = pgTable('keys', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  product_id: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  sharing: boolean('sharing').notNull().default(false),
  device_id: varchar('device_id', { length: 255 }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  expires_at: timestamp('expires_at', { withTimezone: true }),
  status: keyStatusEnum('status').notNull().default('unused'), 
  order_id: integer('order_id').references(() => orders.id, { onDelete: 'restrict' }),
}, (table) => ({
  // หา key ตาม product
  keysProductIdx: index('keys_product_idx').on(table.product_id),
  // ใช้ตอนดูว่า order นี้ได้ key อะไรไป
  keysOrderIdx: index('keys_order_idx').on(table.order_id),
  // ใช้ตอนหา shared key ของ product
  keysProductSharingIdx: index('keys_product_sharing_idx').on(table.product_id, table.sharing),
  // ใช้ตอนหา key ว่าง ๆ สำหรับแจก (product_id + order_id)
  // ให้ตรงกับ where: product_id = ? AND order_id IS NULL
  keysAvailableIdx: index('keys_available_idx').on(table.product_id, table.order_id),
}));

export const productItems = pgTable('product_items', {
  id: serial('id').primaryKey(),
  product_id: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  item: varchar('item', { length: 255 }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  order_id: integer('order_id').references(() => orders.id, { onDelete: 'restrict' }),
}, (table) => ({
  productItemsProductIdx: index('product_items_product_idx').on(table.product_id),
  productItemsOrderIdx: index('product_items_order_idx').on(table.order_id),
  // เพิ่ม index ให้ตรงกับ query: product_id = ? AND order_id IS NULL
  productItemsProductOrderIdx: index('product_items_product_order_idx').on(
    table.product_id,
    table.order_id,
  ),
}));

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

export const coupons = pgTable('coupons', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  credit_amount: numeric('credit_amount', { precision: 10, scale: 2 }).notNull(),
  usage_limit: integer('usage_limit').notNull().default(1),
  used_count: integer('used_count').notNull().default(0),
  expires_at: timestamp('expires_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const announcements = pgTable('announcements', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const couponRedemptions = pgTable('coupon_redemptions', {
  id: serial('id').primaryKey(),
  coupon_id: integer('coupon_id')
    .notNull()
    .references(() => coupons.id, { onDelete: 'cascade' }),
  user_id: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => ({
  // 1 user ใช้คูปองนี้ได้ครั้งเดียว
  couponUserUniqueIdx: uniqueIndex('coupon_user_unique_idx')
    .on(table.coupon_id, table.user_id),

  couponRedemptionsCouponIdx: index('coupon_redemptions_coupon_idx')
    .on(table.coupon_id),
  couponRedemptionsUserIdx: index('coupon_redemptions_user_idx')
    .on(table.user_id),
}));
