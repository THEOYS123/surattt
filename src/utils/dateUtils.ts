// Bulletproof Indonesian Date Parsing and Countdown Helpers

export interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

const INDO_MONTH_MAP: Record<string, string> = {
  januari: '01', jan: '01',
  februari: '02', feb: '02',
  maret: '03', mar: '03',
  april: '04', apr: '04',
  mei: '05',
  juni: '06', jun: '06',
  juli: '07', jul: '07',
  agustus: '08', agu: '08', ags: '08',
  september: '09', sep: '09',
  oktober: '10', okt: '10',
  november: '11', nov: '11',
  desember: '12', des: '12'
};

/**
 * Safely parse date and time string into timestamp in milliseconds.
 * NEVER returns NaN.
 */
export function parseEventDateTime(dateStr?: string, timeStr?: string): number {
  const safeFallback = Date.now() + 14 * 24 * 60 * 60 * 1000; // 14 days ahead
  if (!dateStr || typeof dateStr !== 'string' || !dateStr.trim()) {
    return safeFallback;
  }

  const cleanDate = dateStr.trim();

  // Extract first HH:mm from time string (handles e.g. "08:00 - 14:00 WIB", "09.30", "11:00")
  let timeFormatted = '09:00';
  if (timeStr && typeof timeStr === 'string' && timeStr.trim()) {
    const timeMatch = timeStr.match(/(\d{1,2})[:.](\d{2})/);
    if (timeMatch) {
      const h = timeMatch[1].padStart(2, '0');
      const m = timeMatch[2];
      timeFormatted = `${h}:${m}`;
    }
  }

  // 1. Check standard ISO format: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
    const parsed = new Date(`${cleanDate}T${timeFormatted}:00`).getTime();
    if (!isNaN(parsed)) return parsed;
  }

  // 2. Check DD/MM/YYYY or DD-MM-YYYY
  const dmyNumeric = cleanDate.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyNumeric) {
    const day = dmyNumeric[1].padStart(2, '0');
    const month = dmyNumeric[2].padStart(2, '0');
    const year = dmyNumeric[3];
    const parsed = new Date(`${year}-${month}-${day}T${timeFormatted}:00`).getTime();
    if (!isNaN(parsed)) return parsed;
  }

  // 3. Check Indonesian month names: e.g. "24 Oktober 2026" or "10-Nov-2026"
  const dmyText = cleanDate.match(/(\d{1,2})[\s/-]+([a-zA-Z]+)[\s/-]+(\d{4})/);
  if (dmyText) {
    const day = dmyText[1].padStart(2, '0');
    const monthWord = dmyText[2].toLowerCase();
    const year = dmyText[3];
    const monthCode = INDO_MONTH_MAP[monthWord] || '01';
    const parsed = new Date(`${year}-${monthCode}-${day}T${timeFormatted}:00`).getTime();
    if (!isNaN(parsed)) return parsed;
  }

  // 4. Standard Date.parse
  const directParsed = Date.parse(cleanDate);
  if (!isNaN(directParsed)) {
    return directParsed;
  }

  return safeFallback;
}

/**
 * Calculate countdown difference. Guaranteed to return valid numbers, NEVER NaN.
 */
export function calculateCountdown(targetTimestamp: number): CountdownResult {
  if (isNaN(targetTimestamp) || targetTimestamp <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false };
  }

  const now = Date.now();
  const diff = targetTimestamp - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return {
    days: isNaN(days) ? 0 : days,
    hours: isNaN(hours) ? 0 : hours,
    minutes: isNaN(minutes) ? 0 : minutes,
    seconds: isNaN(seconds) ? 0 : seconds,
    isPast: false
  };
}

/**
 * Format date into Indonesian locale string: "Sabtu, 24 Oktober 2026"
 */
export function formatIndoDate(dateStr?: string): string {
  if (!dateStr) return 'Tanggal Segera Ditentukan';
  try {
    const timestamp = parseEventDateTime(dateStr, '09:00');
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}
