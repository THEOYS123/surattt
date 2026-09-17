import { SystemDebugLog, DebugLogLevel } from '../types';
import { customerAuth } from './customerAuth';

const DEBUG_STORAGE_KEY = 'surat_debug_logs';
const MAX_LOGS = 150;

class DebugLoggerService {
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initGlobalListeners();
    }
  }

  public initGlobalListeners() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // Capture uncaught JavaScript errors
    window.addEventListener('error', (event: ErrorEvent) => {
      this.log({
        level: 'error',
        category: 'SYSTEM',
        message: event.message || 'Uncaught JavaScript Error',
        source: `${event.filename || 'script'}:${event.lineno || 0}:${event.colno || 0}`,
        stack: event.error?.stack || undefined,
        details: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      let message = 'Unhandled Promise Rejection';
      let stack: string | undefined;

      if (reason instanceof Error) {
        message = reason.message;
        stack = reason.stack;
      } else if (typeof reason === 'string') {
        message = reason;
      } else {
        try {
          message = JSON.stringify(reason);
        } catch {
          message = String(reason);
        }
      }

      this.log({
        level: 'error',
        category: 'SYSTEM',
        message: `Promise Rejection: ${message}`,
        source: 'Promise.UnhandledRejection',
        stack,
        details: typeof reason === 'object' ? reason : { reason }
      });
    });

    // Log startup
    this.log({
      level: 'info',
      category: 'SYSTEM',
      message: 'SURAT Auto-Debug Monitor aktif dan mengawasi sistem.',
      source: 'DebugLoggerService:init',
      details: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        screen: `${window.innerWidth}x${window.innerHeight}`
      }
    });
  }

  public getLogs(): SystemDebugLog[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(DEBUG_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  public log(params: {
    level: DebugLogLevel;
    category: 'CHECKOUT' | 'AUTH' | 'DATABASE' | 'UI_BUTTON' | 'SYSTEM' | 'NETWORK';
    message: string;
    source: string;
    stack?: string;
    details?: Record<string, unknown> | string;
  }): SystemDebugLog {
    const logs = this.getLogs();
    const currentUser = typeof window !== 'undefined' ? customerAuth.getCurrentUser() : null;

    const newLog: SystemDebugLog = {
      id: `DBG-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      level: params.level,
      category: params.category,
      message: params.message,
      source: params.source,
      stack: params.stack,
      details: params.details,
      path: typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/',
      userEmail: currentUser?.email || undefined,
      userId: currentUser?.id || undefined,
      timestamp: new Date().toISOString()
    };

    logs.unshift(newLog);

    if (logs.length > MAX_LOGS) {
      logs.splice(MAX_LOGS);
    }

    try {
      localStorage.setItem(DEBUG_STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      // If quota exceeded, clean up half of old logs
      try {
        const trimmed = logs.slice(0, 30);
        localStorage.setItem(DEBUG_STORAGE_KEY, JSON.stringify(trimmed));
      } catch {
        // ignore fallback
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('surat:debug-log-added', { detail: newLog }));
    }

    return newLog;
  }

  public logError(source: string, message: string, details?: Record<string, unknown> | string, errorObj?: unknown) {
    let stack: string | undefined;
    if (errorObj instanceof Error) {
      stack = errorObj.stack;
      if (!message || message === 'Error') {
        message = errorObj.message;
      }
    }
    return this.log({
      level: 'error',
      category: source.toLowerCase().includes('checkout') || source.toLowerCase().includes('order') ? 'CHECKOUT' : 'SYSTEM',
      message,
      source,
      stack,
      details
    });
  }

  public logWarning(source: string, message: string, details?: Record<string, unknown> | string) {
    return this.log({
      level: 'warn',
      category: 'SYSTEM',
      message,
      source,
      details
    });
  }

  public logInfo(source: string, message: string, details?: Record<string, unknown> | string) {
    return this.log({
      level: 'info',
      category: 'SYSTEM',
      message,
      source,
      details
    });
  }

  public logAction(buttonName: string, source: string, details?: Record<string, unknown> | string) {
    return this.log({
      level: 'action',
      category: 'UI_BUTTON',
      message: `Klik tombol: ${buttonName}`,
      source,
      details
    });
  }

  public clearLogs() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(DEBUG_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('surat:debug-log-cleared'));
  }

  public getErrorCount(): number {
    return this.getLogs().filter(l => l.level === 'error').length;
  }

  public exportLogsAsText(): string {
    const logs = this.getLogs();
    if (logs.length === 0) return 'Tidak ada log debug yang tercatat.';

    return logs.map((l, i) => {
      const time = new Date(l.timestamp).toLocaleString('id-ID');
      const header = `[#${i + 1}] [${l.level.toUpperCase()}] [${l.category}] ${time}`;
      const location = `Sumber: ${l.source} | Rute: ${l.path} | Pengguna: ${l.userEmail || 'Guest'}`;
      const msg = `Pesan: ${l.message}`;
      const stack = l.stack ? `\nStack Trace:\n${l.stack}` : '';
      const details = l.details ? `\nDetail: ${typeof l.details === 'object' ? JSON.stringify(l.details, null, 2) : l.details}` : '';
      return `${header}\n${location}\n${msg}${stack}${details}\n------------------------------------------------------------`;
    }).join('\n\n');
  }

  public exportLogsAsJson(): string {
    return JSON.stringify(this.getLogs(), null, 2);
  }

  public triggerTestError() {
    this.log({
      level: 'error',
      category: 'CHECKOUT',
      message: 'Uji Coba Auto-Debug: Simulasi kesalahan proses pembayaran & checkout.',
      source: 'TestTrigger:ManualSimulatedError',
      stack: 'Error: Simulasi Kesalahan Auto Debug\n    at DebugLoggerService.triggerTestError (debugLogger.ts:180)\n    at AdminPanel.handleTestClick (AdminPanel.tsx)',
      details: {
        testType: 'MANUAL_SIMULATION',
        testedAt: new Date().toISOString(),
        description: 'Log error ini dihasilkan secara manual untuk memverifikasi fitur Auto Debug & Salin Error.'
      }
    });
  }
}

export const debugLogger = new DebugLoggerService();
