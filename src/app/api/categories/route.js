// app/api/categories/route.js
import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { categories } from '@/db/schema';
import { eq } from 'drizzle-orm';

// helper to insert and return created row (handles drivers w/o .returning())
async function insertCategory(values) {
  try {
    const res = await db.insert(categories).values(values).returning();
    if (res && res[0]) return res[0];
    // fallback
    await db.insert(categories).values(values).run();
    const r = await db.select().from(categories).where(eq(categories.slug, values.slug)).limit(1);
    return r[0];
  } catch (err) {
    throw err;
  }
}

export async function GET(req) {
  try {
    // ดึงทั้งหมดตามคำขอ (ส่งทั้งหมด ไม่มีการค้นหา/กรอง)
    const all = await db.select().from(categories);
    const items = Array.isArray(all) ? all.slice() : [];

    // เรียงล่าสุดก่อน (ถ้ามี created_at)
    items.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    console.error('GET /api/categories error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
