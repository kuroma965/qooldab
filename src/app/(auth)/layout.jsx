// app/(other-pages)/layout.js
import Navbar from '@/components/layout/Navbar';
import FooterCopyright from '@/components/layout/FooterCopyright';

export default function OtherPagesLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>
        <div className='py-[-200px]'>
          {children}
        </div>
        <FooterCopyright />
      </main>
    </>
  );
}
