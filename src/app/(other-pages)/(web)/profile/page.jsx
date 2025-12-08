// app/account/page.jsx
import React from 'react';
import ProfileUser from '@/components/web/ProfileUser';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function Page() {
  const session = await getServerSession(authOptions);

  // ส่ง session เป็น prop เริ่มต้น (จะถูก serialise)
  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-3xl mx-auto">
        <ProfileUser initialSession={session ?? null} />
      </div>
    </div>
  );
}
