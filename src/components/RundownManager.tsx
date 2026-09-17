import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Check,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { RundownItem } from '../types';

interface RundownManagerProps {
  categorySlug?: string;
  rundown: RundownItem[];
  onChange: (items: RundownItem[]) => void;
}

// Preset examples by category
const PRESETS: Record<string, { label: string; items: RundownItem[] }[]> = {
  pernikahan: [
    {
      label: 'Pernikahan Standar / Nasional',
      items: [
        {
          time: '08:00 - 09:30 WIB',
          title: 'Akad Nikah / Ijab Kabul',
          description: 'Prosesi sakral akad nikah dan serah terima mahar oleh kedua mempelai.',
          location: 'Ruang Utama Akad'
        },
        {
          time: '09:30 - 10:30 WIB',
          title: 'Upacara Adat & Sungkeman',
          description: 'Sungkeman memohon restu kepada kedua orang tua dan sesepuh keluarga.',
          location: 'Pelaminan'
        },
        {
          time: '11:00 - 14:00 WIB',
          title: 'Resepsi & Ramah Tamah',
          description: 'Pemberian ucapan selamat dari para tamu undangan diiringi santap siang bersama.',
          location: 'Grand Ballroom'
        },
        {
          time: '13:00 - 14:00 WIB',
          title: 'Sesi Foto & Lempar Bunga',
          description: 'Foto bersama keluarga besar, sahabat, rekan kerja, dan penutupan.',
          location: 'Panggung Utama'
        }
      ]
    },
    {
      label: 'Pernikahan Sore / Malam (Intimate)',
      items: [
        {
          time: '15:30 - 17:00 WIB',
          title: 'Holy Matrimony / Pemberkatan',
          description: 'Ibadah pemberkatan nikah dan pengucapan janji suci.',
          location: 'Chapel / Venue Outdoor'
        },
        {
          time: '18:00 - 19:00 WIB',
          title: 'Welcome Drink & Cocktail Hour',
          description: 'Penyambutan tamu dan photo booth time.',
          location: 'Garden Area'
        },
        {
          time: '19:00 - 21:00 WIB',
          title: 'Intimate Dinner & Live Music',
          description: 'Santap malam bersama, toast, speeches dari sahabat, dan first dance.',
          location: 'Main Pavilion'
        }
      ]
    }
  ],
  sekolah: [
    {
      label: 'Pentas Seni & Gelar Kreativitas Pelajar',
      items: [
        {
          time: '08:00 - 08:30 WIB',
          title: 'Registrasi & Penyambutan Tamu',
          description: 'Registrasi kehadiran guru, orang tua, alumni, dan tamu undangan.',
          location: 'Gerbang Utama'
        },
        {
          time: '08:30 - 09:15 WIB',
          title: 'Pembukaan & Tari Tradisional',
          description: 'Tari selamat datang dan sambutan oleh Kepala Sekolah & Ketua Panitia.',
          location: 'Panggung Pensi'
        },
        {
          time: '09:15 - 11:45 WIB',
          title: 'Penampilan Kreativitas Siswa',
          description: 'Band sekolah, drama musikal, paduan suara, dan fashion show daur ulang.',
          location: 'Panggung Utama'
        },
        {
          time: '11:45 - 13:00 WIB',
          title: 'Ishoma & Pameran Karya Seni',
          description: 'Istirahat, salat, santap siang, dan kunjungan bazar kuliner karya siswa.',
          location: 'Area Bazar'
        },
        {
          time: '13:00 - 15:00 WIB',
          title: 'Guest Star Performance & Penutupan',
          description: 'Penampilan bintang tamu utama dan pengumuman pemenang kompetisi seni.',
          location: 'Panggung Pensi'
        }
      ]
    }
  ],
  bisnis: [
    {
      label: 'Seminar / Workshop / Conference',
      items: [
        {
          time: '08:30 - 09:00 WIB',
          title: 'Registrasi & Morning Coffee',
          description: 'Check-in peserta, pengambilan seminar kit, dan coffee break.',
          location: 'Lobi Auditorium'
        },
        {
          time: '09:00 - 10:30 WIB',
          title: 'Keynote Speech 1: Digital Transformation',
          description: 'Pemaparan tren industri terbaru oleh pembicara utama.',
          location: 'Main Hall'
        },
        {
          time: '10:30 - 12:00 WIB',
          title: 'Panel Discussion & Tanya Jawab',
          description: 'Diskusi panel interaktif bersama praktisi dan pakar teknologi.',
          location: 'Main Hall'
        },
        {
          time: '12:00 - 13:00 WIB',
          title: 'Lunch Break & Networking Session',
          description: 'Makan siang dan sesi jejaring bisnis antar peserta.',
          location: 'Dining Hall'
        },
        {
          time: '13:00 - 15:30 WIB',
          title: 'Workshop Hands-on & Penyerahan Sertifikat',
          description: 'Praktik langsung studi kasus dan penutupan acara.',
          location: 'Workshop Room'
        }
      ]
    }
  ],
  'ulang-tahun': [
    {
      label: 'Perayaan Ulang Tahun',
      items: [
        {
          time: '15:00 - 15:30 WIB',
          title: 'Penyambutan Tamu & Photo Booth',
          description: 'Foto bersama di photo booth tematik dan pemberian welcoming snack.',
          location: 'Photo Area'
        },
        {
          time: '15:30 - 16:15 WIB',
          title: 'Opening Games & Ice Breaking',
          description: 'Keseruan games berhadiah bersama MC kondang.',
          location: 'Main Room'
        },
        {
          time: '16:15 - 17:00 WIB',
          title: 'Tiup Lilin, Potong Kue & Doa',
          description: 'Momen tiup lilin ulang tahun, ucapan doa dari orang terkasih, dan potong kue.',
          location: 'Kue Ulang Tahun'
        },
        {
          time: '17:00 - 18:00 WIB',
          title: 'Makan Bersama & Pembagian Souvenir',
          description: 'Santap sore, pembagian goodie bag / bingkisan, dan foto bersama.',
          location: 'Dining Table'
        }
      ]
    }
  ],
  umum: [
    {
      label: 'Susunan Acara Umum / Tasyakuran',
      items: [
        {
          time: '09:00 - 09:30 WIB',
          title: 'Pembukaan & Pembacaan Ayat Suci / Doa',
          description: 'Pembukaan oleh pembawa acara dilanjutkan lantunan doa keselamatan.',
          location: 'Ruang Acara'
        },
        {
          time: '09:30 - 10:30 WIB',
          title: 'Sambutan Tuan Rumah & Tausiyah',
          description: 'Sambutan dari perwakilan keluarga dan penyampaian tausiyah berkah.',
          location: 'Mimbar Acara'
        },
        {
          time: '10:30 - 12:00 WIB',
          title: 'Ramah Tamah & Santap Bersama',
          description: 'Menikmati hidangan bersama serta bersilaturahmi dengan para tamu.',
          location: 'Area Prasmanan'
        }
      ]
    }
  ]
};

