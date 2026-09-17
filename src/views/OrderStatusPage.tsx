import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Download,
  Share2,
  ExternalLink,
  Upload,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  FileCheck,
  Zap,
  Edit3,
  Calendar,
  MapPin,
  Music,
  Image as ImageIcon,
  User,
  Info
} from 'lucide-react';
import { Order, SiteSettings } from '../types';
import { db } from '../services/storage';
import { generateInvitationZip } from '../services/zipGenerator';
import { ShareModal } from '../components/ShareModal';
import { ExpediteOrderModal } from '../components/ExpediteOrderModal';
import { safeCopyToClipboard } from '../utils/clipboard';

interface OrderStatusPageProps {
  order: Order;
  settings: SiteSettings;
  onRefresh: () => void;
  onGoToHome: () => void;
  onEditOrder?: (order: Order) => void;
}

export const OrderStatusPage: React.FC<OrderStatusPageProps> = ({
  order,
  settings,
  onRefresh,
  onGoToHome,
  onEditOrder
}) => {
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [expediteModalOpen, setExpediteModalOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Re-upload proof state for REJECTED orders
  const [reUploadProofUrl, setReUploadProofUrl] = useState<string>('');
  const [isReUploading, setIsReUploading] = useState(false);
  const [reUploadSuccess, setReUploadSuccess] = useState(false);

  const d = order.invitationData || ({} as any);
  const isPaid = order.paymentStatus === 'PAID';
  const isPending = order.paymentStatus === 'PENDING';
  const isRejected = order.paymentStatus === 'REJECTED';

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://surattt.netlify.app';
  const invitationUrl = `${baseUrl}/${order.slug.replace(/^\//, '')}`;

  const handleDownloadZip = async () => {
    try {
      setIsDownloadingZip(true);
      await generateInvitationZip(order);
    } catch (err) {
      console.error('Error generating zip:', err);
      alert('Gagal membuat file ZIP. Silakan coba lagi.');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const handleCopyUrl = () => {
    safeCopyToClipboard(invitationUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setReUploadProofUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleReSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reUploadProofUrl) return;

    setIsReUploading(true);
    const updated: Order = {
      ...order,
      paymentStatus: 'PENDING',
      paymentProofUrl: reUploadProofUrl,
      rejectionReason: undefined,
      updatedAt: new Date().toISOString()
    };
    db.saveOrder(updated);

    setTimeout(() => {
      setIsReUploading(false);
      setReUploadSuccess(true);
      onRefresh();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-stone-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Status Header Banner */}
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
          
          {/* PAID Banner */}
          {isPaid && (
            <div className="bg-emerald-600 text-white p-6 sm:p-8 text-center space-y-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest bg-emerald-700/60 py-1 px-3 rounded-full inline-block">
                Status: Pembayaran Terverifikasi (PAID)
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif-display">
                Undangan Anda Telah Aktif & Terbit!
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-md mx-auto">
                Selamat! Pembayaran Anda telah disetujui admin. Link undangan online kini aktif dan Anda bebas mengedit data undangan kapan saja.
              </p>
            </div>
          )}

          {/* PENDING Banner */}
          {isPending && (
            <div className="bg-amber-600 text-white p-6 sm:p-8 text-center space-y-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-7 h-7 text-white animate-spin-slow" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest bg-amber-700/60 py-1 px-3 rounded-full inline-block">
                Status: MENUNGGU VERIFIKASI ADMIN
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif-display">
                Bukti Pembayaran Diterima
              </h1>
              <p className="text-xs sm:text-sm text-amber-100 max-w-md mx-auto">
                Admin sedang memverifikasi bukti transfer Anda. Anda tetap dapat mengedit data undangan selagi menunggu.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setExpediteModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-stone-950 hover:bg-stone-900 text-amber-400 font-bold px-5 py-2.5 rounded-full text-xs shadow-lg transition-transform hover:scale-105 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-amber-400" />
                  <span>⚡ Ingatkan Owner / Percepat Pesanan (Telegram)</span>
                </button>
              </div>
            </div>
          )}

          {/* REJECTED Banner */}
          {isRejected && (
            <div className="bg-rose-600 text-white p-6 sm:p-8 text-center space-y-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-7 h-7 text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest bg-rose-700/60 py-1 px-3 rounded-full inline-block">
                Status: Pembayaran Ditolak (REJECTED)
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif-display">
                Verifikasi Pembayaran Ditolak
              </h1>
              <p className="text-xs sm:text-sm text-rose-100 max-w-md mx-auto">
                Admin menemukan kendala pada verifikasi bukti pembayaran. Silakan baca alasan penolakan dan upload ulang bukti transfer yang valid.
              </p>
            </div>
          )}

          {/* Body Content */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Primary Action Buttons Bar */}
            <div className="space-y-4 pb-6 border-b border-stone-200">
              {/* URL Undangan Bar */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Alamat URL Undangan:
                  </label>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isPaid ? 'Aktif Publik' : 'Menunggu Verifikasi'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={invitationUrl}
                    className="flex-1 bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-medium text-stone-800 truncate"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
                  >
                    {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedUrl ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Tombol Edit Undangan Lengkap (Selalu Tersedia) */}
                {onEditOrder && (
                  <button
                    onClick={() => onEditOrder(order)}
                    className="sm:col-span-2 bg-stone-900 hover:bg-stone-800 text-amber-400 py-3.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all border border-amber-500/30 cursor-pointer"
                    id="btn-edit-order-full"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>✏️ Edit Data Undangan Lengkap (6 Langkah Pengisian)</span>
                  </button>
                )}

                {isPaid && (
                  <>
                    <a
                      href={`/${order.slug.replace(/^\//, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-amber-600 hover:bg-amber-500 text-white py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Buka Undangan Online</span>
                    </a>

                    <button
                      onClick={() => setShareModalOpen(true)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Salin Link Tamu WhatsApp</span>
                    </button>

                    <button
                      onClick={handleDownloadZip}
                      disabled={isDownloadingZip}
                      className="sm:col-span-2 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
                      id="btn-download-zip"
                    >
                      <Download className="w-4 h-4 text-amber-600" />
                      <span>{isDownloadingZip ? 'Membuat ZIP...' : 'Download Source Code Website (.zip)'}</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Rejection notice and re-upload form if REJECTED */}
            {isRejected && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-rose-900">Alasan Penolakan dari Admin:</h3>
                    <p className="text-xs text-rose-800 mt-1 font-medium bg-white/80 p-2.5 rounded-lg border border-rose-200">
                      "{order.rejectionReason || 'Nominal tidak sesuai atau gambar bukti transfer tidak terbaca dengan jelas.'}"
                    </p>
                  </div>
                </div>

                <form onSubmit={handleReSubmitProof} className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                    Upload Ulang Bukti Transfer Baru:
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    className="block w-full text-xs text-stone-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer"
                  />

                  {reUploadProofUrl && (
                    <img
                      src={reUploadProofUrl}
                      alt="Preview Bukti Baru"
                      className="max-h-36 rounded-lg border border-stone-200 shadow-xs"
                    />
                  )}

                  <button
                    type="submit"
                    disabled={isReUploading || !reUploadProofUrl}
                    className="w-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-3 rounded-xl shadow-sm flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isReUploading ? 'Mengirim...' : 'Kirim Ulang Bukti Pembayaran'}</span>
                  </button>
                </form>
              </div>
            )}

            {/* Detailed Order Specifications Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-600" />
                <span>Informasi Lengkap Pesanan & Undangan</span>
              </h3>
              
              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 divide-y divide-stone-200 text-xs sm:text-sm">
                <div className="flex justify-between py-2">
                  <span className="text-stone-500">Nomor Order</span>
                  <span className="font-mono font-bold text-stone-900">{order.id}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-stone-500">Status Pembayaran</span>
                  <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                    isPaid ? 'bg-emerald-100 text-emerald-800' : isPending ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {isPaid ? 'LUNAS (PAID)' : isPending ? 'PENDING' : 'REJECTED'}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-stone-500">Nama Pelanggan</span>
                  <span className="font-semibold text-stone-900">{order.customerName}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-stone-500">WhatsApp / Email</span>
                  <span className="text-stone-800">{order.whatsapp} • {order.email}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-stone-500">Judul Undangan</span>
                  <span className="font-semibold text-stone-900 text-right">{d.title || '-'}</span>
                </div>
                {(d.eventDate || d.akadDate) && (
                  <div className="flex justify-between py-2">
                    <span className="text-stone-500">Tanggal Acara</span>
                    <span className="text-stone-800">{d.eventDate || d.akadDate} ({d.startTime || d.akadTime || '09:00'})</span>
                  </div>
                )}
                {d.venueName && (
                  <div className="flex justify-between py-2">
                    <span className="text-stone-500">Lokasi Acara</span>
                    <span className="text-stone-800 text-right">{d.venueName}</span>
                  </div>
                )}
                <div className="flex justify-between py-2">
                  <span className="text-stone-500">Alamat Slug</span>
                  <span className="font-mono text-amber-700 font-semibold">/{order.slug}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-stone-500">Total Biaya</span>
                  <span className="font-bold text-stone-900 font-mono">Rp{(order.price || 5000).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-stone-500">Waktu Pemesanan</span>
                  <span className="text-stone-700">{new Date(order.createdAt).toLocaleString('id-ID')}</span>
                </div>
                {order.paymentProofUrl && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-stone-500">Bukti Pembayaran</span>
                    <a
                      href={order.paymentProofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-amber-700 hover:text-amber-800 font-medium underline flex items-center gap-1"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Lihat Gambar Bukti</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions at Bottom */}
            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={onGoToHome}
                className="text-xs text-stone-500 hover:text-stone-800 font-medium"
              >
                ← Kembali ke Beranda
              </button>

              <button
                onClick={onRefresh}
                className="inline-flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-800 font-semibold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Segarkan Status</span>
              </button>
            </div>

          </div>

        </div>

        {/* Share Modal */}
        {shareModalOpen && (
          <ShareModal
            order={order}
            slug={order.slug}
            title={order.invitationData?.title}
            onClose={() => setShareModalOpen(false)}
          />
        )}

        {/* Expedite Order Modal */}
        {expediteModalOpen && (
          <ExpediteOrderModal
            order={order}
            onClose={() => setExpediteModalOpen(false)}
            onSuccess={() => onRefresh()}
          />
        )}

      </div>
    </div>
  );
};

