// app/(other-pages)/layout.js
import Navbar from '@/components/layout/Navbar';
import FooterCopyright from '@/components/layout/FooterCopyright';

export default function OtherPagesLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className='bg-gray-950'>
        {children}
        <FooterCopyright />
      </main>
    </>
  );
}
