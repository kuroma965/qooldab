// app/admin/layout.jsx
import AdminNavbar from '@/components/admin/AdminNavbar';

export default function AdminLayout({ children }) {
  return (
    <>
        <AdminNavbar />
        <main>{children}</main>
    </>
  );
}
