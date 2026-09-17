import React, { useState } from 'react';
import { X, Copy, Check, MessageCircle, Share2, Sparkles, ExternalLink } from 'lucide-react';
import { Order } from '../types';
import { safeCopyToClipboard } from '../utils/clipboard';

interface ShareModalProps {
  order?: Order | null;
  slug?: string;
  title?: string;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ order, slug: propSlug, title: propTitle, onClose }) => {
  const [guestName, setGuestName] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedWa, setCopiedWa] = useState(false);
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  // Safely extract slug and title with resilient fallbacks
  const effectiveSlug = (propSlug || order?.slug || '').replace(/^\//, '').trim();
  const effectiveTitle = propTitle || order?.invitationData?.title || 'Undangan Digital';

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://suratttt.netlify.app';
  const directUrl = `${baseUrl}/${effectiveSlug}`;
  const personalizedUrl = guestName.trim()
    ? `${directUrl}?to=${encodeURIComponent(guestName.trim())}`
    : directUrl;

  const defaultWaText = guestName.trim()
    ? `Kepada Yth. Bapak/Ibu/Saudara/i *${guestName.trim()}*,\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Anda untuk hadir di acara *${effectiveTitle}*.\n\nInformasi lengkap dan konfirmasi kehadiran dapat dilihat melalui tautan undangan berikut:\n${personalizedUrl}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami atas kehadiran dan doa restu Anda.\nTerima kasih.`
    : `Kepada Yth. Tamu Undangan,\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Anda untuk hadir di acara *${effectiveTitle}*.\n\nInformasi lengkap dapat diakses melalui tautan undangan online berikut:\n${directUrl}\n\nTerima kasih atas perhatian dan doa restu Anda.`;

  const showToast = (msg: string) => {
    setCopiedToast(msg);
    setTimeout(() => setCopiedToast(null), 2500);
  };

  const copyToClipboard = (text: string, isWa = false) => {
    try {
      safeCopyToClipboard(text);
      if (isWa) {
        setCopiedWa(true);
        showToast('✓ Teks WhatsApp berhasil disalin!');
        setTimeout(() => setCopiedWa(false), 2000);
      } else {
        setCopied(true);
        showToast('✓ Link undangan berhasil disalin!');
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (e) {
      console.warn('Copy error handled:', e);
      showToast('✓ Berhasil menyalin ke clipboard!');
    }
  };

  const shareToWhatsapp = () => {
    const encodedText = encodeURIComponent(defaultWaText);
    const waUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in">
      {/* Copied Toast */}
      {copiedToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-60 bg-emerald-600 text-white font-semibold text-xs px-4 py-2 rounded-full shadow-lg animate-in fade-in slide-in-from-top-3 flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5" />
          <span>{copiedToast}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 relative overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Bagikan Undangan</h3>
              <p className="text-xs text-stone-500">Generator link personal dengan nama tamu khusus</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Guest personalization input */}
        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Nama Tamu yang Diundang (Opsional)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Contoh: Budi Santoso & Keluarga / Ibu Ratna"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-all pr-8"
              />
              <Sparkles className="w-4 h-4 text-amber-500 absolute right-3 top-3 pointer-events-none" />
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              Nama ini akan otomatis ditampilkan di sampul cover pembuka: <span className="font-semibold text-stone-800">"Kepada Yth. Bapak/Ibu/Saudara/i {guestName || 'Tamu Undangan'}"</span>.
            </p>
          </div>

          {/* Generated URL Box */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Link Undangan
              </label>
              <a
                href={personalizedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-amber-700 hover:text-amber-800 font-medium inline-flex items-center gap-1"
              >
                <span>Uji Buka Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={personalizedUrl}
                className="flex-1 bg-stone-100 border border-stone-200 rounded-xl px-3 py-2.5 text-xs font-mono text-stone-700 select-all"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(personalizedUrl)}
                className="px-3.5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin Link'}</span>
              </button>
            </div>
          </div>

          {/* WhatsApp Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Teks Pesan WhatsApp Siap Kirim
              </label>
              <button
                type="button"
                onClick={() => copyToClipboard(defaultWaText, true)}
                className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                {copiedWa ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedWa ? 'Tersalin' : 'Salin Teks Pesan'}</span>
              </button>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 text-xs text-stone-700 font-sans whitespace-pre-line max-h-36 overflow-y-auto leading-relaxed">
              {defaultWaText}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={shareToWhatsapp}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Bagikan Langsung via WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
