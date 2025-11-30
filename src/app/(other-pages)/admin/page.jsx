// app/admin/categories/page.jsx
import React from 'react';
import CategoriesManager from '@/components/admin/categories/CategoriesManager';

export default function AdminCategoriesPage() {
  return (
    <div className="min-h-screen p-8 bg-gray-950">
      <CategoriesManager />
    </div>
  );
}
