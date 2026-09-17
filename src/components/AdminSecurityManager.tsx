import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Trash2,
  UserX,
  CheckCircle2,
  Search,
  Zap,
  Lock,
  Sliders,
  FileText
} from 'lucide-react';
import { securityService } from '../services/security';
import { db } from '../services/storage';
import { SecurityAuditLog } from '../types';

export const AdminSecurityManager: React.FC = () => {
  const [logs, setLogs] = useState<SecurityAuditLog[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Security stats
  const [stats, setStats] = useState({
    totalEvents: 0,
    xssBlocked: 0,
    bruteForceBlocked: 0,
    unauthorizedBlocked: 0,
    activeBannedUsers: 0
  });

  const loadSecurityData = () => {
    const rawLogs = securityService.getAuditLogs();
    setLogs(rawLogs);

    const bannedUsers = db.getBannedUsers();
    const xss = rawLogs.filter(l => l.eventType === 'XSS_ATTEMPT_BLOCKED' || l.eventType === 'SUSPICIOUS_PAYLOAD_SANITIZED').length;
    const bf = rawLogs.filter(l => l.eventType === 'BRUTE_FORCE_LOCKOUT' || l.eventType === 'FAILED_LOGIN').length;
    const unauth = rawLogs.filter(l => l.eventType === 'UNAUTHORIZED_ACCESS_ATTEMPT').length;

    setStats({
      totalEvents: rawLogs.length,
      xssBlocked: xss,
      bruteForceBlocked: bf,
      unauthorizedBlocked: unauth,
      activeBannedUsers: bannedUsers.length
    });
  };

  useEffect(() => {
    loadSecurityData();

    const handleSecUpdate = () => loadSecurityData();
    window.addEventListener('surat:security-logs-updated', handleSecUpdate);
    window.addEventListener('surat:banned-updated', handleSecUpdate);
    return () => {
      window.removeEventListener('surat:security-logs-updated', handleSecUpdate);
      window.removeEventListener('surat:banned-updated', handleSecUpdate);
    };
  }, []);

  const notify = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleClearLogs = () => {
    if (!window.confirm('Apakah Anda yakin ingin mengosongkan seluruh riwayat log keamanan siber?')) {
      return;
    }
    securityService.clearAuditLogs();
    loadSecurityData();
    notify('Seluruh catatan audit log keamanan berhasil dibersihkan.');
  };

  const handleSimulateThreat = () => {
    securityService.logSecurityEvent(
      'XSS_ATTEMPT_BLOCKED',
      'TestAttacker_bot',
      'Uji coba simulasi deteksi serangan XSS script payload: <script>alert("test")</script>',
      'high'
    );
    loadSecurityData();
    notify('Simulasi serangan siber berhasil dicatat dan diblokir oleh sistem.');
  };

  const handleQuickBan = (identifier: string, reason: string) => {
    if (!identifier || identifier === 'unknown') {
      alert('Identitas target tidak valid untuk diblokir.');
      return;
    }

    if (window.confirm(`Blokir pengguna/IP "${identifier}" secara permanen dari seluruh sistem?`)) {
      db.banUser({
        id: 'ban-' + Date.now(),
        name: identifier,
        identifier: identifier,
        reason: `Pelanggaran Keamanan Siber: ${reason}`,
        bannedAt: new Date().toISOString(),
        bannedBy: 'SURAT Cyber Shield'
      });
      loadSecurityData();
      notify(`Pengguna "${identifier}" berhasil diblokir secara permanen.`);
    }
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchType = filterType === 'ALL' || log.eventType === filterType;
    const matchSeverity = filterSeverity === 'ALL' || log.severity === filterSeverity;
    const matchSearch =
      searchQuery.trim() === '' ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.target && log.target.toLowerCase().includes(searchQuery.toLowerCase())) ||
      log.eventType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSeverity && matchSearch;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-950/80 text-rose-300 border-rose-700';
      case 'high':
        return 'bg-rose-900/60 text-rose-200 border-rose-800';
      case 'medium':
        return 'bg-amber-900/60 text-amber-200 border-amber-700';
      default:
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'XSS_ATTEMPT_BLOCKED':
        return { label: 'Injeksi XSS Diblokir', color: 'text-rose-400' };
      case 'SUSPICIOUS_PAYLOAD_SANITIZED':
        return { label: 'Payload Disanitasi', color: 'text-amber-400' };
      case 'BRUTE_FORCE_LOCKOUT':
        return { label: 'Brute Force Lockout', color: 'text-rose-400' };
      case 'FAILED_LOGIN':
        return { label: 'Gagal Otorisasi', color: 'text-amber-400' };
      case 'UNAUTHORIZED_ACCESS_ATTEMPT':
        return { label: 'Akses Ditolak (Banned)', color: 'text-rose-400' };
      case 'BOT_HONEYPOT_TRIGGERED':
        return { label: 'Bot Spam Ditangkal', color: 'text-rose-400' };
      case 'RATE_LIMIT_EXCEEDED':
        return { label: 'Rate Limit Melebihi Batas', color: 'text-amber-400' };
      case 'SUCCESSFUL_LOGIN':
        return { label: 'Otorisasi Sukses', color: 'text-emerald-400' };
      default:
        return { label: type, color: 'text-stone-300' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900">
              Pusat Keamanan Siber & Deteksi Ancaman
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              SURAT Shield Aktif
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Audit keamanan komprehensif, deteksi serangan XSS, mitigasi brute force login, dan perlindungan formulir undangan publik.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadSecurityData}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Muat ulang log keamanan"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Segarkan</span>
          </button>
          <button
            onClick={handleSimulateThreat}
            className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Simulasi deteksi ancaman XSS untuk verifikasi sistem"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Tes Deteksi</span>
          </button>
          <button
            onClick={handleClearLogs}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Hapus log riwayat"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Bersihkan Log</span>
          </button>
        </div>
      </div>

      {/* Action Notice */}
      {actionNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* KPI Security Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[11px] text-stone-500 font-medium block">Total Deteksi Ancaman</span>
          <div className="text-2xl font-black text-stone-900 font-mono">
            {stats.totalEvents}
          </div>
          <span className="text-[10px] text-stone-400 block">Insiden tercatat</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[11px] text-stone-500 font-medium block">Serangan XSS Diblokir</span>
          <div className="text-2xl font-black text-rose-600 font-mono">
            {stats.xssBlocked}
          </div>
          <span className="text-[10px] text-rose-500 font-semibold block">Injeksi payload netral</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[11px] text-stone-500 font-medium block">Brute Force Dicegah</span>
          <div className="text-2xl font-black text-amber-600 font-mono">
            {stats.bruteForceBlocked}
          </div>
          <span className="text-[10px] text-amber-600 font-semibold block">Lockout proteksi login</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1">
          <span className="text-[11px] text-stone-500 font-medium block">Akses Banned Ditolak</span>
          <div className="text-2xl font-black text-stone-800 font-mono">
            {stats.unauthorizedBlocked}
          </div>
          <span className="text-[10px] text-stone-500 block">Penyerang ditangkal</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-1 col-span-2 lg:col-span-1">
          <span className="text-[11px] text-stone-500 font-medium block">Total User Diblokir</span>
          <div className="text-2xl font-black text-rose-700 font-mono">
            {stats.activeBannedUsers}
          </div>
          <span className="text-[10px] text-rose-600 font-semibold block">Blacklist aktif</span>
        </div>
      </div>

      {/* Cyber Security Layers Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-stone-900">
            <Lock className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Proteksi Panel Admin</h3>
          </div>
          <ul className="text-xs text-stone-600 space-y-1.5 list-disc list-inside leading-relaxed">
            <li>Kunci otomatis 15 menit jika 5x salah kode otorisasi.</li>
            <li>Rate limiting 5 percobaan per 30 detik untuk cegah brute-force script.</li>
            <li>Sanitasi input strip tags pada seluruh formulir masuk.</li>
          </ul>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-stone-900">
            <Shield className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Keamanan Halaman Undangan</h3>
          </div>
          <ul className="text-xs text-stone-600 space-y-1.5 list-disc list-inside leading-relaxed">
            <li>URL Parameter <code>?to=...</code> disanitasi otomatis terhadap XSS.</li>
            <li>Formulir RSVP dibatasi maksimal 4 kiriman per 45 detik (Anti-Spam).</li>
            <li>Pengecekan otomatis status pemblokiran nama tamu sebelum kirim.</li>
          </ul>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-stone-900">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Keamanan Obrolan Langsung</h3>
          </div>
          <ul className="text-xs text-stone-600 space-y-1.5 list-disc list-inside leading-relaxed">
            <li>Wajib login (Authentication Gateway) sebelum dapat mengirim obrolan.</li>
            <li>Anti-flood rate limiter (maksimal 6 pesan per 15 detik).</li>
            <li>Pencegahan string script, HTML berbahaya, dan URL exploit.</li>
          </ul>
        </div>
      </div>

      {/* Audit Log Table Section */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-stone-700" />
              <span>Log Audit Kejadian & Serangan Siber</span>
            </h3>
            <p className="text-xs text-stone-500">
              Menampilkan riwayat waktu nyata seluruh pencegahan ancaman di aplikasi.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari log atau target..."
                className="pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl w-44 sm:w-56 focus:outline-none focus:border-amber-500"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-700 focus:outline-none"
            >
              <option value="ALL">Semua Tipe</option>
              <option value="XSS_ATTEMPT_BLOCKED">Injeksi XSS</option>
              <option value="BRUTE_FORCE_LOCKOUT">Brute Force Lockout</option>
              <option value="FAILED_LOGIN">Gagal Login</option>
              <option value="UNAUTHORIZED_ACCESS_ATTEMPT">Akses Ditolak</option>
              <option value="SUCCESSFUL_LOGIN">Login Sukses</option>
            </select>

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-700 focus:outline-none"
            >
              <option value="ALL">Semua Level</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs space-y-2">
              <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="font-semibold text-stone-600">Tidak ada kejadian ancaman terdeteksi.</p>
              <p className="text-[11px] text-stone-400">Sistem terlindungi dan seluruh input pengguna dalam kondisi steril.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                <tr>
                  <th className="p-3.5">Waktu</th>
                  <th className="p-3.5">Jenis Kejadian</th>
                  <th className="p-3.5">Level Ancaman</th>
                  <th className="p-3.5">Target / Identitas</th>
                  <th className="p-3.5">Rincian & Aksi Sistem</th>
                  <th className="p-3.5 text-right">Moderasi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-sans">
                {filteredLogs.map((log) => {
                  const typeInfo = getTypeLabel(log.eventType);
                  return (
                    <tr key={log.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="p-3.5 text-stone-500 font-mono text-[11px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </td>
                      <td className="p-3.5 font-semibold text-stone-900 whitespace-nowrap">
                        <span className={typeInfo.color}>{typeInfo.label}</span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getSeverityBadge(log.severity)}`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-stone-800 font-semibold whitespace-nowrap">
                        {log.target || 'N/A'}
                      </td>
                      <td className="p-3.5 text-stone-600 max-w-md break-words">
                        {log.details}
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        {log.target && log.target !== 'admin-panel' && log.target !== 'N/A' && log.target !== 'System Kernel' && (
                          <button
                            onClick={() => handleQuickBan(log.target!, log.details)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                            title={`Blokir permanen ${log.target}`}
                          >
                            <UserX className="w-3 h-3" />
                            <span>Blokir User</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
