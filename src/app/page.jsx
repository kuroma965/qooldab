// src/app/page.js
import React from 'react';
import GameShop from '../components/GameShop.jsx.jsx'; 
import Navbar from '@/components/common/Navbar';

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-950">
    <Navbar />
      
      <div className="py-12">
        <GameShop />
      </div>
    </main>
  );
}
