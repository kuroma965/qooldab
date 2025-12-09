// src/app/page.js
import React from 'react';
import Home from '../components/web/Home.jsx';
import Navbar from '@/components/layout/Navbar.jsx';
import FooterCopyright from '@/components/layout/FooterCopyright';

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="py-6">
        <Home />
      </div>
      <FooterCopyright />
    </main>
  );
}
