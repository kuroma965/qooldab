// components/admin/categories/CategoriesManager.jsx
'use client';
import React, { useEffect, useState, useCallback } from 'react';

function slugify(s = '') {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function CategoriesManager({
  apiBase = '/api/admin/categories',
}) {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(''); // this will store final image URL

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchList = useCallback(async (pageArg = page, qArg = q) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (qArg) params.set('q', qArg);
      params.set('page', String(pageArg));
      params.set('limit', String(limit));
      const res = await fetch(`${apiBase}?${params.toString()}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Failed to load (${res.status})`);
      }
      const data = await res.json();
      setItems(data.items || []);
      setTotal(data.total ?? (data.items ? data.items.length : 0));
      setPage(data.page ?? pageArg);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Unknown error');
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [apiBase, limit, page, q]);

  useEffect(() => {
    fetchList(1, q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, limit]);

  useEffect(() => {
    fetchList(page, q);
  }, [page, fetchList, q]);

  function resetForm() {
    setName('');
    setSlug('');
    setDescription('');
    setImage('');
    setEditing(null);
    setMessage('');
  }

  // helper to convert File -> dataURL
  function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => {
        reader.abort();
        reject(new Error('ไฟล์อ่านไม่ได้'));
      };
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }

  // upload file to our server which proxies to pic.in.th
  async function uploadFileToServer(file) {
    try {
      setUploading(true);
      setMessage('กำลังอัพโหลดรูป...');

      const fd = new FormData();
      fd.append('file', file, file.name); // ส่งไฟล์เป็น multipart/form-data ไปยัง /api/upload

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: fd,
        // อย่าใส่ Content-Type เอง — browser จะใส่ boundary ให้
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error?.message || json?.error || `Upload failed (${res.status})`);
      }

      const img = json?.image;
      const url = img?.display_url || img?.url;
      if (!url) {
        throw new Error('ไม่พบ url จาก upstream');
      }
      setImage(url);
      setMessage('อัพโหลดรูปเรียบร้อย');
      return url;
    } catch (err) {
      console.error('uploadFileToServer error', err);
      setMessage(err.message || 'Upload failed');
      throw err;
    } finally {
      setUploading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setMessage('');
    if (!name.trim()) return setMessage('ชื่อ (name) ต้องไม่ว่าง');
    const body = {
      name: name.trim(),
      slug: slugify(slug || name),
      description: description || null,
      image: image || null,
    };
    try {
      const res = await fetch(apiBase, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || data?.message || `Create failed (${res.status})`);
      }
      setMessage('สร้างหมวดหมู่เรียบร้อย');
      setCreateOpen(false);
      resetForm();
      setPage(1);
      fetchList(1, q);
    } catch (err) {
      console.error(err);
      setMessage(err.message || 'เกิดข้อผิดพลาด');
    }
  }

  function openEdit(cat) {
    setEditing(cat);
    setName(cat.name ?? '');
    setSlug(cat.slug ?? '');
    setDescription(cat.description ?? '');
    setImage(cat.image ?? '');
    setEditOpen(true);
    setMessage('');
  }

  async function handleEdit(e) {
    e.preventDefault();
    if (!editing) return setMessage('ไม่มีรายการที่จะแก้ไข');
    if (!name.trim()) return setMessage('ชื่อ (name) ต้องไม่ว่าง');
    const payload = {
      name: name.trim(),
      slug: slugify(slug || name),
      description: description || null,
      image: image || null,
    };
    try {
      const res = await fetch(`${apiBase}/${editing.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Update failed (${res.status})`);
      setMessage('อัพเดตเรียบร้อย');
      setEditOpen(false);
      resetForm();
      fetchList(page, q);
    } catch (err) {
      console.error(err);
      setMessage(err.message || 'เกิดข้อผิดพลาด');
    }
  }

  async function handleDelete(cat) {
    if (!confirm(`ยืนยันการลบหมวดหมู่ "${cat.name}" ?`)) return;
    try {
      const res = await fetch(`${apiBase}/${cat.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Delete failed (${res.status})`);
      setMessage('ลบเรียบร้อย');
      const newTotal = Math.max(0, total - 1);
      const lastPage = Math.max(1, Math.ceil(newTotal / limit));
      if (page > lastPage) setPage(lastPage);
      else fetchList(page, q);
    } catch (err) {
      console.error(err);
      setMessage(err.message || 'เกิดข้อผิดพลาด');
    }
  }

  // handle file input change from create/edit modal
  async function onFileInputChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadFileToServer(file);
    } catch (_) {
      // error handled in uploadFileToServer
    }
  }

  return (
    <div className="p-6 bg-gray-950 min-h-[60vh]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">จัดการหมวดหมู่</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { resetForm(); setCreateOpen(true); }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white font-medium"
            >
              + สร้างใหม่
            </button>
          </div>
        </div>

        <div className="flex gap-3 items-center mb-4">
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="ค้นหา (ชื่อ, slug, รายละเอียด)"
            className="px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white w-full"
          />
          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}
            className="px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white"
          >
            <option value={6}>6</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
          </select>
        </div>

        {message && <div className="mb-4 px-4 py-2 bg-green-700/20 border border-green-700 text-green-200 rounded">{message}</div>}
        {error && <div className="mb-4 px-4 py-2 bg-red-700/20 border border-red-700 text-red-200 rounded">{error}</div>}

        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <table className="min-w-full text-left">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-sm text-gray-300">ID</th>
                <th className="px-4 py-3 text-sm text-gray-300">ชื่อ</th>
                <th className="px-4 py-3 text-sm text-gray-300">Slug</th>
                <th className="px-4 py-3 text-sm text-gray-300">รูป</th>
                <th className="px-4 py-3 text-sm text-gray-300">สร้างเมื่อ</th>
                <th className="px-4 py-3 text-sm text-gray-300 text-right">การกระทำ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="px-4 py-6 text-center text-gray-400">กำลังโหลด...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="6" className="px-4 py-6 text-center text-gray-400">ไม่พบหมวดหมู่</td></tr>
              ) : (
                items.map((c) => (
                  <tr key={c.id} className="border-t border-gray-800">
                    <td className="px-4 py-3 text-sm text-gray-300">{c.id}</td>
                    <td className="px-4 py-3 text-sm text-white">{c.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{c.slug}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {c.image ? <img src={c.image} alt={c.name} className="h-8 w-12 object-cover rounded" /> : <span className="text-gray-500">-</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">{c.created_at ? new Date(c.created_at).toLocaleString() : '-'}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="inline-flex gap-2">
                        <button onClick={() => openEdit(c)} className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded">แก้ไข</button>
                        <button onClick={() => handleDelete(c)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded">ลบ</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-400">รวม {total} รายการ</div>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 rounded bg-gray-800 text-white disabled:opacity-50">ก่อนหน้า</button>
            <div className="px-3 py-1 text-sm text-gray-300">หน้า {page} / {Math.max(1, Math.ceil(total / limit))}</div>
            <button disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded bg-gray-800 text-white disabled:opacity-50">ถัดไป</button>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="สร้างหมวดหมู่ใหม่">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-sm text-gray-300">ชื่อ</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 p-2 bg-gray-800 border border-gray-700 rounded text-white" />
          </div>

          <div>
            <label className="text-sm text-gray-300">slug (ถ้าไม่กรอกจะสร้างจากชื่อ)</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full mt-1 p-2 bg-gray-800 border border-gray-700 rounded text-white" />
          </div>

          <div>
            <label className="text-sm text-gray-300">รูปภาพ (URL หรืออัพโหลด)</label>
            <div className="flex gap-2 items-center mt-1">
              <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="วาง URL หรือกด Upload" className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded text-white" />
              <label className="px-3 py-2 bg-gray-700 text-white rounded cursor-pointer">
                เลือกไฟล์
                <input type="file" accept="image/*" onChange={onFileInputChange} style={{ display: 'none' }} />
              </label>
            </div>
            {uploading && <div className="text-sm text-gray-300 mt-1">กำลังอัพโหลด...</div>}
            <div className="flex justify-center mt-2">{image && <img src={image} alt="preview" className="mt-2 max-h-40 object-contain rounded" />}</div>
          </div>

          <div>
            <label className="text-sm text-gray-300">คำอธิบาย</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full mt-1 p-2 bg-gray-800 border border-gray-700 rounded text-white" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="px-4 py-2 bg-gray-700 text-white rounded">ยกเลิก</button>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">บันทึก</button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="แก้ไขหมวดหมู่">
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-300">ชื่อ</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 p-2 bg_gray-800 border border-gray-700 rounded text-white" />
          </div>

          <div>
            <label className="text-sm text-gray-300">slug</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full mt-1 p-2 bg-gray-800 border border-gray-700 rounded text-white" />
          </div>

          <div>
            <label className="text-sm text-gray-300">รูปภาพ (URL หรืออัพโหลด)</label>
            <div className="flex gap-2 items-center mt-1">
              <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="วาง URL หรือกด Upload" className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded text-white" />
              <label className="px-3 py-2 bg-gray-700 text-white rounded cursor-pointer">
                เลือกไฟล์
                <input type="file" accept="image/*" onChange={onFileInputChange} style={{ display: 'none' }} />
              </label>
            </div>
            {uploading && <div className="text-sm text-gray-300 mt-1">กำลังอัพโหลด...</div>}
            <div className="flex justify-center mt-2">{image && <img src={image} alt="preview" className="mt-2 max-h-40 object-contain rounded" />}</div>
          </div>

          <div>
            <label className="text-sm text-gray-300">คำอธิบาย</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full mt-1 p-2 bg-gray-800 border border-gray-700 rounded text-white" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setEditOpen(false)} className="px-4 py-2 bg-gray-700 text-white rounded">ยกเลิก</button>
            <button type="submit" className="px-4 py-2 bg-yellow-600 text-white rounded">บันทึกการแก้ไข</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
