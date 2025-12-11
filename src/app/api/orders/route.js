// app/api/orders/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/db/db';
import {
  users,
  products,
  orders,
  keys,
  productItems,
} from '@/db/schema';
import { eq, and, isNull, inArray } from 'drizzle-orm';

export async function POST(req) {
  try {
    // 1) auth
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { ok: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' },
        { status: 401 }
      );
    }
    const userId = Number(session.user.id);

    // 2) body
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { ok: false, message: 'รูปแบบข้อมูลไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    const productId = Number(body.productId);
    const quantityRaw = Number(body.quantity ?? 1);
    const quantity =
      Number.isFinite(quantityRaw) && quantityRaw > 0
        ? Math.floor(quantityRaw)
        : 0;

    if (!productId || quantity <= 0) {
      return NextResponse.json(
        { ok: false, message: 'productId หรือ quantity ไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // 3) product
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      return NextResponse.json(
        { ok: false, message: 'ไม่พบสินค้า' },
        { status: 404 }
      );
    }

    if (product.stock != null && product.stock < quantity) {
      return NextResponse.json(
        { ok: false, message: 'จำนวนสินค้าในสต็อกไม่เพียงพอ' },
        { status: 400 }
      );
    }

    // 3.1 สินค้าแบบจำกัดสิทธิ์
    if (product.is_limited_per_user) {
      const [existingOrder] = await db
        .select({ id: orders.id })
        .from(orders)
        .where(
          and(
            eq(orders.user_id, userId),
            eq(orders.product_id, productId)
          )
        )
        .limit(1);

      if (existingOrder) {
        return NextResponse.json(
          {
            ok: false,
            message: 'คุณได้ใช้สิทธิ์ซื้อสินค้านี้ไปแล้ว ไม่สามารถซื้อซ้ำได้',
          },
          { status: 400 }
        );
      }

      if (quantity !== 1) {
        return NextResponse.json(
          {
            ok: false,
            message: 'สินค้านี้จำกัดสิทธิ์ให้ซื้อได้คนละ 1 ชิ้นเท่านั้น',
          },
          { status: 400 }
        );
      }
    }

    // 4) ราคาสินค้า
    const unitPrice = Number(product.price ?? 0);
    const totalPrice = unitPrice * quantity;

    if (!Number.isFinite(totalPrice) || totalPrice < 0) {
      return NextResponse.json(
        { ok: false, message: 'ราคาสินค้าไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // 5) user + credits
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { ok: false, message: 'ไม่พบผู้ใช้' },
        { status: 404 }
      );
    }

    const currentCredits = Number(user.credits ?? 0);

    if (totalPrice > 0 && currentCredits < totalPrice) {
      return NextResponse.json(
        {
          ok: false,
          message: 'เครดิตไม่พอสำหรับทำรายการ',
          currentCredits,
          needed: totalPrice,
        },
        { status: 400 }
      );
    }

    // 6) ก่อนตัดเงิน / สร้าง order → เช็ก key / item ว่าพอไหม
    let assignedKeys = [];
    let assignedItems = [];
    let mode = null; // 'keys' หรือ 'items'

    // 6.1 ลองใช้ keys ก่อน
    const availableKeys = await db
      .select()
      .from(keys)
      .where(
        and(
          eq(keys.product_id, productId),
          isNull(keys.order_id),
        )
      )
      .limit(quantity);

    let keyIdsToAssign = [];
    let itemIdsToAssign = [];

    if (availableKeys.length >= quantity) {
      mode = 'keys';
      keyIdsToAssign = availableKeys
        .slice(0, quantity)
        .map((k) => k.id);
    } else if (availableKeys.length === 0) {
      // ไม่มี key ว่างเลย → ใช้ product_items แทน
      const availableItems = await db
        .select()
        .from(productItems)
        .where(
          and(
            eq(productItems.product_id, productId),
            isNull(productItems.order_id)
          )
        )
        .limit(quantity);

      if (availableItems.length >= quantity) {
        mode = 'items';
        itemIdsToAssign = availableItems
          .slice(0, quantity)
          .map((i) => i.id);
      } else {
        // ทั้ง keys และ product_items ไม่มีพอ → แจ้ง error
        console.error(
          'not enough product_items for order',
          'need',
          quantity,
          'have',
          availableItems.length
        );
        return NextResponse.json(
          {
            ok: false,
            message:
              'จำนวน key / item สำหรับสินค้านี้ไม่เพียงพอ กรุณาติดต่อผู้ดูแลระบบ',
          },
          { status: 500 }
        );
      }
    } else {
      // มี keys บ้างแต่ไม่ครบ quantity → ไม่ยอมให้ผ่าน
      console.error(
        'not enough keys for order',
        'need',
        quantity,
        'have',
        availableKeys.length
      );
      return NextResponse.json(
        {
          ok: false,
          message:
            'จำนวน key สำหรับสินค้านี้ไม่เพียงพอ กรุณาติดต่อผู้ดูแลระบบ',
        },
        { status: 500 }
      );
    }

    // ถึงตรงนี้ = mode ต้องเป็น 'keys' หรือ 'items' แน่นอน แล้วมี id ที่จะใช้ครบตาม quantity แล้ว

    const newCredits =
      totalPrice > 0 ? currentCredits - totalPrice : currentCredits;

    // 7) ไม่มี transaction → ทำทีละคำสั่ง

    // 7.1 อัปเดตเครดิต
    if (totalPrice > 0) {
      await db
        .update(users)
        .set({ credits: newCredits })
        .where(eq(users.id, userId));
    }

    // 7.2 อัปเดต stock / sold
    await db
      .update(products)
      .set({
        stock:
          product.stock != null ? product.stock - quantity : product.stock,
        sold: (product.sold ?? 0) + quantity,
      })
      .where(eq(products.id, productId));

    // 7.3 สร้าง order
    const [inserted] = await db
      .insert(orders)
      .values({
        user_id: userId,
        product_id: productId,
        quantity,
        total_price: totalPrice,
      })
      .returning();

    const orderId = inserted.id;

    // 7.4 ผูก key หรือ item ตาม mode ที่เลือกไว้
    if (mode === 'keys' && keyIdsToAssign.length > 0) {
      await db
        .update(keys)
        .set({
          order_id: orderId,
          status: 'unused', // ใส่ค่าเดิมตามที่คุณใช้ ไม่ไปยุ่ง logic อื่น
        })
        .where(inArray(keys.id, keyIdsToAssign));

      assignedKeys = keyIdsToAssign;
    } else if (mode === 'items' && itemIdsToAssign.length > 0) {
      await db
        .update(productItems)
        .set({
          order_id: orderId,
        })
        .where(inArray(productItems.id, itemIdsToAssign));

      assignedItems = itemIdsToAssign;
    }

    // 8) response
    return NextResponse.json({
      ok: true,
      message: 'ทำรายการสำเร็จ',
      order: {
        id: inserted.id,
        user_id: inserted.user_id,
        product_id: inserted.product_id,
        quantity: inserted.quantity,
        total_price: inserted.total_price,
        created_at: inserted.created_at,
      },
      credits: {
        before: currentCredits,
        after: newCredits,
      },
    });
  } catch (err) {
    console.error('order create error', err);
    return NextResponse.json(
      { ok: false, message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' },
      { status: 500 }
    );
  }
}
