import React, { useState, useEffect } from 'react';
import {
  Bell,
  Sparkles,
  AlertTriangle,
  Info,
  CheckCircle,
  X,
  ArrowRight,
  Megaphone
} from 'lucide-react';
import { Announcement } from '../types';
import { db } from '../services/storage';

interface AnnouncementBannerProps {
  onNavigate?: (path: string) => void;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ onNavigate }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('surat_dismissed_announcements');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const loadAnnouncements = () => {
    const active = db.getActiveAnnouncements();
    setAnnouncements(active);
  };

  useEffect(() => {
    loadAnnouncements();

    const handleUpdate = () => loadAnnouncements();
    window.addEventListener('surat:announcements-updated', handleUpdate);
    return () => window.removeEventListener('surat:announcements-updated', handleUpdate);
  }, []);

  const handleDismiss = (id: string) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    try {
      localStorage.setItem('surat_dismissed_announcements', JSON.stringify(updated));
    } catch {
      // safe
    }
  };

  const visibleAnnouncements = announcements.filter(a => !dismissedIds.includes(a.id));

  if (visibleAnnouncements.length === 0) return null;

  return (
    <div className="w-full space-y-2 relative z-30" id="announcement-broadcast-container">
      {visibleAnnouncements.map((anc) => {
        const isPromo = anc.type === 'promo';
        const isWarning = anc.type === 'warning';
        const isSuccess = anc.type === 'success';

        let bgClass = 'bg-stone-900 text-white border-stone-800';
        let icon = <Megaphone className="w-4 h-4 text-amber-400 shrink-0" />;
        let badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/30';

        if (isPromo) {
          bgClass = 'bg-gradient-to-r from-amber-600 via-amber-700 to-stone-900 text-white border-amber-500/30 shadow-md';
          icon = <Sparkles className="w-4 h-4 text-yellow-300 shrink-0 animate-spin-slow" />;
          badgeBg = 'bg-yellow-400/20 text-yellow-200 border-yellow-300/30';
        } else if (isWarning) {
          bgClass = 'bg-rose-900 text-white border-rose-800 shadow-md';
          icon = <AlertTriangle className="w-4 h-4 text-rose-300 shrink-0" />;
          badgeBg = 'bg-rose-800 text-rose-200 border-rose-700';
        } else if (isSuccess) {
          bgClass = 'bg-emerald-900 text-white border-emerald-800 shadow-md';
          icon = <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" />;
          badgeBg = 'bg-emerald-800 text-emerald-200 border-emerald-700';
        }

        return (
          <div
            key={anc.id}
            className={`w-full py-2.5 px-4 text-xs flex items-center justify-between gap-3 border transition-all animate-in fade-in ${bgClass}`}
          >
            <div className="flex items-center gap-2.5 max-w-5xl mx-auto flex-1 min-w-0">
              <div className="hidden sm:flex">{icon}</div>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 ${badgeBg}`}>
                  {anc.type === 'promo' ? 'Promo Spesial' : anc.type === 'warning' ? 'Pemberitahuan Penting' : 'Info'}
                </span>
                <span className="font-bold truncate">{anc.title}</span>
                <span className="text-stone-200 opacity-90 hidden md:inline truncate">
                  — {anc.content}
                </span>
              </div>

              {anc.actionText && (
                <button
                  type="button"
                  onClick={() => {
                    if (anc.actionUrl && onNavigate) {
                      onNavigate(anc.actionUrl);
                    } else if (anc.actionUrl) {
                      window.location.href = anc.actionUrl;
                    }
                  }}
                  className="shrink-0 ml-auto bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>{anc.actionText}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleDismiss(anc.id)}
              className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
              title="Sembunyikan Pemberitahuan"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