export const RundownManager: React.FC<RundownManagerProps> = ({
  categorySlug = 'pernikahan',
  rundown = [],
  onChange
}) => {
  const [showPresets, setShowPresets] = useState(false);

  // New item form state
  const [newTime, setNewTime] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLoc, setNewLoc] = useState('');

  const currentCategoryPresets = PRESETS[categorySlug] || PRESETS.umum || PRESETS.pernikahan;

  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: RundownItem = {
      id: 'rd-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      time: newTime.trim() || '09:00 - Selesai',
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      location: newLoc.trim() || undefined
    };

    onChange([...rundown, newItem]);
    setNewTime('');
    setNewTitle('');
    setNewDesc('');
    setNewLoc('');
  };

  const handleUpdateItem = (index: number, field: keyof RundownItem, val: string) => {
    const updated = [...rundown];
    updated[index] = { ...updated[index], [field]: val };
    onChange(updated);
  };

  const handleRemoveItem = (index: number) => {
    const updated = rundown.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === rundown.length - 1)
    ) {
      return;
    }
    const updated = [...rundown];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    onChange(updated);
  };

  const handleApplyPreset = (items: RundownItem[]) => {
    onChange(items.map(item => ({ ...item, id: 'rd-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6) })));
    setShowPresets(false);
  };

  return (
    <div className="space-y-4 pt-4 border-t border-stone-200" id="rundown-manager-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Susunan Acara / Rundown Kegiatan</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Atur dan tuliskan jadwal rangkaian kegiatan acaramu secara manual agar tamu tahu susunan waktu yang tepat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{showPresets ? 'Tutup Pilihan Cepat' : 'Template Cepat'}</span>
          </button>
        </div>
      </div>

      {/* PRESETS MODAL / ACCORDION */}
      {showPresets && (
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-700" />
              <span>Pilih Template Susunan Acara Siap Pakai:</span>
            </h4>
            <span className="text-[11px] text-amber-700">Klik untuk menerapkan otomatis</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {currentCategoryPresets.map((preset, idx) => (
              <div
                key={idx}
                className="bg-white p-3 rounded-lg border border-amber-200 shadow-2xs hover:border-amber-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <h5 className="text-xs font-bold text-stone-900">{preset.label}</h5>
                  <p className="text-[11px] text-stone-500 mt-1">
                    {preset.items.length} agenda: {preset.items.map(i => i.title).join(' • ')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(preset.items)}
                  className="mt-2.5 text-xs w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-md transition-colors"
                >
                  Terapkan Template Ini
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LIST OF RUNDOWN ITEMS */}
      {rundown.length === 0 ? (
        <div className="p-5 rounded-xl border border-dashed border-stone-300 text-center bg-stone-50/60 space-y-2">
          <Clock className="w-6 h-6 text-stone-400 mx-auto" />
          <p className="text-xs text-stone-600 font-medium">
            Belum ada susunan acara yang ditambahkan.
          </p>
          <p className="text-[11px] text-stone-400 max-w-md mx-auto">
            Anda dapat menuliskan susunan acara secara mandiri melalui form di bawah atau klik tombol &quot;Template Cepat&quot; untuk mengisi otomatis.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rundown.map((item, idx) => (
            <div
              key={item.id || idx}
              className="bg-stone-50 hover:bg-stone-50/80 p-3.5 rounded-xl border border-stone-200 transition-all space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2 border-b border-stone-200/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center justify-center font-mono shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-stone-800">
                    Agenda #{idx + 1}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveItem(idx, 'up')}
                    className="p-1 rounded-md hover:bg-stone-200 text-stone-600 disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Pindah ke Atas"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === rundown.length - 1}
                    onClick={() => handleMoveItem(idx, 'down')}
                    className="p-1 rounded-md hover:bg-stone-200 text-stone-600 disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Pindah ke Bawah"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1 rounded-md hover:bg-rose-100 text-rose-600 transition-colors ml-1"
                    title="Hapus Agenda"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-4">
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-0.5">
                    Waktu / Jam
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 08:00 - 09:30 WIB"
                    value={item.time}
                    onChange={(e) => handleUpdateItem(idx, 'time', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-8">
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-0.5">
                    Nama Kegiatan / Agenda
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Akad Nikah / Pentas Seni / Keynote Speech"
                    value={item.title}
                    onChange={(e) => handleUpdateItem(idx, 'title', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-semibold text-stone-900 focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-7">
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-0.5">
                    Deskripsi / Keterangan (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Prosesi sakral ijab kabul dan penyerahan mahar."
                    value={item.description || ''}
                    onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-5">
                  <label className="block text-[10px] uppercase font-bold text-stone-500 mb-0.5">
                    Lokasi / Pengisi (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Ruang Utama / Panggung Pensi"
                    value={item.location || ''}
                    onChange={(e) => handleUpdateItem(idx, 'location', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QUICK ADD NEW ITEM FORM */}
      <div className="p-3.5 bg-amber-50/40 border border-dashed border-amber-300 rounded-xl space-y-3">
        <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5 text-amber-600" />
          <span>Tambah Susunan Acara Baru</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <div className="sm:col-span-4">
            <label className="block text-[10px] uppercase font-bold text-stone-500 mb-0.5">
              Waktu / Jam
            </label>
            <input
              type="text"
              placeholder="Contoh: 11:00 - 13:00 WIB"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
            />
          </div>

          <div className="sm:col-span-8">
            <label className="block text-[10px] uppercase font-bold text-stone-500 mb-0.5">
              Nama Kegiatan / Acara *
            </label>
            <input
              type="text"
              placeholder="Contoh: Resepsi & Santap Siang Bersama"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddItem();
                }
              }}
              className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-semibold text-stone-900"
            />
          </div>

          <div className="sm:col-span-7">
            <label className="block text-[10px] uppercase font-bold text-stone-500 mb-0.5">
              Deskripsi Singkat (Opsional)
            </label>
            <input
              type="text"
              placeholder="Penjelasan singkat jalannya agenda..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block text-[10px] uppercase font-bold text-stone-500 mb-0.5">
              Lokasi / Panggung (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Pelaminan / Ballroom"
              value={newLoc}
              onChange={(e) => setNewLoc(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            disabled={!newTitle.trim()}
            onClick={() => handleAddItem()}
            className="text-xs bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Simpan ke Susunan Acara</span>
          </button>
        </div>
      </div>
    </div>
  );
};
