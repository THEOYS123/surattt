import React, { useState } from 'react';
import {
  QrCode,
  Upload,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  FileText,
  Copy,
  Check
} from 'lucide-react';
import { Order, SiteSettings } from '../types';
import { db } from '../services/storage';
import { safeCopyToClipboard } from '../utils/clipboard';
import { telegramService } from '../services/telegramService';

interface CheckoutPageProps {
  order: Order;
  settings: SiteSettings;
  onPaymentSubmitted: (orderId: string) => void;
  onBack: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  order,
  settings,
  onPaymentSubmitted,
  onBack
}) => {
  const [buyerName, setBuyerName] = useState(order.customerName);
  const [email, setEmail] = useState(order.email);
  const [whatsapp, setWhatsapp] = useState(order.whatsapp);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  // Handle file upload with strict MIME & size validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Hanya diperbolehkan format gambar (JPG, PNG, atau WEBP).');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal 5MB.');
      return;
    }

    setProofFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProofPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCopyOrderId = () => {
    safeCopyToClipboard(order.id);
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofPreviewUrl) {
      setUploadError('Silakan pilih foto atau screenshot bukti transfer Anda.');
      return;
    }

    setIsSubmitting(true);

    // Update order with payment proof and status PENDING (MENUNGGU VERIFIKASI)
    const updatedOrder: Order = {
      ...order,
      customerName: buyerName.trim(),
      email: email.trim(),
      whatsapp: whatsapp.trim(),
      paymentStatus: 'PENDING',
      updatedAt: new Date().toISOString(),
      paymentProofUrl: proofPreviewUrl,
      paymentProofName: proofFile?.name || 'bukti_transfer.jpg'
    };

    db.saveOrder(updatedOrder);

    // Auto-report to Telegram Bot if configured
    telegramService.notifyNewOrder(updatedOrder).catch((err) => {
      console.warn('Telegram notification failed:', err);
    });

    setTimeout(() => {
      setIsSubmitting(false);
      onPaymentSubmitted(order.id);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-stone-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Back navigation */}
        <button
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Editor</span>
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
          
          {/* Header */}
          <div className="bg-stone-900 text-white p-6 sm:p-8 text-center space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
              Pembayaran QRIS Satu Kali
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-display">
              TOTAL PEMBAYARAN: Rp5.000
            </h1>
            <p className="text-xs text-stone-300">
              Order ID: <span className="font-mono font-bold text-amber-300">{order.id}</span>
              <button 
                onClick={handleCopyOrderId} 
                className="ml-2 inline-flex items-center text-[10px] text-stone-400 hover:text-white"
                title="Salin Order ID"
              >
                {copiedOrderId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            
            {/* QRIS Display Container */}
            <div className="bg-stone-50 border-2 border-dashed border-stone-300 rounded-2xl p-6 text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700">
                <QrCode className="w-4 h-4 text-amber-600" />
                <span>Scan QRIS Resmi Merchant</span>
              </div>

              {/* QRIS Image Frame */}
              <div className="max-w-[280px] mx-auto bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
                <div className="border-b border-stone-200 pb-2 mb-3">
                  <span className="text-[10px] font-black tracking-widest text-stone-800 uppercase block">
                    QRIS • PEMBAYARAN DIGITAL
                  </span>
                  <p className="text-[11px] font-bold text-amber-700 truncate">
                    {settings.merchantName}
                  </p>
                </div>

                <div className="aspect-square bg-stone-100 flex items-center justify-center overflow-hidden rounded-lg">
                  <img
                    src={settings.qrisImageUrl}
                    alt="QRIS Pembayaran"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="pt-2 text-[10px] text-stone-500 font-mono">
                  {settings.merchantBank}
                </div>
              </div>

              <div className="max-w-md mx-auto text-xs text-stone-600 leading-relaxed">
                Buka aplikasi pembayaran apa saja (<strong>DANA, GoPay, OVO, ShopeePay, BCA, Livin Mandiri, BRImo</strong>) lalu scan QRIS di atas dengan nominal pas <strong>Rp5.000</strong>.
              </div>
            </div>

            {/* FORM UPLOAD BUKTI PEMBAYARAN */}
            <form onSubmit={handleSubmitProof} className="space-y-5">
              <div className="border-t border-stone-200 pt-6">
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-amber-600" />
                  <span>Upload Bukti Pembayaran</span>
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Kirimkan tangkapan layar atau struk transfer untuk diverifikasi oleh admin.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nama Pembeli *
                  </label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nomor WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Alamat Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Order ID
                  </label>
                  <input
                    type="text"
                    disabled
                    value={order.id}
                    className="w-full px-3.5 py-2.5 bg-stone-100 border border-stone-200 rounded-xl text-xs sm:text-sm font-mono text-stone-500"
                  />
                </div>
              </div>

              {/* Bukti Upload Dropzone */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Foto Bukti Transfer (JPG / PNG) *
                </label>
                <div className="relative border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-2xl p-6 text-center bg-stone-50/50 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    required={!proofPreviewUrl}
                  />

                  {proofPreviewUrl ? (
                    <div className="space-y-3">
                      <img
                        src={proofPreviewUrl}
                        alt="Bukti Transfer"
                        className="max-h-48 mx-auto rounded-lg shadow-xs object-contain"
                      />
                      <p className="text-xs text-emerald-700 font-semibold flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>File terpilih: {proofFile?.name || 'bukti_transfer.jpg'}</span>
                      </p>
                      <span className="text-[11px] text-stone-400 block">Klik di sini untuk mengganti foto</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-stone-400 mx-auto" />
                      <p className="text-xs font-semibold text-stone-700">
                        Klik atau seret foto bukti pembayaran ke sini
                      </p>
                      <p className="text-[11px] text-stone-400">
                        Format JPG, PNG, atau WEBP (Maksimal 5MB)
                      </p>
                    </div>
                  )}
                </div>

                {uploadError && (
                  <p className="text-xs text-rose-600 flex items-center gap-1 mt-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{uploadError}</span>
                  </p>
                )}
              </div>

              {/* Status Note Banner */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Penting: Status Menunggu Verifikasi</p>
                  <p className="text-amber-800 leading-relaxed mt-0.5">
                    Setelah Anda mengunggah bukti, status order berubah menjadi <strong>MENUNGGU VERIFIKASI</strong>. 
                    Admin kami akan memverifikasi dana masuk sebelum tautan online diaktifkan dan file ZIP dapat di-download.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !proofPreviewUrl}
                className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition-all"
                id="btn-upload-proof"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'Mengirim Bukti...' : 'Kirim Bukti Pembayaran'}</span>
              </button>

            </form>

          </div>
        </div>

      </div>
    </div>
  );
};
