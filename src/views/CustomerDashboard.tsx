import React, { useState, useEffect, useMemo } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  ExternalLink,
  Download,
  Copy,
  CheckCircle2,
  Clock,
  AlertCircle,
  Activity,
  Key,
  LogOut,
  ShieldCheck,
  Share2,
  Eye,
  FileText,
  Search,
  Filter,
  ArrowRight,
  Compass,
  Check,
  Layers,
  ChevronRight,
  UserCheck,
  ShoppingBag,
  RefreshCw,
  Zap
} from 'lucide-react';
import { UserAccount, Order, UserActivityLog, SiteSettings } from '../types';
import { customerAuth } from '../services/customerAuth';
import { db } from '../services/storage';
import { generateStandaloneWebsiteZip } from '../services/zipGenerator';
import { ShareModal } from '../components/ShareModal';
import { ExpediteOrderModal } from '../components/ExpediteOrderModal';
import { copyToClipboard } from '../utils/clipboard';

interface CustomerDashboardProps {
  user: UserAccount;
  settings: SiteSettings;
  onLogout: () => void;
  onNavigateHome: () => void;
  onStartCreate: () => void;
  onViewOrder: (orderId: string) => void;
  onViewInvitation: (slug: string) => void;
  onUpdateUser: (updatedUser: UserAccount) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  user,
  settings,
  onLogout,
  onNavigateHome,
  onStartCreate,
  onViewOrder,
  onViewInvitation,
  onUpdateUser
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'activities' | 'settings'>('orders');
  
