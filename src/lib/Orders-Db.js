// lib/Orders-Db.js

const ORDERS_ENDPOINT = '/api/orders';

// ให้เหมือน DEFAULT_FETCH_OPTIONS ของ Cats-Prod-Db
const DEFAULT_POST_OPTIONS = {
  cache: 'no-store',
  credentials: 'include',
};

/**
 * createOrder:
 * เรียก API /api/orders (POST)
 * body: { productId, quantity }
 *
 * ตัว API ฝั่ง server จะ:
 *  - ดึง user จาก session (next-auth)
 *  - ดึง product จาก DB
 *  - คำนวณ total_price = quantity * product.price
 *  - เช็ค credits ผู้ใช้ว่าพอไหม
 *  - ตัดเครดิต, อัปเดต stock/sold, สร้าง row ใน orders (receipts)
 */
export async function createOrder(
  { productId, quantity = 1 } = {},
  opts = {}
) {
  const { fetchOptions = DEFAULT_POST_OPTIONS } = opts;

  const pid = Number(productId);
  const qtyRaw = Number(quantity ?? 1);
  const qty =
    Number.isFinite(qtyRaw) && qtyRaw > 0 ? Math.floor(qtyRaw) : 0;

  if (!pid || qty <= 0) {
    throw new Error('productId หรือ quantity ไม่ถูกต้อง');
  }

  const mergedOptions = {
    ...fetchOptions,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers || {}),
    },
    body: JSON.stringify({
      productId: pid,
      quantity: qty,
    }),
  };

  const res = await fetch(ORDERS_ENDPOINT, mergedOptions);

  let json = null;
  try {
    json = await res.json();
  } catch {
    // เผื่อ API ไม่ได้คืน JSON กลับมา
    json = null;
  }

  if (!res.ok || !json || json.ok === false) {
    const msg =
      (json && (json.message || json.error)) ||
      `สร้างออเดอร์ไม่สำเร็จ (${res.status})`;
    throw new Error(msg);
  }

  // json รูปแบบประมาณ:
  // {
  //   ok: true,
  //   message: 'ทำรายการสำเร็จ',
  //   order: { ... },
  //   credits: { before, after }
  // }
  return json;
}
