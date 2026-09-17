import React, { useState, useEffect } from 'react';
import { Check, X, Sparkles, Loader2, Link2 } from 'lucide-react';
import { db } from '../services/storage';

interface SlugAvailabilityProps {
  value: string;
  onChange: (val: string) => void;
  excludeOrderId?: string;
  categorySlug?: string;
  titleSuggestion?: string;
}

export const SlugAvailability: React.FC<SlugAvailabilityProps> = ({
  value,
  onChange,
  excludeOrderId,
  titleSuggestion
}) => {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Sanitize slug input: lowercase, alphanumeric and hyphens only
  const handleInputChange = (raw: string) => {
    const sanitized = raw
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    onChange(sanitized);
  };

  useEffect(() => {
    if (!value || value.length < 3) {
      setIsAvailable(null);
      setSuggestions([]);
      return;
    }

    setIsChecking(true);
    const timer = setTimeout(() => {
      const taken = db.isSlugTaken(value, excludeOrderId);
      setIsAvailable(!taken);
      setIsChecking(false);

      if (taken) {
        // Generate 3 clever alternatives
        const randomNum = Math.floor(10 + Math.random() * 90);
        const year = new Date().getFullYear();
        const base = value.replace(/-\d+$/, '');
        
        const alt1 = `${base}-${year}`;
        const alt2 = `${base}-${randomNum}`;
        const alt3 = `${base}-official`;

        // Filter out any that might already exist
        const viable = [alt1, alt2, alt3].filter(s => !db.isSlugTaken(s, excludeOrderId));
        setSuggestions(viable.length > 0 ? viable : [`${base}-${Date.now().toString().slice(-4)}`]);
      } else {
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [value, excludeOrderId]);

  const domainPrefix = typeof window !== 'undefined' ? `${window.location.host}/` : 'surattt.netlify.app/';

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
          Tentukan Alamat URL Undangan (Slug)
        </label>
        
        <div className="flex rounded-xl shadow-sm border border-stone-300 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 bg-white overflow-hidden transition-all">
          <span className="inline-flex items-center px-3.5 bg-stone-100 text-stone-500 text-xs sm:text-sm font-mono border-r border-stone-200 select-none">
            {domainPrefix}
          </span>
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="undangan-nikah-rendi-jihan"
            className="flex-1 px-3.5 py-3 text-stone-900 text-sm font-medium focus:outline-none placeholder-stone-400 font-mono"
            required
          />
          <div className="flex items-center pr-3">
            {isChecking && <Loader2 className="w-4 h-4 text-stone-400 animate-spin" />}
            {!isChecking && isAvailable === true && (
              <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium bg-emerald-50 px-2 py-1 rounded-full">
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tersedia</span>
              </span>
            )}
            {!isChecking && isAvailable === false && (
              <span className="inline-flex items-center gap-1 text-rose-600 text-xs font-medium bg-rose-50 px-2 py-1 rounded-full">
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Terpakai</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Validation status feedback */}
      {!isChecking && isAvailable === true && (
        <p className="text-xs text-emerald-700 flex items-center gap-1.5">
          <Link2 className="w-3.5 h-3.5" />
          <span>Alamat URL ini tersedia dan dapat langsung digunakan!</span>
        </p>
      )}

      {!isChecking && isAvailable === false && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
          <p className="text-xs text-amber-900 font-medium">
            Slug <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-950">/{value}</code> sudah digunakan oleh pengguna lain. Silakan pilih salah satu saran berikut:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {suggestions.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => onChange(sug)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-amber-300 hover:border-amber-500 hover:bg-amber-100 text-amber-950 rounded-lg text-xs font-mono font-medium transition-all shadow-xs"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>/{sug}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
