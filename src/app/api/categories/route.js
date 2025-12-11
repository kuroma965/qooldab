import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { categories } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const items = await db
      .select()
      .from(categories)
      .orderBy(desc(categories.created_at));

    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    console.error('GET /api/categories error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
