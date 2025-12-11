// components/layout/FooterCopyright.jsx
'use client';

import React from 'react';

export default function FooterCopyright() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 border-t border-gray-800 bg-black/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center justify-center gap-1 text-center">
          <p className="text-xs sm:text-sm text-gray-400">
            © {year}{' '}
            <span className="font-semibold text-gray-200">Qooldab.</span>{' '}
            <span className="text-gray-500">
              All Rights Reserved.
            </span>
          </p>

          <p className="text-[11px] sm:text-xs text-gray-500">
            Powered by{' '}
            <span className="text-purple-300">
              reqilerDev
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
