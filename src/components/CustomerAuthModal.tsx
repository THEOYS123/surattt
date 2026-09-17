import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Compass,
  ArrowRight,
  LogIn,
  UserPlus
} from 'lucide-react';
import { customerAuth, REFERRAL_OPTIONS } from '../services/customerAuth';
import { UserAccount } from '../types';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
  onSuccess?: (user: UserAccount) => void;
  messageNotice?: string;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login',
  onSuccess,
  messageNotice
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  // Sync tab whenever modal opens or initialTab changes
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialTab]);
  
  // Login State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [remember30Days, setRemember30Days] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register State
  const [regUsername, setRegUsername] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regReferral, setRegReferral] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // UI status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    setTimeout(() => {
      const res = customerAuth.login(loginIdentifier, loginPassword, remember30Days);
      setLoading(false);

      if (res.success && res.user) {
        setSuccessMsg('Login berhasil! Mengarahkan...');
        setTimeout(() => {
          if (onSuccess) onSuccess(res.user!);
          onClose();
        }, 500);
      } else {
        setErrorMsg(res.message);
      }
    }, 400);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok dengan password yang dibuat.');
      return;
    }

    if (!agreeTerms) {
      setErrorMsg('Harap setujui syarat dan ketentuan layanan.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const res = customerAuth.register({
        username: regUsername,
        phone: regPhone,
        email: regEmail,
        password: regPassword,
        referralSource: regReferral
      });
      setLoading(false);

      if (res.success && res.user) {
        setSuccessMsg('Pendaftaran berhasil! Selamat datang.');
        setTimeout(() => {
          if (onSuccess) onSuccess(res.user!);
          onClose();
        }, 600);
      } else {
        setErrorMsg(res.message);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-stone-200 overflow-hidden relative max-h-[92vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-stone-100 p-6 sm:p-7 relative">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-cinzel text-lg font-bold tracking-widest text-amber-400">
              SURAT ACCOUNT
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {activeTab === 'login' ? 'Masuk ke Akun Anda' : 'Buat Akun Baru'}
          </h2>
          <p className="text-xs text-stone-300 mt-1">
            {activeTab === 'login'
              ? 'Pantau pesanan undangan, aktivitas akun, dan kelola link tamu Anda.'
              : 'Daftar mudah untuk menyimpan seluruh riwayat pesanan & file undangan digital.'}
          </p>

          {messageNotice && (
            <div className="mt-3 py-2 px-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-xs text-amber-200 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{messageNotice}</span>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex rounded-xl bg-stone-800/80 p-1 mt-4 border border-stone-700/60">
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'login'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk (Login)</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('register'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftar Akun</span>
            </button>
          </div>
        </div>

        {/* Modal Body / Forms */}
        <div className="p-6 sm:p-7 overflow-y-auto flex-1">
          
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Email atau Nama Pengguna
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="nama@email.com atau username"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="Masukkan password Anda"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* FITUR INGAT SAYA 30 HARI */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remember30Days}
                    onChange={(e) => setRemember30Days(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
                  />
                  <span className="text-xs text-stone-700 font-medium">
                    Ingat saya selama 30 hari
                  </span>
                </label>
                <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                  Auto-Login 30h
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <span>Memproses Masuk...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Masuk ke Akun</span>
                  </>
                )}
              </button>

              <div className="pt-3 border-t border-stone-100 text-center">
                <p className="text-xs text-stone-500">
                  Belum punya akun?{' '}
                  <button
                    type="button"
                    onClick={() => { setActiveTab('register'); setErrorMsg(null); }}
                    className="text-amber-600 font-bold hover:underline"
                  >
                    Daftar Akun Baru
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nama Pengguna (Username / Nama Lengkap) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rendi Pratama"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nomor HP & WhatsApp *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Alamat Email Aktif *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="nama@domain.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      placeholder="Min. 6 karakter"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Ulangi Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      placeholder="Ulangi password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* FITUR OPSIONAL: DARI MANA ANDA TAHU WEBSITE INI */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-amber-600" />
                    <span>Darimana Anda tahu website ini?</span>
                  </span>
                  <span className="text-[10px] text-stone-400 font-normal">(Opsional)</span>
                </label>
                <select
                  value={regReferral}
                  onChange={(e) => setRegReferral(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="">-- Pilih salah satu (opsional) --</option>
                  {REFERRAL_OPTIONS.map((opt, idx) => (
                    <option key={idx} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500 mt-0.5"
                  />
                  <span className="text-[11px] text-stone-600 leading-snug">
                    Saya menyetujui Ketentuan Layanan, Kebijakan Privasi, dan sistem penyimpanan data pesanan.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <span>Mendaftarkan Akun...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Daftar & Masuk Sekarang</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <p className="text-xs text-stone-500">
                  Sudah memiliki akun?{' '}
                  <button
                    type="button"
                    onClick={() => { setActiveTab('login'); setErrorMsg(null); }}
                    className="text-amber-600 font-bold hover:underline"
                  >
                    Masuk di sini
                  </button>
                </p>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
