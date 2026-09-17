import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  ExternalLink,
  Lock,
  LogIn,
  UserPlus,
  ShieldCheck,
  GripVertical,
  RotateCcw,
  Move
} from 'lucide-react';
import { ChatMessage, ChatConversation, UserAccount, SiteSettings } from '../types';
import { db } from '../services/storage';
import { customerAuth } from '../services/customerAuth';
import { telegramService } from '../services/telegramService';
import { securityService } from '../services/security';

interface LiveChatWidgetProps {
  currentOrderId?: string;
  currentUser?: UserAccount | null;
}

interface PositionCoords {
  x: number;
  y: number;
}

export const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({ currentOrderId, currentUser: propUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => propUser || customerAuth.getCurrentUser());
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isBanned, setIsBanned] = useState(false);
  const [banReason, setBanReason] = useState('');

  // Site Settings for widget positioning & customization
  const [settings, setSettings] = useState<SiteSettings>(() => db.getSettings());

  // Draggable button positioning state
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [buttonPos, setButtonPos] = useState<PositionCoords | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasMovedFar, setHasMovedFar] = useState(false);
  const [hasCustomDraggedPos, setHasCustomDraggedPos] = useState(false);

  // Compute position from admin settings
  const computeInitialPosition = useCallback((st: SiteSettings): PositionCoords => {
    if (typeof window === 'undefined') return { x: 100, y: 100 };
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const btnW = buttonRef.current?.offsetWidth || 210;
    const btnH = buttonRef.current?.offsetHeight || 50;

    const offsetX = Math.max(8, Number(st.chatWidgetOffsetX ?? 24));
    const offsetY = Math.max(8, Number(st.chatWidgetOffsetY ?? 24));

    let x = winW - btnW - offsetX;
    let y = winH - btnH - offsetY;

    const preset = st.chatWidgetPosition || 'bottom-right';

    switch (preset) {
      case 'bottom-left':
        x = offsetX;
        y = winH - btnH - offsetY;
        break;
      case 'top-right':
        x = winW - btnW - offsetX;
        y = offsetY;
        break;
      case 'top-left':
        x = offsetX;
        y = offsetY;
        break;
      case 'custom':
        x = typeof st.chatWidgetCustomX === 'number' ? st.chatWidgetCustomX : winW - btnW - offsetX;
        y = typeof st.chatWidgetCustomY === 'number' ? st.chatWidgetCustomY : winH - btnH - offsetY;
        break;
      case 'bottom-right':
      default:
        x = winW - btnW - offsetX;
        y = winH - btnH - offsetY;
        break;
    }

    // Clamp inside viewport
    const clampedX = Math.max(8, Math.min(winW - btnW - 8, x));
    const clampedY = Math.max(8, Math.min(winH - btnH - 8, y));

    return { x: clampedX, y: clampedY };
  }, []);

  // Initialize or re-evaluate position
  useEffect(() => {
    const handleSettingsUpdate = (e?: Event) => {
      const updated = db.getSettings();
      setSettings(updated);
      // If user hasn't actively dragged it in this session, adhere to new admin settings
      try {
        const savedSession = sessionStorage.getItem('surat_chat_widget_user_pos');
        if (!savedSession) {
          setButtonPos(computeInitialPosition(updated));
          setHasCustomDraggedPos(false);
        }
      } catch {
        setButtonPos(computeInitialPosition(updated));
      }
    };

    // Load from session storage if dragged previously
    try {
      const savedSession = sessionStorage.getItem('surat_chat_widget_user_pos');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          // Verify it's within viewport bounds
          const btnW = 210;
          const btnH = 50;
          const clampedX = Math.max(8, Math.min(window.innerWidth - btnW - 8, parsed.x));
          const clampedY = Math.max(8, Math.min(window.innerHeight - btnH - 8, parsed.y));
          setButtonPos({ x: clampedX, y: clampedY });
          setHasCustomDraggedPos(true);
        } else {
          setButtonPos(computeInitialPosition(settings));
        }
      } else {
        setButtonPos(computeInitialPosition(settings));
      }
    } catch {
      setButtonPos(computeInitialPosition(settings));
    }

    window.addEventListener('surat:settings-updated', handleSettingsUpdate);
    const handleResize = () => {
      setButtonPos(prev => {
        if (!prev) return computeInitialPosition(settings);
        const btnW = buttonRef.current?.offsetWidth || 210;
        const btnH = buttonRef.current?.offsetHeight || 50;
        return {
          x: Math.max(8, Math.min(window.innerWidth - btnW - 8, prev.x)),
          y: Math.max(8, Math.min(window.innerHeight - btnH - 8, prev.y))
        };
      });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('surat:settings-updated', handleSettingsUpdate);
      window.removeEventListener('resize', handleResize);
    };
  }, [computeInitialPosition, settings]);

  // Reset to default admin position
  const handleResetPosition = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      sessionStorage.removeItem('surat_chat_widget_user_pos');
    } catch {}
    const fresh = computeInitialPosition(settings);
    setButtonPos(fresh);
    setHasCustomDraggedPos(false);
  };

  // Drag logic handling (Mouse & Touch)
  const dragRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  }>({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  const startDrag = (clientX: number, clientY: number) => {
    if (settings.chatWidgetDraggable === false) return;
    const current = buttonPos || computeInitialPosition(settings);
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      initialX: current.x,
      initialY: current.y
    };
    setIsDragging(true);
    setHasMovedFar(false);
  };

  useEffect(() => {
    if (!isDragging) return;

    const onPointerMove = (clientX: number, clientY: number) => {
      const deltaX = clientX - dragRef.current.startX;
      const deltaY = clientY - dragRef.current.startY;
      const dist = Math.hypot(deltaX, deltaY);
      if (dist > 6) {
        setHasMovedFar(true);
      }

      const btnW = buttonRef.current?.offsetWidth || 210;
      const btnH = buttonRef.current?.offsetHeight || 50;
      const newX = Math.max(8, Math.min(window.innerWidth - btnW - 8, dragRef.current.initialX + deltaX));
      const newY = Math.max(8, Math.min(window.innerHeight - btnH - 8, dragRef.current.initialY + deltaY));

      setButtonPos({ x: newX, y: newY });
    };

    const onMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      onPointerMove(e.clientX, e.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onPointerEnd = () => {
      setIsDragging(false);
      if (hasMovedFar) {
        setHasCustomDraggedPos(true);
        if (buttonPos) {
          try {
            sessionStorage.setItem('surat_chat_widget_user_pos', JSON.stringify(buttonPos));
          } catch {}
        }
      }
    };

    const onMouseUp = () => onPointerEnd();
    const onTouchEnd = () => onPointerEnd();

    window.addEventListener('mousemove', onMouseMove, { passive: false });
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, hasMovedFar, buttonPos]);

  // Nudge / Expedite state
  const [nudgeCooldown, setNudgeCooldown] = useState(0);
  const [nudgeSuccess, setNudgeSuccess] = useState(false);
  const [nudgeCount, setNudgeCount] = useState(0);
  const [isNudging, setIsNudging] = useState(false);
  const [showNudgeWarningModal, setShowNudgeWarningModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync current user session
  useEffect(() => {
    const handleAuthChange = () => {
      const user = customerAuth.getCurrentUser();
      setCurrentUser(user);
      if (user) {
        setUserEmail(user.email);
        setUserName(user.name || user.username);
      } else {
        setUserEmail('');
        setUserName('');
        setConversation(null);
        setMessages([]);
      }
    };

    handleAuthChange();
    window.addEventListener('surat:auth-changed', handleAuthChange);
    return () => window.removeEventListener('surat:auth-changed', handleAuthChange);
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
    const user = currentUser || customerAuth.getCurrentUser();
    if (!user || !user.email) {
      setIsBanned(false);
      return;
    }

    const email = user.email.trim().toLowerCase();
    const name = (user.name || user.username || 'Pelanggan').trim();

    // Check ban status thoroughly
    const banCheck = db.isUserBanned(email, [user.username, user.phone, user.id]);
    if (banCheck.isBanned) {
      setIsBanned(true);
      setBanReason(banCheck.reason || 'Pelanggaran ketentuan sistem atau spamming.');
    } else {
      setIsBanned(false);
    }

    let convo = db.getConversationByEmail(email);
    if (!convo) {
      convo = {
        id: 'conv-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        userId: user.id,
        userName: name,
        userEmail: email,
        userPhone: user.phone,
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

      // Initial greeting from Admin
      const welcomeMsg: ChatMessage = {
        id: 'msg-welcome-' + Date.now(),
        conversationId: convo.id,
        senderRole: 'admin',
        senderName: 'Customer Support SURAT',
        text: `Halo kak ${name}! 👋 Selamat datang di Live Support SURAT. Ada yang bisa kami bantu seputar pesanan atau undangan kakak?`,
        timestamp: new Date().toISOString()
      };
      db.sendMessage(welcomeMsg);
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
  }, [currentUser, isOpen]);

  // Auto scroll
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = (textToSend?: string) => {
    const rawText = (textToSend || inputMessage).trim();
    if (!rawText || !conversation || isBanned || !currentUser) return;

    // Cyber Security: Sanitize user input to prevent XSS
    const sanitized = securityService.sanitizeText(rawText);
    if (!sanitized) return;

    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      conversationId: conversation.id,
      senderRole: 'user',
      senderId: currentUser.id || currentUser.email,
      senderName: currentUser.name || currentUser.username || userName || 'Pelanggan',
      text: sanitized,
      timestamp: new Date().toISOString()
    };

    db.sendMessage(newMsg);
    setInputMessage('');
  };

  const handleConfirmNudge = async () => {
    if (!conversation || isBanned || nudgeCooldown > 0 || !currentUser) return;

    setIsNudging(true);
    setShowNudgeWarningModal(false);

    const nudgeMsgText = '⚡ [PENGINGAT OTOMATIS]: Halo Admin, mohon bantuan dan responnya segera untuk percakapan ini. Terima kasih!';
    
    const nudgeMsg: ChatMessage = {
      id: 'nudge-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      conversationId: conversation.id,
      senderRole: 'user',
      senderId: currentUser.id || currentUser.email,
      senderName: currentUser.name || currentUser.username || 'Pelanggan',
      text: nudgeMsgText,
      timestamp: new Date().toISOString(),
      isNudge: true
    };

    db.sendMessage(nudgeMsg);

    // Send high-priority alert to admin Telegram Bot
    try {
      await telegramService.notifyChatNudge(
        currentUser.name || currentUser.username,
        currentUser.email,
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

  if (settings.chatWidgetEnabled === false) {
    return null;
  }

  // Calculate modal dynamic anchor position based on current button location
  const getModalStyle = (): React.CSSProperties => {
    if (typeof window === 'undefined') return {};
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    
    // On small screens, fixed at bottom-4 with responsive margins
    if (winW < 640) {
      return {
        bottom: '16px',
        left: '12px',
        right: '12px',
        width: 'calc(100vw - 24px)'
      };
    }

    if (!buttonPos) {
      return {
        bottom: '16px',
        right: '16px'
      };
    }

    const modalW = 384;
    const modalH = 560;

    const style: React.CSSProperties = {};

    // Horizontal placement
    if (buttonPos.x < winW / 2) {
      style.left = `${Math.max(12, Math.min(winW - modalW - 12, buttonPos.x))}px`;
    } else {
      style.right = `${Math.max(12, Math.min(winW - modalW - 12, winW - buttonPos.x - (buttonRef.current?.offsetWidth || 210)))}px`;
    }

    // Vertical placement
    if (buttonPos.y < winH / 2) {
      // Place downwards if space permits, or clamped
      style.top = `${Math.max(12, Math.min(winH - modalH - 12, buttonPos.y + 56))}px`;
    } else {
      // Place upwards from button
      style.bottom = `${Math.max(12, Math.min(winH - modalH - 12, winH - buttonPos.y))}px`;
    }

    return style;
  };

  return (
    <>
      {/* Floating Chat Button (Draggable & Admin Configurable) */}
      {!isOpen && (
        <div
          style={{
            position: 'fixed',
            left: buttonPos ? `${buttonPos.x}px` : undefined,
            top: buttonPos ? `${buttonPos.y}px` : undefined,
            bottom: !buttonPos ? '24px' : undefined,
            right: !buttonPos ? '24px' : undefined,
            zIndex: 40,
            touchAction: 'none'
          }}
          className="flex items-center gap-1.5"
        >
          <button
            ref={buttonRef}
            type="button"
            onMouseDown={(e) => {
              if (e.button !== 0) return;
              startDrag(e.clientX, e.clientY);
            }}
            onTouchStart={(e) => {
              if (e.touches.length > 0) {
                startDrag(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            onClick={(e) => {
              if (hasMovedFar) {
                e.preventDefault();
                e.stopPropagation();
                return;
              }
              setIsOpen(true);
              if (conversation && unreadCount > 0) {
                db.markConversationRead(conversation.id, 'user');
              }
            }}
            className={`bg-stone-900 hover:bg-stone-800 text-white p-3.5 sm:px-4 sm:py-3.5 rounded-full shadow-2xl flex items-center gap-2.5 transition-all select-none border border-stone-700/80 group ${
              isDragging ? 'cursor-grabbing scale-105 shadow-amber-500/20 ring-2 ring-amber-500' : 'cursor-grab hover:scale-105'
            }`}
            id="btn-live-chat-toggle"
            aria-label="Buka Live Chat Support"
            title={settings.chatWidgetDraggable !== false ? "Klik untuk chat • Tahan dan geser untuk memindahkan posisi" : "Klik untuk chat"}
          >
            {settings.chatWidgetDraggable !== false && (
              <div
                className="text-stone-400 group-hover:text-stone-200 transition-colors -ml-1 cursor-grab active:cursor-grabbing"
                title="Geser posisi"
              >
                <GripVertical className="w-3.5 h-3.5" />
              </div>
            )}
            <div className="relative flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-amber-400 group-hover:rotate-6 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-stone-900 animate-pulse" />
            </div>
            <span className="text-xs font-bold tracking-wide hidden sm:inline whitespace-nowrap">
              {settings.chatWidgetLabel || 'Tanya Admin / Live Chat'}
            </span>
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Reset position button if user moved it away from default */}
          {hasCustomDraggedPos && (
            <button
              type="button"
              onClick={handleResetPosition}
              title="Reset ke posisi awal admin"
              className="w-7 h-7 rounded-full bg-stone-900/90 hover:bg-stone-800 text-stone-400 hover:text-amber-400 border border-stone-700 flex items-center justify-center shadow-lg transition-all cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* CHAT WINDOW MODAL */}
      {isOpen && (
        <div
          style={getModalStyle()}
          className="fixed z-50 w-[calc(100vw-1.5rem)] sm:w-96 max-h-[85vh] h-[560px] bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-3"
        >
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
          {!currentUser ? (
            /* Login required gateway */
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4 bg-stone-50">
              <div className="w-14 h-14 bg-amber-100/90 text-amber-800 rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-amber-200">
                <Lock className="w-7 h-7 text-amber-700" />
              </div>
              <div className="space-y-1.5 max-w-xs">
                <h4 className="text-sm font-bold text-stone-900">Masuk untuk Mengobrol</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Untuk keamanan dan verifikasi pesanan, fitur Live Chat dengan Admin hanya dapat diakses oleh pelanggan yang telah masuk (login).
                </p>
              </div>

              <div className="w-full max-w-xs space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('surat:open-auth-modal', {
                      detail: { tab: 'login', message: 'Silakan masuk ke akun Anda untuk mulai mengobrol dengan Admin.' }
                    }));
                  }}
                  className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4 text-amber-400" />
                  <span>Masuk ke Akun Saya</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('surat:open-auth-modal', {
                      detail: { tab: 'register', message: 'Daftar akun gratis untuk menghubungi Admin.' }
                    }));
                  }}
                  className="w-full py-2.5 px-4 bg-white hover:bg-stone-100 text-stone-700 font-bold text-xs rounded-xl border border-stone-300 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4 text-stone-500" />
                  <span>Daftar Akun Baru (Gratis)</span>
                </button>
              </div>

              <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Enkripsi & Perlindungan Siber Aktif</span>
              </div>
            </div>
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
          {currentUser && !isBanned && (
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
          {currentUser && !isBanned && (
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
