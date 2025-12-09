// app/api/admin/products/route.js
import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { products, categories } from '@/db/schema';
import { eq } from 'drizzle-orm'; // 🆕 เพิ่มอันนี้

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get('q') || '').trim();
    const qLower = q.toLowerCase();

    // 🆕 ดึงเฉพาะสินค้าที่ is_active = true
    const allProducts = await db
      .select()
      .from(products)
      .where(eq(products.is_active, true));

    // ดึงหมวดหมู่ทั้งหมด เพื่อ map id/slug/name -> category_name
    const allCategories = await db.select().from(categories);

    const catByIdName = new Map();
    const catBySlugName = new Map();
    const catByNameName = new Map();

    allCategories.forEach((c) => {
      const idKey = c.id != null ? String(c.id) : null;
      const slugKey = c.slug != null ? String(c.slug).toLowerCase() : null;
      const nameKey = c.name != null ? String(c.name).toLowerCase() : null;
      if (idKey) catByIdName.set(idKey, c.name);
      if (slugKey) catBySlugName.set(slugKey, c.name);
      if (nameKey) catByNameName.set(nameKey, c.name);
    });

    const itemsWithCategory = allProducts.map((p) => {
      let categoryName = null;

      if (p.category_id != null) {
        categoryName = catByIdName.get(String(p.category_id)) ?? null;
      }

      return {
        ...p,
        category_name: categoryName,
      };
    });

    if (q) {
      const matchedCatIds = new Set(
        allCategories
          .filter((c) => {
            if (c.id != null && String(c.id) === q) return true;
            if (c.slug && String(c.slug).toLowerCase() === qLower) return true;
            if (c.name && String(c.name).toLowerCase() === qLower) return true;
            return false;
          })
          .map((c) => String(c.id))
      );

      const filtered = itemsWithCategory.filter((p) => {
        if (matchedCatIds.size > 0) {
          return (
            p.category_id != null &&
            matchedCatIds.has(String(p.category_id))
          );
        }

        if (String(p.id) === q) return true;
        if (p.name && p.name.toLowerCase().includes(qLower)) return true;

        return false;
      });

      return NextResponse.json({ items: filtered }, { status: 200 });
    }

    return NextResponse.json({ items: itemsWithCategory }, { status: 200 });
  } catch (err) {
    console.error('GET /api/admin/products error', err);
    return NextResponse.json(
      { error: 'server_error', detail: String(err) },
      { status: 500 }
    );
  }
}
