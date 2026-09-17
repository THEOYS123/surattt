import React from 'react';
import { Heart, Plus, Trash2 } from 'lucide-react';

export interface LoveStoryMilestone {
  year: string;
  title: string;
  description: string;
}

interface LoveStoryManagerProps {
  loveStory: LoveStoryMilestone[];
  onChange: (story: LoveStoryMilestone[]) => void;
}

export const LoveStoryManager: React.FC<LoveStoryManagerProps> = ({
  loveStory,
  onChange
}) => {
  const handleAddMilestone = () => {
    onChange([
      ...loveStory,
      { year: new Date().getFullYear().toString(), title: '', description: '' }
    ]);
  };

  const handleUpdate = (index: number, field: keyof LoveStoryMilestone, val: string) => {
    const updated = [...loveStory];
    updated[index] = { ...updated[index], [field]: val };
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const updated = loveStory.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-4 pt-4 border-t border-stone-200" id="love-story-manager">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Kisah Cinta / Perjalanan Pasangan (Opsional)</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Bagikan momen manis saat pertama berjumpa hingga memutuskan mengikat janji suci.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddMilestone}
          className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Momen</span>
        </button>
      </div>

      {loveStory.length === 0 ? (
        <div className="p-4 rounded-xl border border-dashed border-stone-300 text-center bg-stone-50">
          <p className="text-xs text-stone-500">
            Belum ada kisah yang ditambahkan. Klik &quot;Tambah Momen&quot; jika ingin menampilkan timeline perjalanan cinta.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {loveStory.map((item, idx) => (
            <div key={idx} className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 font-mono">
                  Momen #{idx + 1}
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
                    Tahun / Tanggal
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 2023"
                    value={item.year}
                    onChange={(e) => handleUpdate(idx, 'year', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">
                    Judul Momen
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Awal Berjumpa di Kampus"
                    value={item.title}
                    onChange={(e) => handleUpdate(idx, 'title', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">
                  Deskripsi Cerita Singkat
                </label>
                <textarea
                  rows={2}
                  placeholder="Ceritakan sedikit kesan atau kenangan indah dari momen tersebut..."
                  value={item.description}
                  onChange={(e) => handleUpdate(idx, 'description', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
