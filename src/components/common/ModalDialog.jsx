// components/common/ModalDialog.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function ModalDialog({
  open,
  onClose,
  title,
  icon,
  children,
  size = 'md',           // 'sm' | 'md' | 'lg'
  closeOnBackdrop = true,
  className = '',
}) {
  const [render, setRender] = useState(open);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      // เริ่มโชว์ modal + reset closing state
      setRender(true);
      setClosing(false);
    } else if (render) {
      // เล่น outro animation แล้วค่อย unmount
      setClosing(true);
      const timer = setTimeout(() => {
        setRender(false);
        setClosing(false);
      }, 200); // duration ให้ตรงกับ transition-* ด้านล่าง

      return () => clearTimeout(timer);
    }
  }, [open, render]);

  if (!render) return null;

  const sizeClass =
    size === 'sm'
      ? 'max-w-sm'
      : size === 'lg'
      ? 'max-w-2xl'
      : 'max-w-md';

  // state ของ animation
  const panelStateClass = closing
    ? 'opacity-0 translate-y-4 scale-95'
    : 'opacity-100 translate-y-0 scale-100';

  const backdropStateClass = closing
    ? 'opacity-0'
    : 'opacity-100';

  const handleBackdropClick = () => {
    if (!closeOnBackdrop) return;
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop + animation */}
      <div
        className={`
          absolute inset-0 bg-black/60 backdrop-blur-sm
          transition-opacity duration-200 ease-out
          ${backdropStateClass}
        `}
        onClick={handleBackdropClick}
      />

      {/* Panel + animation */}
      <div
        className={`
          relative w-full ${sizeClass} mx-4 rounded-2xl bg-gray-900
          border border-purple-700/70 shadow-2xl p-6 sm:p-7 z-10
          transform transition-all duration-200 ease-out
          ${panelStateClass}
          ${className}
        `}
      >
        {(title || icon) && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {icon && <div className="text-purple-300">{icon}</div>}
              {title && (
                <h3 className="text-lg font-semibold text-white">
                  {title}
                </h3>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
