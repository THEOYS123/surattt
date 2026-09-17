import React, { useState, useEffect, useMemo } from 'react';
import {
  Terminal,
  Bug,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  Info,
  Sparkles,
  Search,
  Filter,
  Activity,
  Code,
  Globe,
  User,
  Clock,
  Layers,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { SystemDebugLog, DebugLogLevel } from '../types';
import { debugLogger } from '../services/debugLogger';
import { safeCopyToClipboard } from '../utils/clipboard';

export const AdminAutoDebugManager: React.FC = () => {
  const [logs, setLogs] = useState<SystemDebugLog[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyAllSuccess, setCopyAllSuccess] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const loadLogs = () => {
    setLogs(debugLogger.getLogs());
  };

  useEffect(() => {
    loadLogs();

    const handleNewLog = () => {
      loadLogs();
    };

    const handleClear = () => {
      setLogs([]);
    };

    window.addEventListener('surat:debug-log-added', handleNewLog);
    window.addEventListener('surat:debug-log-cleared', handleClear);

    return () => {
      window.removeEventListener('surat:debug-log-added', handleNewLog);
      window.removeEventListener('surat:debug-log-cleared', handleClear);
    };
  }, []);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Level filter
      if (selectedLevel !== 'all' && log.level !== selectedLevel) return false;
      // Category filter
      if (selectedCategory !== 'all' && log.category !== selectedCategory) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchMessage = log.message.toLowerCase().includes(q);
        const matchSource = log.source.toLowerCase().includes(q);
        const matchPath = log.path.toLowerCase().includes(q);
        const matchUser = log.userEmail?.toLowerCase().includes(q) || false;
        const matchStack = log.stack?.toLowerCase().includes(q) || false;
        const matchDetails = typeof log.details === 'string'
          ? log.details.toLowerCase().includes(q)
          : JSON.stringify(log.details || {}).toLowerCase().includes(q);

        if (!matchMessage && !matchSource && !matchPath && !matchUser && !matchStack && !matchDetails) {
          return false;
        }
      }
      return true;
    });
  }, [logs, selectedLevel, selectedCategory, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const errorCount = logs.filter((l) => l.level === 'error').length;
    const warnCount = logs.filter((l) => l.level === 'warn').length;
    const actionCount = logs.filter((l) => l.level === 'action').length;
    const infoCount = logs.filter((l) => l.level === 'info').length;
    return {
      total: logs.length,
      errorCount,
      warnCount,
      actionCount,
      infoCount
    };
  }, [logs]);

  // Handle Copy Single Error
  const handleCopySingleError = (log: SystemDebugLog) => {
    const timeStr = new Date(log.timestamp).toLocaleString('id-ID');
    const content = `[SURAT AUTO-DEBUG ERROR REPORT]
Waktu: ${timeStr}
Tingkat: ${log.level.toUpperCase()}
Kategori: ${log.category}
Sumber: ${log.source}
Halaman/Rute: ${log.path}
Pengguna: ${log.userEmail || 'Guest (Belum Login)'}
Pesan Error: ${log.message}
${log.stack ? `\nStack Trace:\n${log.stack}` : ''}
${log.details ? `\nDetail Tambahan:\n${typeof log.details === 'object' ? JSON.stringify(log.details, null, 2) : log.details}` : ''}
------------------------------------------------------------
Browser: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'}
URL: ${typeof window !== 'undefined' ? window.location.href : 'Unknown'}`;

    safeCopyToClipboard(content);
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Handle Copy All Errors
  const handleCopyAllErrors = () => {
    const onlyErrors = logs.filter((l) => l.level === 'error');
    if (onlyErrors.length === 0) {
      safeCopyToClipboard('Tidak ada error yang terdeteksi saat ini. Sistem berjalan normal.');
    } else {
      const formatted = `=== LAPORAN SEMUA ERROR SURAT AUTO-DEBUG (${onlyErrors.length} TERDETEKSI) ===\n` +
        `Tanggal Laporan: ${new Date().toLocaleString('id-ID')}\n\n` +
        onlyErrors.map((l, idx) => {
          return `[#${idx + 1}] [${l.category}] ${new Date(l.timestamp).toLocaleTimeString('id-ID')}
Sumber: ${l.source}
Rute: ${l.path}
Pengguna: ${l.userEmail || 'Guest'}
Pesan: ${l.message}
${l.stack ? `Stack:\n${l.stack}\n` : ''}
------------------------------------------------------------`;
        }).join('\n\n');

      safeCopyToClipboard(formatted);
    }

    setCopyAllSuccess(true);
    setTimeout(() => setCopyAllSuccess(false), 2500);
  };

  // Handle Copy All Logs JSON
  const handleCopyJson = () => {
    safeCopyToClipboard(JSON.stringify(logs, null, 2));
    setCopyAllSuccess(true);
    setTimeout(() => setCopyAllSuccess(false), 2500);
  };

  // Handle Clear Logs
  const handleClearLogs = () => {
    if (window.confirm('Yakin ingin menghapus semua riwayat log auto-debug ini?')) {
      debugLogger.clearLogs();
      setLogs([]);
    }
  };

  // Trigger test error
  const handleTriggerTestError = () => {
    debugLogger.triggerTestError();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Header */}
      <div className="bg-stone-900 text-stone-100 rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="space-y-2 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-serif-display text-white tracking-tight flex items-center gap-2">
                <span>Auto-Debug & Log Kesalahan Sistem</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-medium border border-emerald-500/30">
                  REALTIME
                </span>
              </h1>
              <p className="text-xs text-stone-400 mt-0.5">
                Memantau setiap interaksi tombol, galat runtime, kegagalan transaksi checkout, dan status sistem secara otomatis.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 z-10">
          <button
            type="button"
            onClick={handleCopyAllErrors}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
            title="Salin semua pesan error ke clipboard untuk laporan"
          >
            {copyAllSuccess ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>{copyAllSuccess ? 'Tersalin!' : 'Copy Semua Error'}</span>
          </button>

          <button
            type="button"
            onClick={handleTriggerTestError}
            className="px-3.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            title="Kirim simulasi error untuk mengetes kemampuan logging"
          >
            <Bug className="w-4 h-4 text-amber-400" />
            <span>Tes Error</span>
          </button>

          <button
            type="button"
            onClick={handleClearLogs}
            className="px-3 py-2.5 bg-stone-800/80 hover:bg-rose-900/40 text-stone-300 hover:text-rose-300 border border-stone-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            title="Bersihkan seluruh log"
          >
            <Trash2 className="w-4 h-4" />
            <span>Bersihkan</span>
          </button>

          <button
            type="button"
            onClick={loadLogs}
            className="p-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl transition-all cursor-pointer"
            title="Muat Ulang Log"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => setSelectedLevel('error')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedLevel === 'error'
              ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-400/20 shadow-xs'
              : 'bg-white border-stone-200 hover:border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Error Runtime</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black font-mono text-rose-600 mt-2">
            {stats.errorCount}
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">Kesalahan sistem atau tombol</p>
        </div>

        <div
          onClick={() => setSelectedLevel('warn')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedLevel === 'warn'
              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
              : 'bg-white border-stone-200 hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Peringatan</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-600 mt-2">
            {stats.warnCount}
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">Validasi & anomali input</p>
        </div>

        <div
          onClick={() => setSelectedLevel('action')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedLevel === 'action'
              ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-400/20 shadow-xs'
              : 'bg-white border-stone-200 hover:border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Aksi Tombol</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black font-mono text-blue-600 mt-2">
            {stats.actionCount}
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">Interaksi checkout & form</p>
        </div>

        <div
          onClick={() => setSelectedLevel('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedLevel === 'all'
              ? 'bg-stone-100 border-stone-400 ring-2 ring-stone-400/20 shadow-xs'
              : 'bg-white border-stone-200 hover:border-stone-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">Total Log</span>
            <Layers className="w-4 h-4 text-stone-500" />
          </div>
          <div className="text-2xl font-black font-mono text-stone-900 mt-2">
            {stats.total}
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">Semua jejak log di browser</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari pesan error, nama fungsi/komponen, rute, atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Level Filter Dropdown */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              aria-label="Filter berdasarkan level log"
              className="px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-medium cursor-pointer"
            >
              <option value="all">Semua Level</option>
              <option value="error">🔴 Error Saja</option>
              <option value="warn">🟡 Warning Saja</option>
              <option value="action">🔵 Aksi Tombol</option>
              <option value="info">🟢 Info Sistem</option>
            </select>

            {/* Category Filter Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter berdasarkan kategori modul"
              className="px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 font-medium cursor-pointer"
            >
              <option value="all">Semua Modul</option>
              <option value="CHECKOUT">Checkout & Pesanan</option>
              <option value="AUTH">Autentikasi Akun</option>
              <option value="DATABASE">Penyimpanan / DB</option>
              <option value="UI_BUTTON">Tombol Tampilan</option>
              <option value="SYSTEM">Sistem Browser</option>
              <option value="NETWORK">Jaringan / API</option>
            </select>

            <button
              type="button"
              onClick={handleCopyJson}
              className="px-3 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Salin Format JSON"
            >
              <Code className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Log Feed List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 font-serif-display">
              Tidak Ada Catatan Error yang Cocok
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              {logs.length === 0
                ? 'Belum ada error yang tertangkap di sesi ini. Sistem berjalan lancar!'
                : 'Tidak ada log yang sesuai dengan filter atau kata kunci pencarian Anda.'}
            </p>
            {logs.length === 0 && (
              <button
                type="button"
                onClick={handleTriggerTestError}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Coba Jalankan Tes Error</span>
              </button>
            )}
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isError = log.level === 'error';
            const isWarn = log.level === 'warn';
            const isAction = log.level === 'action';
            const isExpanded = expandedId === log.id;
            const isCopied = copiedId === log.id;

            return (
              <div
                key={log.id}
                className={`rounded-2xl border transition-all ${
                  isError
                    ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                    : isWarn
                    ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                    : isAction
                    ? 'bg-blue-50/30 border-blue-200 hover:border-blue-300'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                } p-4 sm:p-5 space-y-3`}
              >
                {/* Header item */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono uppercase tracking-wide ${
                        isError
                          ? 'bg-rose-600 text-white'
                          : isWarn
                          ? 'bg-amber-500 text-white'
                          : isAction
                          ? 'bg-blue-600 text-white'
                          : 'bg-stone-600 text-white'
                      }`}
                    >
                      {log.level}
                    </span>

                    <span className="px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-[11px] font-mono font-medium text-stone-700">
                      {log.category}
                    </span>

                    <span className="text-xs text-stone-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(log.timestamp).toLocaleTimeString('id-ID')}</span>
                    </span>
                  </div>

                  {/* Copy Button for this specific log */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleCopySingleError(log)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                        isCopied
                          ? 'bg-emerald-600 text-white'
                          : isError
                          ? 'bg-rose-600 hover:bg-rose-500 text-white'
                          : 'bg-stone-800 hover:bg-stone-700 text-stone-100'
                      }`}
                      title="Salin seluruh detail error ini"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Tersalin!' : 'Salin Error Ini'}</span>
                    </button>
                  </div>
                </div>

                {/* Body Message */}
                <div>
                  <div className="text-sm font-semibold text-stone-900 break-words flex items-start gap-2">
                    {isError && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                    {isWarn && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
                    {isAction && <Activity className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
                    {!isError && !isWarn && !isAction && <Info className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />}
                    <span className={isError ? 'text-rose-950 font-bold font-mono' : 'text-stone-800'}>
                      {log.message}
                    </span>
                  </div>

                  {/* Meta tag details */}
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
                    <span className="flex items-center gap-1">
                      <Code className="w-3 h-3 text-stone-400" />
                      <strong className="font-mono text-stone-700">{log.source}</strong>
                    </span>

                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3 text-stone-400" />
                      <span>Rute: <code className="text-stone-700 font-mono">{log.path}</code></span>
                    </span>

                    {log.userEmail && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-stone-400" />
                        <span>Akun: <strong>{log.userEmail}</strong></span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Expandable Stack Trace & Details */}
                {(log.stack || log.details) && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : log.id)}
                      className="text-[11px] font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer pt-1"
                    >
                      <span>{isExpanded ? 'Sembunyikan Stack Trace & Detail' : 'Lihat Stack Trace & Detail Lengkap'}</span>
                      <span>{isExpanded ? '▲' : '▼'}</span>
                    </button>

                    {isExpanded && (
                      <div className="mt-2.5 p-3.5 bg-stone-900 text-stone-200 rounded-xl font-mono text-[11px] space-y-2 overflow-x-auto border border-stone-800 shadow-inner">
                        {log.stack && (
                          <div>
                            <div className="text-amber-400 font-bold mb-1">// STACK TRACE:</div>
                            <pre className="whitespace-pre-wrap leading-relaxed text-rose-300 font-mono">{log.stack}</pre>
                          </div>
                        )}
                        {log.details && (
                          <div className="pt-2 border-t border-stone-800">
                            <div className="text-amber-400 font-bold mb-1">// DETAIL PARAMETERS:</div>
                            <pre className="whitespace-pre-wrap text-stone-300 font-mono">
                              {typeof log.details === 'object' ? JSON.stringify(log.details, null, 2) : log.details}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
