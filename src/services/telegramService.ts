import { Order, SiteSettings } from '../types';
import { db } from './storage';

export interface TelegramSendResult {
  success: boolean;
  message: string;
  response?: any;
}

export const telegramService = {
  /**
   * Verify whether the bot token is valid by calling Telegram getMe
   */
  async verifyBotToken(token: string): Promise<{ success: boolean; botName?: string; username?: string; message: string }> {
    const cleanToken = token.trim();
    if (!cleanToken) {
      return { success: false, message: 'Bot Token Telegram belum diisi.' };
    }

    try {
      const res = await fetch(`https://api.telegram.org/bot${cleanToken}/getMe`);
      const data = await res.json();
      if (data.ok) {
        return {
          success: true,
          botName: data.result.first_name,
          username: data.result.username,
          message: `Bot terhubung: @${data.result.username} (${data.result.first_name})`
        };
      } else {
        return {
          success: false,
          message: data.description || 'Token Bot Telegram tidak valid.'
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: 'Gagal terhubung ke server Telegram: ' + (err.message || String(err))
      };
    }
  },

  /**
   * Send a general text/HTML message via Telegram Bot
   */
  async sendMessage(
    text: string,
    customSettings?: { token?: string; chatId?: string }
  ): Promise<TelegramSendResult> {
    const settings = db.getSettings();
    const token = (customSettings?.token || settings.telegramBotToken || '').trim();
    const chatId = (customSettings?.chatId || settings.telegramChatId || '').trim();

    if (!token) {
      return { success: false, message: 'Bot Token Telegram belum diatur.' };
    }
    if (!chatId) {
      return { success: false, message: 'Chat ID / Channel ID Telegram belum diatur.' };
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML',
          disable_web_page_preview: false
        })
      });

      const data = await response.json();
      if (data.ok) {
        return { success: true, message: 'Pesan Telegram berhasil terkirim.', response: data.result };
      } else {
        return {
          success: false,
          message: data.description || 'Gagal mengirim pesan Telegram.'
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: 'Koneksi ke Telegram gagal: ' + (err.message || String(err))
      };
    }
  },

  /**
   * Send Test Notification from Admin Panel
   */
  async sendTestMessage(token: string, chatId: string): Promise<TelegramSendResult> {
    const now = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      dateStyle: 'full',
      timeStyle: 'medium'
    });

    const text = `
<b>🔔 TEST KONEKSI BOT TELEGRAM SURAT</b>
━━━━━━━━━━━━━━━━━━━━
✅ <b>Status:</b> Terhubung & Siap Menerima Notifikasi
⏰ <b>Waktu:</b> ${now} WIB
🌐 <b>Platform:</b> SURAT - Undangan Digital

<i>Bot ini akan otomatis melaporkan setiap kali ada pesanan baru dan permintaan percepat order dari pelanggan.</i>
━━━━━━━━━━━━━━━━━━━━
`;
    return this.sendMessage(text.trim(), { token, chatId });
  },

  /**
   * Automatic report when a new order is created or checkout payment proof is submitted
   */
  async notifyNewOrder(order: Order, overrideSettings?: SiteSettings): Promise<TelegramSendResult> {
    const settings = overrideSettings || db.getSettings();
    if (!settings.telegramEnabled || !settings.telegramNotifyOnOrder) {
      return { success: false, message: 'Notifikasi Telegram untuk pesanan baru dinonaktifkan.' };
    }

    const d = (order.invitationData || {}) as Record<string, any>;
    const domainUrl = typeof window !== 'undefined' ? window.location.origin : 'https://suratttt.netlify.app';
    const invitationLink = `${domainUrl}/${order.slug.replace(/^\//, '')}`;
    const statusPageLink = `${domainUrl}/status/${order.id}`;

    const now = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const text = `
<b>🛒 PESANAN UNDANGAN BARU MASUK!</b>
━━━━━━━━━━━━━━━━━━━━
📋 <b>ID Pesanan:</b> <code>${order.id}</code>
👤 <b>Pelanggan:</b> <b>${escapeHtml(order.customerName)}</b>
📱 <b>WhatsApp:</b> <a href="https://wa.me/${cleanPhoneForWa(order.whatsapp)}">${escapeHtml(order.whatsapp)}</a>
✉️ <b>Email:</b> ${escapeHtml(order.email)}

💍 <b>Judul:</b> ${escapeHtml(d.title || 'Undangan Digital')}
🔗 <b>Slug URL:</b> <code>/${order.slug}</code>
💰 <b>Total Harga:</b> <b>Rp${(order.price || 5000).toLocaleString('id-ID')}</b>
💳 <b>Status Bayar:</b> <b>${order.paymentStatus === 'PAID' ? '✅ LUNAS' : order.paymentStatus === 'PENDING' ? '⏳ MENUNGGU VERIFIKASI' : '✕ DITOLAK'}</b>

📅 <b>Tanggal Acara:</b> ${escapeHtml(d.eventDate || '-')} (${escapeHtml(d.startTime || '')} WIB)
📍 <b>Lokasi:</b> ${escapeHtml(d.venueName || '-')}

⏰ <b>Dibuat:</b> ${now} WIB
━━━━━━━━━━━━━━━━━━━━
🔗 <a href="${statusPageLink}">Buka Status Pesanan</a> | <a href="${invitationLink}">Pratinjau Undangan</a>
`;

    return this.sendMessage(text.trim());
  },

  /**
   * Notification triggered when a customer clicks "⚡ Ingatkan Owner / Percepat Pesanan"
   */
  async notifyExpediteRequest(
    order: Order,
    customerNote?: string,
    overrideSettings?: SiteSettings
  ): Promise<TelegramSendResult> {
    const settings = overrideSettings || db.getSettings();
    if (!settings.telegramEnabled || !settings.telegramNotifyOnReminder) {
      return { success: false, message: 'Fitur notifikasi pengingat ke Telegram tidak aktif.' };
    }

    const domainUrl = typeof window !== 'undefined' ? window.location.origin : 'https://suratttt.netlify.app';
    const statusPageLink = `${domainUrl}/status/${order.id}`;
    const adminPanelLink = `${domainUrl}/admin`;

    const now = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      dateStyle: 'medium',
      timeStyle: 'medium'
    });

    const text = `
<b>⚡ PERMINTAAN PERCEPAT PESANAN / INGATKAN OWNER!</b>
━━━━━━━━━━━━━━━━━━━━
🚨 <b>Prioritas:</b> TINGGI (Pelanggan Meminta Verifikasi Segera)
📋 <b>ID Pesanan:</b> <code>${order.id}</code>
👤 <b>Nama:</b> <b>${escapeHtml(order.customerName)}</b>
📱 <b>Hubungi via WA:</b> <a href="https://wa.me/${cleanPhoneForWa(order.whatsapp)}">${escapeHtml(order.whatsapp)}</a>
✉️ <b>Email:</b> ${escapeHtml(order.email)}
🔗 <b>Undangan:</b> <code>/${order.slug}</code>
💰 <b>Nominal:</b> Rp${(order.price || 5000).toLocaleString('id-ID')}

${customerNote ? `💬 <b>Pesan dari Pemesan:</b>\n<i>"${escapeHtml(customerNote)}"</i>\n` : ''}
⏰ <b>Waktu Permintaan:</b> ${now} WIB
━━━━━━━━━━━━━━━━━━━━
👉 <a href="${statusPageLink}">Buka & Periksa Bukti Transfer</a> | <a href="${adminPanelLink}">Buka Admin Panel</a>
`;

    return this.sendMessage(text.trim());
  }
};

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function cleanPhoneForWa(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }
  return cleaned;
}
