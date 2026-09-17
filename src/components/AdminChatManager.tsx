import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  Zap,
  ShieldAlert,
  Trash2,
  ExternalLink,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Ban,
  Check,
  Copy,
  Download,
  FileText,
  Filter,
  Columns,
  Maximize2,
  Minimize2,
  Bookmark,
  BellRing,
  Info,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  Layers
} from 'lucide-react';
import { ChatConversation, ChatMessage, BannedUser } from '../types';
import { db } from '../services/storage';
import { securityService } from '../services/security';

interface AdminChatManagerProps {
  onViewOrder?: (orderId: string) => void;
}

type ColumnLayout = 'balanced' | 'wideChat' | 'compact' | 'fullChat';
type FilterTab = 'all' | 'unread' | 'nudge' | 'banned' | 'open' | 'resolved';

const QUICK_REPLIES = [
  { label: '✅ Pembayaran Sah', text: 'Halo kak! Pembayaran pesanan undangan Anda telah terverifikasi dan pesanan sudah aktif. Anda dapat membagikan tautan undangan sekarang.' },
  { label: '📸 Minta Bukti', text: 'Halo kak, mohon kirimkan tangkapan layar (screenshot) bukti transfer bank agar tim verifikasi kami dapat memproses pesanan Anda.' },
  { label: '✏️ Panduan Edit', text: 'Halo kak! Anda dapat mengubah susunan acara, foto galeri, dan teks undangan kapan saja melalui menu "Akun Saya" > "Kelola Undangan".' },
  { label: '⏳ Sedang Diproses', text: 'Halo kak! Pesanan Anda saat ini sedang dalam antrean pemrosesan oleh tim kami. Estimasi selesai dalam 15-30 menit.' },
  { label: '⚠️ Teguran Spam', text: 'Peringatan Sistem: Mohon tidak mengirimkan pesan berulang kali atau menekan tombol pengingat secara berlebihan demi kelancaran layanan.' }
];

const BAN_PRESETS = [
  'Melakukan spam pengingat (nudge) secara berlebihan dan mengganggu server.',
  'Terdeteksi upaya serangan siber, XSS payload, atau penyusupan data.',
  'Kecurangan bukti pembayaran atau manipulasi data transfer perbankan.',
  'Penggunaan kata-kata kasar, pelecehan, atau ancaman terhadap staf/sistem.'
];

