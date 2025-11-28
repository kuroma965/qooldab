// app/api/auth/logout/route.js
import { NextResponse } from 'next/server';

export async function POST() {
  const cookie = `token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax;`;

  return NextResponse.json(
    { ok: true },
    {
      status: 200,
      headers: {
        'Set-Cookie': cookie,
      },
    }
  );
}
