import React, { useState, useEffect, useMemo } from 'react';
import { db } from './services/storage';
import { authService } from './services/auth';
import { customerAuth } from './services/customerAuth';
import { Order, SiteSettings, UserAccount } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './views/LandingPage';
import { CreateWizard } from './views/CreateWizard';
import { CheckoutPage } from './views/CheckoutPage';
import { OrderStatusPage } from './views/OrderStatusPage';
import { InvitationView } from './views/InvitationView';
import { AdminPanel } from './views/AdminPanel';
import { AdminLogin } from './views/AdminLogin';
import { CustomerDashboard } from './views/CustomerDashboard';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { AlertCircle, ArrowLeft, Home, Sparkles } from 'lucide-react';

export default function App() {
  // Navigation Path state synced with window.location.pathname
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);
  const [searchParams, setSearchParams] = useState<URLSearchParams>(new URLSearchParams(window.location.search));

  // Current working order during creation/checkout flow
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Category or Template pre-selected when starting wizard from landing page
  const [wizardPreselect, setWizardPreselect] = useState<{ categoryId?: string; templateId?: string }>({});

  // Global settings & categories (dynamic state)
  const [settings, setSettings] = useState<SiteSettings>(() => db.getSettings());
  const [categories, setCategories] = useState(() => db.getCategories());
  const [templates, setTemplates] = useState(() => db.getTemplates());

  // Admin auth state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(authService.isAuthenticated());

  // Customer auth state
  const [customerUser, setCustomerUser] = useState<UserAccount | null>(() => customerAuth.getCurrentUser());
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    tab: 'login' | 'register';
    message?: string;
  }>({
    isOpen: false,
    tab: 'login'
  });

  // Refresh data whenever route or navigation occurs
  const refreshData = () => {
    setSettings(db.getSettings());
    setCategories(db.getCategories());
    setTemplates(db.getTemplates());
    setIsAdminAuthenticated(authService.isAuthenticated());
    setCustomerUser(customerAuth.getCurrentUser());
  };

  // Sync customer authentication state across all browser actions
  useEffect(() => {
    const handleAuthEvent = (e: Event) => {
      const customEvt = e as CustomEvent<UserAccount | null>;
      setCustomerUser(customEvt.detail !== undefined ? customEvt.detail : customerAuth.getCurrentUser());
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'surat_customer_session' || e.key === 'surat_customer_users') {
        setCustomerUser(customerAuth.getCurrentUser());
      }
    };

    window.addEventListener('surat:auth-changed', handleAuthEvent);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('surat:auth-changed', handleAuthEvent);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Listen to browser forward/back buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      setSearchParams(new URLSearchParams(window.location.search));
      refreshData();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Helper to change routes seamlessly
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    setSearchParams(new URLSearchParams(window.location.search));
    refreshData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateView = (view: string, param?: string) => {
    if (view === 'landing') {
      navigate('/');
    } else if (view === 'create') {
      setWizardPreselect({});
      navigate('/create');
    } else if (view === 'order-status' && param) {
      navigate(`/status/${param}`);
    } else if (view === 'my-account' || view === 'account' || view === 'dashboard') {
      navigate('/my-account');
    } else if (view === 'login') {
      setAuthModal({ isOpen: true, tab: 'login' });
    } else if (view === 'register') {
      setAuthModal({ isOpen: true, tab: 'register' });
    } else if (view === 'admin' || view === 'admin-login') {
      setIsAdminAuthenticated(authService.isAuthenticated());
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const openAuth = (tab: 'login' | 'register' = 'login', message?: string) => {
    setAuthModal({ isOpen: true, tab, message });
  };

  // Check if current route is a special system route
  const isSpecialRoute = [
    '/',
    '/create',
    '/checkout',
    '/admin',
    '/admin/login',
    '/my-account',
    '/account',
    '/dashboard',
    '/login',
    '/register',
    '/masuk',
    '/daftar'
  ].includes(currentPath) || currentPath.startsWith('/status/');

  // Route: Admin
  if (currentPath === '/admin' || currentPath === '/admin/login') {
    if (!isAdminAuthenticated) {
      return (
        <AdminLogin
          onLoginSuccess={() => {
            setIsAdminAuthenticated(true);
            navigate('/admin');
          }}
          onCancel={() => navigate('/')}
        />
      );
    }
    return (
      <AdminPanel
        onLogout={() => {
          authService.logout();
          setIsAdminAuthenticated(false);
          navigate('/');
        }}
        onViewInvitation={(slug) => navigate(`/${slug.replace(/^\//, '')}`)}
      />
    );
  }

  // Route: Customer Auth Direct URLs (/login, /register, /masuk, /daftar)
  if (['/login', '/register', '/masuk', '/daftar'].includes(currentPath)) {
    const defaultTab = currentPath.includes('register') || currentPath.includes('daftar') ? 'register' : 'login';
    return (
      <div className="min-h-screen flex flex-col justify-between bg-stone-100">
        <Navbar
          settings={settings}
          currentView="landing"
          currentUser={customerUser}
          onLogoutCustomer={() => {
            customerAuth.logout();
            setCustomerUser(null);
            navigate('/');
          }}
          onNavigate={handleNavigateView}
          onNavigateHome={() => navigate('/')}
          onStartCreate={() => {
            setWizardPreselect({});
            navigate('/create');
          }}
          onOpenAuth={(tab) => openAuth(tab)}
        />
        <div className="flex-1 flex items-center justify-center p-4">
          <CustomerAuthModal
            isOpen={true}
            initialTab={defaultTab}
            onClose={() => navigate('/')}
            onSuccess={(user) => {
              setCustomerUser(user);
              navigate('/my-account');
            }}
          />
        </div>
        <Footer
          settings={settings}
          categories={categories}
          onNavigate={handleNavigateView}
          onStartCreate={(catId) => { setWizardPreselect({ categoryId: catId }); navigate('/create'); }}
        />
      </div>
    );
  }

  // Route: Customer Account / Dashboard (/my-account, /account, /dashboard)
  if (['/my-account', '/account', '/dashboard'].includes(currentPath)) {
    if (!customerUser) {
      return (
        <div className="min-h-screen flex flex-col justify-between bg-stone-100">
          <Navbar
            settings={settings}
            currentView="landing"
            currentUser={customerUser}
            onLogoutCustomer={() => {
              customerAuth.logout();
              setCustomerUser(null);
              navigate('/');
            }}
            onNavigate={handleNavigateView}
            onNavigateHome={() => navigate('/')}
            onStartCreate={() => {
              setWizardPreselect({});
              navigate('/create');
            }}
            onOpenAuth={(tab) => openAuth(tab)}
          />
          <CustomerAuthModal
            isOpen={true}
            initialTab="login"
            messageNotice="Silakan masuk atau daftar akun terlebih dahulu untuk melihat dashboard dan riwayat pesanan Anda."
            onClose={() => navigate('/')}
            onSuccess={(user) => {
              setCustomerUser(user);
              navigate('/my-account');
            }}
          />
          <Footer
            settings={settings}
            categories={categories}
            onNavigate={handleNavigateView}
            onStartCreate={(catId) => { setWizardPreselect({ categoryId: catId }); navigate('/create'); }}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col justify-between bg-stone-100">
        <Navbar
          settings={settings}
          currentView="my-account"
          currentUser={customerUser}
          onLogoutCustomer={() => {
            customerAuth.logout();
            setCustomerUser(null);
            navigate('/');
          }}
          onNavigate={handleNavigateView}
          onNavigateHome={() => navigate('/')}
          onStartCreate={() => {
            setWizardPreselect({});
            navigate('/create');
          }}
          onOpenAuth={(tab) => openAuth(tab)}
        />
        <CustomerDashboard
          user={customerUser}
          settings={settings}
          onLogout={() => {
            customerAuth.logout();
            setCustomerUser(null);
            navigate('/');
          }}
          onNavigateHome={() => navigate('/')}
          onStartCreate={() => {
            setWizardPreselect({});
            navigate('/create');
          }}
          onViewOrder={(orderId) => navigate(`/status/${orderId}`)}
          onViewInvitation={(slug) => navigate(`/${slug}`)}
          onUpdateUser={(updated) => setCustomerUser(updated)}
        />
        <Footer
          settings={settings}
          categories={categories}
          onNavigate={handleNavigateView}
          onStartCreate={(catId) => { setWizardPreselect({ categoryId: catId }); navigate('/create'); }}
        />
      </div>
    );
  }

  // Route: Order Status (/status/:orderId or ?order=ID)
  const orderIdFromUrl = currentPath.startsWith('/status/')
    ? currentPath.replace('/status/', '')
    : searchParams.get('order');

  if (orderIdFromUrl) {
    const foundOrder = db.getOrderById(orderIdFromUrl) || activeOrder;
    if (foundOrder) {
      return (
        <div className="min-h-screen flex flex-col justify-between bg-stone-100">
          <Navbar
            settings={settings}
            currentView="order-status"
            currentUser={customerUser}
            onLogoutCustomer={() => {
              customerAuth.logout();
              setCustomerUser(null);
              navigate('/');
            }}
            onNavigate={handleNavigateView}
            onNavigateHome={() => navigate('/')}
            onStartCreate={() => {
              setWizardPreselect({});
              navigate('/create');
            }}
            onOpenAuth={(tab) => openAuth(tab)}
          />
          <OrderStatusPage
            order={foundOrder}
            settings={settings}
            onRefresh={() => {
              const fresh = db.getOrderById(foundOrder.id);
              if (fresh) setActiveOrder(fresh);
            }}
            onGoToHome={() => navigate('/')}
          />
          <Footer
            settings={settings}
            categories={categories}
            onNavigate={handleNavigateView}
            onStartCreate={(catId) => { setWizardPreselect({ categoryId: catId }); navigate('/create'); }}
          />

          <CustomerAuthModal
            isOpen={authModal.isOpen}
            initialTab={authModal.tab}
            messageNotice={authModal.message}
            onClose={() => setAuthModal(prev => ({ ...prev, isOpen: false }))}
            onSuccess={(user) => {
              setCustomerUser(user);
              setAuthModal(prev => ({ ...prev, isOpen: false }));
            }}
          />
        </div>
      );
    }
  }

  // Route: Create Wizard
  if (currentPath === '/create') {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-stone-100">
        <Navbar
          settings={settings}
          currentView="create"
          currentUser={customerUser}
          onLogoutCustomer={() => {
            customerAuth.logout();
            setCustomerUser(null);
            navigate('/');
          }}
          onNavigate={handleNavigateView}
          onNavigateHome={() => navigate('/')}
          onStartCreate={() => {
            setWizardPreselect({});
            navigate('/create');
          }}
          onOpenAuth={(tab) => openAuth(tab)}
        />
        <CreateWizard
          initialCategoryId={wizardPreselect.categoryId}
          initialTemplateId={wizardPreselect.templateId}
          onOpenAuth={(tab) => openAuth(tab)}
          onComplete={(newOrder) => {
            setActiveOrder(newOrder);
            navigate('/checkout');
          }}
          onCancel={() => navigate('/')}
        />
        <Footer
          settings={settings}
          categories={categories}
          onNavigate={handleNavigateView}
          onStartCreate={(catId) => { setWizardPreselect({ categoryId: catId }); navigate('/create'); }}
        />

        <CustomerAuthModal
          isOpen={authModal.isOpen}
          initialTab={authModal.tab}
          messageNotice={authModal.message}
          onClose={() => setAuthModal(prev => ({ ...prev, isOpen: false }))}
          onSuccess={(user) => {
            setCustomerUser(user);
            setAuthModal(prev => ({ ...prev, isOpen: false }));
          }}
        />
      </div>
    );
  }

  // Route: Checkout Page
  if (currentPath === '/checkout' && activeOrder) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-stone-100">
        <Navbar
          settings={settings}
          currentView="checkout"
          currentUser={customerUser}
          onLogoutCustomer={() => {
            customerAuth.logout();
            setCustomerUser(null);
            navigate('/');
          }}
          onNavigate={handleNavigateView}
          onNavigateHome={() => navigate('/')}
          onStartCreate={() => {
            setWizardPreselect({});
            navigate('/create');
          }}
          onOpenAuth={(tab) => openAuth(tab)}
        />
        <CheckoutPage
          order={activeOrder}
          settings={settings}
          onPaymentSubmitted={(orderId) => {
            navigate(`/status/${orderId}`);
          }}
          onBack={() => navigate('/create')}
        />
        <Footer
          settings={settings}
          categories={categories}
          onNavigate={handleNavigateView}
          onStartCreate={(catId) => { setWizardPreselect({ categoryId: catId }); navigate('/create'); }}
        />

        <CustomerAuthModal
          isOpen={authModal.isOpen}
          initialTab={authModal.tab}
          messageNotice={authModal.message}
          onClose={() => setAuthModal(prev => ({ ...prev, isOpen: false }))}
          onSuccess={(user) => {
            setCustomerUser(user);
            setAuthModal(prev => ({ ...prev, isOpen: false }));
          }}
        />
      </div>
    );
  }

  // Route: Dynamic Invitation View (/:slug)
  if (!isSpecialRoute) {
    const rawSlug = currentPath.split('?')[0].replace(/^\//, '').trim();
    const guestParam = searchParams.get('to') || 
      (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('to') : null) || '';
    const orderForSlug = db.getOrderBySlug(rawSlug);

    if (orderForSlug) {
      // Check if invitation is active or if admin is inspecting
      if (orderForSlug.paymentStatus === 'PAID' || isAdminAuthenticated) {
        return <InvitationView order={orderForSlug} guestNameParam={guestParam} />;
      }

      // If pending or rejected, show informative notice
      return (
        <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold font-serif-display text-stone-900">
              Undangan Belum Aktif
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Undangan <strong>/{rawSlug}</strong> sedang menunggu verifikasi pembayaran oleh admin.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => navigate(`/status/${orderForSlug.id}`)}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-xs"
              >
                Cek Status Pesanan
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full text-xs text-stone-500 hover:text-stone-800 font-medium py-2"
              >
                Kembali ke Beranda
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 404 Not Found
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200 shadow-xl text-center space-y-4">
          <span className="text-4xl font-black text-amber-500 font-mono">404</span>
          <h1 className="text-xl font-bold font-serif-display text-stone-900">
            Undangan Tidak Ditemukan
          </h1>
          <p className="text-xs text-stone-600 leading-relaxed">
            Alamat link <strong>/{rawSlug}</strong> tidak terdaftar atau belum pernah dibuat.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => navigate('/create')}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Buat Undangan dengan Nama Ini</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full text-xs text-stone-500 hover:text-stone-800 font-medium py-2 flex items-center justify-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Kembali ke Beranda</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Route: Default Landing Page (/)
  return (
    <div className="min-h-screen flex flex-col justify-between bg-stone-50">
      <Navbar
        settings={settings}
        currentView="landing"
        currentUser={customerUser}
        onLogoutCustomer={() => {
          customerAuth.logout();
          setCustomerUser(null);
          navigate('/');
        }}
        onNavigate={handleNavigateView}
        onNavigateHome={() => navigate('/')}
        onStartCreate={() => {
          setWizardPreselect({});
          navigate('/create');
        }}
        onOpenAuth={(tab) => openAuth(tab)}
      />
      
      <LandingPage
        categories={categories}
        templates={templates}
        settings={settings}
        onStartCreate={(catId, tplId) => {
          setWizardPreselect({ categoryId: catId, templateId: tplId });
          navigate('/create');
        }}
        onViewDemo={(demoSlug) => navigate(`/${demoSlug}`)}
        onNavigate={handleNavigateView}
      />

      <Footer
        settings={settings}
        categories={categories}
        onNavigate={handleNavigateView}
        onStartCreate={(catId) => {
          setWizardPreselect({ categoryId: catId });
          navigate('/create');
        }}
      />

      <CustomerAuthModal
        isOpen={authModal.isOpen}
        initialTab={authModal.tab}
        messageNotice={authModal.message}
        onClose={() => setAuthModal(prev => ({ ...prev, isOpen: false }))}
        onSuccess={(user) => {
          setCustomerUser(user);
          setAuthModal(prev => ({ ...prev, isOpen: false }));
          navigate('/my-account');
        }}
      />
    </div>
  );
}
