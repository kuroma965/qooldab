// app/api/categories/route.js
import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { categories } from '@/db/schema';
import { eq } from 'drizzle-orm';

// simple slugify
function slugify(s) {
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

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
    const url = new URL(req.url);
    const q = url.searchParams.get('q') || '';
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10));

    // NOTE: for simplicity we load all and filter in JS.
    // For large tables you should use a DB WHERE + LIMIT query.
    const all = await db.select().from(categories);
    let filtered = all;

    if (q) {
      const ql = q.toLowerCase();
      filtered = all.filter(
        (c) =>
          (c.name && c.name.toLowerCase().includes(ql)) ||
          (c.slug && c.slug.toLowerCase().includes(ql)) ||
          (c.description && c.description.toLowerCase().includes(ql))
      );
    }

    // sort by created_at desc (if field exists)
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const total = filtered.length;
    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit);

    return NextResponse.json({ items, total, page, limit });
  } catch (err) {
    console.error('GET /api/categories error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const name = (body.name || '').trim();
    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const slug = slugify(body.slug || name);
    if (!slug) {
      return NextResponse.json({ error: 'invalid slug' }, { status: 400 });
    }

    // check slug uniqueness
    const exists = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    if (exists && exists.length) {
      return NextResponse.json({ error: 'slug already exists' }, { status: 409 });
    }

    const insertObj = {
      name,
      slug,
      description: body.description ?? null,
      image: body.image ?? null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const created = await insertCategory(insertObj);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error('POST /api/categories error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
