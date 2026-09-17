import React, { useState } from 'react';
import { X, Copy, Check, MessageCircle, Share2, Sparkles } from 'lucide-react';
import { safeCopyToClipboard } from '../utils/clipboard';

interface ShareModalProps {
  slug: string;
  title: string;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ slug, title, onClose }) => {
  const [guestName, setGuestName] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedWa, setCopiedWa] = useState(false);

  const cleanSlug = slug.replace(/^\//, '');
  const baseUrl = window.location.origin;
  const directUrl = `${baseUrl}/${cleanSlug}`;
  const personalizedUrl = guestName.trim()
    ? `${directUrl}?to=${encodeURIComponent(guestName.trim())}`
    : directUrl;

  const defaultWaText = guestName.trim()
    ? `Kepada Yth. Bapak/Ibu/Saudara/i *${guestName.trim()}*,\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Anda untuk hadir di acara *${title}*.\n\nInformasi lengkap dan konfirmasi kehadiran dapat dilihat melalui tautan undangan berikut:\n${personalizedUrl}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami atas kehadiran dan doa restu Anda.\nTerima kasih.`
    : `Kepada Yth. Tamu Undangan,\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Anda untuk hadir di acara *${title}*.\n\nInformasi lengkap dapat diakses melalui tautan undangan online berikut:\n${directUrl}\n\nTerima kasih atas perhatian dan doa restu Anda.`;

  const copyToClipboard = (text: string, isWa = false) => {
    safeCopyToClipboard(text);
    if (isWa) {
      setCopiedWa(true);
      setTimeout(() => setCopiedWa(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareToWhatsapp = () => {
    const encodedText = encodeURIComponent(defaultWaText);
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Bagikan Undangan</h3>
              <p className="text-xs text-stone-500">Kirim dengan nama tamu khusus (Personalized Link)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
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
                placeholder="Contoh: Budi Santoso / Ibu Ratna & Keluarga"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-all pr-8"
              />
              <Sparkles className="w-4 h-4 text-amber-500 absolute right-3 top-3 pointer-events-none" />
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              Nama ini akan otomatis ditampilkan di sampul cover: <span className="font-semibold text-stone-700">"Kepada Yth. Bapak/Ibu/Saudara/i {guestName || 'Tamu Undangan'}"</span>.
            </p>
          </div>

          {/* Generated URL Box */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Link Undangan
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={personalizedUrl}
                className="flex-1 bg-stone-100 border border-stone-200 rounded-lg px-3 py-2 text-xs font-mono text-stone-700 select-all"
              />
              <button
                onClick={() => copyToClipboard(personalizedUrl)}
                className="px-3 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors shrink-0"
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
                Teks Pesan WhatsApp
              </label>
              <button
                onClick={() => copyToClipboard(defaultWaText, true)}
                className="text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1"
              >
                {copiedWa ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedWa ? 'Tersalin' : 'Salin Teks'}</span>
              </button>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-700 font-sans whitespace-pre-line max-h-36 overflow-y-auto leading-relaxed">
              {defaultWaText}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              onClick={shareToWhatsapp}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Kirim via WhatsApp</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-xl text-sm font-medium transition-colors"
            >
              Tutup
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