  // Orders & Activities state
  const [orders, setOrders] = useState<Order[]>([]);
  const [activities, setActivities] = useState<UserActivityLog[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'PAID' | 'PENDING' | 'REJECTED'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Share & Expedite modal
  const [selectedShareOrder, setSelectedShareOrder] = useState<Order | null>(null);
  const [selectedExpediteOrder, setSelectedExpediteOrder] = useState<Order | null>(null);
  
  // Profile Form state
  const [name, setName] = useState(user.name || user.username);
  const [username, setUsername] = useState(user.username || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [referralSource, setReferralSource] = useState(user.referralSource || '');
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Password Form state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMsg, setPassMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // ZIP Download status
  const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(null);

  // Load orders & activities
  const loadUserData = () => {
    const userOrders = customerAuth.getUserOrders(user.id, user.email);
    setOrders(userOrders);
    const userActs = customerAuth.getUserActivities(user.id);
    setActivities(userActs);
  };

  useEffect(() => {
    loadUserData();
  }, [user]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchStatus = filterStatus === 'all' || o.paymentStatus === filterStatus;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        o.id.toLowerCase().includes(q) || 
        o.slug.toLowerCase().includes(q) || 
        (o.invitationData?.title && o.invitationData.title.toLowerCase().includes(q));
      return matchStatus && matchQuery;
    });
  }, [orders, filterStatus, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = orders.length;
    const paid = orders.filter(o => o.paymentStatus === 'PAID').length;
    const pending = orders.filter(o => o.paymentStatus === 'PENDING').length;
    const totalViews = orders.reduce((acc, curr) => acc + (curr.viewsCount || 0), 0);
    return { total, paid, pending, totalViews };
  }, [orders]);

  // Handle Profile Update
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);

    const res = customerAuth.updateProfile(user.id, {
      name,
      username,
      phone,
      referralSource
    });

    if (res.success && res.user) {
      setProfileMsg({ text: 'Data profil berhasil diperbarui!', type: 'success' });
      onUpdateUser(res.user);
      loadUserData();
    } else {
      setProfileMsg({ text: res.message, type: 'error' });
    }
  };

  // Handle Change Password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);

    if (newPassword !== confirmPassword) {
      setPassMsg({ text: 'Konfirmasi password baru tidak cocok.', type: 'error' });
      return;
    }

    const res = customerAuth.changePassword(user.id, oldPassword, newPassword);
    if (res.success) {
      setPassMsg({ text: 'Password berhasil diperbarui!', type: 'success' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      loadUserData();
    } else {
      setPassMsg({ text: res.message, type: 'error' });
    }
  };

  // Handle Download ZIP
  const handleDownloadZip = async (order: Order) => {
    try {
      setDownloadingOrderId(order.id);
      await generateStandaloneWebsiteZip(order);
      customerAuth.logActivity(
        user.id,
        user.email,
        'Download ZIP Undangan',
        `Mengunduh file website mandiri untuk pesanan ${order.id} (${order.slug}).`,
        'Download'
      );
      loadUserData();
    } catch (err) {
      console.error('Failed to download ZIP:', err);
      alert('Gagal mengunduh file ZIP. Silakan coba lagi.');
    } finally {
      setDownloadingOrderId(null);
    }
  };

  const domainUrl = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : 'https://suratttt.netlify.app';

  return (
    <div className="min-h-screen bg-stone-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* TOP PROFILE HEADER BANNER */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-stone-100 rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-800 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            {/* User Details */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg shadow-amber-500/20 border-2 border-amber-300">
                {(user.name || user.username).charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-white">
                    {user.name || user.username}
                  </h1>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    @{user.username}
                  </span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Member Aktif</span>
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-stone-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <span>{user.email}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>{user.phone}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-500" />
                    <span>Bergabung: {new Date(user.createdAt).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <button
                onClick={onStartCreate}
                className="flex-1 md:flex-initial bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-transform transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>Buat Undangan Baru</span>
                <span className="bg-stone-950/20 text-stone-950 text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">
                  Rp5.000
                </span>
              </button>

              <button
                onClick={onLogout}
                className="px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-stone-700"
                title="Keluar dari akun"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-stone-800/80">
            <div className="bg-stone-800/60 rounded-xl p-3 border border-stone-700/50">
              <span className="text-[11px] text-stone-400 block font-medium">Total Pesanan</span>
              <span className="text-xl font-bold font-mono text-white mt-0.5 block">{stats.total}</span>
            </div>
            <div className="bg-emerald-950/30 rounded-xl p-3 border border-emerald-800/40">
              <span className="text-[11px] text-emerald-400 block font-medium">Undangan Aktif / Lunas</span>
              <span className="text-xl font-bold font-mono text-emerald-300 mt-0.5 block">{stats.paid}</span>
            </div>
            <div className="bg-amber-950/30 rounded-xl p-3 border border-amber-800/40">
              <span className="text-[11px] text-amber-400 block font-medium">Menunggu Verifikasi</span>
              <span className="text-xl font-bold font-mono text-amber-300 mt-0.5 block">{stats.pending}</span>
            </div>
            <div className="bg-stone-800/60 rounded-xl p-3 border border-stone-700/50">
              <span className="text-[11px] text-stone-400 block font-medium">Total Kunjungan Tamu</span>
              <span className="text-xl font-bold font-mono text-amber-400 mt-0.5 block">{stats.totalViews}</span>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all ${
                activeTab === 'orders'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Riwayat Pesanan</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'orders' ? 'bg-stone-950/20 text-stone-950' : 'bg-stone-100 text-stone-600'
              }`}>
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('activities')}
              className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all ${
                activeTab === 'activities'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Aktivitas Akun</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'activities' ? 'bg-stone-950/20 text-stone-950' : 'bg-stone-100 text-stone-600'
              }`}>
                {activities.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all ${
                activeTab === 'settings'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Pengaturan Profil</span>
            </button>
          </div>

          <button
            onClick={loadUserData}
            className="p-2 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
            title="Muat Ulang Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* TAB 1: RIWAYAT PESANAN */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            
            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Cari Order ID, slug, atau judul..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <span className="text-[11px] text-stone-400 mr-1 hidden md:inline">Filter:</span>
                {(['all', 'PAID', 'PENDING', 'REJECTED'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      filterStatus === st
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {st === 'all' && 'Semua'}
                    {st === 'PAID' && '✓ Lunas / Aktif'}
                    {st === 'PENDING' && '⏳ Verifikasi'}
                    {st === 'REJECTED' && '✕ Ditolak'}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-stone-200 shadow-sm space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-stone-900">Belum Ada Pesanan Undangan</h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    {searchQuery || filterStatus !== 'all'
                      ? 'Tidak ada pesanan yang sesuai dengan filter pencarian.'
                      : 'Mulai buat undangan digital pertama Anda hanya dengan Rp5.000 sekali bayar.'}
                  </p>
                </div>
                <button
                  onClick={onStartCreate}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Buat Undangan Digital Sekarang</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredOrders.map(order => {
                  const isPaid = order.paymentStatus === 'PAID';
                  const isPending = order.paymentStatus === 'PENDING';
                  const isRejected = order.paymentStatus === 'REJECTED';
                  const fullUrl = `${domainUrl}/${order.slug}`;

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-sm hover:shadow-md transition-shadow space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-stone-100 text-amber-700 flex items-center justify-center font-bold font-mono text-xs border border-stone-200">
                            #{order.id.slice(-4)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-stone-900 font-mono">
                                {order.id}
                              </span>
                              <span className="text-[11px] text-stone-500">
                                • {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <h3 className="text-sm font-semibold text-stone-800 mt-0.5">
                              {order.invitationData?.title || `Undangan ${order.slug}`}
                            </h3>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          {isPaid && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>LUNAS (Aktif)</span>
                            </span>
                          )}
                          {isPending && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Menunggu Verifikasi Admin</span>
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Ditolak</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Order Details Body */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-stone-50 rounded-xl p-3 text-xs">
                        <div>
                          <span className="text-stone-400 block text-[11px]">URL Undangan:</span>
                          <span className="font-mono font-bold text-amber-700 truncate block">
                            /{order.slug}
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[11px]">Total Biaya:</span>
                          <span className="font-bold text-stone-800">
                            Rp{order.price.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[11px]">Kunjungan Tamu:</span>
                          <span className="font-bold text-stone-800">
                            👁️ {order.viewsCount || 0} Pembaca
                          </span>
                        </div>
                      </div>

                      {/* Rejection notice if any */}
                      {isRejected && order.rejectionReason && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                          <strong>Catatan Admin:</strong> {order.rejectionReason}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        {isPaid ? (
                          <>
                            <button
                              onClick={() => onViewInvitation(order.slug)}
                              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Buka Undangan</span>
                            </button>

                            <button
                              onClick={() => setSelectedShareOrder(order)}
                              className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                            >
                              <Share2 className="w-3.5 h-3.5 text-amber-400" />
                              <span>Salin Link Tamu WA</span>
                            </button>

                            <button
                              onClick={() => handleDownloadZip(order)}
                              disabled={downloadingOrderId === order.id}
                              className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-stone-300"
                            >
                              <Download className="w-3.5 h-3.5 text-amber-600" />
                              <span>{downloadingOrderId === order.id ? 'Membuat ZIP...' : 'Download ZIP'}</span>
                            </button>

                            <button
                              onClick={() => onViewOrder(order.id)}
                              className="px-3 py-2 rounded-xl text-stone-600 hover:text-stone-900 font-semibold text-xs flex items-center gap-1 ml-auto"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Detail Invoice</span>
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => onViewOrder(order.id)}
                              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>{isPending ? 'Cek Status & Bukti Transfer' : 'Upload Ulang Bukti Bayar'}</span>
                            </button>

                            {isPending && (
                              <button
                                onClick={() => setSelectedExpediteOrder(order)}
                                className="px-3.5 py-2 rounded-xl bg-stone-950 hover:bg-stone-900 text-amber-400 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                              >
                                <Zap className="w-3.5 h-3.5 fill-amber-400" />
                                <span>⚡ Percepat Verifikasi (Telegram)</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* TAB 2: AKTIVITAS AKUN */}
        {activeTab === 'activities' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-stone-900">Aktivitas & Log Akun</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Riwayat tindakan yang dilakukan pada akun Anda untuk transparansi & keamanan.
              </p>
            </div>

            {activities.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-xs">
                Belum ada catatan log aktivitas akun.
              </div>
            ) : (
              <div className="space-y-3 relative before:absolute before:inset-y-0 before:left-4 before:w-0.5 before:bg-stone-200 pl-8">
                {activities.map(act => (
                  <div key={act.id} className="relative group">
                    <div className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-amber-500 border-2 border-white ring-2 ring-stone-200 group-hover:scale-110 transition-transform" />
                    <div className="bg-stone-50 hover:bg-stone-100/80 p-3.5 rounded-xl border border-stone-200 transition-colors space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-stone-900">{act.action}</span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {new Date(act.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600">{act.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PENGATURAN PROFIL & KEAMANAN */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Profil Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-5">
              <div>
                <h2 className="text-base font-bold text-stone-900">Ubah Data Profil</h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Perbarui nama, nomor kontak, dan preferensi akun Anda.
                </p>
              </div>

              {profileMsg && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {profileMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Pengguna (Username)</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Nomor WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Alamat Email (Permanen)</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full px-3.5 py-2.5 bg-stone-100 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Tahu Website Dari</label>
                  <input
                    type="text"
                    value={referralSource}
                    onChange={(e) => setReferralSource(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-xs"
                >
                  Simpan Perubahan Profil
                </button>
              </form>
            </div>

            {/* Password Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-5">
              <div>
                <h2 className="text-base font-bold text-stone-900">Ganti Password</h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Pastikan menggunakan kombinasi kata sandi yang kuat.
                </p>
              </div>

              {passMsg && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  passMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {passMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{passMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Password Saat Ini</label>
                  <input
                    type="password"
                    required
                    placeholder="Masukkan password lama"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Password Baru</label>
                  <input
                    type="password"
                    required
                    placeholder="Min. 6 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Ulangi Password Baru</label>
                  <input
                    type="password"
                    required
                    placeholder="Ulangi password baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-2.5 rounded-xl text-xs shadow-xs"
                >
                  Perbarui Password
                </button>
              </form>
            </div>

          </div>
        )}

      </div>

      {/* Share Guest Link Modal */}
      {selectedShareOrder && (
        <ShareModal
          order={selectedShareOrder}
          onClose={() => setSelectedShareOrder(null)}
        />
      )}

      {/* Expedite Order Modal */}
      {selectedExpediteOrder && (
        <ExpediteOrderModal
          order={selectedExpediteOrder}
          onClose={() => setSelectedExpediteOrder(null)}
          onSuccess={() => {
            const list = db.getOrders();
            const myOrders = list.filter(o => 
              (o.userId && o.userId === user.id) || 
              (o.email && o.email.toLowerCase() === user.email.toLowerCase())
            );
            setOrders(myOrders);
          }}
        />
      )}
    </div>
  );
};
