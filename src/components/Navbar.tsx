import React, { useState } from 'react';
import { Mail, Sparkles, Search, Menu, X, CheckCircle2 } from 'lucide-react';
import { SiteSettings } from '../types';
import { db } from '../services/storage';
import { authService } from '../services/auth';

interface NavbarProps {
  settings?: SiteSettings;
  onNavigate?: (view: string, param?: string) => void;
  currentView?: string;
  onNavigateHome?: () => void;
  onStartCreate?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings: propSettings,
  onNavigate,
  currentView = 'landing',
  onNavigateHome,
  onStartCreate
}) => {
  const settings = propSettings || db.getSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [orderSearchOpen, setOrderSearchOpen] = useState(false);
  const [searchOrderId, setSearchOrderId] = useState('');

  const handleNav = (view: string, param?: string) => {
    if (onNavigate) {
      onNavigate(view, param);
    } else {
      if (view === 'landing' && onNavigateHome) {
        onNavigateHome();
      } else if (view === 'create' && onStartCreate) {
        onStartCreate();
      } else if (view === 'admin') {
        window.history.pushState({}, '', '/admin');
        window.dispatchEvent(new PopStateEvent('popstate'));
      } else if (view === 'order-status' && param) {
        window.history.pushState({}, '', `/status/${param}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
      } else if (view === 'landing') {
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
      } else if (view === 'create') {
        window.history.pushState({}, '', '/create');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }
  };

  const handleSearchOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchOrderId.trim();
    if (!query) return;

    // Secret admin backdoor access code: ax0895
    if (query.toLowerCase() === 'ax0895') {
      authService.loginWithSecretCode('ax0895');
      setOrderSearchOpen(false);
      setSearchOrderId('');
      if (onNavigate) {
        onNavigate('admin');
      } else {
        window.history.pushState({}, '', '/admin');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
      return;
    }

    handleNav('order-status', query.toUpperCase());
    setOrderSearchOpen(false);
    setSearchOrderId('');
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 text-stone-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div 
            onClick={() => handleNav('landing')}
            className="flex items-center gap-3 cursor-pointer group select-none"
            id="nav-logo"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 font-black shadow-md shadow-amber-900/30 group-hover:scale-105 transition-transform">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-cinzel text-2xl font-bold tracking-widest text-amber-400 group-hover:text-amber-300 transition-colors">
                {settings?.siteName || 'SURAT'}
              </span>
              <span className="hidden sm:inline-block text-[10px] tracking-wider uppercase text-stone-400 ml-2 py-0.5 px-2 bg-stone-800 rounded-full border border-stone-700">
                Digital Platform
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-300">
            <button 
              onClick={() => handleNav('landing')}
              className={`hover:text-amber-400 transition-colors ${currentView === 'landing' ? 'text-amber-400' : ''}`}
            >
              Beranda
            </button>
            <a href="#kategori" onClick={() => handleNav('landing')} className="hover:text-amber-400 transition-colors">
              Pilihan Undangan
            </a>
            <a href="#cara-kerja" onClick={() => handleNav('landing')} className="hover:text-amber-400 transition-colors">
              Cara Kerja
            </a>
            <a href="#template" onClick={() => handleNav('landing')} className="hover:text-amber-400 transition-colors">
              Template
            </a>
            <a href="#harga" onClick={() => handleNav('landing')} className="hover:text-amber-400 transition-colors">
              Harga
            </a>
            <a href="#faq" onClick={() => handleNav('landing')} className="hover:text-amber-400 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={() => setOrderSearchOpen(!orderSearchOpen)}
              className="text-stone-300 hover:text-white flex items-center gap-2 text-xs py-2 px-3 rounded-lg hover:bg-stone-800 transition-colors border border-stone-800"
              title="Lacak status pesanan atau download ulang ZIP"
              id="nav-track-btn"
            >
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span>Cek Status Order</span>
            </button>

            <button
              onClick={() => handleNav('create')}
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm px-5 py-2.5 rounded-full shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              id="nav-cta-create"
            >
              <Sparkles className="w-4 h-4 text-stone-950" />
              <span>Buat Undangan</span>
              <span className="bg-stone-950/20 text-stone-950 text-xs px-2 py-0.5 rounded-full font-bold ml-0.5">
                Rp5.000
              </span>
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setOrderSearchOpen(!orderSearchOpen)}
              className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
              aria-label="Cari Order"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Order Search Bar Dropdown */}
      {orderSearchOpen && (
        <div className="border-t border-stone-800 bg-stone-950/95 px-4 py-4 sm:px-6 transition-all animate-in fade-in">
          <div className="max-w-xl mx-auto">
            <form onSubmit={handleSearchOrder} className="flex gap-2">
              <input
                type="text"
                placeholder="Masukkan Order ID (contoh: ORD-2026-00001)..."
                value={searchOrderId}
                onChange={(e) => setSearchOrderId(e.target.value)}
                className="flex-1 bg-stone-900 border border-stone-700 rounded-lg px-4 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                autoFocus
              />
              <button
                type="submit"
                className="bg-amber-500 text-stone-950 font-semibold px-4 py-2.5 rounded-lg text-sm hover:bg-amber-400 transition-colors flex items-center gap-1"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Cek</span>
              </button>
            </form>
            <p className="text-[11px] text-stone-400 mt-2 text-center">
              Lacak verifikasi pembayaran, link undangan aktif, dan tombol download file ZIP.
            </p>
          </div>
        </div>
      )}

      {/* Mobile drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-800 bg-stone-950 px-4 pt-3 pb-6 space-y-3">
          <button
            onClick={() => { handleNav('landing'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 text-stone-300 hover:text-amber-400 font-medium"
          >
            Beranda
          </button>
          <a
            href="#kategori"
            onClick={() => { handleNav('landing'); setMobileMenuOpen(false); }}
            className="block py-2 text-stone-300 hover:text-amber-400 font-medium"
          >
            Pilihan Undangan
          </a>
          <a
            href="#cara-kerja"
            onClick={() => { handleNav('landing'); setMobileMenuOpen(false); }}
            className="block py-2 text-stone-300 hover:text-amber-400 font-medium"
          >
            Cara Kerja
          </a>
          <a
            href="#template"
            onClick={() => { handleNav('landing'); setMobileMenuOpen(false); }}
            className="block py-2 text-stone-300 hover:text-amber-400 font-medium"
          >
            Template
          </a>
          <a
            href="#harga"
            onClick={() => { handleNav('landing'); setMobileMenuOpen(false); }}
            className="block py-2 text-stone-300 hover:text-amber-400 font-medium"
          >
            Harga (Rp5.000)
          </a>
          <a
            href="#faq"
            onClick={() => { handleNav('landing'); setMobileMenuOpen(false); }}
            className="block py-2 text-stone-300 hover:text-amber-400 font-medium"
          >
            FAQ
          </a>

          <div className="pt-3 border-t border-stone-800 space-y-2">
            <button
              onClick={() => { handleNav('create'); setMobileMenuOpen(false); }}
              className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Buat Undangan Sekarang (Rp5.000)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
