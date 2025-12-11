// app/api/profile/history/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/db/db';
import {
  products,
  orders,
  keys,
  productItems,
} from '@/db/schema';
import {
  eq,
  desc,
  sql,
} from 'drizzle-orm';

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { ok: false, message: 'กรุณาเข้าสู่ระบบก่อนดูประวัติการซื้อ' },
        { status: 401 }
      );
    }
    const userId = Number(session.user.id);

    // อ่าน query ?page=1&limit=20
    const { searchParams } = new URL(req.url);
    const pageParam = Number(searchParams.get('page') ?? '1');
    const limitParam = Number(searchParams.get('limit') ?? '20');

    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limitRaw =
      Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 20;
    const limit = Math.min(limitRaw, 50); // กัน limit มั่ว ๆ
    const offset = (page - 1) * limit;

    // นับจำนวน order ทั้งหมดของ user นี้
    const totalResult = await db
      .select({
        count: sql`COUNT(*)`,
      })
      .from(orders)
      .where(eq(orders.user_id, userId));

    const total = Number(totalResult[0]?.count ?? 0);
    const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

    if (total === 0) {
      return NextResponse.json({
        ok: true,
        page,
        limit,
        total,
        totalPages,
        items: [],
      });
    }

    // ดึงรายการ order + product + keys + product_items
    const rows = await db
      .select({
        order_id: orders.id,
        order_created_at: orders.created_at,
        order_quantity: orders.quantity,
        order_total_price: orders.total_price,

        product_id: products.id,
        product_name: products.name,
        product_slug: products.slug,
        // product_image: products.image, // ❌ ไม่ต้องส่งรูปแล้ว

        key_id: keys.id,
        key_value: keys.key,

        item_id: productItems.id,
        item_value: productItems.item,
      })
      .from(orders)
      .leftJoin(products, eq(orders.product_id, products.id))
      .leftJoin(keys, eq(keys.order_id, orders.id))
      .leftJoin(productItems, eq(productItems.order_id, orders.id))
      .where(eq(orders.user_id, userId))
      .orderBy(desc(orders.created_at))
      .limit(limit)
      .offset(offset);

    // group ตาม order_id → รวม keys / items เข้าเป็น array
    const map = new Map();

    for (const row of rows) {
      const id = row.order_id;

      if (!map.has(id)) {
        map.set(id, {
          id,
          quantity: row.order_quantity,
          total_price: row.order_total_price,
          created_at: row.order_created_at,

          product: row.product_id
            ? {
                id: row.product_id,
                name: row.product_name,
                slug: row.product_slug,
                // image: row.product_image, // ❌ ไม่ส่งออก
              }
            : null,

          // ส่งออกเป็น array ของ string ไม่ส่ง id
          keys: [],
          items: [],
        });
      }

      const o = map.get(id);

      if (row.key_id && row.key_value) {
        // กัน duplicate จาก join ด้วยการเช็ค value
        if (!o.keys.includes(row.key_value)) {
          o.keys.push(row.key_value);
        }
      }

      if (row.item_id && row.item_value) {
        if (!o.items.includes(row.item_value)) {
          o.items.push(row.item_value);
        }
      }
    }

    const items = Array.from(map.values());

    return NextResponse.json({
      ok: true,
      page,
      limit,
      total,
      totalPages,
      items,
    });
  } catch (err) {
    console.error('orders history error', err);
    return NextResponse.json(
      { ok: false, message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' },
      { status: 500 }
    );
  }
}
