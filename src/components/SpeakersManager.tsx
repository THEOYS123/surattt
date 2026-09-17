import React from 'react';
import { Users, Plus, Trash2, Upload } from 'lucide-react';
import { Speaker } from '../types';

interface SpeakersManagerProps {
  speakers: Speaker[];
  onChange: (speakers: Speaker[]) => void;
}

export const SpeakersManager: React.FC<SpeakersManagerProps> = ({
  speakers,
  onChange
}) => {
  const handleAdd = () => {
    onChange([
      ...speakers,
      {
        id: `spk-${Date.now()}`,
        name: '',
        title: '',
        company: '',
        photoUrl: ''
      }
    ]);
  };

  const handleUpdate = (index: number, field: keyof Speaker, val: string) => {
    const updated = [...speakers];
    updated[index] = { ...updated[index], [field]: val };
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const updated = speakers.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      handleUpdate(index, 'photoUrl', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4 pt-4 border-t border-stone-200" id="speakers-manager">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-600" />
            <span>Narasumber & Pembicara Acara (Opsional)</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Tampilkan foto dan profil para pembicara utama untuk seminar, workshop, atau konferensi bisnis.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Pembicara</span>
        </button>
      </div>

      {speakers.length === 0 ? (
        <div className="p-4 rounded-xl border border-dashed border-stone-300 text-center bg-stone-50">
          <p className="text-xs text-stone-500">
            Belum ada pembicara yang ditambahkan. Klik &quot;Tambah Pembicara&quot; jika ingin menampilkan narasumber.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {speakers.map((spk, idx) => (
            <div key={spk.id || idx} className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 font-mono">
                  Pembicara #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">
                    Nama Lengkap & Gelar *
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Dr. Ir. Budi Santoso"
                    value={spk.name}
                    onChange={(e) => handleUpdate(idx, 'name', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">
                    Jabatan / Topik
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Chief Technology Officer"
                    value={spk.title}
                    onChange={(e) => handleUpdate(idx, 'title', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">
                    Instansi / Perusahaan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Google / Tech Asia"
                    value={spk.company || ''}
                    onChange={(e) => handleUpdate(idx, 'company', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">
                  Foto Pembicara (URL atau Upload)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-stone-200 overflow-hidden shrink-0 border border-stone-300">
                    {spk.photoUrl ? (
                      <img src={spk.photoUrl} alt={spk.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[9px] text-stone-400">Foto</div>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="URL foto pembicara"
                    value={spk.photoUrl || ''}
                    onChange={(e) => handleUpdate(idx, 'photoUrl', e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                  />
                  <label className="px-3 py-1.5 bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 rounded-lg text-xs font-semibold cursor-pointer shrink-0 flex items-center gap-1 shadow-2xs">
                    <Upload className="w-3 h-3 text-stone-500" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, idx)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
