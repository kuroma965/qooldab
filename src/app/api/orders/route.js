// app/api/orders/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/db/db';
import { users, products, orders } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

    // 4) ราคาสินค้า
    const unitPrice = Number(product.price ?? 0);
    const totalPrice = unitPrice * quantity;

    // อนุญาตให้ราคา 0 ได้ (ของฟรี) แต่ห้ามติดลบ/NaN
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

    const newCredits =
      totalPrice > 0 ? currentCredits - totalPrice : currentCredits;

    // 6) ⚠️ ไม่มี transaction ใช้แบบทีละคำสั่งแทน ⚠️

    // 6.1 อัปเดตเครดิต (เฉพาะกรณีต้องตัดเงิน)
    if (totalPrice > 0) {
      await db
        .update(users)
        .set({ credits: newCredits })
        .where(eq(users.id, userId));
    }

    // 6.2 อัปเดต stock / sold
    await db
      .update(products)
      .set({
        stock:
          product.stock != null ? product.stock - quantity : product.stock,
        sold: (product.sold ?? 0) + quantity,
      })
      .where(eq(products.id, productId));

    // 6.3 สร้างใบสั่งซื้อ (orders)
    const [inserted] = await db
      .insert(orders)
      .values({
        user_id: userId,
        product_id: productId,
        quantity,
        total_price: totalPrice,
        // created_at ใช้ defaultNow() จาก schema
      })
      .returning();

    // 7) response
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
