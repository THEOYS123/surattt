import React, { useState } from 'react';
import {
  X,
  FileText,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Share2,
  Download,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Edit3,
  User,
  Phone,
  Mail,
  Zap,
  Image as ImageIcon,
  Music,
  CreditCard,
  QrCode
} from 'lucide-react';
import { Order, SiteSettings } from '../types';
import { copyToClipboard } from '../utils/clipboard';

interface OrderDetailModalProps {
  order: Order | null;
  settings: SiteSettings;
  isOpen: boolean;
  onClose: () => void;
  onEditOrder?: (order: Order) => void;
  onOpenShare?: (order: Order) => void;
  onDownloadZip?: (order: Order) => void;
  onExpediteOrder?: (order: Order) => void;
  onViewInvitation?: (slug: string) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  settings,
  isOpen,
  onClose,
  onEditOrder,
  onOpenShare,
  onDownloadZip,
  onExpediteOrder,
  onViewInvitation
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [showProofPreview, setShowProofPreview] = useState(false);

  if (!isOpen || !order) return null;

  const d = order.invitationData || ({} as any);
  const isPaid = order.paymentStatus === 'PAID';
  const isPending = order.paymentStatus === 'PENDING';
  const isRejected = order.paymentStatus === 'REJECTED';

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://surattt.netlify.app';
  const invitationUrl = `${baseUrl}/${order.slug}`;

  const handleCopyLink = async () => {
    const ok = await copyToClipboard(invitationUrl);
    if (ok) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyId = async () => {
    const ok = await copyToClipboard(order.id);
    if (ok) {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-stone-200 shadow-2xl flex flex-col"
        id="modal-order-detail"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-stone-900">Informasi Detail Pesanan</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isPaid ? 'bg-emerald-100 text-emerald-800' : isPending ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {isPaid ? 'PAID / LUNAS' : isPending ? 'PENDING' : 'REJECTED'}
                </span>
              </div>
              <p className="text-xs text-stone-500">Rincian pesanan, status pembayaran, dan data undangan digital.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Status Alert Banner */}
          {isPaid && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 space-y-1">
                <p className="font-bold">Pesanan Terkonfirmasi & Undangan Aktif!</p>
                <p>
                  Undangan Anda dapat diakses bebas oleh seluruh tamu secara online. Anda juga dapat mengedit seluruh data undangan kapan saja.
                </p>
              </div>
            </div>
          )}

          {isPending && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 space-y-1">
                <p className="font-bold">Menunggu Verifikasi Admin / Pembayaran</p>
                <p>
                  Pesanan Anda sedang menunggu verifikasi bukti transfer QRIS. Gunakan tombol percepat di bawah jika ingin notifikasi prioritas via Telegram.
                </p>
              </div>
            </div>
          )}

