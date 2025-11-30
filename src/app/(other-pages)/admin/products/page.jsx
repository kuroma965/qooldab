// app/admin/products/page.jsx
import React from 'react';
import ProductsManager from '@/components/admin/products/ProductsManager';

export default function AdminCategoriesPage() {
  return (
    <div className="min-h-screen p-8 bg-gray-950">
      <ProductsManager />
    </div>
  );
}
