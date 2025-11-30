// app/api/account/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/db/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
    }
    const uid = Number(session.user.id);

    const body = await req.json();
    const updates = {};

    // only allow name change (per request)
    if (body.name !== undefined) {
      const nm = String(body.name ?? '').trim();
      if (nm.length === 0) {
        return NextResponse.json({ error: 'name_required' }, { status: 400 });
      }
      if (nm.length > 100) {
        return NextResponse.json({ error: 'name_too_long' }, { status: 400 });
      }
      updates.name = nm;
    }

    // include image only if provided in payload
    if (body.image !== undefined) {
      // allow explicit null to clear image
      updates.image = body.image === null ? null : String(body.image).trim();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'nothing_to_update' }, { status: 400 });
    }

    // always update updated_at
    updates.updated_at = new Date();

    // run update (using returning if supported)
    const res = await db.update(users).set(updates).where(eq(users.id, uid)).returning();
    let updated;
    if (res && res[0]) updated = res[0];
    else {
      const sel = await db.select().from(users).where(eq(users.id, uid)).limit(1);
      updated = sel[0];
    }

    if (!updated) {
      return NextResponse.json({ error: 'update_failed' }, { status: 500 });
    }

    // return safe fields including updated_at
    const safe = {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      image: updated.image ?? null,
      created_at: updated.created_at,
      updated_at: updated.updated_at,
    };

    return NextResponse.json({ user: safe });
  } catch (err) {
    console.error('PATCH /api/account error', err);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
