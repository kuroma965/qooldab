// app/api/admin/products/route.js
import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { products, categories } from '@/db/schema';

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get('q') || '').trim();
    const qLower = q.toLowerCase();

    // ดึงสินค้าทั้งหมด
    const allProducts = await db.select().from(products);

    // ดึงหมวดหมู่ทั้งหมด เพื่อ map id/slug/name -> category_name
    const allCategories = await db.select().from(categories);

    // สร้าง maps เพื่อ lookup ชื่อหมวดหมู่ ตาม id/slug/name (ใช้สำหรับเติม category_name)
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

    // ผนวก field category_name ให้ทุก product
    const itemsWithCategory = allProducts.map((p) => {
      let categoryName = null;

      if (p.category_id != null) {
        categoryName = catByIdName.get(String(p.category_id));
      }

      if (!categoryName && p.category_slug) {
        categoryName = catBySlugName.get(String(p.category_slug).toLowerCase());
      }

      if (!categoryName && p.category) {
        const cLower = String(p.category).toLowerCase();
        categoryName = catByNameName.get(cLower) ?? catBySlugName.get(cLower) ?? catByIdName.get(cLower);
      }

      const finalCategoryName = categoryName ?? p.category_name ?? p.category ?? null;

      return {
        ...p,
        category_name: finalCategoryName,
      };
    });

    // ถ้ามี q ให้กรองเฉพาะสินค้าที่อยู่ในหมวดหมู่ q
    if (q) {
      // หา category ids ที่ match q (q อาจเป็น id หรือ slug หรือ name)
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
        // ถ้าเจอ matchedCatIds ให้เช็ค category_id กับเซตนั้น
        if (matchedCatIds.size > 0) {
          return matchedCatIds.has(String(p.category_id));
        }

        // ถ้าไม่มี category ที่ match (แต่ผู้ใช้ส่ง q เป็น id/slug/name ของ product field เอง)
        // ให้ fallback เช็คหลายๆ ฟิลด์ของ product (category_id / category_slug / category / category_name)
        if (p.category_id != null && String(p.category_id) === q) return true;
        if (p.category_slug && String(p.category_slug).toLowerCase() === qLower) return true;
        if (p.category && String(p.category).toLowerCase() === qLower) return true;
        if (p.category_name && String(p.category_name).toLowerCase() === qLower) return true;

        return false;
      });

      return NextResponse.json({ items: filtered }, { status: 200 });
    }

    // ถ้าไม่มี q ส่งทั้งหมด
    return NextResponse.json({ items: itemsWithCategory }, { status: 200 });
  } catch (err) {
    console.error('GET /api/admin/products error', err);
    return NextResponse.json({ error: 'server_error', detail: String(err) }, { status: 500 });
  }
}
