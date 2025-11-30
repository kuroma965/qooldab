// app/api/admin/categories/[id]/route.js
import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { categories } from '@/db/schema';
import { eq } from 'drizzle-orm';

function slugify(s) {
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isNumericId(param) {
  return /^[0-9]+$/.test(param);
}

export async function GET(req, ctx) {
  try {
    const { params } = ctx;
    const { id } = await params; // <<< await here
    let rows;
    if (isNumericId(id)) {
      rows = await db.select().from(categories).where(eq(categories.id, Number(id))).limit(1);
    } else {
      rows = await db.select().from(categories).where(eq(categories.slug, id)).limit(1);
    }

    const item = rows && rows[0];
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(item);
  } catch (err) {
    console.error('GET /api/categories/[id] error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req, ctx) {
  try {
    const { params } = ctx;
    const { id } = await params; // <<< await here

    if (!isNumericId(id)) {
      return NextResponse.json({ error: 'PATCH requires numeric id' }, { status: 400 });
    }
    const body = await req.json();
    const updates = {};

    if (body.name !== undefined) updates.name = String(body.name).trim();
    if (body.description !== undefined) updates.description = body.description ?? null;
    if (body.image !== undefined) updates.image = body.image ?? null;
    if (body.slug !== undefined) {
      const newSlug = slugify(body.slug || body.name || '');
      if (!newSlug) return NextResponse.json({ error: 'invalid slug' }, { status: 400 });
      const existing = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, newSlug))
        .limit(1);

      if (existing && existing.length && Number(existing[0].id) !== Number(id)) {
        return NextResponse.json({ error: 'slug already in use' }, { status: 409 });
      }
      updates.slug = newSlug;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'no fields to update' }, { status: 400 });
    }

    updates.updated_at = new Date();

    try {
      const updated = await db
        .update(categories)
        .set(updates)
        .where(eq(categories.id, Number(id)))
        .returning();
      if (updated && updated[0]) return NextResponse.json(updated[0]);
    } catch (e) {
      // some drivers don't support returning(); fallthrough
    }

    await db.update(categories).set(updates).where(eq(categories.id, Number(id))).run();
    const rows = await db.select().from(categories).where(eq(categories.id, Number(id))).limit(1);
    if (!rows || !rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('PATCH /api/categories/[id] error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req, ctx) {
  try {
    const { params } = ctx;
    const { id } = await params; // <<< await here

    if (!isNumericId(id)) {
      return NextResponse.json({ error: 'DELETE requires numeric id' }, { status: 400 });
    }

    try {
      const deleted = await db.delete(categories).where(eq(categories.id, Number(id))).returning();
      if (deleted && deleted.length) return NextResponse.json({ success: true });
    } catch (e) {
      // fallback
    }

    await db.delete(categories).where(eq(categories.id, Number(id))).run();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/categories/[id] error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
