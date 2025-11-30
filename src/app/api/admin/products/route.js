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

export async function POST(req) {
  try {
    const body = await req.json();
    const name = (body.name || '').trim();
    if (!name) return NextResponse.json({ error: 'name_required' }, { status: 400 });

    const slug = slugify(body.slug || name);
    if (!slug) return NextResponse.json({ error: 'invalid_slug' }, { status: 400 });

    // check unique slug
    const existing = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    if (existing && existing.length) {
      return NextResponse.json({ error: 'slug_in_use' }, { status: 409 });
    }

    const values = {
      name,
      slug,
      description: body.description ?? null,
      price: Number(body.price ?? 0),
      stock: Number(body.stock ?? 0),
      sold: Number(body.sold ?? 0),
      category_id: body.category_id ? Number(body.category_id) : null,
      image: body.image ?? null,
      updated_at: new Date(),
      created_at: new Date(),
    };

    try {
      const inserted = await db.insert(products).values(values).returning();
      if (inserted && inserted[0]) return NextResponse.json(inserted[0], { status: 201 });
    } catch (e) {
      // some drivers may not support returning()
    }

    await db.insert(products).values(values).run();
    // fetch the last inserted row (fallback - adjust if you have better method)
    // NOTE: This fallback may not be accurate for concurrent inserts — prefer returning() in production
    const rows = await db.select().from(products).orderBy(products.id.desc).limit(1);
    return NextResponse.json(rows[0] || null, { status: 201 });
  } catch (err) {
    console.error('POST /api/admin/products error', err);
    return NextResponse.json({ error: 'server_error', detail: String(err) }, { status: 500 });
  }
}
