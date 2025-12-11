// app/api/redeem-coupon/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // แก้ path ตามโปรเจค
import { db } from '@/db/db';
import { users, coupons, couponRedemptions } from '@/db/schema';
import { eq, and, lt, or, isNull, gt } from 'drizzle-orm';

export async function POST(req) {
  try {
    // 1) เช็คว่า login อยู่ไหม
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: 'กรุณาเข้าสู่ระบบก่อนใช้งาน' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const code = body.code;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'กรุณาระบุโค้ดให้ถูกต้อง' },
        { status: 400 }
      );
    }

    const now = new Date();

    // 2) หา user ปัจจุบันจาก email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email));

    if (!user) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลผู้ใช้' },
        { status: 404 }
      );
    }

    // 3) หา coupon ตามโค้ด + ไม่หมดอายุ + ยังไม่ใช้ครบ
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(
        and(
          eq(coupons.code, code),
          or(isNull(coupons.expires_at), gt(coupons.expires_at, now)),
          lt(coupons.used_count, coupons.usage_limit)
        )
      );

    if (!coupon) {
      return NextResponse.json(
        { error: 'โค้ดนี้ไม่ถูกต้อง หมดอายุ หรือถูกใช้ครบแล้ว' },
        { status: 400 }
      );
    }

    // 4) เช็คว่า user คนนี้เคยใช้คูปองนี้ไปแล้วหรือยัง
    const [alreadyUsed] = await db
      .select()
      .from(couponRedemptions)
      .where(
        and(
          eq(couponRedemptions.coupon_id, coupon.id),
          eq(couponRedemptions.user_id, user.id)
        )
      );

    if (alreadyUsed) {
      return NextResponse.json(
        { error: 'คุณใช้คูปองโค้ดนี้ไปแล้ว ไม่สามารถใช้ซ้ำได้' },
        { status: 400 }
      );
    }

    // 5) บันทึกการใช้คูปองของ user นี้
    await db.insert(couponRedemptions).values({
      coupon_id: coupon.id,
      user_id: user.id,
    });

    // 6) อัปเดต used_count ของ coupon (ไม่ใช้ transaction แต่อัปเดตตรง ๆ)
    const newUsedCount = (coupon.used_count ?? 0) + 1;

    await db
      .update(coupons)
      .set({
        used_count: newUsedCount,
      })
      .where(eq(coupons.id, coupon.id));

    // 7) คำนวณเครดิต และอัปเดต user
    const creditAmount =
      typeof coupon.credit_amount === 'string'
        ? parseFloat(coupon.credit_amount)
        : Number(coupon.credit_amount ?? 0);

    const currentCredits =
      typeof user.credits === 'string'
        ? parseFloat(user.credits)
        : Number(user.credits ?? 0);

    const newCredits = currentCredits + creditAmount;

    await db
      .update(users)
      .set({
        credits: newCredits,
        updated_at: new Date(),
      })
      .where(eq(users.id, user.id));

    return NextResponse.json(
      {
        success: true,
        message: `เติมเงินสำเร็จ +${creditAmount} credits`,
        data: {
          creditAmount,
          newCredits,
          code: coupon.code,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('redeem-coupon error', err);

    // เผื่ออนาคตถ้า unique constraint ของ coupon_redemptions เด้งมา (กันเผื่อ)
    if (err && err.code === '23505') {
      return NextResponse.json(
        { error: 'คุณใช้คูปองโค้ดนี้ไปแล้ว ไม่สามารถใช้ซ้ำได้' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์' },
      { status: 500 }
    );
  }
}
