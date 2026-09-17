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
  Ban
} from 'lucide-react';
import { ChatConversation, ChatMessage, BannedUser } from '../types';
import { db } from '../services/storage';

interface AdminChatManagerProps {
  onViewOrder?: (orderId: string) => void;
}

export const AdminChatManager: React.FC<AdminChatManagerProps> = ({ onViewOrder }) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputReply, setInputReply] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Ban modal state
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banTargetConvo, setBanTargetConvo] = useState<ChatConversation | null>(null);
  const [banReasonInput, setBanReasonInput] = useState('Melakukan spam tombol percepat / pengingat secara berlebihan.');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadData = () => {
    const list = db.getConversations();
    setConversations(list);
    if (selectedConvoId) {
      setMessages(db.getMessages(selectedConvoId));
      db.markConversationRead(selectedConvoId, 'admin');
    } else if (list.length > 0 && !selectedConvoId) {
      setSelectedConvoId(list[0].id);
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

  const handleSelectConvo = (id: string) => {
    setSelectedConvoId(id);
    setMessages(db.getMessages(id));
    db.markConversationRead(id, 'admin');
  };

  const handleSendReply = (quickText?: string) => {
    const text = (quickText || inputReply).trim();
    if (!text || !selectedConvoId) return;

    const activeConvo = conversations.find(c => c.id === selectedConvoId);
    if (!activeConvo) return;

    const newMsg: ChatMessage = {
      id: 'admin-msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      conversationId: selectedConvoId,
      senderRole: 'admin',
      senderName: 'Customer Support SURAT (Admin)',
      text: text,
      timestamp: new Date().toISOString()
    };

    db.sendMessage(newMsg);
    setInputReply('');
  };

  const handleDeleteConversation = (id: string) => {
    if (confirm('Yakin ingin menghapus percakapan ini secara permanen?')) {
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
    setBanReasonInput(`Spam tombol percepat / pengingat sebanyak ${convo.nudgeCount || 1} kali.`);
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
      bannedBy: 'Super Admin'
    };

    db.banUser(newBan);
    setBanModalOpen(false);
    setBanTargetConvo(null);
    loadData();
  };

  const handleUnban = (email: string) => {
    db.unbanUser(email);
    loadData();
  };

  const filteredConversations = conversations.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.userName.toLowerCase().includes(q) ||
      c.userEmail.toLowerCase().includes(q) ||
      (c.orderId && c.orderId.toLowerCase().includes(q)) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(q))
    );
  });

  const activeConvo = conversations.find(c => c.id === selectedConvoId);
  const isTargetBanned = activeConvo ? db.isUserBanned(activeConvo.userEmail).isBanned : false;

  return (
    <div className="space-y-6" id="admin-chat-manager-view">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-amber-600" />
            <span>Live Chat & Percakapan Pelanggan</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Pantau dan balas pesan pelanggan secara langsung serta kelola permintaan percepat respon (nudge).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Chat Panel */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        {/* Left Column: Conversations List */}
        <div className="lg:col-span-4 border-r border-stone-200 flex flex-col bg-stone-50/50">
          {/* Search Box */}
          <div className="p-3.5 border-b border-stone-200 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama, email, atau order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-200/60 max-h-[540px]">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-stone-400 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-stone-300" />
                <p className="text-xs font-medium text-stone-600">Belum ada chat masuk</p>
                <p className="text-[11px] text-stone-400">Pesan dari pengunjung akan tampil di sini secara realtime.</p>
              </div>
            ) : (
              filteredConversations.map((convo) => {
                const isSelected = convo.id === selectedConvoId;
                const unread = convo.unreadAdminCount || 0;
                const hasNudge = (convo.nudgeCount || 0) > 0;
                const banned = db.isUserBanned(convo.userEmail).isBanned;

                return (
                  <div
                    key={convo.id}
                    onClick={() => handleSelectConvo(convo.id)}
                    className={`p-3.5 cursor-pointer transition-all flex flex-col gap-1.5 ${
                      isSelected ? 'bg-amber-50/90 border-l-4 border-amber-600' : 'hover:bg-stone-100/80 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-7 h-7 rounded-full bg-stone-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                          {convo.userName.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-stone-900 truncate">
                            {convo.userName}
                          </h4>
                          <span className="text-[10px] text-stone-400 block truncate">
                            {convo.userEmail}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {unread > 0 && (
                          <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
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
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-rose-300">
                            BANNED
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-stone-600 line-clamp-1 mt-0.5 pl-9">
                      {convo.lastMessage || 'Tidak ada pesan.'}
                    </p>

                    <div className="flex items-center justify-between text-[9px] text-stone-400 pl-9 pt-1">
                      <span>
                        {convo.lastMessageAt
                          ? new Date(convo.lastMessageAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                          : ''}
                      </span>
                      {convo.orderId && (
                        <span className="bg-stone-100 px-1.5 py-0.5 rounded font-mono text-stone-600">
                          Order #{convo.orderId}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat History & Reply */}
        <div className="lg:col-span-8 flex flex-col bg-white">
          {activeConvo ? (
            <>
              {/* Active Conversation Header */}
              <div className="p-4 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 bg-stone-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-stone-900 text-amber-400 font-bold flex items-center justify-center text-sm">
                    {activeConvo.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-stone-900">{activeConvo.userName}</h3>
                      {isTargetBanned && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          ⛔ DIBLOKIR
                        </span>
                      )}
                      {(activeConvo.nudgeCount || 0) > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-600" />
                          <span>Pernah Ping {activeConvo.nudgeCount}x</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-stone-500 mt-0.5">
                      <span>✉️ {activeConvo.userEmail}</span>
                      {activeConvo.orderId && (
                        <span className="font-mono text-amber-700 font-semibold">
                          📋 ID: {activeConvo.orderId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isTargetBanned ? (
                    <button
                      type="button"
                      onClick={() => handleUnban(activeConvo.userEmail)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Buka Blokir (Unban)
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenBanModal(activeConvo)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      title="Blokir pengguna ini dari pengiriman pesan dan spam"
                    >
                      <Ban className="w-3.5 h-3.5 text-rose-600" />
                      <span>Blokir (Ban)</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteConversation(activeConvo.id)}
                    className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    title="Hapus Percakapan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-100/40 max-h-[420px]">
                {messages.map((msg) => {
                  const isAdmin = msg.senderRole === 'admin';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <div className="flex items-center gap-1.5 px-1">
                        <span className="text-[10px] font-bold text-stone-500">
                          {isAdmin ? 'Anda (Admin)' : msg.senderName || 'Pelanggan'}
                        </span>
                        <span className="text-[9px] text-stone-400 font-mono">
                          {new Date(msg.timestamp).toLocaleString('id-ID', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </span>
                      </div>

                      <div
                        className={`max-w-[80%] px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                          msg.isNudge
                            ? 'bg-amber-100 border-2 border-amber-400 text-amber-950 font-semibold shadow-xs'
                            : isAdmin
                            ? 'bg-stone-900 text-white rounded-tr-xs shadow-xs'
                            : 'bg-white border border-stone-200 text-stone-900 rounded-tl-xs shadow-2xs'
                        }`}
                      >
                        {msg.isNudge && (
                          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800 mb-1">
                            <Zap className="w-3.5 h-3.5 text-amber-600" />
                            <span>PELANGGAN MEMINTA RESPON CEPAT (NUDGE)</span>
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Reply Presets */}
              <div className="p-2.5 bg-stone-50 border-t border-stone-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                <span className="text-stone-400 text-[10px] font-bold uppercase shrink-0">
                  Balas Cepat:
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleSendReply(
                      'Halo kak! Pembayaran Anda sudah kami terima dan sedang diverifikasi. Mohon ditunggu dalam 5-10 menit ya.'
                    )
                  }
                  className="shrink-0 px-2.5 py-1 bg-white hover:bg-stone-200 border border-stone-300 rounded-lg text-stone-700 transition"
                >
                  ⏳ Sedang Diverifikasi
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSendReply(
                      'Halo kak! Undangan Anda sudah BERHASIL DIKONFIRMASI dan aktif. Anda dapat membagikan tautan atau mendownload ZIP sekarang.'
                    )
                  }
                  className="shrink-0 px-2.5 py-1 bg-white hover:bg-stone-200 border border-stone-300 rounded-lg text-stone-700 transition"
                >
                  ✅ Undangan Aktif
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSendReply(
                      'Halo! Untuk mengedit data susunan acara, silakan buka halaman status pesanan Anda lalu klik tombol "Edit Data Undangan".'
                    )
                  }
                  className="shrink-0 px-2.5 py-1 bg-white hover:bg-stone-200 border border-stone-300 rounded-lg text-stone-700 transition"
                >
                  ✏️ Petunjuk Edit Data
                </button>
              </div>

              {/* Input Reply Box */}
              <div className="p-3.5 bg-white border-t border-stone-200 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ketik balasan untuk pelanggan..."
                  value={inputReply}
                  onChange={(e) => setInputReply(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                  className="flex-1 px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  disabled={!inputReply.trim()}
                  onClick={() => handleSendReply()}
                  className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Balasan</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-stone-400 space-y-2">
              <MessageSquare className="w-10 h-10 text-stone-300" />
              <p className="text-sm font-semibold text-stone-600">Pilih Percakapan</p>
              <p className="text-xs text-stone-400">Pilih salah satu percakapan di kolom kiri untuk membalas.</p>
            </div>
          )}
        </div>
      </div>

      {/* BAN USER MODAL */}
      {banModalOpen && banTargetConvo && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-stone-900">
                Blokir Pengguna (Ban User)
              </h3>
              <p className="text-xs text-stone-500">
                Pengguna yang diblokir tidak akan bisa mengirim pesan chat atau melakukan ping permintaan.
              </p>
            </div>

            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs space-y-1">
              <p className="font-bold text-stone-800">Target Pemblokiran:</p>
              <p className="text-stone-700">Nama: <b>{banTargetConvo.userName}</b></p>
              <p className="text-stone-700">Email/Kontak: <b>{banTargetConvo.userEmail}</b></p>
              <p className="text-amber-800">Jumlah Nudge / Spam: <b>{banTargetConvo.nudgeCount || 0} kali</b></p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Alasan Pemblokiran *
              </label>
              <textarea
                rows={3}
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
                className="flex-1 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmBan}
                className="flex-1 py-2.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition"
              >
                Konfirmasi Blokir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
