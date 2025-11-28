// src/app/page.js
import React from 'react';
import CountryExplorer from '../components/CountryExplorer'; 

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="py-12">
        <CountryExplorer />
      </div>
    </main>
  );
}