export const AdminChatManager: React.FC<AdminChatManagerProps> = ({ onViewOrder }) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputReply, setInputReply] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [layoutMode, setLayoutMode] = useState<ColumnLayout>('balanced');
  const [isSystemAlert, setIsSystemAlert] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notesInput, setNotesInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Ban modal state
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banTargetConvo, setBanTargetConvo] = useState<ChatConversation | null>(null);
  const [banReasonInput, setBanReasonInput] = useState(BAN_PRESETS[0]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadData = () => {
    const list = db.getConversations();
    setConversations(list);
    if (selectedConvoId) {
      const convo = list.find(c => c.id === selectedConvoId);
      if (convo) {
        setNotesInput(convo.adminNotes || '');
      }
      setMessages(db.getMessages(selectedConvoId));
      db.markConversationRead(selectedConvoId, 'admin');
    } else if (list.length > 0 && !selectedConvoId) {
      setSelectedConvoId(list[0].id);
      setNotesInput(list[0].adminNotes || '');
      setMessages(db.getMessages(list[0].id));
      db.markConversationRead(list[0].id, 'admin');
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('surat:chat-updated', handleUpdate);
    window.addEventListener('surat:chat-message-sent', handleUpdate);
    window.addEventListener('surat:banned-updated', handleUpdate);

    return () => {
      window.removeEventListener('surat:chat-updated', handleUpdate);
      window.removeEventListener('surat:chat-message-sent', handleUpdate);
      window.removeEventListener('surat:banned-updated', handleUpdate);
    };
  }, [selectedConvoId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeConvo = conversations.find(c => c.id === selectedConvoId);
  const isTargetBanned = activeConvo
    ? db.isUserBanned(activeConvo.userEmail, [activeConvo.userId, activeConvo.userName]).isBanned
    : false;

  const handleSelectConvo = (convo: ChatConversation) => {
    setSelectedConvoId(convo.id);
    setNotesInput(convo.adminNotes || '');
    setMessages(db.getMessages(convo.id));
    db.markConversationRead(convo.id, 'admin');
  };

  const handleSendReply = (quickText?: string) => {
    const rawText = (quickText || inputReply).trim();
    if (!rawText || !selectedConvoId) return;

    // Sanitize output
    const sanitized = securityService.sanitizeText(rawText);
    if (!sanitized) return;

    const newMsg: ChatMessage = {
      id: 'admin-msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      conversationId: selectedConvoId,
      senderRole: isSystemAlert ? 'system' : 'admin',
      senderName: isSystemAlert ? 'Pemberitahuan Resmi Sistem' : 'Customer Support SURAT (Admin)',
      text: sanitized,
      timestamp: new Date().toISOString(),
      isSystemAlert: isSystemAlert
    };

    db.sendMessage(newMsg);
    setInputReply('');
    if (isSystemAlert) setIsSystemAlert(false);
  };

  const handleDeleteMessage = (messageId: string) => {
    if (confirm('Hapus pesan ini dari riwayat chat?')) {
      db.deleteMessage(messageId);
      if (selectedConvoId) {
        setMessages(db.getMessages(selectedConvoId));
      }
    }
  };

  const handleClearChatHistory = () => {
    if (!selectedConvoId) return;
    if (confirm('PERINGATAN: Apakah Anda yakin ingin membersihkan semua riwayat obrolan pelanggan ini?')) {
      db.clearMessages(selectedConvoId);
      setMessages([]);
      loadData();
    }
  };

  const handleSaveNotes = () => {
    if (!selectedConvoId) return;
    db.updateConversationNotes(selectedConvoId, notesInput);
    loadData();
  };

  const handleChangeStatus = (status: 'open' | 'pending' | 'resolved' | 'archived') => {
    if (!selectedConvoId) return;
    db.updateConversationStatus(selectedConvoId, status);
    loadData();
  };

  const handleDeleteConversation = (id: string) => {
    if (confirm('Yakin ingin menghapus percakapan ini secara permanen dari daftar obrolan?')) {
      db.deleteConversation(id);
      if (selectedConvoId === id) {
        setSelectedConvoId(null);
        setMessages([]);
      }
      loadData();
    }
  };

  const handleOpenBanModal = (convo: ChatConversation) => {
    setBanTargetConvo(convo);
    setBanReasonInput(BAN_PRESETS[0]);
    setBanModalOpen(true);
  };

  const handleConfirmBan = () => {
    if (!banTargetConvo) return;

    const newBan: BannedUser = {
      id: 'ban-' + Date.now(),
      identifier: banTargetConvo.userEmail,
      name: banTargetConvo.userName,
      reason: banReasonInput.trim(),
      spamCount: banTargetConvo.nudgeCount || 1,
      bannedAt: new Date().toISOString(),
      bannedBy: 'Admin SURAT'
    };

    db.banUser(newBan);
    setBanModalOpen(false);
    setBanTargetConvo(null);
    loadData();
  };

  const handleUnban = (identifier: string) => {
    db.unbanUser(identifier);
    loadData();
  };

  const handleCopyInfo = (text: string, idTag: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(idTag);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportTranscript = () => {
    if (!activeConvo) return;
    const header = `=== TRANSKRIP LIVE CHAT SURAT ===\nPelanggan: ${activeConvo.userName} (${activeConvo.userEmail})\nOrder ID: ${activeConvo.orderId || 'N/A'}\nWaktu Ekspor: ${new Date().toLocaleString('id-ID')}\nStatus: ${activeConvo.status || 'open'}\n\n`;
    const body = messages.map(m => `[${new Date(m.timestamp).toLocaleString('id-ID')}] ${m.senderName}: ${m.text}`).join('\n');
    const fullText = header + body;

    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-transcript-${activeConvo.userName.replace(/\s+/g, '_')}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered Conversations
  const filteredConversations = conversations.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.userName.toLowerCase().includes(q) ||
      c.userEmail.toLowerCase().includes(q) ||
      (c.orderId && c.orderId.toLowerCase().includes(q)) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    const isBanned = db.isUserBanned(c.userEmail, [c.userId, c.userName]).isBanned;
    if (filterTab === 'unread') return (c.unreadAdminCount || 0) > 0;
    if (filterTab === 'nudge') return (c.nudgeCount || 0) > 0;
    if (filterTab === 'banned') return isBanned;
    if (filterTab === 'open') return !c.status || c.status === 'open';
    if (filterTab === 'resolved') return c.status === 'resolved';

    return true;
  });

  // Calculate layout column widths based on layoutMode
  const getColSpanClasses = () => {
    switch (layoutMode) {
      case 'compact':
        return { list: 'lg:col-span-5', chat: 'lg:col-span-7' };
      case 'wideChat':
        return { list: 'lg:col-span-3', chat: 'lg:col-span-9' };
      case 'fullChat':
        return { list: 'hidden', chat: 'lg:col-span-12' };
      case 'balanced':
      default:
        return { list: 'lg:col-span-4', chat: 'lg:col-span-8' };
    }
  };

  const colClasses = getColSpanClasses();

  return (
    <div className="space-y-6" id="admin-chat-manager-view">
      {/* Top Header with Layout Customizer */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <span>Pusat Kontrol Live Chat & Moderasi Pelanggan</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Full Authority
                </span>
              </h2>
              <p className="text-xs text-stone-500">
                Kelola percakapan, tanggapi pengingat Telegram (nudge), lakukan blokir/buka blokir, dan moderasi penuh pesan.
              </p>
            </div>
          </div>
        </div>

        {/* Layout & Quick Tools */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Column Layout Controls */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
            <span className="text-[10px] font-bold text-stone-500 px-2 flex items-center gap-1">
              <Columns className="w-3.5 h-3.5 text-stone-400" />
              <span>Kolom:</span>
            </span>
            <button
              type="button"
              onClick={() => setLayoutMode('balanced')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                layoutMode === 'balanced' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Tata letak seimbang (4:8)"
            >
              Standar
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('wideChat')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                layoutMode === 'wideChat' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Perluas area chat (3:9)"
            >
              Chat Lebar
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('compact')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                layoutMode === 'compact' ? 'bg-white text-stone-900 shadow-2xs font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Perluas daftar pesan (5:7)"
            >
              Daftar Lebar
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode(layoutMode === 'fullChat' ? 'balanced' : 'fullChat')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                layoutMode === 'fullChat' ? 'bg-stone-900 text-white shadow-2xs font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Maksimalkan ruang chat penuh"
            >
              {layoutMode === 'fullChat' ? 'Kembali' : 'Penuh'}
            </button>
          </div>

          <button
            type="button"
            onClick={loadData}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            title="Segarkan data obrolan"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Segarkan</span>
          </button>
        </div>
      </div>

      {/* Main Multi-Column Panel */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Column: Conversations List */}
        <div className={`${colClasses.list} border-r border-stone-200 flex flex-col bg-stone-50/50`}>
          {/* Search Box */}
          <div className="p-3 border-b border-stone-200 bg-white">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                placeholder="Cari nama, email, order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 mt-2.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
              <button
                type="button"
                onClick={() => setFilterTab('all')}
                className={`px-2 py-1 rounded-lg font-medium shrink-0 transition cursor-pointer ${
                  filterTab === 'all' ? 'bg-stone-900 text-white font-bold' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Semua ({conversations.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('unread')}
                className={`px-2 py-1 rounded-lg font-medium shrink-0 transition cursor-pointer ${
                  filterTab === 'unread' ? 'bg-rose-600 text-white font-bold' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Belum Dibaca
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('nudge')}
                className={`px-2 py-1 rounded-lg font-medium shrink-0 transition cursor-pointer ${
                  filterTab === 'nudge' ? 'bg-amber-600 text-white font-bold' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                ⚡ Nudge
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('banned')}
                className={`px-2 py-1 rounded-lg font-medium shrink-0 transition cursor-pointer ${
                  filterTab === 'banned' ? 'bg-rose-700 text-white font-bold' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                ⛔ Terblokir
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('resolved')}
                className={`px-2 py-1 rounded-lg font-medium shrink-0 transition cursor-pointer ${
                  filterTab === 'resolved' ? 'bg-emerald-600 text-white font-bold' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Selesai
              </button>
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-200">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-stone-400 space-y-1">
                <MessageSquare className="w-8 h-8 mx-auto text-stone-300" />
                <p className="text-xs font-semibold text-stone-600">Tidak ada percakapan</p>
                <p className="text-[11px] text-stone-400">Tidak ada data obrolan yang sesuai filter.</p>
              </div>
            ) : (
              filteredConversations.map((convo) => {
                const isSelected = convo.id === selectedConvoId;
                const unread = convo.unreadAdminCount || 0;
                const hasNudge = (convo.nudgeCount || 0) > 0;
                const banned = db.isUserBanned(convo.userEmail, [convo.userId, convo.userName]).isBanned;

                return (
                  <div
                    key={convo.id}
                    onClick={() => handleSelectConvo(convo)}
                    className={`p-3.5 transition-all cursor-pointer border-l-4 ${
                      isSelected
                        ? 'bg-amber-50/70 border-l-amber-500 shadow-2xs'
                        : unread > 0
                        ? 'bg-white border-l-rose-500 font-semibold'
                        : 'bg-white hover:bg-stone-100/80 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-stone-900 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                          {convo.userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-stone-900 truncate">
                            {convo.userName}
                          </h4>
                          <p className="text-[10px] text-stone-400 truncate">
                            {convo.userEmail}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {unread > 0 && (
                          <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                            {unread}
                          </span>
                        )}
                        {hasNudge && (
                          <span
                            className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 border border-amber-300"
                            title={`Nudge terkirim: ${convo.nudgeCount}x`}
                          >
                            <Zap className="w-3 h-3 text-amber-600" />
                            <span>{convo.nudgeCount}x</span>
                          </span>
                        )}
                        {banned && (
                          <span className="bg-rose-100 text-rose-800 text-[9px] font-bold px-1.5 py-0.5 rounded-md border border-rose-300">
                            BANNED
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-stone-600 line-clamp-1 mt-1 pl-10">
                      {convo.lastMessage || 'Tidak ada pesan.'}
                    </p>

                    <div className="flex items-center justify-between text-[9px] text-stone-400 pl-10 pt-1">
                      <span>
                        {convo.lastMessageAt
                          ? new Date(convo.lastMessageAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                          : ''}
                      </span>
                      {convo.orderId && (
                        <span className="bg-stone-100 px-1.5 py-0.5 rounded font-mono text-stone-600">
                          #{convo.orderId}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat History & Full Authority Workspace */}
        <div className={`${colClasses.chat} flex flex-col bg-white`}>
          {activeConvo ? (
            <>
              {/* Active Conversation Master Header */}
              <div className="p-4 border-b border-stone-200 bg-stone-50/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {layoutMode === 'fullChat' && (
                    <button
                      type="button"
                      onClick={() => setLayoutMode('balanced')}
                      className="p-1.5 bg-white border border-stone-300 rounded-lg text-stone-600 hover:text-stone-900 transition text-xs flex items-center gap-1 cursor-pointer"
                      title="Kembali ke tampilan berdampingan"
                    >
                      <Columns className="w-3.5 h-3.5" />
                      <span>Daftar</span>
                    </button>
                  )}

                  <div className="w-10 h-10 rounded-full bg-stone-900 text-amber-400 font-bold flex items-center justify-center text-sm shadow-inner">
                    {activeConvo.userName.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-stone-900">{activeConvo.userName}</h3>
                      {isTargetBanned ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3 text-rose-600" />
                          <span>TERBLOKIR (BANNED)</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Status: Aktif</span>
                        </span>
                      )}

                      {(activeConvo.nudgeCount || 0) > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-600" />
                          <span>Pernah Ping {activeConvo.nudgeCount}x</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-stone-400" />
                        <span>{activeConvo.userEmail}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyInfo(activeConvo.userEmail, 'email')}
                          className="text-stone-400 hover:text-stone-700 ml-0.5"
                          title="Salin Email"
                        >
                          {copiedId === 'email' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </span>

                      {activeConvo.orderId && (
                        <span className="flex items-center gap-1 font-mono text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          <span>#{activeConvo.orderId}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyInfo(activeConvo.orderId || '', 'order')}
                            className="text-amber-700 hover:text-amber-900"
                            title="Salin Order ID"
                          >
                            {copiedId === 'order' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action Tools for Admin */}
                <div className="flex items-center flex-wrap gap-2">
                  {/* Status Dropdown */}
                  <select
                    value={activeConvo.status || 'open'}
                    onChange={(e) => handleChangeStatus(e.target.value as any)}
                    className="px-2.5 py-1.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 focus:ring-1 focus:ring-amber-500 focus:outline-hidden cursor-pointer"
                  >
                    <option value="open">🟢 Belum Selesai (Open)</option>
                    <option value="pending">🟡 Dalam Proses (Pending)</option>
                    <option value="resolved">🔵 Selesai (Resolved)</option>
                    <option value="archived">⚪ Arsipkan (Archived)</option>
                  </select>

                  {/* Open Associated Order */}
                  {activeConvo.orderId && onViewOrder && (
                    <button
                      type="button"
                      onClick={() => onViewOrder(activeConvo.orderId!)}
                      className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                      title="Buka detail pesanan di panel admin"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
                      <span>Lihat Order</span>
                    </button>
                  )}

                  {/* Toggle Notes Button */}
                  <button
                    type="button"
                    onClick={() => setShowNotes(!showNotes)}
                    className={`px-3 py-1.5 border rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs ${
                      showNotes || activeConvo.adminNotes
                        ? 'bg-amber-100 border-amber-300 text-amber-900'
                        : 'bg-white hover:bg-stone-100 border-stone-300 text-stone-700'
                    }`}
                    title="Catatan internal admin untuk obrolan ini"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Catatan {activeConvo.adminNotes ? '•' : ''}</span>
                  </button>

                  {/* Export Transcript */}
                  <button
                    type="button"
                    onClick={handleExportTranscript}
                    className="p-1.5 bg-white hover:bg-stone-100 text-stone-600 border border-stone-300 rounded-xl transition cursor-pointer shadow-2xs"
                    title="Unduh transkrip chat (.txt)"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  {/* Ban / Unban Master Button */}
                  {isTargetBanned ? (
                    <button
                      type="button"
                      onClick={() => handleUnban(activeConvo.userEmail)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Buka Blokir (Unban)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenBanModal(activeConvo)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                      title="Blokir pengguna ini dari pengiriman pesan dan spam"
                    >
                      <Ban className="w-3.5 h-3.5 text-rose-600" />
                      <span>Blokir (Ban)</span>
                    </button>
                  )}

                  {/* Clear History */}
                  <button
                    type="button"
                    onClick={handleClearChatHistory}
                    className="p-1.5 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition cursor-pointer"
                    title="Bersihkan Semua Pesan"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Conversation */}
                  <button
                    type="button"
                    onClick={() => handleDeleteConversation(activeConvo.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    title="Hapus Percakapan Permanen"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Internal Notes Drawer if toggled */}
              {showNotes && (
                <div className="p-3.5 bg-amber-50/70 border-b border-amber-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 animate-in fade-in">
                  <div className="flex-1 flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-amber-600 shrink-0" />
                    <input
                      type="text"
                      placeholder="Tulis catatan internal admin (hanya terlihat oleh tim admin)..."
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveNotes();
                        }
                      }}
                      className="flex-1 px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                  >
                    Simpan Catatan
                  </button>
                </div>
              )}

              {/* Banned Alert Banner inside Conversation */}
              {isTargetBanned && (
                <div className="p-3 bg-rose-50 border-b border-rose-200 flex items-center justify-between gap-3 text-rose-900">
                  <div className="flex items-center gap-2 text-xs">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      <b>Pengguna Ini Sedang Diblokir:</b> Akses chat dan pembuatan pesanan ditolak secara otomatis oleh sistem.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUnban(activeConvo.userEmail)}
                    className="text-xs font-bold text-rose-700 hover:underline shrink-0"
                  >
                    Pulihkan Akses Sekarang
                  </button>
                </div>
              )}

              {/* Chat Messages List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-100/40 min-h-[360px] max-h-[480px]">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-stone-400 space-y-1">
                    <MessageSquare className="w-8 h-8 text-stone-300" />
                    <p className="text-xs font-semibold text-stone-600">Belum ada riwayat pesan</p>
                    <p className="text-[11px] text-stone-400">Balas pesan pertama Anda melalui kolom di bawah.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isAdmin = msg.senderRole === 'admin';
                    const isSystem = msg.senderRole === 'system' || msg.isSystemAlert;
                    const isMe = isAdmin || isSystem;

                    return (
                      <div
                        key={msg.id}
                        className={`group flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                      >
                        <div className="flex items-center gap-2 px-1">
                          <span className="text-[10px] font-bold text-stone-500">
                            {isSystem
                              ? '📢 PEMBERITAHUAN RESMI SISTEM'
                              : isAdmin
                              ? 'Anda (Admin)'
                              : msg.senderName || 'Pelanggan'}
                          </span>
                          <span className="text-[9px] text-stone-400 font-mono">
                            {new Date(msg.timestamp).toLocaleString('id-ID', {
                              dateStyle: 'short',
                              timeStyle: 'short'
                            })}
                          </span>

                          {/* Delete individual message action on hover */}
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-stone-400 hover:text-rose-600 transition"
                            title="Hapus pesan ini"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        <div
                          className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs leading-relaxed relative ${
                            isSystem
                              ? 'bg-amber-500 text-stone-950 font-medium rounded-tr-xs shadow-md border-2 border-amber-600'
                              : msg.isNudge
                              ? 'bg-amber-100 border-2 border-amber-400 text-amber-950 font-semibold shadow-xs'
                              : isAdmin
                              ? 'bg-stone-900 text-white rounded-tr-xs shadow-xs'
                              : 'bg-white border border-stone-200 text-stone-900 rounded-tl-xs shadow-2xs'
                          }`}
                        >
                          {msg.isNudge && (
                            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800 mb-1">
                              <Zap className="w-3.5 h-3.5 text-amber-600" />
                              <span>PELANGGAN MEMINTA RESPON CEPAT (NUDGE VIA BOT TELEGRAM)</span>
                            </div>
                          )}

                          {isSystem && (
                            <div className="flex items-center gap-1 text-[11px] font-bold text-stone-950 uppercase tracking-wider mb-1">
                              <BellRing className="w-3.5 h-3.5 text-stone-900" />
                              <span>Pemberitahuan Resmi Dari Admin</span>
                            </div>
                          )}

                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Reply Presets Bar */}
              <div className="px-3.5 py-2 bg-stone-50 border-t border-stone-200 flex items-center gap-2 overflow-x-auto no-scrollbar text-[11px]">
                <span className="text-[10px] font-bold text-stone-400 shrink-0 uppercase tracking-wider">
                  Template Balasan:
                </span>
                {QUICK_REPLIES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendReply(preset.text)}
                    className="shrink-0 px-2.5 py-1 bg-white hover:bg-stone-200 border border-stone-300 rounded-lg text-stone-700 transition cursor-pointer font-medium"
                    title={preset.text}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Input Reply Box & System Alert Mode Toggle */}
              <div className="p-3.5 bg-white border-t border-stone-200 space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isSystemAlert}
                      onChange={(e) => setIsSystemAlert(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                    />
                    <span className={isSystemAlert ? 'font-bold text-amber-700' : ''}>
                      Kirim sebagai Pengumuman Sistem Resmi (Gold Highlight)
                    </span>
                  </label>

                  <span className="text-[11px] text-stone-400">
                    Tekan <b>Enter</b> untuk mengirim
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={
                      isSystemAlert
                        ? 'Tulis pengumuman sistem resmi untuk pelanggan...'
                        : 'Ketik balasan untuk pelanggan...'
                    }
                    value={inputReply}
                    onChange={(e) => setInputReply(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                    className={`flex-1 px-3.5 py-2.5 border rounded-xl text-xs focus:ring-1 focus:outline-hidden transition ${
                      isSystemAlert
                        ? 'bg-amber-50/70 border-amber-300 focus:ring-amber-500 font-medium text-stone-900'
                        : 'bg-stone-50 border-stone-300 focus:ring-amber-500'
                    }`}
                  />
                  <button
                    type="button"
                    disabled={!inputReply.trim()}
                    onClick={() => handleSendReply()}
                    className={`px-4 py-2.5 disabled:opacity-40 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                      isSystemAlert
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-stone-900 hover:bg-stone-800 text-white'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSystemAlert ? 'Kirim Alert' : 'Kirim Balasan'}</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-stone-400 space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-stone-300" />
              </div>
              <p className="text-sm font-semibold text-stone-600">Pilih Percakapan</p>
              <p className="text-xs text-stone-400 max-w-xs text-center">
                Pilih salah satu percakapan di kolom kiri untuk membalas, melihat detail pemesan, atau mengelola status blokir.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* BAN USER ADVANCED MODAL */}
      {banModalOpen && banTargetConvo && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-stone-900">
                Blokir Pengguna (Ban User)
              </h3>
              <p className="text-xs text-stone-500">
                Pengguna yang diblokir tidak akan bisa mengakses live chat, mengirim form, atau membuat pesanan baru.
              </p>
            </div>

            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs space-y-1">
              <p className="font-bold text-stone-800">Target Pemblokiran:</p>
              <p className="text-stone-700">Nama: <b>{banTargetConvo.userName}</b></p>
              <p className="text-stone-700">Email/Identitas: <b>{banTargetConvo.userEmail}</b></p>
              <p className="text-amber-800">Jumlah Nudge / Spam: <b>{banTargetConvo.nudgeCount || 0} kali</b></p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-stone-700">
                Pilih Preset Alasan Pelanggaran:
              </label>
              <div className="space-y-1.5">
                {BAN_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setBanReasonInput(preset)}
                    className={`w-full text-left p-2 rounded-lg text-xs border transition cursor-pointer ${
                      banReasonInput === preset
                        ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold'
                        : 'bg-white hover:bg-stone-100 border-stone-200 text-stone-700'
                    }`}
                  >
                    • {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Kustomisasi Catatan Alasan Pemblokiran *
              </label>
              <textarea
                rows={2}
                required
                value={banReasonInput}
                onChange={(e) => setBanReasonInput(e.target.value)}
                placeholder="Tuliskan alasan pemblokiran pengguna..."
                className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:ring-1 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setBanModalOpen(false);
                  setBanTargetConvo(null);
                }}
                className="flex-1 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmBan}
                className="flex-1 py-2.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Konfirmasi Blokir Akun</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
