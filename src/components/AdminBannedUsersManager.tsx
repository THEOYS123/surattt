import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Ban,
  UserCheck,
  Plus,
  Trash2,
  Search,
  AlertTriangle,
  RefreshCw,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { BannedUser } from '../types';
import { db } from '../services/storage';

export const AdminBannedUsersManager: React.FC = () => {
  const [bannedList, setBannedList] = useState<BannedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingBan, setIsAddingBan] = useState(false);

  // New ban form state
  const [newIdentifier, setNewIdentifier] = useState('');
  const [newName, setNewName] = useState('');
  const [newReason, setNewReason] = useState('Melakukan spam tombol percepat / pengingat secara berlebihan.');

  const loadData = () => {
    setBannedList(db.getBannedUsers());
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('surat:banned-updated', handleUpdate);
    return () => window.removeEventListener('surat:banned-updated', handleUpdate);
  }, []);

  const handleAddBan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdentifier.trim()) return;

    const newBan: BannedUser = {
      id: 'ban-' + Date.now(),
      identifier: newIdentifier.trim().toLowerCase(),
      name: newName.trim() || undefined,
      reason: newReason.trim() || 'Pelanggaran ketentuan sistem dan spamming.',
      spamCount: 1,
      bannedAt: new Date().toISOString(),
      bannedBy: 'Admin SURAT'
    };

    db.banUser(newBan);
    setNewIdentifier('');
    setNewName('');
    setNewReason('Melakukan spam tombol percepat / pengingat secara berlebihan.');
    setIsAddingBan(false);
    loadData();
  };

  const handleUnban = (identifier: string) => {
    if (confirm(`Yakin ingin membuka blokir untuk ${identifier}?`)) {
      db.unbanUser(identifier);
      loadData();
    }
  };

  const filteredBans = bannedList.filter(b => {
    const q = searchQuery.toLowerCase();
    return (
      b.identifier.toLowerCase().includes(q) ||
      (b.name && b.name.toLowerCase().includes(q)) ||
      b.reason.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6" id="admin-banned-users-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <span>Manajemen Pengguna Diblokir (Banned Users)</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Kelola daftar pengguna atau email yang diblokir dari fitur live chat dan pengiriman formulir karena spam atau penyalahgunaan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddingBan(!isAddingBan)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAddingBan ? 'Tutup Formulir' : 'Tambah Blokir Manual'}</span>
          </button>
        </div>
      </div>

      {/* MANUAL BAN FORM ACCORDION */}
      {isAddingBan && (
        <form onSubmit={handleAddBan} className="bg-rose-50/70 border border-rose-200 p-5 rounded-2xl space-y-4 animate-in fade-in">
          <div className="flex items-center gap-2 text-rose-900">
            <Ban className="w-4 h-4 text-rose-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Formulir Pemblokiran Pengguna Baru</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Email / No. WhatsApp / User Identifier *
              </label>
              <input
                type="text"
                required
                placeholder="nama@email.com / 08123456789"
                value={newIdentifier}
                onChange={(e) => setNewIdentifier(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nama Pengguna (Opsional)
              </label>
              <input
                type="text"
                placeholder="Contoh: Budi Santoso"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Alasan Pemblokiran *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Spam tombol percepat secara berulang kali."
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingBan(false)}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-200/60 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              Simpan & Blokir Pengguna
            </button>
          </div>
        </form>
      )}

      {/* Search & List */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-stone-200 flex items-center justify-between gap-3 bg-stone-50">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari email, nama, atau alasan blokir..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          <span className="text-xs font-semibold text-stone-500">
            Total Diblokir: <b>{filteredBans.length}</b> pengguna
          </span>
        </div>

        {filteredBans.length === 0 ? (
          <div className="p-12 text-center text-stone-400 space-y-2">
            <ShieldCheck className="w-10 h-10 mx-auto text-emerald-500/70" />
            <p className="text-sm font-semibold text-stone-700">Tidak Ada Pengguna yang Diblokir</p>
            <p className="text-xs text-stone-400">Semua pengguna memiliki akses normal dan bebas dari pemblokiran.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-[11px] uppercase tracking-wider text-stone-500 font-bold">
                  <th className="p-3.5">Pengguna / Identitas</th>
                  <th className="p-3.5">Alasan Pemblokiran</th>
                  <th className="p-3.5 text-center">Spam / Nudge</th>
                  <th className="p-3.5">Waktu Blokir</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs text-stone-800">
                {filteredBans.map((ban) => (
                  <tr key={ban.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-stone-900">{ban.identifier}</div>
                      {ban.name && <div className="text-[11px] text-stone-500">{ban.name}</div>}
                    </td>
                    <td className="p-3.5">
                      <span className="text-rose-900 font-medium bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md inline-block">
                        {ban.reason}
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-amber-700">
                      {ban.spamCount || 1}x
                    </td>
                    <td className="p-3.5 text-stone-500 font-mono text-[11px]">
                      {new Date(ban.bannedAt).toLocaleString('id-ID', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleUnban(ban.identifier)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1 ml-auto transition cursor-pointer"
                        title="Buka blokir pengguna ini"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Buka Blokir</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