          {isRejected && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-900 space-y-1">
                <p className="font-bold">Pesanan Ditolak / Perlu Perbaikan</p>
                <p>{order.rejectionReason || 'Bukti transfer tidak valid atau nominal tidak sesuai. Silakan upload ulang.'}</p>
              </div>
            </div>
          )}

          {/* Section 1: Rincian Pesanan & Pembayaran */}
          <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200 space-y-3">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-amber-600" />
              <span>Rincian Transaksi & Dokumen</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-stone-200/80">
                <span className="text-stone-400 block text-[11px]">Nomor Order ID</span>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="font-mono font-bold text-stone-900">{order.id}</span>
                  <button
                    onClick={handleCopyId}
                    className="p-1 rounded-md hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
                    title="Salin ID"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-stone-200/80">
                <span className="text-stone-400 block text-[11px]">Total Biaya</span>
                <span className="font-mono font-bold text-amber-600 text-sm mt-0.5 block">
                  Rp{(order.price || settings.basePrice || 5000).toLocaleString('id-ID')}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-stone-200/80">
                <span className="text-stone-400 block text-[11px]">Tanggal Pembuatan</span>
                <span className="text-stone-800 font-medium mt-0.5 block">
                  {new Date(order.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-stone-200/80">
                <span className="text-stone-400 block text-[11px]">Terakhir Diperbarui</span>
                <span className="text-stone-800 font-medium mt-0.5 block">
                  {order.updatedAt ? new Date(order.updatedAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Sama dengan dibuat'}
                </span>
              </div>
            </div>

            {/* Bukti Transfer */}
            {order.paymentProofUrl && (
              <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 flex items-center justify-between">
                <div>
                  <span className="text-stone-400 block text-[11px]">Bukti Pembayaran</span>
                  <span className="text-stone-800 font-medium text-xs">Struk transfer terunggah</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProofPreview(true)}
                  className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold text-xs border border-amber-200 transition-colors"
                >
                  Lihat Struk
                </button>
              </div>
            )}
          </div>

          {/* Section 2: Data Kontak Pemesan */}
          <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200 space-y-3">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-600" />
              <span>Data Kontak Pemesan</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-stone-200/80">
                <span className="text-stone-400 block text-[11px]">Nama Pemesan</span>
                <span className="font-semibold text-stone-900 mt-0.5 block">{order.customerName}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-stone-200/80">
                <span className="text-stone-400 block text-[11px] flex items-center gap-1">
                  <Phone className="w-3 h-3 text-stone-400" /> WhatsApp
                </span>
                <span className="font-mono text-stone-900 mt-0.5 block">{order.whatsapp}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-stone-200/80">
                <span className="text-stone-400 block text-[11px] flex items-center gap-1">
                  <Mail className="w-3 h-3 text-stone-400" /> Email
                </span>
                <span className="text-stone-900 mt-0.5 block truncate">{order.email}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Ringkasan Data Undangan */}
          <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>Ringkasan Isi Undangan</span>
              </h4>
              <span className="font-mono text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                /{order.slug}
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200/80 space-y-2.5 text-xs">
              <div className="flex justify-between items-start gap-2 pb-2 border-b border-stone-100">
                <span className="text-stone-500 font-medium">Judul Acara:</span>
                <span className="font-bold text-stone-900 text-right">{d.title || '-'}</span>
              </div>

              {(d.eventDate || d.akadDate) && (
                <div className="flex justify-between items-center gap-2 pb-2 border-b border-stone-100">
                  <span className="text-stone-500 font-medium">Tanggal Acara:</span>
                  <span className="text-stone-800 font-medium">{d.eventDate || d.akadDate}</span>
                </div>
              )}

              {(d.startTime || d.akadTime) && (
                <div className="flex justify-between items-center gap-2 pb-2 border-b border-stone-100">
                  <span className="text-stone-500 font-medium">Waktu Acara:</span>
                  <span className="text-stone-800 font-medium">{d.startTime || d.akadTime}</span>
                </div>
              )}

              {d.venueName && (
                <div className="flex justify-between items-start gap-2 pb-2 border-b border-stone-100">
                  <span className="text-stone-500 font-medium">Lokasi / Gedung:</span>
                  <span className="text-stone-800 text-right">{d.venueName}</span>
                </div>
              )}

              {d.venueAddress && (
                <div className="flex justify-between items-start gap-2 pb-2 border-b border-stone-100">
                  <span className="text-stone-500 font-medium">Alamat:</span>
                  <span className="text-stone-600 text-right text-[11px] max-w-xs">{d.venueAddress}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 text-[11px] text-stone-500">
                <span className="flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-stone-400" />
                  {d.galleryImages?.length || 0} Foto Galeri
                </span>
                <span className="flex items-center gap-1">
                  <Music className="w-3.5 h-3.5 text-stone-400" />
                  {d.backgroundMusicUrl ? 'Ada Musik Latar' : 'Tanpa Musik'}
                </span>
                <span>👁️ {order.viewsCount || 0} Kunjungan</span>
              </div>
            </div>

            {/* URL Undangan Bar */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">
                  Tautan Undangan Aktif
                </span>
                <span className="font-mono text-xs font-bold text-stone-900 truncate block">
                  {invitationUrl}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs border border-stone-200 flex items-center gap-1 shadow-2xs transition-colors"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Tersalin!' : 'Salin URL'}</span>
                </button>
                {onViewInvitation && (
                  <button
                    type="button"
                    onClick={() => onViewInvitation(order.slug)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1 shadow-2xs transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 sm:p-6 border-t border-stone-100 bg-stone-50/60 flex items-center justify-between gap-2 flex-wrap">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-stone-600 hover:text-stone-900 font-medium text-xs hover:bg-stone-200/50 transition-colors"
          >
            Tutup
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Tombol Edit Undangan Lengkap */}
            {onEditOrder && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditOrder(order);
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                id="btn-edit-from-detail"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Data Undangan Lengkap</span>
              </button>
            )}

            {/* Tombol Share Link Tamu */}
            {onOpenShare && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenShare(order);
                }}
                className="px-3.5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Salin Link Tamu WA</span>
              </button>
            )}

            {/* Tombol Download ZIP */}
            {isPaid && onDownloadZip && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDownloadZip(order);
                }}
                className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 font-semibold text-xs border border-stone-300 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-amber-600" />
                <span>Download ZIP</span>
              </button>
            )}

            {/* Tombol Expedite Telegram */}
            {isPending && onExpediteOrder && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onExpediteOrder(order);
                }}
                className="px-3.5 py-2.5 rounded-xl bg-stone-950 hover:bg-stone-900 text-amber-400 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Zap className="w-3.5 h-3.5 fill-amber-400" />
                <span>⚡ Percepat Verifikasi Bot</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bukti Transfer Zoom Modal */}
      {showProofPreview && order.paymentProofUrl && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-lg w-full bg-white rounded-3xl p-4 border border-stone-700 shadow-2xl">
            <button
              onClick={() => setShowProofPreview(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center hover:bg-stone-800"
            >
              <X className="w-4 h-4" />
            </button>
            <h4 className="font-bold text-stone-900 text-sm mb-3">Bukti Pembayaran QRIS - {order.id}</h4>
            <div className="rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 max-h-[70vh] flex items-center justify-center">
              <img
                src={order.paymentProofUrl}
                alt="Struk Bukti Pembayaran"
                className="max-h-[65vh] w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
