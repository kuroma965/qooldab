// app/api/upload/route.js
import { NextResponse } from 'next/server';

const PIC_API_URL = 'https://pic.in.th/api/1/upload';
const MAX_RETRIES = 5; // ลองเปลี่ยนชื่ออัพใหม่ไม่เกิน 5 ครั้ง

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get('file');

    if (!file) {
      return NextResponse.json({ error: 'missing_file' }, { status: 400 });
    }

    // quick size guard
    const MAX = 15 * 1024 * 1024; // 15 MB
    if (typeof file.size === 'number' && file.size > MAX) {
      return NextResponse.json(
        { error: 'file_too_large', maxBytes: MAX },
        { status: 413 }
      );
    }

    const PIC_DEFAULT_ALBUM_ID = process.env.PIC_DEFAULT_ALBUM_ID;
    const PIC_API_KEY = process.env.PIC_API_KEY;
    if (!PIC_API_KEY) {
      console.warn('PIC_API_KEY not set; upstream may reject the request');
    }

    const originalName = file.name || 'upload.jpg';

    // helper: สร้างชื่อใหม่ไม่ให้ซ้ำ (เติม timestamp + random)
    function makeFilename(baseName, attempt) {
      const idx = baseName.lastIndexOf('.');
      const base =
        idx > 0 ? baseName.slice(0, idx) : baseName;
      const ext = idx > 0 ? baseName.slice(idx) : '';
      if (attempt === 0) return baseName;
      return `${base}-${Date.now()}-${Math.floor(
        Math.random() * 10000
      )}${ext}`;
    }

    // helper: เช็คว่า error แบบไหนที่ควรลองใหม่
    function isRetryableError(upstreamStatus, upstreamJson) {
      if (upstreamStatus !== 400) return false;
      const msg = upstreamJson?.error?.message || '';
      // คุณจะปรับเงื่อนไขให้เฉพาะเคสชื่อซ้ำก็ได้
      if (msg.includes('file_put_contents')) return true;
      if (msg.includes('already exists')) return true;
      if (msg.includes('No space left on device')) return true; // ตามตัวอย่างที่ให้มา
      return false;
    }

    let lastErrorJson = null;
    let lastStatus = 500;

    // ลองอัพโหลดซ้ำโดยเปลี่ยนชื่อไฟล์
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const filename = makeFilename(originalName, attempt);

      const forwardFd = new FormData();
      forwardFd.append('source', file, filename);
      forwardFd.append('format', 'json');
      if (PIC_DEFAULT_ALBUM_ID) {
        forwardFd.append('album_id', String(PIC_DEFAULT_ALBUM_ID));
      }
      if (PIC_API_KEY) {
        forwardFd.append('key', String(PIC_API_KEY));
      }

      const upstream = await fetch(PIC_API_URL, {
        method: 'POST',
        body: forwardFd,
      });

      const upstreamJson = await upstream.json().catch(() => ({}));

      // ถ้าอัพโหลดสำเร็จ return เลย
      if (upstream.ok) {
        return NextResponse.json(upstreamJson, { status: upstream.status });
      }

      // เก็บ error ไว้เผื่อรอบสุดท้ายต้องคืนให้ client
      lastErrorJson = upstreamJson;
      lastStatus = upstream.status || 500;

      // ถ้า error นี้ไม่ควร retry หรือเดินมาถึงรอบสุดท้ายแล้ว -> ออกเลย
      if (!isRetryableError(upstream.status, upstreamJson) || attempt === MAX_RETRIES - 1) {
        return NextResponse.json(
          lastErrorJson || { error: 'upstream_error' },
          { status: lastStatus }
        );
      }

      // ถ้าเป็น error แบบ retry ได้ -> loop ต่อไป ด้วยชื่อไฟล์ใหม่
      console.warn(
        `Upload attempt ${attempt + 1} failed, retry with new filename...`,
        upstreamJson
      );
    }

    // เผื่อหลุดมาถึงตรงนี้ (ปกติจะ return ไปใน loop แล้ว)
    return NextResponse.json(
      lastErrorJson || { error: 'upload_failed' },
      { status: lastStatus }
    );
  } catch (err) {
    console.error('POST /api/upload error', err);
    return NextResponse.json(
      { error: 'server_error', detail: String(err) },
      { status: 500 }
    );
  }
}
