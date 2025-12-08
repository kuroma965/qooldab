// app/products/[slug]/page.jsx
import React from 'react';
import ProductDetailPage from '@/components/web/products/Product';

export default async function Page({ params }) {
  const { slug } = await params; // Next 16: params เป็น Promise

  return (
    <main>
      <ProductDetailPage slug={slug} />
    </main>
  );
}
