import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Plus,
  Trash2,
  Music,
  Check,
  Play,
  Pause,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { CURATED_PHOTOS, CURATED_MUSIC, CuratedPhoto } from '../data/curatedMedia';

interface MediaGalleryManagerProps {
  categorySlug: string;
  coverImageUrl: string;
  onCoverChange: (url: string) => void;
  galleryImages: string[];
  onGalleryChange: (images: string[]) => void;
  backgroundMusicUrl?: string;
  onMusicChange: (url: string) => void;
  isWedding?: boolean;
  groomPhotoUrl?: string;
  onGroomPhotoChange?: (url: string) => void;
  bridePhotoUrl?: string;
  onBridePhotoChange?: (url: string) => void;
}

export const MediaGalleryManager: React.FC<MediaGalleryManagerProps> = ({
  categorySlug,
  coverImageUrl,
  onCoverChange,
  galleryImages,
  onGalleryChange,
  backgroundMusicUrl,
  onMusicChange,
  isWedding,
  groomPhotoUrl,
  onGroomPhotoChange,
  bridePhotoUrl,
  onBridePhotoChange
}) => {
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'cover' | 'gallery'>('gallery');
  const [playingMusicUrl, setPlayingMusicUrl] = useState<string | null>(null);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);

  // Filter curated photos matching category
  const relevantCuratedPhotos = CURATED_PHOTOS.filter(p => {
    if (categorySlug === 'pernikahan') return p.category === 'wedding' || p.category === 'general';
    if (['bisnis', 'seminar', 'workshop', 'rapat'].includes(categorySlug)) return p.category === 'business';
    if (categorySlug === 'ulang-tahun') return p.category === 'birthday';
    if (['aqiqah', 'khitanan', 'tasyakuran'].includes(categorySlug)) return p.category === 'aqiqah';
    return true;
  });

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'cover' | 'gallery' | 'groom' | 'bride') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      if (target === 'cover') {
        onCoverChange(dataUrl);
      } else if (target === 'gallery') {
        onGalleryChange([...galleryImages, dataUrl]);
      } else if (target === 'groom' && onGroomPhotoChange) {
        onGroomPhotoChange(dataUrl);
      } else if (target === 'bride' && onBridePhotoChange) {
        onBridePhotoChange(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    onGalleryChange([...galleryImages, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleRemoveGalleryImage = (index: number) => {
    const updated = galleryImages.filter((_, i) => i !== index);
    onGalleryChange(updated);
  };

  const handlePlayMusic = (url: string) => {
    if (playingMusicUrl === url && audioPlayer) {
      audioPlayer.pause();
      setPlayingMusicUrl(null);
      return;
    }

    if (audioPlayer) {
      audioPlayer.pause();
    }

    const newAudio = new Audio(url);
    newAudio.play().catch(() => {});
    newAudio.onended = () => setPlayingMusicUrl(null);
    setAudioPlayer(newAudio);
    setPlayingMusicUrl(url);
  };

  return (
    <div className="space-y-6 pt-4 border-t border-stone-200" id="media-gallery-manager">
      <div>
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-amber-600" />
          <span>Pengaturan Foto & Galeri Dokumentasi</span>
        </h3>
        <p className="text-xs text-stone-500 mt-0.5">
          Atur foto sampul, foto profil, dan susunan galeri foto kenangan untuk undangan Anda secara bebas.
        </p>
      </div>

      {/* FOTO SAMPUL / COVER */}
      <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-stone-800 uppercase tracking-wide">
            Foto Sampul Utama (Cover Hero)
          </label>
          <button
            type="button"
            onClick={() => {
              setPickerTarget('cover');
              setIsPhotoPickerOpen(true);
            }}
            className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pilih dari Foto Indah</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-full sm:w-36 h-24 rounded-lg bg-stone-200 overflow-hidden border border-stone-300 shrink-0">
            {coverImageUrl ? (
              <img src={coverImageUrl} alt="Cover Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
                Belum ada foto
              </div>
            )}
          </div>

          <div className="flex-1 w-full space-y-2">
            <input
              type="text"
              placeholder="Masukkan link URL foto sampul (https://...)"
              value={coverImageUrl}
              onChange={(e) => onCoverChange(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
            />
            <div className="flex items-center gap-2">
              <label className="px-3 py-1.5 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 cursor-pointer flex items-center gap-1.5 shadow-2xs">
                <Upload className="w-3.5 h-3.5 text-stone-500" />
                <span>Upload dari HP / Komputer</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'cover')}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* FOTO PROFIL MEMPELAI (JIKA PERNIKAHAN) */}
      {isWedding && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
          {/* Groom Photo */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-stone-800 uppercase">Foto Mempelai Pria</span>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-stone-200 overflow-hidden border border-stone-300 shrink-0">
                {groomPhotoUrl ? (
                  <img src={groomPhotoUrl} alt="Mempelai Pria" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400">Pria</div>
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <input
                  type="text"
                  placeholder="URL Foto Pria"
                  value={groomPhotoUrl || ''}
                  onChange={(e) => onGroomPhotoChange && onGroomPhotoChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                />
                <label className="inline-flex items-center gap-1 text-[11px] text-stone-600 hover:text-stone-900 cursor-pointer font-medium">
                  <Upload className="w-3 h-3" />
                  <span>Upload Foto Pria</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'groom')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Bride Photo */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-stone-800 uppercase">Foto Mempelai Wanita</span>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-stone-200 overflow-hidden border border-stone-300 shrink-0">
                {bridePhotoUrl ? (
                  <img src={bridePhotoUrl} alt="Mempelai Wanita" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400">Wanita</div>
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <input
                  type="text"
                  placeholder="URL Foto Wanita"
                  value={bridePhotoUrl || ''}
                  onChange={(e) => onBridePhotoChange && onBridePhotoChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                />
                <label className="inline-flex items-center gap-1 text-[11px] text-stone-600 hover:text-stone-900 cursor-pointer font-medium">
                  <Upload className="w-3 h-3" />
                  <span>Upload Foto Wanita</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'bride')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GALERI FOTO TAMBAHAN (MULTI-PHOTO) */}
      <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wide block">
              Galeri Foto Acara ({galleryImages.length} Foto)
            </span>
            <span className="text-[11px] text-stone-500">
              Foto-foto ini akan ditampilkan di slider galeri interaktif undangan Anda.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setPickerTarget('gallery');
                setIsPhotoPickerOpen(true);
              }}
              className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Pilih Koleksi Indah</span>
            </button>
            <label className="text-xs bg-stone-900 hover:bg-stone-800 text-white px-3 py-1.5 rounded-lg font-semibold cursor-pointer flex items-center gap-1.5 shadow-2xs">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Foto</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'gallery')}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Input manual URL */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ketik atau tempel link URL foto (https://...)"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
          />
          <button
            type="button"
            onClick={handleAddImageUrl}
            className="bg-stone-800 hover:bg-stone-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shrink-0"
          >
            Tambah Foto
          </button>
        </div>

        {/* Galeri Grid */}
        {galleryImages.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
            {galleryImages.map((imgUrl, idx) => (
              <div key={idx} className="relative group rounded-lg overflow-hidden border border-stone-300 aspect-square bg-stone-200">
                <img src={imgUrl} alt={`Galeri ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveGalleryImage(idx)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-rose-600/90 hover:bg-rose-700 text-white rounded-full flex items-center justify-center opacity-90 transition-all shadow"
                  title="Hapus foto ini"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                <span className="absolute bottom-1 left-1.5 text-[9px] bg-stone-950/60 text-white px-1.5 rounded font-mono">
                  #{idx + 1}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center border-2 border-dashed border-stone-200 rounded-xl bg-white text-xs text-stone-500">
            Belum ada foto di galeri. Klik &quot;Upload Foto&quot;, tempel URL foto, atau &quot;Pilih Koleksi Indah&quot;.
          </div>
        )}
      </div>

      {/* MUSIK LATAR UNDANGAN */}
      <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wide flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-amber-600" />
              <span>Musik Latar Interaktif (Background Music)</span>
            </span>
            <p className="text-[11px] text-stone-500">
              Akan diputar otomatis secara lembut saat tamu menekan tombol Buka Undangan.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
          {CURATED_MUSIC.map(m => {
            const isSelected = backgroundMusicUrl === m.url;
            const isPlaying = playingMusicUrl === m.url;
            return (
              <div
                key={m.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                  isSelected ? 'border-amber-500 bg-amber-50/60 ring-1 ring-amber-500/30' : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="overflow-hidden pr-2">
                  <div className="font-semibold text-stone-900 truncate">{m.title}</div>
                  <div className="text-[10px] text-stone-500">{m.genre}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handlePlayMusic(m.url)}
                    className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center transition-all"
                    title={isPlaying ? 'Pause Pratinjau' : 'Dengar Cuplikan Musik'}
                  >
                    {isPlaying ? <Pause className="w-3 h-3 text-amber-600" /> : <Play className="w-3 h-3" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => onMusicChange(m.url)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold ${
                      isSelected ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                    }`}
                  >
                    {isSelected ? 'Terpilih' : 'Pilih'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <label className="block text-[11px] text-stone-600 mb-1">
            Atau masukkan link file audio MP3 kustom Anda:
          </label>
          <input
            type="url"
            placeholder="https://example.com/lagu-anda.mp3"
            value={backgroundMusicUrl || ''}
            onChange={(e) => onMusicChange(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
          />
        </div>
      </div>

      {/* MODAL / DRAWER PICKER KOLEKSI FOTO INDAH */}
      {isPhotoPickerOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-stone-200">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Koleksi Foto Resolusi Tinggi</span>
                </h4>
                <p className="text-xs text-stone-500">
                  Pilih foto yang cocok untuk dijadikan {pickerTarget === 'cover' ? 'Foto Sampul' : 'Foto Galeri'}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPhotoPickerOpen(false)}
                className="text-stone-400 hover:text-stone-800 text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3">
              {relevantCuratedPhotos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => {
                    if (pickerTarget === 'cover') {
                      onCoverChange(photo.url);
                    } else {
                      onGalleryChange([...galleryImages, photo.url]);
                    }
                    setIsPhotoPickerOpen(false);
                  }}
                  className="group rounded-xl overflow-hidden border border-stone-200 hover:border-amber-500 cursor-pointer relative aspect-[4/3] bg-stone-100 transition-all hover:shadow-md"
                >
                  <img src={photo.url} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex items-end p-2 opacity-90">
                    <span className="text-[10px] text-white font-medium leading-tight line-clamp-1">
                      {photo.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPhotoPickerOpen(false)}
                className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
