// app/api/admin/products/route.js
import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';

function slugify(s = '') {
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get('page') || 1));
    const limit = Math.max(1, Number(url.searchParams.get('limit') || 12));
    const q = (url.searchParams.get('q') || '').trim();

    // Build basic where (search by name/slug/description)
    const whereClause = q
      ? (row) => (row.name.ilike ? row.name.ilike(`%${q}%`) : null) // placeholder, drivers differ
      : null;

    // Simple approach: get items (no complex query builder to ensure compatibility)
    // NOTE: For large datasets, replace with proper SQL count and filtered query (using Drizzle SQL helpers)
    const all = q
      ? await db.select().from(products).where(
          // naive: search on name or slug or description using ILIKE for postgres
          (products.name.ilike && products.name.ilike(`%${q}%`)) ||
          (products.slug.ilike && products.slug.ilike(`%${q}%`)) ||
          (products.description.ilike && products.description.ilike(`%${q}%`))
        )
      : await db.select().from(products);

    const total = all.length;
    const start = (page - 1) * limit;
    const items = all.slice(start, start + limit);

    return NextResponse.json({ items, total, page, limit }, { status: 200 });
  } catch (err) {
    console.error('GET /api/admin/products error', err);
    return NextResponse.json({ error: 'server_error', detail: String(err) }, { status: 500 });
  }
}