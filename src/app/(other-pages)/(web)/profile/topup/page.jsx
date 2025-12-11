// app/account/page.jsx
import React from 'react';
import TopupPage from '@/components/web/user/topup/TopupPage';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function Page() {
  const session = await getServerSession(authOptions);

  // ส่ง session เป็น prop เริ่มต้น (จะถูก serialise)
  return (
    <div className=" bg-gray-950 p-8">
        <TopupPage initialSession={session ?? null} />
    </div>
  );
}
