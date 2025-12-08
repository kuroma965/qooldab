// app/categories/[slug]/page.jsx
import React from 'react';
import CategoryProducts from '@/components/web/categories/Category';

export default async function Page({ params }) {
  const { slug } = await params;   // Next 16 style

  return (
    <main className=''>
      <CategoryProducts slug={slug} />
    </main>
  );
}
