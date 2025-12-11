// app/api/announcements/route.js
import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { announcements } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const limitRaw = url.searchParams.get('limit');
    const limit = limitRaw ? Number(limitRaw) : null;

    let query = db
      .select()
      .from(announcements)
      .orderBy(desc(announcements.created_at));

    // ถ้าส่ง ?limit=5 มาก็จำกัดจำนวน
    if (limit && Number.isFinite(limit) && limit > 0) {
      query = query.limit(limit);
    }

    const items = await query;

    return NextResponse.json(
      { items },
      { status: 200 },
    );
  } catch (err) {
    console.error('GET /api/announcements error', err);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 },
    );
  }
}
