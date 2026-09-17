import React, { useState, useEffect } from 'react';
import { X, Zap, Send, CheckCircle2, AlertCircle, Clock, MessageSquare, ExternalLink } from 'lucide-react';
import { Order } from '../types';
import { db } from '../services/storage';
import { telegramService } from '../services/telegramService';

interface ExpediteOrderModalProps {
  order: Order;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ExpediteOrderModal: React.FC<ExpediteOrderModalProps> = ({ order, onClose, onSuccess }) => {
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusResult, setStatusResult] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const storageKey = `surat_expedite_cooldown_${order.id}`;

  useEffect(() => {
    const lastSent = localStorage.getItem(storageKey);
    if (lastSent) {
      const diffSec = Math.floor((Date.now() - parseInt(lastSent, 10)) / 1000);
      if (diffSec < 60) {
        setCooldownSeconds(60 - diffSec);
      }
    }
  }, [storageKey]);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const handleSendReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldownSeconds > 0) return;

    setIsSubmitting(true);
    setStatusResult(null);

    const settings = db.getSettings();

    try {
      const result = await telegramService.notifyExpediteRequest(
        order,
        note.trim() || undefined,
        settings
      );

      if (result.success) {
        localStorage.setItem(storageKey, Date.now().toString());
        setCooldownSeconds(60);
        setStatusResult({
          type: 'success',
          message: '🚀 Notifikasi darurat berhasil dikirim ke Telegram Owner! Tim kami akan segera memverifikasi pesanan Anda.'
        });
        if (onSuccess) onSuccess();
      } else {
        // If telegram bot is not configured or failed, provide fallback notice with direct WhatsApp link
        setStatusResult({
          type: 'info',
          message: result.message || 'Notifikasi bot Telegram sedang offline. Anda juga dapat menghubungi Owner langsung via WhatsApp.'
        });
      }
    } catch (err: any) {
      setStatusResult({
        type: 'error',
        message: 'Gagal mengirim notifikasi: ' + (err.message || 'Terjadi kesalahan jaringan.')
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const settings = db.getSettings();
  const supportWa = settings.supportWhatsapp || '6281234567890';
  const cleanWa = supportWa.replace(/\D/g, '').replace(/^0/, '62');
  const waFallbackText = encodeURIComponent(
    `Halo Admin/Owner SURAT, saya ingin konfirmasi dan mempercepat verifikasi pesanan:\n` +
    `ID Pesanan: ${order.id}\n` +
    `Nama: ${order.customerName}\n` +
    `Undangan: /${order.slug}\n` +
    (note ? `Pesan: ${note}\n` : '') +
    `Mohon bantuannya untuk segera diproses ya kak. Terima kasih!`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
              <Zap className="w-5 h-5 fill-stone-950" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">Percepat Pesanan</h3>
              <p className="text-xs text-stone-500">Kirim notifikasi instan langsung ke Telegram Owner</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Summary Card */}
        <div className="mt-4 p-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-stone-500">ID Pesanan:</span>
            <span className="font-mono font-bold text-stone-800">{order.id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-500">Judul Undangan:</span>
            <span className="font-medium text-stone-900 truncate max-w-[200px]">{order.invitationData?.title || 'Undangan'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-500">Status Pembayaran:</span>
            <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
              order.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
              order.paymentStatus === 'PENDING' ? 'bg-amber-100 text-amber-800' :
              'bg-rose-100 text-rose-800'
            }`}>
              {order.paymentStatus === 'PAID' ? 'LUNAS (AKTIF)' : order.paymentStatus === 'PENDING' ? 'MENUNGGU VERIFIKASI' : 'DITOLAK'}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSendReminder} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Catatan untuk Owner (Opsional)</span>
              <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Halo min, bukti bayar sudah diunggah, mohon segera diaktifkan ya kak karena mau segera disebar..."
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Feedback status */}
          {statusResult && (
            <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
              statusResult.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' :
              statusResult.type === 'info' ? 'bg-amber-50 text-amber-900 border border-amber-200' :
              'bg-rose-50 text-rose-900 border border-rose-200'
            }`}>
              {statusResult.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-medium leading-relaxed">{statusResult.message}</p>
                {statusResult.type !== 'success' && (
                  <a
                    href={`https://wa.me/${cleanWa}?text=${waFallbackText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-amber-800 hover:text-amber-950 underline pt-1"
                  >
                    <span>Hubungi Owner via WhatsApp</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              type="submit"
              disabled={isSubmitting || cooldownSeconds > 0}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
                cooldownSeconds > 0
                  ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/20'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  <span>Mengirim ke Telegram...</span>
                </>
              ) : cooldownSeconds > 0 ? (
                <>
                  <Clock className="w-4 h-4 text-stone-500" />
                  <span>Tunggu {cooldownSeconds} detik</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-stone-950" />
                  <span>⚡ Kirim Notifikasi Percepat Pesanan</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
