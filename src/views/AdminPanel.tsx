import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  Tag,
  QrCode,
  Users,
  Settings,
  LogOut,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Trash2,
  Edit2,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Download,
  ExternalLink,
  MessageCircle,
  FileCheck,
  Search,
  Filter,
  Save,
  AlertTriangle,
  Upload,
  Bot,
  Send,
  Bell,
  Zap,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  Megaphone,
  Ban,
  Shield
} from 'lucide-react';
import { Order, Template, Category, SiteSettings, AdminUser } from '../types';
import { db } from '../services/storage';
import { authService } from '../services/auth';
import { generateInvitationZip } from '../services/zipGenerator';
import { telegramService } from '../services/telegramService';
import { AdminChatManager } from '../components/AdminChatManager';
import { AdminBannedUsersManager } from '../components/AdminBannedUsersManager';
import { AdminAnnouncementsManager } from '../components/AdminAnnouncementsManager';
import { AdminSecurityManager } from '../components/AdminSecurityManager';

interface AdminPanelProps {
  onLogout: () => void;
  onViewInvitation: (slug: string) => void;
  onEditOrder?: (order: Order) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onLogout,
  onViewInvitation,
  onEditOrder
}) => {
  // Tabs: 'analytics' | 'orders' | 'chats' | 'banned' | 'security' | 'announcements' | 'templates' | 'categories' | 'qris' | 'customers' | 'settings'
  const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'chats' | 'banned' | 'security' | 'announcements' | 'templates' | 'categories' | 'qris' | 'customers' | 'settings'>('orders');

  // Real data from storage
  const [orders, setOrders] = useState<Order[]>(db.getOrders());
  const [templates, setTemplates] = useState<Template[]>(db.getTemplates());
  const [categories, setCategories] = useState<Category[]>(db.getCategories());
  const [settings, setSettings] = useState<SiteSettings>(db.getSettings());

  // Chat & Ban counts
  const [unreadChatCount, setUnreadChatCount] = useState<number>(() => {
    return db.getConversations().reduce((acc, c) => acc + (c.unreadAdminCount || 0), 0);
  });
  const [totalNudgeCount, setTotalNudgeCount] = useState<number>(() => {
    return db.getConversations().reduce((acc, c) => acc + (c.nudgeCount || 0), 0);
  });
  const [bannedCount, setBannedCount] = useState<number>(() => {
    return db.getBannedUsers().length;
  });

  // Search & Filter state for Orders
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'ALL' | 'PENDING' | 'PAID' | 'REJECTED'>('ALL');

  // Selected order for detail view / approval modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Editing Template State
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);

  // Editing Category State
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(settings);
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState(false);

  // Settings sub-tab state
  const [settingsSubTab, setSettingsSubTab] = useState<'identity' | 'hero' | 'banner' | 'features' | 'faqs' | 'contact' | 'qris' | 'telegram'>('identity');

  // Telegram Bot Test State
  const [telegramTestStatus, setTelegramTestStatus] = useState<{
    loading: boolean;
    result?: { success: boolean; message: string };
  }>({ loading: false });

  // Template Modal State
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templateFormData, setTemplateFormData] = useState<Partial<Template>>({
    name: '',
    categoryId: 'cat-1',
    thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80',
    description: '',
    price: 5000,
    theme: 'minimal-modern',
    isActive: true
  });

  // Category Modal State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState<Partial<Category>>({
    name: '',
    slug: '',
    description: '',
    isActive: true,
    sortOrder: 1
  });

  // Feature CMS state (inline adding / editing)
  const [editingFeatureIndex, setEditingFeatureIndex] = useState<number | null>(null);
  const [newFeature, setNewFeature] = useState({ title: '', description: '' });

  // FAQ CMS state (inline adding / editing)
  const [editingFaqIndex, setEditingFaqIndex] = useState<number | null>(null);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });

  // Refresh data helper
  const reloadData = () => {
    setOrders(db.getOrders());
    setTemplates(db.getTemplates());
    setCategories(db.getCategories());
    setSettings(db.getSettings());
    const convos = db.getConversations();
    setUnreadChatCount(convos.reduce((acc, c) => acc + (c.unreadAdminCount || 0), 0));
    setTotalNudgeCount(convos.reduce((acc, c) => acc + (c.nudgeCount || 0), 0));
    setBannedCount(db.getBannedUsers().length);
  };

  React.useEffect(() => {
    const handleChatUpdate = () => {
      const convos = db.getConversations();
      setUnreadChatCount(convos.reduce((acc, c) => acc + (c.unreadAdminCount || 0), 0));
      setTotalNudgeCount(convos.reduce((acc, c) => acc + (c.nudgeCount || 0), 0));
    };
    const handleBanUpdate = () => {
      setBannedCount(db.getBannedUsers().length);
    };

    window.addEventListener('surat:chat-updated', handleChatUpdate);
    window.addEventListener('surat:chat-message-sent', handleChatUpdate);
    window.addEventListener('surat:banned-updated', handleBanUpdate);

    return () => {
      window.removeEventListener('surat:chat-updated', handleChatUpdate);
      window.removeEventListener('surat:chat-message-sent', handleChatUpdate);
      window.removeEventListener('surat:banned-updated', handleBanUpdate);
    };
  }, []);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSearch =
        o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.slug.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.whatsapp.includes(orderSearch);

      const matchStatus = orderStatusFilter === 'ALL' || o.paymentStatus === orderStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  // Analytics Metrics
  const analytics = useMemo(() => {
    const totalOrders = orders.length;
    const paidOrders = orders.filter(o => o.paymentStatus === 'PAID');
    const pendingOrders = orders.filter(o => o.paymentStatus === 'PENDING');
    const activeInvitations = orders.filter(o => o.invitationStatus === 'ACTIVE').length;
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.price, 0);
    const conversionRate = totalOrders > 0 ? ((paidOrders.length / totalOrders) * 100).toFixed(1) : '0';

    // Most popular template
    const templateCounts: Record<string, number> = {};
    orders.forEach(o => {
      templateCounts[o.templateId] = (templateCounts[o.templateId] || 0) + 1;
    });

    const popularTemplateId = Object.keys(templateCounts).reduce((a, b) =>
      (templateCounts[a] || 0) > (templateCounts[b] || 0) ? a : b, ''
    );
    const popularTemplate = templates.find(t => t.id === popularTemplateId)?.name || 'Default';

    return {
      totalOrders,
      paidCount: paidOrders.length,
      pendingCount: pendingOrders.length,
      activeInvitations,
      totalRevenue,
      conversionRate,
      popularTemplate
    };
  }, [orders, templates]);

  // Order Approval Handler
  const handleApproveOrder = (order: Order) => {
    const updated: Order = {
      ...order,
      paymentStatus: 'PAID',
      invitationStatus: 'ACTIVE',
      rejectionReason: undefined,
      updatedAt: new Date().toISOString()
    };
    db.saveOrder(updated);
    reloadData();
    setSelectedOrder(updated);
  };

  // Order Rejection Handler
  const handleRejectOrder = (order: Order) => {
    if (!rejectionReason.trim()) {
      alert('Mohon masukkan alasan penolakan.');
      return;
    }

    const updated: Order = {
      ...order,
      paymentStatus: 'REJECTED',
      invitationStatus: 'INACTIVE',
      rejectionReason: rejectionReason.trim(),
      updatedAt: new Date().toISOString()
    };
    db.saveOrder(updated);
    reloadData();
    setSelectedOrder(updated);
    setRejectionModalOpen(false);
    setRejectionReason('');
  };

  // WhatsApp Notification Link Generator
  const sendWhatsAppNotification = (order: Order) => {
    let cleanPhone = order.whatsapp.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);

    let message = '';
    if (order.paymentStatus === 'PAID') {
      message = `Halo ${order.customerName},\n\nPembayaran sebesar Rp5.000 untuk undangan digital Anda telah DIVERIFIKASI dan DISETUJUI oleh Admin SURAT.\n\nLink undangan online Anda:\n${window.location.origin}/${order.slug}\n\nAnda juga dapat men-download file ZIP website melalui halaman status pesanan Anda. Terima kasih telah menggunakan SURAT!`;
    } else if (order.paymentStatus === 'REJECTED') {
      message = `Halo ${order.customerName},\n\nMohon maaf, bukti pembayaran untuk pesanan ${order.id} belum dapat kami verifikasi dengan alasan:\n"${order.rejectionReason || 'Bukti transfer tidak valid/jelas'}"\n\nSilakan kunjungi link status untuk mengunggah ulang bukti pembayaran Anda.`;
    } else {
      message = `Halo ${order.customerName},\n\nPesanan undangan digital ${order.id} Anda saat ini sedang dalam antrean verifikasi admin.`;
    }

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    db.saveSettings(settingsForm);
    setSettings(settingsForm);
    setSettingsSaveSuccess(true);
    setTimeout(() => setSettingsSaveSuccess(false), 2500);
  };

  // Telegram Bot Test Handler
  const handleTestTelegram = async () => {
    if (!settingsForm.telegramBotToken?.trim() || !settingsForm.telegramChatId?.trim()) {
      setTelegramTestStatus({
        loading: false,
        result: {
          success: false,
          message: 'Silakan isi Bot Token dan Chat ID / Channel ID terlebih dahulu sebelum melakukan uji coba kirim.'
        }
      });
      return;
    }

    setTelegramTestStatus({ loading: true, result: undefined });
    try {
      const res = await telegramService.sendTestMessage(
        settingsForm.telegramBotToken.trim(),
        settingsForm.telegramChatId.trim()
      );
      setTelegramTestStatus({
        loading: false,
        result: {
          success: res.success,
          message: res.message
        }
      });
    } catch (err: any) {
      setTelegramTestStatus({
        loading: false,
        result: {
          success: false,
          message: 'Gagal mengirim: ' + (err.message || String(err))
        }
      });
    }
  };

  // QRIS File Upload handler
  const handleQrisUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSettingsForm(prev => ({
        ...prev,
        qrisImageUrl: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  // Template CRUD Handlers
  const handleOpenAddTemplate = () => {
    setTemplateFormData({
      id: `tpl-${Date.now()}`,
      name: '',
      categoryId: categories[0]?.id || 'cat-1',
      thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80',
      description: '',
      price: settingsForm.basePrice || 5000,
      theme: 'minimal-modern',
      fields: { brideGroom: true, akadResepsi: true, rsvp: true },
      createdAt: new Date().toISOString(),
      isActive: true
    });
    setTemplateModalOpen(true);
  };

  const handleOpenEditTemplate = (tpl: Template) => {
    setTemplateFormData({ ...tpl });
    setTemplateModalOpen(true);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateFormData.name || !templateFormData.categoryId) {
      alert('Nama template dan kategori wajib diisi!');
      return;
    }
    const tplToSave: Template = {
      id: templateFormData.id || `tpl-${Date.now()}`,
      name: templateFormData.name,
      categoryId: templateFormData.categoryId,
      thumbnail: templateFormData.thumbnail || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80',
      description: templateFormData.description || '',
      price: Number(templateFormData.price) || 5000,
      theme: templateFormData.theme || 'minimal-modern',
      fields: templateFormData.fields || { brideGroom: true, akadResepsi: true, rsvp: true },
      createdAt: templateFormData.createdAt || new Date().toISOString(),
      isActive: templateFormData.isActive ?? true
    };
    db.saveTemplate(tplToSave);
    reloadData();
    setTemplateModalOpen(false);
  };

  // Category CRUD Handlers
  const handleOpenAddCategory = () => {
    setCategoryFormData({
      id: `cat-${Date.now()}`,
      name: '',
      slug: '',
      description: '',
      iconName: 'Sparkles',
      isActive: true,
      sortOrder: categories.length + 1
    });
    setCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setCategoryFormData({ ...cat });
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.name) {
      alert('Nama kategori wajib diisi!');
      return;
    }
    const slug = (categoryFormData.slug || categoryFormData.name).toLowerCase().replace(/\s+/g, '-');
    const catToSave: Category = {
      id: categoryFormData.id || `cat-${Date.now()}`,
      name: categoryFormData.name,
      slug,
      iconName: categoryFormData.iconName || 'Sparkles',
      description: categoryFormData.description || `Undangan digital untuk acara ${categoryFormData.name}.`,
      isActive: categoryFormData.isActive ?? true,
      sortOrder: Number(categoryFormData.sortOrder) || (categories.length + 1)
    };
    db.saveCategory(catToSave);
    reloadData();
    setCategoryModalOpen(false);
  };

  // Feature CMS handlers
  const handleAddFeature = () => {
    if (!newFeature.title.trim()) return;
    const currentList = settingsForm.featuresList || [];
    setSettingsForm({
      ...settingsForm,
      featuresList: [...currentList, { id: `feat-${Date.now()}`, title: newFeature.title.trim(), description: newFeature.description.trim() }]
    });
    setNewFeature({ title: '', description: '' });
  };

  const handleRemoveFeature = (index: number) => {
    const currentList = [...(settingsForm.featuresList || [])];
    currentList.splice(index, 1);
    setSettingsForm({ ...settingsForm, featuresList: currentList });
  };

  // FAQ CMS handlers
  const handleAddFaq = () => {
    if (!newFaq.question.trim()) return;
    const currentFaqs = settingsForm.faqItems || [];
    setSettingsForm({
      ...settingsForm,
      faqItems: [...currentFaqs, { id: `faq-${Date.now()}`, question: newFaq.question.trim(), answer: newFaq.answer.trim() }]
    });
    setNewFaq({ question: '', answer: '' });
  };

  const handleRemoveFaq = (index: number) => {
    const currentFaqs = [...(settingsForm.faqItems || [])];
    currentFaqs.splice(index, 1);
    setSettingsForm({ ...settingsForm, faqItems: currentFaqs });
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-stone-900 text-stone-300 flex flex-col justify-between shrink-0 border-r border-stone-800">
        <div>
          {/* Logo & Header */}
          <div className="p-6 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 font-bold flex items-center justify-center font-serif-display text-lg">
                S
              </span>
              <div>
                <span className="font-bold text-white text-base tracking-wider block">SURAT ADMIN</span>
                <span className="text-[10px] text-amber-400 font-mono">PANEL v1.0</span>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => { setActiveTab('orders'); setSelectedOrder(null); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'orders' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4" />
                <span>Manajemen Order</span>
              </div>
              {analytics.pendingCount > 0 && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === 'orders' ? 'bg-stone-950 text-amber-400' : 'bg-amber-500 text-stone-950'
                }`}>
                  {analytics.pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('chats'); setSelectedOrder(null); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'chats' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4" />
                <span>Live Chat Pelanggan</span>
              </div>
              <div className="flex items-center gap-1">
                {totalNudgeCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-400 text-stone-950 flex items-center gap-0.5" title="Ada permintaan percepat respon">
                    <Zap className="w-3 h-3" />
                    <span>{totalNudgeCount}</span>
                  </span>
                )}
                {unreadChatCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                    {unreadChatCount}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => { setActiveTab('announcements'); setSelectedOrder(null); }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'announcements' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>Broadcast Pengumuman</span>
            </button>

            <button
              onClick={() => { setActiveTab('banned'); setSelectedOrder(null); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'banned' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4" />
                <span>Pengguna Diblokir</span>
              </div>
              {bannedCount > 0 && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === 'banned' ? 'bg-stone-950 text-rose-400' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {bannedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('security'); setSelectedOrder(null); }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'security' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Keamanan & Audit Siber</span>
            </button>

            <button
              onClick={() => { setActiveTab('analytics'); setSelectedOrder(null); }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'analytics' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Analytics</span>
            </button>

            <button
              onClick={() => { setActiveTab('templates'); setSelectedOrder(null); }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'templates' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Manajemen Template</span>
            </button>

            <button
              onClick={() => { setActiveTab('categories'); setSelectedOrder(null); }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'categories' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Manajemen Kategori</span>
            </button>

            <button
              onClick={() => { setActiveTab('qris'); setSelectedOrder(null); }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'qris' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Pengaturan QRIS</span>
            </button>

            <button
              onClick={() => { setActiveTab('customers'); setSelectedOrder(null); }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'customers' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Data Pelanggan</span>
            </button>

            <button
              onClick={() => { setActiveTab('settings'); setSelectedOrder(null); }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'settings' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Pengaturan Website</span>
            </button>
          </nav>
        </div>

        {/* Footer Admin Bar */}
        <div className="p-4 border-t border-stone-800 space-y-3">
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Admin Terautentikasi</span>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-stone-800 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sesi Admin</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        
        {/* TAB: MANAJEMEN ORDER */}
        {activeTab === 'orders' && !selectedOrder && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-stone-900">Manajemen Pesanan</h1>
                <p className="text-xs text-stone-500 mt-0.5">
                  Verifikasi bukti pembayaran transfer QRIS Rp5.000 dan aktifkan tautan undangan.
                </p>
              </div>

              {/* Status Badges Filter */}
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-stone-200 shadow-2xs">
                {(['ALL', 'PENDING', 'PAID', 'REJECTED'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setOrderStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      orderStatusFilter === status ? 'bg-stone-900 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {status === 'ALL' && `Semua (${orders.length})`}
                    {status === 'PENDING' && `Pending (${analytics.pendingCount})`}
                    {status === 'PAID' && `Paid (${analytics.paidCount})`}
                    {status === 'REJECTED' && 'Rejected'}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari ID order, nama pelanggan, whatsapp, atau slug..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-amber-500 shadow-2xs"
              />
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                    <tr>
                      <th className="p-4">Order ID & Tanggal</th>
                      <th className="p-4">Pelanggan & WhatsApp</th>
                      <th className="p-4">Slug Undangan</th>
                      <th className="p-4">Bukti Bayar</th>
                      <th className="p-4">Status Pembayaran</th>
                      <th className="p-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-stone-400">
                          Tidak ada pesanan ditemukan sesuai kriteria filter.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map(order => (
                        <tr key={order.id} className="hover:bg-stone-50/60 transition-colors">
                          <td className="p-4">
                            <span className="font-mono font-bold text-stone-900 block">{order.id}</span>
                            <span className="text-[11px] text-stone-400">
                              {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-stone-900 block">{order.customerName}</span>
                            <span className="text-[11px] text-stone-500">{order.whatsapp}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-mono text-amber-800 font-semibold block">/{order.slug}</span>
                            <span className="text-[11px] text-stone-400">{order.invitationData.title}</span>
                          </td>
                          <td className="p-4">
                            {order.paymentProofUrl ? (
                              <a
                                href={order.paymentProofUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-900 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200"
                              >
                                <FileCheck className="w-3.5 h-3.5" />
                                <span>Lihat Struk</span>
                              </a>
                            ) : (
                              <span className="text-[11px] text-stone-400 italic">Belum upload</span>
                            )}
                          </td>
                          <td className="p-4">
                            {order.paymentStatus === 'PAID' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>PAID / AKTIF</span>
                              </span>
                            )}
                            {order.paymentStatus === 'PENDING' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                <Clock className="w-3 h-3" />
                                <span>PENDING</span>
                              </span>
                            )}
                            {order.paymentStatus === 'REJECTED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                <XCircle className="w-3 h-3" />
                                <span>REJECTED</span>
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 shadow-2xs"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Kelola</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ORDER DETAIL & APPROVAL / REJECTION MODAL VIEW */}
        {activeTab === 'orders' && selectedOrder && (
          <div className="space-y-6 max-w-3xl">
            <button
              onClick={() => setSelectedOrder(null)}
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-stone-200"
            >
              ← Kembali ke Daftar Pesanan
            </button>

            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 font-mono">
                    {selectedOrder.id}
                  </span>
                  <h2 className="text-xl font-bold text-stone-900 mt-1">
                    Detail Pesanan & Verifikasi Pembayaran
                  </h2>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {onEditOrder && (
                    <button
                      onClick={() => onEditOrder(selectedOrder)}
                      className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                      title="Edit seluruh data undangan sama persis seperti wizard pembuatan"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Data Undangan</span>
                    </button>
                  )}

                  <button
                    onClick={() => sendWhatsAppNotification(selectedOrder)}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Kirim WA</span>
                  </button>

                  <button
                    onClick={() => onViewInvitation(selectedOrder.slug)}
                    className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Lihat Web</span>
                  </button>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-stone-500 block">Status Pembayaran Saat Ini:</span>
                  <span className="text-sm font-bold text-stone-900">
                    {selectedOrder.paymentStatus} (Undangan: {selectedOrder.invitationStatus})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApproveOrder(selectedOrder)}
                    disabled={selectedOrder.paymentStatus === 'PAID'}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                    id="btn-admin-approve"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>SETUJUI (APPROVE)</span>
                  </button>

                  <button
                    onClick={() => setRejectionModalOpen(true)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                    id="btn-admin-reject"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>TOLAK (REJECT)</span>
                  </button>
                </div>
              </div>

              {/* Bukti Pembayaran Frame */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Bukti Pembayaran Pelanggan (Struk Transfer):
                </h3>
                {selectedOrder.paymentProofUrl ? (
                  <div className="bg-stone-100 p-4 rounded-xl border border-stone-200 text-center">
                    <img
                      src={selectedOrder.paymentProofUrl}
                      alt="Struk Transfer"
                      className="max-h-96 mx-auto rounded-lg shadow-sm object-contain"
                    />
                    <a
                      href={selectedOrder.paymentProofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-xs text-amber-700 font-semibold hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka Ukuran Asli</span>
                    </a>
                  </div>
                ) : (
                  <div className="p-6 bg-stone-50 rounded-xl border border-stone-200 text-center text-xs text-stone-400 italic">
                    Pelanggan belum mengunggah gambar bukti transfer.
                  </div>
                )}
              </div>

              {/* Rincian Pesanan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-stone-400 block">Nama Pelanggan</span>
                  <span className="font-semibold text-stone-900">{selectedOrder.customerName}</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-stone-400 block">Nomor WhatsApp</span>
                  <span className="font-semibold text-stone-900">{selectedOrder.whatsapp}</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-stone-400 block">Email</span>
                  <span className="font-semibold text-stone-900">{selectedOrder.email}</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-stone-400 block">Slug / URL</span>
                  <span className="font-mono text-amber-700 font-bold">/{selectedOrder.slug}</span>
                </div>
              </div>

              {/* Download ZIP button */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                <span className="text-xs text-stone-500">
                  Download Standalone ZIP Website untuk order ini:
                </span>
                <button
                  onClick={() => generateInvitationZip(selectedOrder)}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Download Standalone ZIP</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB: DASHBOARD ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900">Dashboard Analytics</h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Statistik pertumbuhan, omset penjualan Rp5.000, dan performa template.
              </p>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
                <span className="text-xs text-stone-500 font-medium">Total Omset</span>
                <div className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">
                  Rp{analytics.totalRevenue.toLocaleString('id-ID')}
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{analytics.paidCount} order terverifikasi</span>
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
                <span className="text-xs text-stone-500 font-medium">Total Pesanan Masuk</span>
                <div className="text-2xl sm:text-3xl font-black text-stone-900 font-mono">
                  {analytics.totalOrders}
                </div>
                <span className="text-[11px] text-stone-500">
                  {analytics.pendingCount} order menunggu verifikasi
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
                <span className="text-xs text-stone-500 font-medium">Undangan Aktif Online</span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
                  {analytics.activeInvitations}
                </div>
                <span className="text-[11px] text-stone-500">Tautan dapat diakses publik</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
                <span className="text-xs text-stone-500 font-medium">Rasio Konversi Bayar</span>
                <div className="text-2xl sm:text-3xl font-black text-stone-900 font-mono">
                  {analytics.conversionRate}%
                </div>
                <span className="text-[11px] text-stone-500">
                  Template terpopuler: <strong>{analytics.popularTemplate}</strong>
                </span>
              </div>
            </div>

            {/* Quick Chart Simulation Card */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-stone-900">Performa Penjualan Harian (Simulasi)</h3>
              <div className="h-44 flex items-end gap-2 pt-6 border-b border-stone-200">
                {[4, 7, 3, 9, 12, 16, 20, 15, 18, 24, 28, 35].map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                    <div
                      style={{ height: `${(val / 35) * 100}%` }}
                      className="w-full bg-amber-500 group-hover:bg-amber-400 rounded-t transition-all"
                    />
                    <span className="text-[10px] text-stone-400 font-mono">H-{12 - idx}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-stone-500">
                Peningkatan konversi stabil sejak integrasi pembayaran QRIS satu harga Rp5.000.
              </p>
            </div>
          </div>
        )}

        {/* TAB: MANAJEMEN TEMPLATE */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-stone-900">Manajemen Template Desain</h1>
                <p className="text-xs text-stone-500 mt-0.5">
                  Kelola katalog desain undangan, thumbnail visual, tema, dan status aktif.
                </p>
              </div>

              <button
                onClick={handleOpenAddTemplate}
                className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer w-fit"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Template Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {templates.map(tpl => (
                <div key={tpl.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs flex flex-col justify-between">
                  <div className="aspect-[16/10] bg-stone-100 relative">
                    <img src={tpl.thumbnail} alt={tpl.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 flex gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        tpl.isActive ? 'bg-emerald-600 text-white' : 'bg-stone-600 text-white'
                      }`}>
                        {tpl.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-stone-950/80 backdrop-blur-xs text-amber-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                      Rp{(tpl.price || settingsForm.basePrice || 5000).toLocaleString('id-ID')}
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-stone-900">{tpl.name}</h3>
                        <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                          {tpl.theme}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 line-clamp-2 mt-1">{tpl.description}</p>
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                      <button
                        onClick={() => handleOpenEditTemplate(tpl)}
                        className="text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => {
                          const updated = { ...tpl, isActive: !tpl.isActive };
                          db.saveTemplate(updated);
                          reloadData();
                        }}
                        className="text-stone-600 hover:text-stone-900 font-medium cursor-pointer"
                      >
                        {tpl.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Hapus template "${tpl.name}"? Tindakan ini tidak dapat dibatalkan.`)) {
                            db.deleteTemplate(tpl.id);
                            reloadData();
                          }
                        }}
                        className="text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: MANAJEMEN KATEGORI */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-stone-900">Manajemen Kategori Acara</h1>
                <p className="text-xs text-stone-500 mt-0.5">
                  Daftar kategori acara untuk sistem formulir dan template undangan.
                </p>
              </div>

              <button
                onClick={handleOpenAddCategory}
                className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer w-fit"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Kategori Baru</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                  <tr>
                    <th className="p-4">Urutan</th>
                    <th className="p-4">Nama Kategori</th>
                    <th className="p-4">Slug</th>
                    <th className="p-4">Deskripsi</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {categories.map((cat, idx) => (
                    <tr key={cat.id} className="hover:bg-stone-50/60">
                      <td className="p-4 font-mono text-stone-500">#{cat.sortOrder || (idx + 1)}</td>
                      <td className="p-4 font-bold text-stone-900">{cat.name}</td>
                      <td className="p-4 font-mono text-amber-700">{cat.slug}</td>
                      <td className="p-4 text-stone-500">{cat.description}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          cat.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                        }`}>
                          {cat.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-3">
                        <button
                          onClick={() => handleOpenEditCategory(cat)}
                          className="text-amber-700 hover:text-amber-800 font-semibold cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus kategori "${cat.name}"?`)) {
                              db.deleteCategory(cat.id);
                              reloadData();
                            }
                          }}
                          className="text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: PENGATURAN QRIS & MERCHANT */}
        {activeTab === 'qris' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900">Pengaturan QRIS & Rekening Pembayaran</h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Barcode QRIS resmi dan informasi merchant penerima pembayaran Rp{(settingsForm.basePrice || 5000).toLocaleString('id-ID')}.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-5 shadow-2xs">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nama Merchant QRIS *
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.merchantName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, merchantName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Penyedia Bank / E-Wallet *
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.merchantBank}
                    onChange={(e) => setSettingsForm({ ...settingsForm, merchantBank: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nomor Rekening / No. HP Merchant
                  </label>
                  <input
                    type="text"
                    value={settingsForm.merchantAccount || ''}
                    placeholder="Contoh: 081234567890"
                    onChange={(e) => setSettingsForm({ ...settingsForm, merchantAccount: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Foto / Gambar Barcode QRIS
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-32 h-32 bg-stone-100 rounded-xl border border-stone-200 overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src={settingsForm.qrisImageUrl}
                      alt="QRIS Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Gambar QRIS Baru</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleQrisUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-stone-400">
                      Gunakan gambar QRIS beresolusi tinggi agar mudah di-scan semua aplikasi (BCA, Mandiri, DANA, GoPay).
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Instruksi / Catatan Transfer Pelanggan
                </label>
                <textarea
                  rows={2}
                  value={settingsForm.transferInstructions || ''}
                  placeholder="Contoh: Cantumkan ID Pesanan di berita transfer."
                  onChange={(e) => setSettingsForm({ ...settingsForm, transferInstructions: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div className="pt-4 border-t border-stone-200">
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Pengaturan QRIS</span>
                </button>
                {settingsSaveSuccess && (
                  <p className="text-xs text-emerald-600 font-semibold mt-2">
                    Pengaturan QRIS berhasil diperbarui!
                  </p>
                )}
              </div>
            </form>
          </div>
        )}

        {/* TAB: DATA PELANGGAN */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900">Data Pelanggan</h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Riwayat kontak pelanggan yang pernah membuat undangan digital.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                  <tr>
                    <th className="p-4">Nama Pelanggan</th>
                    <th className="p-4">WhatsApp</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Total Order</th>
                    <th className="p-4">Status Terakhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-stone-50/60">
                      <td className="p-4 font-semibold text-stone-900">{order.customerName}</td>
                      <td className="p-4 font-mono text-stone-600">{order.whatsapp}</td>
                      <td className="p-4 text-stone-600">{order.email}</td>
                      <td className="p-4 font-mono font-bold">1 Pesanan</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: PENGATURAN WEBSITE & MASTER CMS */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900">Pengaturan Lengkap Website (CMS)</h1>
              <p className="text-xs text-stone-500 mt-0.5">
                Kelola seluruh konten, judul, harga, tampilan hero, fitur, FAQ, banner pengumuman, dan kontak.
              </p>
            </div>

            {/* Sub-tabs CMS Navigation */}
            <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3">
              {[
                { id: 'identity', label: '1. Identitas & Harga' },
                { id: 'hero', label: '2. Tampilan Hero' },
                { id: 'banner', label: '3. Banner Promo' },
                { id: 'features', label: '4. Kelola Fitur' },
                { id: 'faqs', label: '5. Kelola FAQ' },
                { id: 'contact', label: '6. Kontak & CS' },
                { id: 'qris', label: '7. QRIS Pembayaran' },
                { id: 'telegram', label: '8. Bot Telegram (Laporan Otomatis)' }
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSettingsSubTab(sub.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    settingsSubTab === sub.id
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-2xs">
              
              {/* SUBTAB: IDENTITAS & HARGA */}
              {settingsSubTab === 'identity' && (
                <div className="space-y-5">
                  <div className="border-b border-stone-100 pb-3">
                    <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Identitas Platform & Harga Dasar</h2>
                    <p className="text-xs text-stone-500">Ubah nama platform, logo, dan harga resmi yang berlaku di seluruh sistem.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Nama Platform Website *
                      </label>
                      <input
                        type="text"
                        required
                        value={settingsForm.siteName}
                        onChange={(e) => setSettingsForm({ ...settingsForm, siteName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Teks Logo Brand
                      </label>
                      <input
                        type="text"
                        value={settingsForm.logoText || ''}
                        placeholder="SURAT"
                        onChange={(e) => setSettingsForm({ ...settingsForm, logoText: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Deskripsi Platform (Meta Tag / SEO)
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.siteDescription}
                      onChange={(e) => setSettingsForm({ ...settingsForm, siteDescription: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                    <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Harga Resmi Pembuatan Undangan (Rupiah) *
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-stone-700">Rp</span>
                      <input
                        type="number"
                        min="1000"
                        step="1000"
                        required
                        value={settingsForm.basePrice || 5000}
                        onChange={(e) => setSettingsForm({ ...settingsForm, basePrice: Number(e.target.value) })}
                        className="w-48 px-3.5 py-2 bg-white border border-amber-300 rounded-xl text-sm font-bold font-mono text-amber-800"
                      />
                      <span className="text-xs text-stone-500">Satu kali bayar per pesanan</span>
                    </div>
                    <p className="text-[11px] text-amber-700">
                      Mengubah angka ini akan langsung memperbarui harga di halaman Beranda, Paket Harga, dan Formulir Pembayaran QRIS.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Teks Hak Cipta Footer
                    </label>
                    <input
                      type="text"
                      value={settingsForm.footerText || ''}
                      placeholder="© 2025 SURAT. Hak cipta dilindungi."
                      onChange={(e) => setSettingsForm({ ...settingsForm, footerText: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                </div>
              )}

              {/* SUBTAB: HERO SECTION */}
              {settingsSubTab === 'hero' && (
                <div className="space-y-5">
                  <div className="border-b border-stone-100 pb-3">
                    <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Tampilan Bagian Hero (Layar Utama)</h2>
                    <p className="text-xs text-stone-500">Kustomisasi judul besar, sub-judul, dan teks tombol aksi di beranda.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Teks Badge Atas Hero
                    </label>
                    <input
                      type="text"
                      value={settingsForm.heroBadgeText || ''}
                      placeholder="Platform Undangan Digital No. 1 • Biaya Tetap Rp5.000"
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroBadgeText: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Judul Besar Hero (Headline)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.heroHeadline || ''}
                      placeholder="Satu Undangan. Banyak Kemungkinan."
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroHeadline: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Sub-Judul Hero (Subheadline)
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.heroSubheadline || ''}
                      placeholder="Buat undangan digital profesional, bagikan dengan mudah, dan miliki file website-nya sendiri."
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroSubheadline: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Teks Tombol Aksi Utama (CTA)
                      </label>
                      <input
                        type="text"
                        value={settingsForm.heroCtaText || ''}
                        placeholder="BUAT UNDANGAN"
                        onChange={(e) => setSettingsForm({ ...settingsForm, heroCtaText: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Teks Tombol Demo Sekunder
                      </label>
                      <input
                        type="text"
                        value={settingsForm.heroSecondaryCtaText || ''}
                        placeholder="LIHAT DEMO"
                        onChange={(e) => setSettingsForm({ ...settingsForm, heroSecondaryCtaText: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB: BANNER PENGUMUMAN */}
              {settingsSubTab === 'banner' && (
                <div className="space-y-5">
                  <div className="border-b border-stone-100 pb-3">
                    <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Banner Pengumuman & Promo (Top Bar)</h2>
                    <p className="text-xs text-stone-500">Tampilkan pita pengumuman di bagian paling atas situs.</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="bannerEnabled"
                      checked={settingsForm.bannerEnabled ?? false}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bannerEnabled: e.target.checked })}
                      className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                    />
                    <label htmlFor="bannerEnabled" className="text-xs font-bold text-stone-800 cursor-pointer">
                      Aktifkan Top Announcement Bar
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Pesan Pengumuman
                    </label>
                    <input
                      type="text"
                      value={settingsForm.bannerText || ''}
                      placeholder="🎉 Promo Spesial: Buat undangan digital eksklusif hanya Rp5.000!"
                      onChange={(e) => setSettingsForm({ ...settingsForm, bannerText: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Tautan / Link Tombol (Opsional)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.bannerLink || ''}
                      placeholder="#harga atau https://wa.me/..."
                      onChange={(e) => setSettingsForm({ ...settingsForm, bannerLink: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Warna Background Banner
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settingsForm.bannerBgColor || '#b45309'}
                          onChange={(e) => setSettingsForm({ ...settingsForm, bannerBgColor: e.target.value })}
                          className="w-10 h-10 rounded border border-stone-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settingsForm.bannerBgColor || '#b45309'}
                          onChange={(e) => setSettingsForm({ ...settingsForm, bannerBgColor: e.target.value })}
                          className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Warna Teks Banner
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settingsForm.bannerTextColor || '#ffffff'}
                          onChange={(e) => setSettingsForm({ ...settingsForm, bannerTextColor: e.target.value })}
                          className="w-10 h-10 rounded border border-stone-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settingsForm.bannerTextColor || '#ffffff'}
                          onChange={(e) => setSettingsForm({ ...settingsForm, bannerTextColor: e.target.value })}
                          className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB: KELOLA FITUR HOMEPAGE */}
              {settingsSubTab === 'features' && (
                <div className="space-y-5">
                  <div className="border-b border-stone-100 pb-3">
                    <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Daftar Fitur Unggulan di Beranda</h2>
                    <p className="text-xs text-stone-500">Ubah, tambah, atau hapus kartu fitur yang ditampilkan di beranda.</p>
                  </div>

                  <div className="space-y-3">
                    {(settingsForm.featuresList || []).map((feat, idx) => (
                      <div key={idx} className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <span className="text-xs font-bold text-stone-900 block">{feat.title}</span>
                          <span className="text-xs text-stone-600 block">{feat.description}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(idx)}
                          className="text-rose-600 hover:text-rose-700 text-xs font-semibold cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                    <span className="text-xs font-bold text-stone-800 block">Tambah Fitur Baru</span>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Judul Fitur (contoh: Buku Tamu Digital)"
                        value={newFeature.title}
                        onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })}
                        className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Deskripsi Fitur"
                        value={newFeature.description}
                        onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                        className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      + Tambah ke Daftar Fitur
                    </button>
                  </div>
                </div>
              )}

              {/* SUBTAB: KELOLA FAQ HOMEPAGE */}
              {settingsSubTab === 'faqs' && (
                <div className="space-y-5">
                  <div className="border-b border-stone-100 pb-3">
                    <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Daftar Pertanyaan Tanya-Jawab (FAQ)</h2>
                    <p className="text-xs text-stone-500">Atur pertanyaan yang sering diajukan pelanggan di bagian bawah beranda.</p>
                  </div>

                  <div className="space-y-3">
                    {(settingsForm.faqItems || []).map((faq, idx) => (
                      <div key={idx} className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <span className="text-xs font-bold text-stone-900 block">{faq.question}</span>
                          <span className="text-xs text-stone-600 block">{faq.answer}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFaq(idx)}
                          className="text-rose-600 hover:text-rose-700 text-xs font-semibold cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                    <span className="text-xs font-bold text-stone-800 block">Tambah Pertanyaan FAQ Baru</span>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Pertanyaan (contoh: Berapa lama link aktif?)"
                        value={newFaq.question}
                        onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                        className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs"
                      />
                      <textarea
                        rows={2}
                        placeholder="Jawaban lengkap..."
                        value={newFaq.answer}
                        onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                        className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddFaq}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      + Tambah ke Daftar FAQ
                    </button>
                  </div>
                </div>
              )}

              {/* SUBTAB: KONTAK & CS */}
              {settingsSubTab === 'contact' && (
                <div className="space-y-5">
                  <div className="border-b border-stone-100 pb-3">
                    <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Kontak Customer Service & Operasional</h2>
                    <p className="text-xs text-stone-500">Nomor WhatsApp dan email yang terhubung langsung ke tim admin.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Nomor WhatsApp Customer Care *
                      </label>
                      <input
                        type="text"
                        required
                        value={settingsForm.supportWhatsapp}
                        onChange={(e) => setSettingsForm({ ...settingsForm, supportWhatsapp: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Email Support Resmi *
                      </label>
                      <input
                        type="email"
                        required
                        value={settingsForm.supportEmail}
                        onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Jam Operasional Layanan
                    </label>
                    <input
                      type="text"
                      value={settingsForm.operationalHours || ''}
                      placeholder="Setiap Hari 08.00 - 22.00 WIB"
                      onChange={(e) => setSettingsForm({ ...settingsForm, operationalHours: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                </div>
              )}

              {/* SUBTAB: QRIS PEMBAYARAN */}
              {settingsSubTab === 'qris' && (
                <div className="space-y-5">
                  <div className="border-b border-stone-100 pb-3">
                    <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Pengaturan Rekening & QRIS</h2>
                    <p className="text-xs text-stone-500">Pengaturan merchant pembayaran dan upload barcode QRIS.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Nama Merchant QRIS *
                      </label>
                      <input
                        type="text"
                        required
                        value={settingsForm.merchantName}
                        onChange={(e) => setSettingsForm({ ...settingsForm, merchantName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Penyedia Bank / E-Wallet *
                      </label>
                      <input
                        type="text"
                        required
                        value={settingsForm.merchantBank}
                        onChange={(e) => setSettingsForm({ ...settingsForm, merchantBank: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Foto / Gambar Barcode QRIS
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 bg-stone-100 rounded-xl border border-stone-200 overflow-hidden flex items-center justify-center shrink-0">
                        <img
                          src={settingsForm.qrisImageUrl}
                          alt="QRIS Preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload QRIS Baru</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleQrisUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB: BOT TELEGRAM (LAPORAN & NUDGE) */}
              {settingsSubTab === 'telegram' && (
                <div className="space-y-6">
                  <div className="border-b border-stone-100 pb-3 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-sky-100 text-sky-700 rounded-lg">
                          <Bot className="w-5 h-5" />
                        </div>
                        <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                          Integrasi Bot Telegram Owner
                        </h2>
                      </div>
                      <p className="text-xs text-stone-500 mt-1">
                        Bot Telegram akan otomatis mengirim laporan instan saat ada pesanan/bukti transfer masuk, dan menerima notifikasi saat pembeli menekan tombol percepat pesanan.
                      </p>
                    </div>
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                      settingsForm.telegramEnabled && settingsForm.telegramBotToken && settingsForm.telegramChatId
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-100 text-stone-600'
                    }`}>
                      {settingsForm.telegramEnabled && settingsForm.telegramBotToken && settingsForm.telegramChatId ? '● Aktif' : '○ Belum Aktif'}
                    </span>
                  </div>

                  {/* Enable Switch */}
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-stone-900 block">
                        Aktifkan Notifikasi Telegram
                      </span>
                      <span className="text-[11px] text-stone-500 block">
                        Matikan jika tidak ingin bot mengirim pesan ke akun/grup Telegram Anda.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.telegramEnabled ?? false}
                        onChange={(e) => setSettingsForm({ ...settingsForm, telegramEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>

                  {/* Credentials Input */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Telegram Bot Token *
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: 7123456789:AAHq..."
                        value={settingsForm.telegramBotToken || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, telegramBotToken: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono"
                      />
                      <span className="text-[10px] text-stone-500 mt-1 block">
                        Dapatkan dari akun resmi <strong>@BotFather</strong> di Telegram.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Telegram Chat ID / Channel ID *
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: 123456789 atau -100123456789"
                        value={settingsForm.telegramChatId || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, telegramChatId: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono"
                      />
                      <span className="text-[10px] text-stone-500 mt-1 block">
                        ID akun Telegram Anda (cek via <strong>@userinfobot</strong> atau <strong>@getmyid_bot</strong>).
                      </span>
                    </div>
                  </div>

                  {/* Notification Triggers */}
                  <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/70 space-y-3">
                    <span className="text-xs font-bold text-amber-950 uppercase tracking-wider block">
                      Pengaturan Pemicu Notifikasi (Trigger)
                    </span>

                    <div className="space-y-2.5">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsForm.telegramNotifyOnOrder ?? true}
                          onChange={(e) => setSettingsForm({ ...settingsForm, telegramNotifyOnOrder: e.target.checked })}
                          className="w-4 h-4 rounded-md border-amber-300 text-amber-600 focus:ring-amber-500"
                        />
                        <div>
                          <span className="text-xs font-bold text-stone-800 block">
                            Laporan Otomatis Pesanan Baru & Bukti Transfer
                          </span>
                          <span className="text-[11px] text-stone-600 block">
                            Kirim ringkasan saat pelanggan mengisi formulir checkout dan mengirim bukti transfer.
                          </span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsForm.telegramNotifyOnReminder ?? true}
                          onChange={(e) => setSettingsForm({ ...settingsForm, telegramNotifyOnReminder: e.target.checked })}
                          className="w-4 h-4 rounded-md border-amber-300 text-amber-600 focus:ring-amber-500"
                        />
                        <div>
                          <span className="text-xs font-bold text-stone-800 block">
                            Notifikasi "Percepat Pesanan" dari Pembeli (Nudge/Reminder)
                          </span>
                          <span className="text-[11px] text-stone-600 block">
                            Kirim peringatan instan ke Telegram saat pembeli mengklik tombol ingatkan owner di halaman status.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Test Connection Button & Result */}
                  <div className="p-4 bg-stone-900 text-white rounded-2xl space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <span className="text-xs font-bold block text-white">
                          Uji Coba Kirim Pesan (Live Test)
                        </span>
                        <span className="text-[11px] text-stone-400 block">
                          Kirim pesan pengujian ke Telegram Anda untuk memastikan Bot Token dan Chat ID bekerja.
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleTestTelegram}
                        disabled={telegramTestStatus.loading}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{telegramTestStatus.loading ? 'Mengirim...' : 'Uji Coba Sekarang'}</span>
                      </button>
                    </div>

                    {telegramTestStatus.result && (
                      <div className={`p-3 rounded-xl text-xs font-medium border ${
                        telegramTestStatus.result.success
                          ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                          : 'bg-rose-950/80 border-rose-700 text-rose-300'
                      }`}>
                        {telegramTestStatus.result.success ? '✓ Berhasil: ' : '✕ Gagal: '}
                        {telegramTestStatus.result.message}
                      </div>
                    )}
                  </div>

                  {/* Step-by-step Setup Guide */}
                  <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-3">
                    <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                      📖 Panduan 3 Menit Menghubungkan Bot Telegram:
                    </span>
                    <ol className="list-decimal list-inside text-xs text-stone-600 space-y-2 leading-relaxed">
                      <li>
                        Buka aplikasi <strong>Telegram</strong> dan cari akun <strong>@BotFather</strong>.
                      </li>
                      <li>
                        Ketik <code>/newbot</code>, ikuti petunjuknya, lalu salin kode <strong>API Token</strong> (misal: <code>7123456789:AAH...</code>) dan tempel ke kolom <strong>Telegram Bot Token</strong> di atas.
                      </li>
                      <li>
                        Buka bot yang baru dibuat di Telegram dan klik tombol <strong>START</strong> agar bot memiliki izin mengirim pesan ke Anda.
                      </li>
                      <li>
                        Cari bot <strong>@userinfobot</strong> atau <strong>@getmyid_bot</strong> di Telegram untuk melihat <strong>Id</strong> akun Anda (contoh: <code>123456789</code>), lalu tempel ke kolom <strong>Chat ID</strong>.
                      </li>
                      <li>
                        Klik tombol <strong>Uji Coba Sekarang</strong> di atas, lalu klik <strong>Simpan Semua Pengaturan Website</strong> di bawah.
                      </li>
                    </ol>
                  </div>
                </div>
              )}

              {/* SAVE BUTTON FOR ALL CMS SETTINGS */}
              <div className="pt-6 border-t border-stone-200 flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-8 py-3 rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Semua Pengaturan Website</span>
                </button>
                {settingsSaveSuccess && (
                  <p className="text-xs text-emerald-600 font-bold">
                    ✓ Pengaturan berhasil disimpan secara permanen!
                  </p>
                )}
              </div>
            </form>
          </div>
        )}

        {/* TAB: LIVE CHAT PELANGGAN */}
        {activeTab === 'chats' && (
          <AdminChatManager
            onViewOrder={(orderId) => {
              const target = orders.find(o => o.id === orderId);
              if (target) {
                setSelectedOrder(target);
                setActiveTab('orders');
              }
            }}
          />
        )}

        {/* TAB: PENGGUNA DIBLOKIR */}
        {activeTab === 'banned' && (
          <AdminBannedUsersManager />
        )}

        {/* TAB: KEAMANAN & AUDIT SIBER */}
        {activeTab === 'security' && (
          <AdminSecurityManager />
        )}

        {/* TAB: BROADCAST PENGUMUMAN */}
        {activeTab === 'announcements' && (
          <AdminAnnouncementsManager />
        )}

      </main>

      {/* TEMPLATE ADD / EDIT MODAL */}
      {templateModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-stone-900">
                {templateFormData.id && templates.some(t => t.id === templateFormData.id) ? 'Edit Template Desain' : 'Tambah Template Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setTemplateModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Template *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Royal Gold Luxury"
                  value={templateFormData.name || ''}
                  onChange={(e) => setTemplateFormData({ ...templateFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Kategori Acara *</label>
                  <select
                    value={templateFormData.categoryId}
                    onChange={(e) => setTemplateFormData({ ...templateFormData, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Tema Visual</label>
                  <select
                    value={templateFormData.theme || 'minimal-modern'}
                    onChange={(e) => setTemplateFormData({ ...templateFormData, theme: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  >
                    <option value="minimal-modern">Minimal Modern (Stone / Dark)</option>
                    <option value="royal-gold">Royal Gold (Emas Mewah)</option>
                    <option value="romantic-blush">Romantic Blush (Pink / Rose)</option>
                    <option value="corporate-navy">Corporate Navy (Biru Resmi)</option>
                    <option value="islamic-emerald">Islamic Emerald (Hijau Religi)</option>
                    <option value="festive-sunset">Festive Sunset (Orange Meriah)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">URL Gambar Thumbnail *</label>
                <input
                  type="url"
                  required
                  value={templateFormData.thumbnail || ''}
                  onChange={(e) => setTemplateFormData({ ...templateFormData, thumbnail: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                />
                {templateFormData.thumbnail && (
                  <div className="mt-2 aspect-[16/9] w-full max-w-xs rounded-xl overflow-hidden border border-stone-200">
                    <img src={templateFormData.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Deskripsi Singkat Template</label>
                <textarea
                  rows={2}
                  value={templateFormData.description || ''}
                  onChange={(e) => setTemplateFormData({ ...templateFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="tplIsActive"
                  checked={templateFormData.isActive ?? true}
                  onChange={(e) => setTemplateFormData({ ...templateFormData, isActive: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                />
                <label htmlFor="tplIsActive" className="text-xs font-semibold text-stone-800 cursor-pointer">
                  Aktifkan template ini (tampilkan di halaman pilih template)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setTemplateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Simpan Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY ADD / EDIT MODAL */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-stone-900">
                {categoryFormData.id && categories.some(c => c.id === categoryFormData.id) ? 'Edit Kategori Acara' : 'Tambah Kategori Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Kategori *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Undangan Wisuda"
                  value={categoryFormData.name || ''}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Slug URL (Opsional)</label>
                <input
                  type="text"
                  placeholder="wisuda"
                  value={categoryFormData.slug || ''}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={categoryFormData.description || ''}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="catIsActive"
                  checked={categoryFormData.isActive ?? true}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, isActive: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                />
                <label htmlFor="catIsActive" className="text-xs font-semibold text-stone-800 cursor-pointer">
                  Kategori Aktif
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL DIALOG */}
      {rejectionModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-stone-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">Tolak Verifikasi Pembayaran</h3>
                <p className="text-xs text-stone-500">Order: {selectedOrder.id}</p>
              </div>
            </div>

            <p className="text-xs text-stone-600">
              Silakan tuliskan alasan penolakan agar pelanggan dapat membaca penjelasan dan mengunggah ulang bukti transfer yang benar.
            </p>

            <textarea
              rows={3}
              required
              placeholder="Contoh: Nominal transfer tidak sesuai atau struk transfer buram/tidak terbaca."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-rose-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectionModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleRejectOrder(selectedOrder)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Konfirmasi Tolak
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
