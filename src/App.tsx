import React, { useState, useEffect, useMemo } from 'react';
import { db } from './services/storage';
import { authService } from './services/auth';
import { Order, SiteSettings } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './views/LandingPage';
import { CreateWizard } from './views/CreateWizard';
import { CheckoutPage } from './views/CheckoutPage';
import { OrderStatusPage } from './views/OrderStatusPage';
import { InvitationView } from './views/InvitationView';
import { AdminPanel } from './views/AdminPanel';
import { AdminLogin } from './views/AdminLogin';
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

  // Refresh data whenever route or navigation occurs
  const refreshData = () => {
    setSettings(db.getSettings());
    setCategories(db.getCategories());
    setTemplates(db.getTemplates());
    setIsAdminAuthenticated(authService.isAuthenticated());
  };

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
    } else if (view === 'admin' || view === 'admin-login') {
      setIsAdminAuthenticated(authService.isAuthenticated());
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  // Check if current route is an invitation slug (anything other than root, /admin, /create, /checkout, /status)
  const isSpecialRoute = [
    '/',
    '/create',
    '/checkout',
    '/admin',
    '/admin/login'
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
            onNavigate={handleNavigateView}
            onNavigateHome={() => navigate('/')}
            onStartCreate={() => {
              setWizardPreselect({});
              navigate('/create');
            }}
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
          onNavigate={handleNavigateView}
          onNavigateHome={() => navigate('/')}
          onStartCreate={() => {
            setWizardPreselect({});
            navigate('/create');
          }}
        />
        <CreateWizard
          initialCategoryId={wizardPreselect.categoryId}
          initialTemplateId={wizardPreselect.templateId}
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
          onNavigate={handleNavigateView}
          onNavigateHome={() => navigate('/')}
          onStartCreate={() => {
            setWizardPreselect({});
            navigate('/create');
          }}
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
      </div>
    );
  }

  // Route: Dynamic Invitation View (/:slug)
  if (!isSpecialRoute) {
    const rawSlug = currentPath.replace(/^\//, '').trim();
    const orderForSlug = db.getOrderBySlug(rawSlug);

    if (orderForSlug) {
      // Check if invitation is active or if admin is inspecting
      if (orderForSlug.paymentStatus === 'PAID' || isAdminAuthenticated) {
        return <InvitationView order={orderForSlug} />;
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
        onNavigate={handleNavigateView}
        onNavigateHome={() => navigate('/')}
        onStartCreate={() => {
          setWizardPreselect({});
          navigate('/create');
        }}
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
    </div>
  );
}
