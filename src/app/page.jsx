// src/app/page.js
import React from 'react';
import Home from '../components/web/Home.jsx';
import Navbar from '@/components/layout/Navbar.jsx';
import FooterCopyright from '@/components/layout/FooterCopyright';
import AnnouncementCenter from '@/components/common/Announcement.jsx'

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-950">
      <AnnouncementCenter />
      <Navbar />
      <div className="py-6">
        <Home />
      </div>
      <FooterCopyright />
    </main>
  );
}
