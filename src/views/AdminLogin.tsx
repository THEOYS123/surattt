import React, { useState } from 'react';
import { ShieldCheck, Lock, KeyRound, ArrowLeft, AlertCircle } from 'lucide-react';
import { authService } from '../services/auth';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onCancel
}) => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const code = accessCode.trim();
      let success = false;

      if (code.toLowerCase() === 'ax0895') {
        success = authService.loginWithSecretCode('ax0895');
      } else {
        success = authService.login(code, code);
      }

      setIsLoading(false);

      if (success) {
        onLoginSuccess();
      } else {
        setError('Kode otorisasi tidak valid.');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-stone-900 rounded-3xl border border-stone-800 shadow-2xl overflow-hidden text-stone-100">
        
        {/* Header */}
        <div className="p-8 text-center space-y-3 border-b border-stone-800">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            Verifikasi Akses
          </h1>
          <p className="text-xs text-stone-400 max-w-xs mx-auto">
            Masukkan kode otorisasi sistem untuk membuka konsol kontrol.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-950/50 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-2">
              Kode Kunci Otorisasi
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Masukkan kode..."
                autoFocus
                className="w-full pl-10 pr-3.5 py-3 bg-stone-800/80 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
              />
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3.5 rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              id="btn-admin-login-submit"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isLoading ? 'Mengautentikasi...' : 'Buka Konsol'}</span>
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full text-xs text-stone-400 hover:text-stone-200 font-medium py-2 flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Halaman Utama</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
