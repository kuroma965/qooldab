import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { products, categories } from '@/db/schema';
import { and, eq, ilike } from 'drizzle-orm';

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get('q') || '').trim();
    const qLower = q.toLowerCase();

    // base condition: เฉพาะ is_active = true
    let whereCond = eq(products.is_active, true);

    let categoryIdFilter = null;

    if (q) {
      // ลองแมตช์ category ก่อน
      const cat = await db
        .select()
        .from(categories)
        .where(
          or(
            eq(categories.slug, qLower),
            eq(categories.name, q),
            eq(categories.id, Number.isFinite(Number(q)) ? Number(q) : -1)
          )
        )
        .limit(1);

      if (cat[0]) {
        categoryIdFilter = cat[0].id;
      }
    }

    // ถ้าเจอหมวดจาก q → filter ด้วย category_id
    if (categoryIdFilter != null) {
      whereCond = and(whereCond, eq(products.category_id, categoryIdFilter));
    } else if (q) {
      // ถ้าไม่ใช่หมวด ลองใช้ id / ชื่อสินค้าแทน
      const asNumber = Number(q);
      if (Number.isFinite(asNumber)) {
        whereCond = and(whereCond, eq(products.id, asNumber));
      } else {
        whereCond = and(whereCond, ilike(products.name, `%${q}%`));
      }
    }

    const rows = await db
      .select()
      .from(products)
      .where(whereCond);

    // ดึง category แค่สำหรับที่จำเป็น (หรือจะดึงทั้งหมดเหมือนเดิมก็ได้)
    const allCategories = await db.select().from(categories);
    const catByIdName = new Map(
      allCategories.map((c) => [String(c.id), c.name])
    );

    const itemsWithCategory = rows.map((p) => ({
      ...p,
      category_name:
        p.category_id != null
          ? catByIdName.get(String(p.category_id)) ?? null
          : null,
    }));

    return NextResponse.json({ items: itemsWithCategory }, { status: 200 });
  } catch (err) {
    console.error('GET /api/admin/products error', err);
    return NextResponse.json(
      { error: 'server_error', detail: String(err) },
      { status: 500 }
    );
  }
}
