// app/(other-pages)/layout.js
import Navbar from '@/components/common/Navbar';

export default function OtherPagesLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>
        <div className='py-[-200px]'>
          {children}
        </div>
      </main>
    </>
  );
}
