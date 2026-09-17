import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Info,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { Announcement } from '../types';
import { db } from '../services/storage';

export const AdminAnnouncementsManager: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'info' | 'warning' | 'success' | 'promo'>('promo');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('high');
  const [actionText, setActionText] = useState('Buat Undangan');
  const [actionUrl, setActionUrl] = useState('/create');
  const [isActive, setIsActive] = useState(true);

  const loadData = () => {
    setAnnouncements(db.getAnnouncements());
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('surat:announcements-updated', handleUpdate);
    return () => window.removeEventListener('surat:announcements-updated', handleUpdate);
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setType('promo');
    setPriority('high');
    setActionText('Buat Undangan');
    setActionUrl('/create');
    setIsActive(true);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (anc: Announcement) => {
    setEditingId(anc.id);
    setTitle(anc.title);
    setContent(anc.content);
    setType(anc.type);
    setPriority(anc.priority || 'normal');
    setActionText(anc.actionText || '');
    setActionUrl(anc.actionUrl || '');
    setIsActive(anc.isActive);
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const anc: Announcement = {
      id: editingId || 'anc-' + Date.now(),
      title: title.trim(),
      content: content.trim(),
      type,
      priority,
      targetAudience: 'all',
      actionText: actionText.trim() || undefined,
      actionUrl: actionUrl.trim() || undefined,
      isActive,
      createdAt: editingId
        ? announcements.find(a => a.id === editingId)?.createdAt || new Date().toISOString()
        : new Date().toISOString()
    };

    db.saveAnnouncement(anc);
    setIsFormOpen(false);
    loadData();
  };

  const handleToggleActive = (anc: Announcement) => {
    const updated = { ...anc, isActive: !anc.isActive };
    db.saveAnnouncement(updated);
    loadData();
  };

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus pemberitahuan siaran ini?')) {
      db.deleteAnnouncement(id);
      loadData();
    }
  };

  return (
    <div className="space-y-6" id="admin-announcements-manager-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2.5">
            <Megaphone className="w-5 h-5 text-amber-600" />
            <span>Pemberitahuan & Siaran Informasi ke Seluruh Pengguna</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Kirim banner pengumuman, promo diskon, pembaruan sistem, atau peringatan penting yang akan tampil di bagian atas website semua pengunjung.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Pemberitahuan Baru</span>
          </button>
        </div>
      </div>

      {/* FORM MODAL / ACCORDION */}
      {isFormOpen && (
        <form onSubmit={handleSave} className="bg-white border border-stone-200 p-6 rounded-2xl shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-600" />
              <span>{editingId ? 'Edit Pemberitahuan Siaran' : 'Buat Pemberitahuan Siaran Baru'}</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-xs text-stone-400 hover:text-stone-700 font-semibold"
            >
              Batal
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Judul Pemberitahuan *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: 🎉 Promo Spesial Undangan Rp5.000!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Tipe Tampilan
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                >
                  <option value="promo">✨ Promo / Event (Kuning Emas)</option>
                  <option value="info">ℹ️ Informasi Umum (Netral Gelap)</option>
                  <option value="warning">⚠️ Peringatan Penting (Merah)</option>
                  <option value="success">✅ Pengumuman Sukses (Hijau)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Prioritas
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                >
                  <option value="high">Tinggi (Paling Atas)</option>
                  <option value="normal">Normal</option>
                  <option value="low">Rendah</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Isi Pesan / Konten Pemberitahuan *
            </label>
            <textarea
              rows={2}
              required
              placeholder="Tuliskan detail pengumuman yang ingin disampaikan kepada seluruh pengunjung..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Teks Tombol Aksi (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Buat Undangan Sekarang"
                value={actionText}
                onChange={(e) => setActionText(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Tautan Tombol Aksi (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: /create atau https://wa.me/..."
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="anc-is-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="anc-is-active" className="text-xs font-semibold text-stone-800 cursor-pointer">
              Aktifkan dan tayangkan langsung di website sekarang
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              {editingId ? 'Simpan Perubahan' : 'Terbitkan Pemberitahuan'}
            </button>
          </div>
        </form>
      )}

      {/* Announcements List */}
      <div className="space-y-3">
        {announcements.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center text-stone-400 space-y-2">
            <Megaphone className="w-10 h-10 mx-auto text-stone-300" />
            <p className="text-sm font-semibold text-stone-700">Belum Ada Pemberitahuan</p>
            <p className="text-xs text-stone-400">Klik tombol &quot;Buat Pemberitahuan Baru&quot; untuk menyiarkan informasi ke seluruh pengguna.</p>
          </div>
        ) : (
          announcements.map((anc) => (
            <div
              key={anc.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                anc.isActive
                  ? 'bg-white border-stone-200 shadow-xs'
                  : 'bg-stone-50 border-stone-200/60 opacity-60'
              }`}
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      anc.type === 'promo'
                        ? 'bg-amber-100 text-amber-800'
                        : anc.type === 'warning'
                        ? 'bg-rose-100 text-rose-800'
                        : anc.type === 'success'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-100 text-stone-800'
                    }`}
                  >
                    {anc.type}
                  </span>

                  <h3 className="font-bold text-sm text-stone-900">{anc.title}</h3>

                  {anc.isActive ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Sedang Tayang</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-200 text-stone-600">
                      Nonaktif
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">{anc.content}</p>

                {anc.actionText && (
                  <div className="text-[11px] text-amber-700 font-semibold flex items-center gap-1 pt-1">
                    <span>Tombol: &quot;{anc.actionText}&quot;</span>
                    <span className="text-stone-400 font-mono">({anc.actionUrl || '-'})</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleActive(anc)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                    anc.isActive
                      ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-300'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}
                >
                  {anc.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{anc.isActive ? 'Nonaktifkan' : 'Aktifkan'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(anc)}
                  className="p-2 text-stone-600 hover:text-amber-700 hover:bg-stone-100 rounded-xl transition cursor-pointer"
                  title="Edit Pemberitahuan"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(anc.id)}
                  className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                  title="Hapus Pemberitahuan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
