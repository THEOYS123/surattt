import React from 'react';
import { Mail, MessageCircle, ShieldCheck, Download, Sparkles, Heart } from 'lucide-react';
import { SiteSettings, Category } from '../types';
import { db } from '../services/storage';

interface FooterProps {
  settings?: SiteSettings;
  onNavigate?: (view: string) => void;
  categories?: Category[];
  onStartCreate?: (categoryId?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings: propSettings,
  onNavigate,
  categories: propCategories,
  onStartCreate
}) => {
  const settings = propSettings || db.getSettings();
  const categories = propCategories || db.getCategories();

  const handleNav = (view: string) => {
    if (onNavigate) {
      onNavigate(view);
    } else if (view === 'landing') {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else if (view === 'admin-login') {
      window.history.pushState({}, '', '/admin');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-stone-950 font-black">
                <Mail className="w-5 h-5 text-stone-950" />
              </div>
              <span className="font-cinzel text-2xl font-bold tracking-widest text-amber-400">
                {settings?.siteName || 'SURAT'}
              </span>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed">
              Platform SaaS inovatif penyedia undangan digital profesional dengan harga tetap Rp5.000. 
              Dapatkan URL online aktif, kado digital, RSVP interaktif, dan file ZIP website mandiri.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400/90 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verifikasi Manual & Keamanan Terjamin</span>
            </div>
          </div>

          {/* Col 2: Kategori Populer */}
          <div>
            <h3 className="text-stone-100 font-semibold text-sm uppercase tracking-wider mb-4">
              Kategori Undangan
            </h3>
            <ul className="space-y-2 text-sm text-stone-400">
              {categories && categories.length > 0 ? (
                categories.slice(0, 6).map((cat) => (
                  <li key={cat.id}>
                    {onStartCreate ? (
                      <button
                        onClick={() => onStartCreate(cat.id)}
                        className="hover:text-amber-400 transition-colors text-left"
                      >
                        {cat.name}
                      </button>
                    ) : (
                      <a href="#kategori" onClick={() => handleNav('landing')} className="hover:text-amber-400 transition-colors">
                        {cat.name}
                      </a>
                    )}
                  </li>
                ))
              ) : (
                <>
                  <li><a href="#kategori" onClick={() => handleNav('landing')} className="hover:text-amber-400 transition-colors">Undangan Pernikahan (Walimah)</a></li>
                  <li><a href="#kategori" onClick={() => handleNav('landing')} className="hover:text-amber-400 transition-colors">Undangan Bisnis & Seminar</a></li>
                  <li><a href="#kategori" onClick={() => handleNav('landing')} className="hover:text-amber-400 transition-colors">Undangan Ulang Tahun & Milad</a></li>
                  <li><a href="#kategori" onClick={() => handleNav('landing')} className="hover:text-amber-400 transition-colors">Undangan Aqiqah & Khitanan</a></li>
                  <li><a href="#kategori" onClick={() => handleNav('landing')} className="hover:text-amber-400 transition-colors">Undangan Reuni & Organisasi</a></li>
                  <li><a href="#kategori" onClick={() => handleNav('landing')} className="hover:text-amber-400 transition-colors">Undangan Tasyakuran & Pengajian</a></li>
                </>
              )}
            </ul>
          </div>

          {/* Col 3: Keunggulan Produk */}
          <div>
            <h3 className="text-stone-100 font-semibold text-sm uppercase tracking-wider mb-4">
              Keunggulan SURAT
            </h3>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Tanpa biaya bulanan / langganan</span>
              </li>
              <li className="flex items-center gap-2">
                <Download className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Download file ZIP website mandiri</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Bayar mudah via QRIS DANA & Bank</span>
              </li>
              <li className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Fitur RSVP, Maps, Countdown & Galeri</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Layanan Bantuan */}
          <div>
            <h3 className="text-stone-100 font-semibold text-sm uppercase tracking-wider mb-4">
              Bantuan & CS
            </h3>
            <p className="text-stone-400 text-sm mb-4 leading-relaxed">
              Punya pertanyaan seputar verifikasi pembayaran atau konfigurasi undangan? Hubungi tim support kami:
            </p>
            <div className="space-y-2.5 text-sm">
              <a
                href={`https://wa.me/${settings?.supportWhatsapp || '6281234567890'}?text=Halo%20Admin%20SURAT%2C%20saya%20butuh%20bantuan.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp: +{settings?.supportWhatsapp || '6281234567890'}</span>
              </a>
              <a
                href={`mailto:${settings?.supportEmail || 'halo@surattt.netlify.app'}`}
                className="flex items-center gap-2 text-stone-300 hover:text-amber-400 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>{settings?.supportEmail || 'halo@surattt.netlify.app'}</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>{settings?.footerText || '© 2026 SURAT. Satu Undangan. Banyak Kemungkinan.'}</p>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => handleNav('landing')}
              className="hover:text-stone-300 transition-colors"
            >
              Syarat & Ketentuan
            </button>
            <button 
              onClick={() => handleNav('landing')}
              className="hover:text-stone-300 transition-colors"
            >
              Kebijakan Privasi
            </button>
            <a 
              href={`https://wa.me/${settings?.supportWhatsapp || '6281234567890'}?text=Halo%20Bantuan%20SURAT`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-stone-300 transition-colors"
            >
              Pusat Bantuan
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
