// src/app/page.js
import React from 'react';
import Home from '../components/web/Home.jsx'; 
import Navbar from '@/components/common/Navbar';

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-950">
    <Navbar />
      
      <div className="py-8">
        <Home />
      </div>
    </main>
  );
}
