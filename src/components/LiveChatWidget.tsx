import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Zap,
  AlertTriangle,
  Clock,
  CheckCircle,
  ShieldAlert,
  User,
  Headphones,
  Info,
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { ChatMessage, ChatConversation } from '../types';
import { db } from '../services/storage';
import { customerAuth } from '../services/customerAuth';
import { telegramService } from '../services/telegramService';

interface LiveChatWidgetProps {
  currentOrderId?: string;
}

export const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({ currentOrderId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isBanned, setIsBanned] = useState(false);
  const [banReason, setBanReason] = useState('');

  // Nudge / Expedite state
  const [nudgeCooldown, setNudgeCooldown] = useState(0);
  const [nudgeSuccess, setNudgeSuccess] = useState(false);
  const [nudgeCount, setNudgeCount] = useState(0);
  const [isNudging, setIsNudging] = useState(false);
  const [showNudgeWarningModal, setShowNudgeWarningModal] = useState(false);

  // User details form if not logged in
  const [hasStarted, setHasStarted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load user session on mount
  useEffect(() => {
    const user = customerAuth.getCurrentUser();
    if (user) {
      setUserEmail(user.email);
      setUserName(user.name);
      setHasStarted(true);
    } else {
      const savedEmail = localStorage.getItem('surat_guest_chat_email') || '';
      const savedName = localStorage.getItem('surat_guest_chat_name') || '';
      if (savedEmail && savedName) {
        setUserEmail(savedEmail);
        setUserName(savedName);
        setHasStarted(true);
      }
    }
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (nudgeCooldown > 0) {
      const timer = setTimeout(() => setNudgeCooldown(nudgeCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [nudgeCooldown]);

  // Sync conversation & messages
  const refreshChat = () => {
    if (!userEmail) return;

    // Check ban status
    const banCheck = db.isUserBanned(userEmail);
    if (banCheck.isBanned) {
      setIsBanned(true);
      setBanReason(banCheck.reason || 'Pelanggaran ketentuan atau spam.');
    } else {
      setIsBanned(false);
    }

    let convo = db.getConversationByEmail(userEmail);
    if (!convo && hasStarted && userName) {
      convo = {
        id: 'conv-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        userName: userName,
        userEmail: userEmail,
        orderId: currentOrderId,
        status: 'open',
        lastMessage: 'Memulai percakapan dengan Customer Service.',
        lastMessageAt: new Date().toISOString(),
        unreadAdminCount: 0,
        unreadUserCount: 0,
        nudgeCount: 0,
        createdAt: new Date().toISOString()
      };
      db.saveConversation(convo);
    }

    if (convo) {
      setConversation(convo);
      setNudgeCount(convo.nudgeCount || 0);
      const msgs = db.getMessages(convo.id);
      setMessages(msgs);
      if (isOpen && convo.unreadUserCount && convo.unreadUserCount > 0) {
        db.markConversationRead(convo.id, 'user');
      }
    }
  };

  useEffect(() => {
    refreshChat();

    const handleUpdate = () => refreshChat();
    window.addEventListener('surat:chat-updated', handleUpdate);
    window.addEventListener('surat:chat-message-sent', handleUpdate);
    window.addEventListener('surat:banned-updated', handleUpdate);

    return () => {
      window.removeEventListener('surat:chat-updated', handleUpdate);
      window.removeEventListener('surat:chat-message-sent', handleUpdate);
      window.removeEventListener('surat:banned-updated', handleUpdate);
    };
  }, [userEmail, hasStarted, isOpen]);

  // Auto scroll
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) return;

    localStorage.setItem('surat_guest_chat_name', userName.trim());
    localStorage.setItem('surat_guest_chat_email', userEmail.trim().toLowerCase());
    setHasStarted(true);

    const banCheck = db.isUserBanned(userEmail.trim().toLowerCase());
    if (banCheck.isBanned) {
      setIsBanned(true);
      setBanReason(banCheck.reason || 'Pelanggaran ketentuan atau spam.');
      return;
    }

    let convo = db.getConversationByEmail(userEmail.trim().toLowerCase());
    if (!convo) {
      convo = {
        id: 'conv-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        userName: userName.trim(),
        userEmail: userEmail.trim().toLowerCase(),
        orderId: currentOrderId,
        status: 'open',
        lastMessage: 'Halo, saya ingin bertanya seputar pembuatan undangan.',
        lastMessageAt: new Date().toISOString(),
        unreadAdminCount: 1,
        unreadUserCount: 0,
        nudgeCount: 0,
        createdAt: new Date().toISOString()
      };
      db.saveConversation(convo);

      // Initial welcome message
      const welcomeMsg: ChatMessage = {
        id: 'msg-welcome-' + Date.now(),
        conversationId: convo.id,
        senderRole: 'admin',
        senderName: 'Customer Support SURAT',
        text: `Halo kak ${userName}! 👋 Selamat datang di layanan Live Support SURAT. Ada yang bisa kami bantu seputar undangan atau verifikasi pesanan kakak?`,
        timestamp: new Date().toISOString()
      };
      db.sendMessage(welcomeMsg);
    }
    setConversation(convo);
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || !conversation || isBanned) return;

    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      conversationId: conversation.id,
      senderRole: 'user',
      senderName: userName || 'Pelanggan',
      text: text,
      timestamp: new Date().toISOString()
    };

    db.sendMessage(newMsg);
    setInputMessage('');
  };

  const handleConfirmNudge = async () => {
    if (!conversation || isBanned || nudgeCooldown > 0) return;

    setIsNudging(true);
    setShowNudgeWarningModal(false);

    const nudgeMsgText = '⚡ [PENGINGAT OTOMATIS]: Halo Admin, mohon bantuan dan responnya segera untuk percakapan ini. Terima kasih!';
    
    const nudgeMsg: ChatMessage = {
      id: 'nudge-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      conversationId: conversation.id,
      senderRole: 'user',
      senderName: userName || 'Pelanggan',
      text: nudgeMsgText,
      timestamp: new Date().toISOString(),
      isNudge: true
    };

    db.sendMessage(nudgeMsg);

    // Send high-priority alert to admin Telegram Bot
    try {
      await telegramService.notifyChatNudge(
        userName,
        userEmail,
        conversation.lastMessage || nudgeMsgText,
        currentOrderId
      );
    } catch {
      // safe
    }

    setNudgeCooldown(60); // 60 seconds cooldown
    setNudgeSuccess(true);
    setIsNudging(false);
    setTimeout(() => setNudgeSuccess(false), 6000);
  };

  const unreadCount = conversation?.unreadUserCount || 0;

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            if (conversation && unreadCount > 0) {
              db.markConversationRead(conversation.id, 'user');
            }
          }}
          className="fixed bottom-6 right-6 z-40 bg-stone-900 hover:bg-stone-800 text-white p-3.5 sm:px-4 sm:py-3.5 rounded-full shadow-xl flex items-center gap-2.5 transition-all transform hover:scale-105 group border border-stone-700/60 cursor-pointer"
          id="btn-live-chat-toggle"
          aria-label="Buka Live Chat Support"
        >
          <div className="relative flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-amber-400 group-hover:rotate-6 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-stone-900 animate-pulse" />
          </div>
          <span className="text-xs font-bold tracking-wide hidden sm:inline">
            Tanya Admin / Live Chat
          </span>
          {unreadCount > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* CHAT WINDOW MODAL */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[85vh] h-[560px] bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-stone-900 text-white px-4 py-3.5 flex items-center justify-between border-b border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Headphones className="w-4 h-4" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-stone-900" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Customer Support SURAT</span>
                </h3>
                <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Online • Siap Menjawab</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
                title="Tutup Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* BAN NOTICE IF USER IS BANNED */}
          {isBanned && (
            <div className="p-4 bg-rose-50 border-b border-rose-200 flex items-start gap-3 text-rose-900">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-rose-800">Akun Anda Telah Diblokir (Banned)</p>
                <p className="text-rose-700">
                  Alasan: <i>{banReason}</i>
                </p>
                <p className="text-[11px] text-rose-600">
                  Anda tidak dapat mengirimkan pesan atau melakukan ping. Hubungi WhatsApp admin resmi jika ada kekeliruan.
                </p>
              </div>
            </div>
          )}

          {/* NUDGE SUCCESS BANNER */}
          {nudgeSuccess && (
            <div className="px-3 py-2 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Notifikasi prioritas terkirim ke bot admin Telegram!</span>
            </div>
          )}

          {/* MAIN CHAT BODY */}
          {!hasStarted ? (
            /* First time entry form */
            <form onSubmit={handleStartChat} className="flex-1 p-5 flex flex-col justify-center space-y-4 bg-stone-50">
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
                  <Sparkles className="w-6 h-6 text-amber-600" />
                </div>
                <h4 className="text-sm font-bold text-stone-900">Mulai Percakapan</h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Isi nama & kontak Anda agar admin kami dapat melayani dan memverifikasi pesanan Anda dengan cepat.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rian Anggara"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Email / No. WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="nama@email.com / 08123456789"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Mulai Chat Sekarang
              </button>
            </form>
          ) : (
            /* Messages list */
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-stone-50/50">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-stone-400 space-y-2">
                  <Headphones className="w-8 h-8 text-stone-300" />
                  <p className="text-xs text-stone-600 font-medium">Belum ada percakapan.</p>
                  <p className="text-[11px] text-stone-400">Kirim pesan pertama Anda di bawah untuk mulai mengobrol.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderRole === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <div className="flex items-center gap-1.5 px-1">
                        <span className="text-[10px] font-bold text-stone-500">
                          {isMe ? 'Anda' : msg.senderName || 'Admin'}
                        </span>
                        <span className="text-[9px] text-stone-400 font-mono">
                          {new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div
                        className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                          msg.isNudge
                            ? 'bg-amber-100 border border-amber-300 text-amber-900 font-medium shadow-xs'
                            : isMe
                            ? 'bg-stone-900 text-white rounded-tr-xs shadow-xs'
                            : 'bg-white border border-stone-200 text-stone-800 rounded-tl-xs shadow-2xs'
                        }`}
                      >
                        {msg.isNudge && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700 mb-1 uppercase tracking-wider">
                            <Zap className="w-3 h-3 text-amber-600" />
                            <span>Permintaan Percepat Respon</span>
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
          )}

          {/* QUICK SUGGESTIONS & NUDGE ADMIN BUTTON */}
          {hasStarted && !isBanned && (
            <div className="p-2.5 bg-stone-100/90 border-t border-stone-200 space-y-2">
              {/* Quick Prompt Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
                <button
                  type="button"
                  onClick={() => handleSendMessage('Halo admin, berapa lama proses verifikasi pembayaran?')}
                  className="shrink-0 px-2.5 py-1 bg-white hover:bg-stone-200 border border-stone-300 rounded-full text-stone-700 transition cursor-pointer"
                >
                  ⏱️ Lama verifikasi?
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Bagaimana cara mengedit susunan acara yang sudah disimpan?')}
                  className="shrink-0 px-2.5 py-1 bg-white hover:bg-stone-200 border border-stone-300 rounded-full text-stone-700 transition cursor-pointer"
                >
                  ✏️ Cara edit acara?
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Apakah saya bisa ganti lagu background undangan?')}
                  className="shrink-0 px-2.5 py-1 bg-white hover:bg-stone-200 border border-stone-300 rounded-full text-stone-700 transition cursor-pointer"
                >
                  🎵 Ganti lagu?
                </button>
              </div>

              {/* Nudge / Slow-response Alert Button */}
              <div className="pt-1 flex items-center justify-between gap-2 border-t border-stone-200/70">
                <button
                  type="button"
                  disabled={nudgeCooldown > 0 || isNudging}
                  onClick={() => setShowNudgeWarningModal(true)}
                  className="text-[11px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 disabled:opacity-50 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                  title="Klik untuk mengirimkan ping prioritas ke Telegram bot admin jika belum direspon"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>
                    {nudgeCooldown > 0
                      ? `Tunggu ${nudgeCooldown}s untuk kirim ulang`
                      : '⚡ Admin Slow Respon? Klik untuk Percepat'}
                  </span>
                </button>

                <span className="text-[10px] text-stone-400">
                  {nudgeCount > 0 ? `Terkirim: ${nudgeCount}x` : ''}
                </span>
              </div>
            </div>
          )}

          {/* INPUT BAR */}
          {hasStarted && !isBanned && (
            <div className="p-3 bg-white border-t border-stone-200 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ketik pesan Anda..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
              />
              <button
                type="button"
                disabled={!inputMessage.trim()}
                onClick={() => handleSendMessage()}
                className="p-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white rounded-xl transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* WARNING MODAL BEFORE SENDING NUDGE */}
      {showNudgeWarningModal && (
        <div className="fixed inset-0 z-60 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 space-y-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>

            <div className="text-center space-y-1.5">
              <h4 className="text-sm font-bold text-stone-900">
                Peringatan: Fitur Pengingat Respon Admin
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Fitur ini akan mengirimkan notifikasi <b>prioritas tinggi</b> langsung ke Telegram admin.
              </p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1 text-amber-800">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                <span>Aturan Anti-Spam:</span>
              </p>
              <p>
                Harap gunakan tombol ini secara bijak. <b>Dilarang melakukan spam atau klik berulang kali</b> tanpa alasan yang wajar. Akun/sesi yang terdeteksi spam akan otomatis diblokir (<b>BANNED</b>) oleh sistem admin.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNudgeWarningModal(false)}
                className="flex-1 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmNudge}
                className="flex-1 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Ya, Ingatkan Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
