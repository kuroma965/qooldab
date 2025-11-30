// app/api/admin/products/[id]/route.js
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

function isNumericId(val) {
  return /^[0-9]+$/.test(String(val));
}

export async function GET(req, ctx) {
  try {
    const { params } = ctx;
    const { id } = await params;
    if (!isNumericId(id)) return NextResponse.json({ error: 'invalid_id' }, { status: 400 });

    const rows = await db.select().from(products).where(eq(products.id, Number(id))).limit(1);
    if (!rows || !rows[0]) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json(rows[0], { status: 200 });
  } catch (err) {
    console.error('GET /api/admin/products/[id] error', err);
    return NextResponse.json({ error: 'server_error', detail: String(err) }, { status: 500 });
  }
}

export async function PATCH(req, ctx) {
  try {
    const { params } = ctx;
    const { id } = await params;
    if (!isNumericId(id)) return NextResponse.json({ error: 'invalid_id' }, { status: 400 });

    const body = await req.json();
    const updates = {};

    if (body.name !== undefined) updates.name = String(body.name).trim();
    if (body.slug !== undefined) updates.slug = slugify(body.slug || body.name || '');
    if (body.description !== undefined) updates.description = body.description ?? null;
    if (body.price !== undefined) updates.price = Number(body.price ?? 0);
    if (body.stock !== undefined) updates.stock = Number(body.stock ?? 0);
    if (body.sold !== undefined) updates.sold = Number(body.sold ?? 0);
    if (body.category_id !== undefined) updates.category_id = body.category_id ? Number(body.category_id) : null;
    if (body.image !== undefined) updates.image = body.image ?? null;

    if (updates.slug) {
      const existing = await db.select().from(products).where(eq(products.slug, updates.slug)).limit(1);
      if (existing && existing.length && Number(existing[0].id) !== Number(id)) {
        return NextResponse.json({ error: 'slug_in_use' }, { status: 409 });
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'no_fields' }, { status: 400 });
    }

    updates.updated_at = new Date();

    try {
      const updated = await db.update(products).set(updates).where(eq(products.id, Number(id))).returning();
      if (updated && updated[0]) return NextResponse.json(updated[0], { status: 200 });
    } catch (e) {
      // fallback
    }

    await db.update(products).set(updates).where(eq(products.id, Number(id))).run();
    const rows = await db.select().from(products).where(eq(products.id, Number(id))).limit(1);
    if (!rows || !rows[0]) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json(rows[0], { status: 200 });
  } catch (err) {
    console.error('PATCH /api/admin/products/[id] error', err);
    return NextResponse.json({ error: 'server_error', detail: String(err) }, { status: 500 });
  }
}

export async function DELETE(req, ctx) {
  try {
    const { params } = ctx;
    const { id } = await params;
    if (!isNumericId(id)) return NextResponse.json({ error: 'invalid_id' }, { status: 400 });

    try {
      const deleted = await db.delete(products).where(eq(products.id, Number(id))).returning();
      if (deleted && deleted.length) return NextResponse.json({ success: true }, { status: 200 });
    } catch (e) {
      // fallback
    }

    await db.delete(products).where(eq(products.id, Number(id))).run();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('DELETE /api/admin/products/[id] error', err);
    return NextResponse.json({ error: 'server_error', detail: String(err) }, { status: 500 });
  }
}
