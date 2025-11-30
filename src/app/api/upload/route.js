// app/api/upload/route.js
import { NextResponse } from 'next/server';

const PIC_API_URL = 'https://pic.in.th/api/1/upload';

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get('file');

    if (!file) {
      return NextResponse.json({ error: 'missing_file' }, { status: 400 });
    }

    // quick size guard (ปรับขนาดสูงสุดตามต้องการ)
    const MAX = 15 * 1024 * 1024; // 15 MB
    if (typeof file.size === 'number' && file.size > MAX) {
      return NextResponse.json({ error: 'file_too_large', maxBytes: MAX }, { status: 413 });
    }

    const forwardFd = new FormData();
    forwardFd.append('source', file, file.name || 'upload.jpg');
    forwardFd.append('format', 'json');

    // ใช้ album id จาก server env เสมอ (ไม่รับจาก client ในตัวอย่างนี้)
    const PIC_DEFAULT_ALBUM_ID = process.env.PIC_DEFAULT_ALBUM_ID; // ใส่ใน .env.local
    if (PIC_DEFAULT_ALBUM_ID) {
      forwardFd.append('album_id', String(PIC_DEFAULT_ALBUM_ID));
    }

    // API key จาก env เท่านั้น (อย่าให้อยู่ใน client)
    const PIC_API_KEY = process.env.PIC_API_KEY;
    if (PIC_API_KEY) {
      forwardFd.append('key', String(PIC_API_KEY));
    } else {
      console.warn('PIC_API_KEY not set; upstream may reject the request');
    }

    const upstream = await fetch(PIC_API_URL, {
      method: 'POST',
      body: forwardFd,
    });

    const upstreamJson = await upstream.json().catch(() => ({}));
    return NextResponse.json(upstreamJson, { status: upstream.status });
  } catch (err) {
    console.error('POST /api/upload error', err);
    return NextResponse.json({ error: 'server_error', detail: String(err) }, { status: 500 });
  }
}
