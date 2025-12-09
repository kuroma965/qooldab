// components/common/PageLoadingOverlay.jsx
'use client';

import { Loader2 } from 'lucide-react';

export default function PageLoadingOverlay({
  open = false,
  label = 'กำลังโหลด...',
}) {
  if (!open) return null;

  return (
    <div className="fixed  inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm rounded-2xl">
      <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
      <div className="text-white font-medium text-sm sm:text-base">
        {label}
      </div>
    </div>
  );
}
