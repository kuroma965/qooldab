// lib/Announcements-Db.js

const ANNOUNCEMENTS_ENDPOINT = '/api/announcements';

const DEFAULT_FETCH_OPTIONS = {
  cache: 'no-store',
  credentials: 'include',
};

// cache เบา ๆ กันยิง API รัว ๆ ตอนอยู่หน้าเดียวกัน
let _cache = null;
let _cacheTime = 0;
const CACHE_MS = 60 * 1000; // 60 วินาที

/**
 * getAnnouncements:
 *  - ดึงประกาศจาก /api/announcements
 *  - รองรับ forceReload, limit
 *
 * @param {Object} params
 * @param {boolean} params.forceReload - true = ไม่ใช้ cache
 * @param {number} params.limit        - จำกัดจำนวนประกาศที่ดึง
 * @param {Object} opts
 * @param {Object} opts.fetchOptions   - override options ให้ fetch
 */
export async function getAnnouncements(
  { forceReload = false, limit = null } = {},
  opts = {}
) {
  const now = Date.now();

  if (!forceReload && _cache && now - _cacheTime < CACHE_MS) {
    // ถ้าข้อมูลใน cache ยังไม่เก่า
    return _cache;
  }

  const { fetchOptions = DEFAULT_FETCH_OPTIONS } = opts;

  const url = new URL(ANNOUNCEMENTS_ENDPOINT, window.location.origin);
  if (limit && Number.isFinite(Number(limit)) && Number(limit) > 0) {
    url.searchParams.set('limit', String(limit));
  }

  const res = await fetch(url.toString(), {
    ...fetchOptions,
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      ...(fetchOptions.headers || {}),
    },
  });

  if (!res.ok) {
    let msg = `โหลดประกาศไม่สำเร็จ (${res.status})`;
    try {
      const j = await res.json();
      if (j?.error) msg = j.error;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  const json = await res.json();
  const items = Array.isArray(json.items) ? json.items : [];

  _cache = items;
  _cacheTime = now;

  return items;
}

/**
 * getLatestAnnouncement:
 *  - ดึงแค่ประกาศล่าสุด 1 อัน
 */
export async function getLatestAnnouncement(opts = {}) {
  const items = await getAnnouncements({ forceReload: false, limit: 1 }, opts);
  return items[0] ?? null;
}
