// app/(other-pages)/layout.js
import Navbar from '@/components/common/Navbar';

export default function OtherPagesLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className='bg-gray-950'>
        {children}
      </main>
    </>
  );
}
