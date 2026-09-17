import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Share2,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  ExternalLink,
  Gift,
  Building2,
  User,
  GraduationCap,
  School,
  Ticket,
  Music2,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order, RSVPItem } from '../types';
import { db } from '../services/storage';
import { ShareModal } from '../components/ShareModal';
import { backgroundAudio } from '../services/audioPlayer';
import { parseEventDateTime, calculateCountdown, formatIndoDate } from '../utils/dateUtils';
import { safeCopyToClipboard } from '../utils/clipboard';

interface InvitationViewProps {
  order: Order;
  guestNameParam?: string;
  isEmbedPreview?: boolean;
}

export const InvitationView: React.FC<InvitationViewProps> = ({
  order,
  guestNameParam = '',
  isEmbedPreview = false
}) => {
  const [isOpen, setIsOpen] = useState(isEmbedPreview);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [audioFeedback, setAudioFeedback] = useState<string | null>(null);

  // RSVP Form state
  const [rsvpName, setRsvpName] = useState(guestNameParam || '');
  const [rsvpStatus, setRsvpStatus] = useState<'attending' | 'not_attending' | 'uncertain'>('attending');
  const [rsvpCount, setRsvpCount] = useState(1);
  const [rsvpWishes, setRsvpWishes] = useState('');
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [rsvps, setRsvps] = useState<RSVPItem[]>([]);

  const d = order.invitationData;

  // Accurately categorize event type
  const categorySlug = (d.categorySlug || '').toLowerCase();
  const categoryId = order.categoryId || '';

  const isSchool = categorySlug === 'sekolah' || categoryId === 'cat-16' || Boolean(d.institutionName && !d.groomName);
  const isGraduation = categorySlug === 'wisuda' || categoryId === 'cat-14';
  const isReunion = categorySlug === 'reuni' || categoryId === 'cat-7';
  const isBusiness = ['bisnis', 'seminar', 'workshop', 'rapat', 'komunitas', 'expo', 'grand-opening'].includes(categorySlug) || Boolean(d.companyName && !isSchool && !isGraduation);
  const isWedding = (categorySlug === 'pernikahan' || categoryId === 'cat-1') && !isSchool && !isGraduation && !isReunion;
  const isBirthday = categorySlug === 'ulang-tahun' || categoryId === 'cat-2';
  const isIslamic = ['khitanan', 'aqiqah', 'tasyakuran', 'pengajian', 'bukber', 'halal-bihalal'].includes(categorySlug);

  // Subscribe to background audio state changes
  useEffect(() => {
    const unsubscribe = backgroundAudio.subscribe((playing) => {
      setIsPlayingMusic(playing);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Safe Countdown timer calculation - NEVER NaN
  const [timeLeft, setTimeLeft] = useState(() => {
    const target = parseEventDateTime(d.eventDate, d.startTime);
    return calculateCountdown(target);
  });

  // Guest Name logic
  const displayedGuest = guestNameParam.trim() ? guestNameParam.trim() : 'Tamu Undangan Terhormat';

  // Load RSVPs
  useEffect(() => {
    setRsvps(db.getRSVPs(order.slug));
  }, [order.slug]);

  // Countdown loop with bulletproof calculation
  useEffect(() => {
    const target = parseEventDateTime(d.eventDate, d.startTime);

    const updateTimer = () => {
      const result = calculateCountdown(target);
      setTimeLeft(result);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [d.eventDate, d.startTime]);

  const showAudioNotice = (msg: string) => {
    setAudioFeedback(msg);
    setTimeout(() => setAudioFeedback(null), 2500);
  };

  const handleOpenInvitation = () => {
    setIsOpen(true);
    // Start background audio immediately on user click
    backgroundAudio.play(d.backgroundMusicUrl).then(() => {
      showAudioNotice('Musik latar berputar 🎵');
    }).catch(() => {
      showAudioNotice('Musik latar diaktifkan 🎵');
    });
  };

  const toggleMusic = () => {
    if (isPlayingMusic) {
      backgroundAudio.pause();
      showAudioNotice('Musik dijeda 🔇');
    } else {
      backgroundAudio.play(d.backgroundMusicUrl);
      showAudioNotice('Musik berputar 🎵');
    }
  };

  const copyToClipboard = (accountNum: string) => {
    safeCopyToClipboard(accountNum);
    setCopiedAccount(accountNum);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  const handleRSVPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim()) return;

    const newRsvp: RSVPItem = {
      id: 'rsvp-' + Date.now(),
      invitationSlug: order.slug,
      guestName: rsvpName.trim(),
      status: rsvpStatus,
      guestCount: Number(rsvpCount),
      wishes: rsvpWishes.trim(),
      createdAt: new Date().toISOString()
    };

    db.addRSVP(newRsvp);
    setRsvps(prev => [newRsvp, ...prev]);
    setRsvpSubmitted(true);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 }
      });
    } catch {
      // safe fallback
    }
  };

  // Determine Category-Specific Hero Styling & Badges
  const getCategoryBadge = () => {
    if (isSchool) {
      return {
        icon: <School className="w-3.5 h-3.5" />,
        text: d.tagline || 'Pentas Seni & Gelar Kreativitas Pelajar',
        subbadge: d.institutionName || 'SMA / SMK / Lembaga Pendidikan',
        themeBg: 'bg-indigo-950',
        accentColor: 'text-indigo-400',
        btnColor: 'bg-indigo-500 hover:bg-indigo-400 text-white'
      };
    }
    if (isGraduation) {
      return {
        icon: <GraduationCap className="w-3.5 h-3.5" />,
        text: d.tagline || 'Wisuda & Pelepasan Akademik',
        subbadge: d.institutionName || 'Universitas / Sekolah Tinggi',
        themeBg: 'bg-slate-950',
        accentColor: 'text-amber-400',
        btnColor: 'bg-amber-500 hover:bg-amber-400 text-stone-950'
      };
    }
    if (isReunion) {
      return {
        icon: <Users className="w-3.5 h-3.5" />,
        text: d.tagline || 'Temu Kangen & Reuni Akbar Alumni',
        subbadge: d.alumniGeneration ? `Angkatan ${d.alumniGeneration}` : (d.institutionName || 'Almamater Tercinta'),
        themeBg: 'bg-stone-950',
        accentColor: 'text-amber-400',
        btnColor: 'bg-amber-500 hover:bg-amber-400 text-stone-950'
      };
    }
    if (isBusiness) {
      return {
        icon: <Building2 className="w-3.5 h-3.5" />,
        text: d.tagline || 'Official Business Invitation',
        subbadge: d.companyName || 'Corporate Event',
        themeBg: 'bg-slate-950',
        accentColor: 'text-cyan-400',
        btnColor: 'bg-cyan-600 hover:bg-cyan-500 text-white'
      };
    }
    if (isBirthday) {
      return {
        icon: <Sparkles className="w-3.5 h-3.5" />,
        text: d.tagline || 'Birthday Celebration Party',
        subbadge: d.honoreeName ? `${d.honoreeName} (${d.honoreeAge || 'Spesial'})` : 'Perayaan Ulang Tahun',
        themeBg: 'bg-stone-950',
        accentColor: 'text-pink-400',
        btnColor: 'bg-pink-600 hover:bg-pink-500 text-white'
      };
    }
    // Default / Wedding
    return {
      icon: <Sparkles className="w-3.5 h-3.5" />,
      text: d.tagline || 'Walimatul ‘Ursy',
      subbadge: d.groomNickname && d.brideNickname ? `${d.groomNickname} & ${d.brideNickname}` : 'The Wedding Celebration',
      themeBg: 'bg-stone-950',
      accentColor: 'text-amber-400',
      btnColor: 'bg-amber-500 hover:bg-amber-400 text-stone-950'
    };
  };

  const badgeInfo = getCategoryBadge();

  // Fallback cover image appropriate to the category
  const defaultCoverImage = isSchool
    ? 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?w=1200&auto=format&fit=crop&q=80'
    : isGraduation
    ? 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80'
    : isReunion
    ? 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&auto=format&fit=crop&q=80'
    : isBusiness
    ? 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80'
    : isBirthday
    ? 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1200&auto=format&fit=crop&q=80'
    : 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80';

  const activeCover = d.coverImageUrl || defaultCoverImage;

  return (
    <div className="relative min-h-screen bg-stone-100 font-sans text-stone-900 selection:bg-amber-800 selection:text-white">
      
      {/* Audio toast feedback */}
      {audioFeedback && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-stone-900/90 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-3">
          {audioFeedback}
        </div>
      )}

      {/* Floating Music & Share Controls */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3">
          <button
            onClick={toggleMusic}
            className={`w-12 h-12 rounded-full shadow-xl border flex items-center justify-center transition-all cursor-pointer ${
              isPlayingMusic 
                ? 'bg-amber-500 text-stone-950 border-amber-400 scale-105 shadow-amber-500/30' 
                : 'bg-white/90 text-stone-700 border-stone-200 backdrop-blur-md hover:bg-stone-50'
            }`}
            title={isPlayingMusic ? "Jeda Musik" : "Putar Musik"}
          >
            {isPlayingMusic ? (
              <div className="flex items-center gap-0.5">
                <span className="w-1 h-3 bg-stone-950 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1 h-5 bg-stone-950 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1 h-3.5 bg-stone-950 rounded-full animate-bounce" />
              </div>
            ) : (
              <VolumeX className="w-5 h-5 text-stone-400" />
            )}
          </button>

          <button
            onClick={() => setShareModalOpen(true)}
            className="w-12 h-12 rounded-full bg-stone-900 text-white shadow-xl flex items-center justify-center hover:bg-stone-800 hover:scale-105 transition-all cursor-pointer"
            title="Bagikan Undangan"
          >
            <Share2 className="w-5 h-5 text-amber-400" />
          </button>
        </div>
      )}

      {/* COVER / WELCOME OVERLAY */}
      {!isOpen && (
        <div 
          className="fixed inset-0 z-50 flex flex-col items-center justify-center text-center p-6 bg-cover bg-center transition-all duration-700"
          style={{
            backgroundImage: `linear-gradient(rgba(10, 10, 15, 0.78), rgba(10, 10, 15, 0.92)), url('${activeCover}')`
          }}
        >
          <div className="max-w-md w-full text-white space-y-6 animate-in fade-in zoom-in-95 duration-500">
            {/* Category Pill */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wider uppercase text-amber-300">
              {badgeInfo.icon}
              <span>{badgeInfo.text}</span>
            </div>

            {/* School / Institution Header if present */}
            {d.institutionName && (
              <p className="text-xs sm:text-sm font-semibold text-stone-300 tracking-widest uppercase">
                {d.institutionName}
              </p>
            )}

            <h1 className="font-serif-display text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              {d.title}
            </h1>

            {/* Guest personalized greeting box */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl shadow-xl space-y-1">
              <p className="text-stone-300 text-xs tracking-wider uppercase">
                Kepada Yth. Bapak/Ibu/Saudara/i
              </p>
              <h2 className="text-xl sm:text-2xl font-bold text-amber-300 tracking-wide">
                {displayedGuest}
              </h2>
              <p className="text-[11px] text-stone-300 pt-1">
                {isSchool 
                  ? 'Kami mengharapkan kehadiran Anda dalam pagelaran seni dan kreativitas ini.' 
                  : 'Merupakan kehormatan & kebahagiaan bagi kami apabila Anda berkenan hadir.'}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleOpenInvitation}
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-8 py-3.5 rounded-full shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 mx-auto transform hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm cursor-pointer"
                id="btn-open-invitation"
              >
                <Music2 className="w-4 h-4 text-stone-950" />
                <span>Buka Undangan & Putar Musik</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN INVITATION CONTENT CONTAINER */}
      <main className="max-w-xl mx-auto bg-white shadow-2xl min-h-screen pb-20 border-x border-stone-200">
        
        {/* HERO HEADER */}
        <section 
          className="relative min-h-[500px] flex flex-col justify-end p-8 text-white bg-cover bg-center overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(15, 17, 23, 0.95)), url('${activeCover}')`
          }}
        >
          <div className="space-y-3 text-center relative z-10">
            {/* Category / Institution Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-300">
              {badgeInfo.icon}
              <span>{d.institutionName || badgeInfo.text}</span>
            </div>

            <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-stone-100 leading-tight">
              {d.title}
            </h1>

            {d.tagline && (
              <p className="text-amber-400 text-xs sm:text-sm font-medium tracking-wide">
                "{d.tagline}"
              </p>
            )}

            <p className="text-stone-300 text-sm flex items-center justify-center gap-2 pt-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>{formatIndoDate(d.eventDate)}</span>
              <span>•</span>
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{d.startTime} {d.endTime ? `- ${d.endTime}` : ''} WIB</span>
            </p>
          </div>
        </section>

        {/* COUNTDOWN TIMER - 100% SAFE, NEVER NaN */}
        <section className="py-8 px-6 bg-stone-900 text-white text-center border-b border-stone-800">
          <p className="text-xs uppercase tracking-widest text-amber-400 mb-4 font-semibold">
            {timeLeft.isPast ? '🎉 Acara Sedang / Telah Berlangsung' : 'Menghitung Waktu Menuju Acara'}
          </p>

          <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-sm mx-auto">
            <div className="bg-stone-800/90 border border-stone-700/60 rounded-xl p-3">
              <span className="block text-2xl sm:text-3xl font-bold text-amber-400 font-mono">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-stone-400 uppercase tracking-wider">Hari</span>
            </div>
            <div className="bg-stone-800/90 border border-stone-700/60 rounded-xl p-3">
              <span className="block text-2xl sm:text-3xl font-bold text-amber-400 font-mono">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-stone-400 uppercase tracking-wider">Jam</span>
            </div>
            <div className="bg-stone-800/90 border border-stone-700/60 rounded-xl p-3">
              <span className="block text-2xl sm:text-3xl font-bold text-amber-400 font-mono">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-stone-400 uppercase tracking-wider">Menit</span>
            </div>
            <div className="bg-stone-800/90 border border-stone-700/60 rounded-xl p-3">
              <span className="block text-2xl sm:text-3xl font-bold text-amber-400 font-mono">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-stone-400 uppercase tracking-wider">Detik</span>
            </div>
          </div>
        </section>

        {/* GREETING / INVITATION TEXT */}
        <section className="py-12 px-6 text-center space-y-4 border-b border-stone-100">
          <div className="w-12 h-1 bg-amber-500 mx-auto rounded-full" />
          <h2 className="font-serif-display text-2xl text-stone-900 font-bold">
            {isSchool ? 'Salam Kehormatan & Kebersamaan' : isBusiness ? 'Undangan Resmi' : 'Salam Hangat'}
          </h2>
          <p className="text-stone-600 text-sm leading-relaxed max-w-md mx-auto">
            {d.description || (
              isSchool 
                ? 'Dengan penuh rasa bangga dan sukacita, kami mengundang segenap Dewan Guru, Orang Tua/Wali Murid, Alumni, serta Siswa-Siswi untuk menghadiri dan memeriahkan pagelaran ini.'
                : isBusiness
                ? 'Kami mengundang Anda untuk berpartisipasi dan menghadiri pertemuan strategis ini bersama para pemangku kepentingan.'
                : 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.'
            )}
          </p>
        </section>

        {/* ========================================================================= */}
        {/* KHUSUS SEKOLAH: SAMBUTAN & PENANGGUNG JAWAB */}
        {/* ========================================================================= */}
        {isSchool && (d.principalOrHead || d.committeeHead || d.academicYear) && (
          <section className="py-10 px-6 bg-indigo-50/60 border-b border-indigo-100 space-y-6">
            <div className="text-center space-y-1">
              <span className="text-xs uppercase tracking-widest text-indigo-700 font-semibold">
                Civitas Akademika
              </span>
              <h3 className="font-serif-display text-xl font-bold text-stone-900">
                Pimpinan & Panitia Pelaksana
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {d.principalOrHead && (
                <div className="p-4 bg-white border border-indigo-100 rounded-2xl shadow-xs text-center space-y-1.5">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
                    Kepala Sekolah / Pimpinan
                  </span>
                  <h4 className="font-bold text-sm text-stone-900">{d.principalOrHead}</h4>
                  {d.institutionName && <p className="text-xs text-stone-500">{d.institutionName}</p>}
                </div>
              )}

              {d.committeeHead && (
                <div className="p-4 bg-white border border-indigo-100 rounded-2xl shadow-xs text-center space-y-1.5">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                    Ketua Pelaksana / OSIS
                  </span>
                  <h4 className="font-bold text-sm text-stone-900">{d.committeeHead}</h4>
                  {d.academicYear && <p className="text-xs text-stone-500">{d.academicYear}</p>}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* KHUSUS SEKOLAH & ACARA: SUSUNAN RUNDOWN / AGENDA PANGGUNG */}
        {/* ========================================================================= */}
        {isSchool && d.agendaRundown && d.agendaRundown.length > 0 && (
          <section className="py-12 px-6 border-b border-stone-100 space-y-6">
            <div className="text-center space-y-1">
              <span className="text-xs uppercase tracking-widest text-indigo-700 font-semibold">
                Susunan Acara
              </span>
              <h3 className="font-serif-display text-2xl font-bold text-stone-900">
                Rundown Kegiatan & Panggung
              </h3>
              <p className="text-xs text-stone-500">Jadwal kegiatan selama acara berlangsung</p>
            </div>

            <div className="space-y-3">
              {d.agendaRundown.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3.5 p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="shrink-0 px-2.5 py-1 bg-indigo-100 text-indigo-900 rounded-lg text-xs font-mono font-bold">
                    {item.time}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-sm text-stone-900">{item.activity}</h4>
                    {item.performer && (
                      <p className="text-xs text-indigo-700 font-medium">
                        Penampil / Pengisi: {item.performer}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* KHUSUS SEKOLAH: INFO TIKET & KETENTUAN MASUK */}
        {/* ========================================================================= */}
        {isSchool && (d.ticketPrice || d.dressCode || d.additionalNotes) && (
          <section className="py-10 px-6 bg-stone-50 border-b border-stone-100 space-y-4">
            <div className="text-center space-y-1">
              <span className="text-xs uppercase tracking-widest text-indigo-700 font-semibold">
                Ketentuan & Akses Masuk
              </span>
              <h3 className="font-serif-display text-xl font-bold text-stone-900">
                Informasi Pengunjung
              </h3>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-3">
              {d.ticketPrice && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-stone-500 uppercase">Tiket / HTM</span>
                    <p className="text-sm font-bold text-stone-900">{d.ticketPrice}</p>
                  </div>
                </div>
              )}

              {d.dressCode && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-stone-500 uppercase">Dress Code</span>
                    <p className="text-sm font-semibold text-stone-800">{d.dressCode}</p>
                  </div>
                </div>
              )}

              {d.additionalNotes && (
                <div className="pt-2 border-t border-stone-100 text-xs text-stone-600 italic">
                  Catatan: {d.additionalNotes}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* WEDDING ONLY: MEMPELAI SECTION (NEVER SHOWN FOR SCHOOL/OTHER) */}
        {/* ========================================================================= */}
        {isWedding && (
          <section className="py-12 px-6 bg-stone-50 border-b border-stone-100 space-y-10">
            <div className="text-center space-y-1">
              <span className="font-serif text-3xl text-amber-600">Mempelai</span>
              <h3 className="font-serif-display text-xl text-stone-900 font-bold">
                Pasangan Bahagia
              </h3>
            </div>

            <div className="space-y-8">
              {d.groomName && (
                <div className="text-center space-y-3">
                  {d.groomPhotoUrl && (
                    <img 
                      src={d.groomPhotoUrl} 
                      alt={d.groomName} 
                      className="w-28 h-28 rounded-full mx-auto object-cover border-4 border-amber-200 shadow-md" 
                    />
                  )}
                  <h4 className="font-serif-display text-xl font-bold text-stone-900">
                    {d.groomName}
                  </h4>
                  {d.groomParents && (
                    <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                      {d.groomParents}
                    </p>
                  )}
                  {d.groomInstagram && (
                    <span className="inline-block text-xs text-amber-700 font-medium">
                      {d.groomInstagram}
                    </span>
                  )}
                </div>
              )}

              <div className="text-center font-serif text-3xl text-amber-500">&</div>

              {d.brideName && (
                <div className="text-center space-y-3">
                  {d.bridePhotoUrl && (
                    <img 
                      src={d.bridePhotoUrl} 
                      alt={d.brideName} 
                      className="w-28 h-28 rounded-full mx-auto object-cover border-4 border-amber-200 shadow-md" 
                    />
                  )}
                  <h4 className="font-serif-display text-xl font-bold text-stone-900">
                    {d.brideName}
                  </h4>
                  {d.brideParents && (
                    <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                      {d.brideParents}
                    </p>
                  )}
                  {d.brideInstagram && (
                    <span className="inline-block text-xs text-amber-700 font-medium">
                      {d.brideInstagram}
                    </span>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* WEDDING ONLY: AKAD & RESEPSI */}
        {isWedding && (d.akadDate || d.resepsiDate) && (
          <section className="py-12 px-6 space-y-8 border-b border-stone-100">
            <div className="text-center space-y-1">
              <span className="text-xs uppercase tracking-widest text-amber-600 font-semibold">
                Agenda Khidmat
              </span>
              <h3 className="font-serif-display text-2xl font-bold text-stone-900">
                Rangkaian Acara
              </h3>
            </div>

            <div className="space-y-6">
              {d.akadDate && (
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 text-center space-y-3">
                  <span className="bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-block">
                    Akad Nikah
                  </span>
                  <p className="text-sm font-semibold text-stone-800">
                    {formatIndoDate(d.akadDate)}
                  </p>
                  <p className="text-xs text-stone-600">
                    Pukul {d.akadTime || d.startTime}
                  </p>
                  <p className="text-xs text-stone-700 font-medium">
                    📍 {d.akadVenue || d.venueName}
                  </p>
                  <p className="text-[11px] text-stone-500">
                    {d.akadAddress || d.venueAddress}
                  </p>
                </div>
              )}

              {d.resepsiDate && (
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 text-center space-y-3">
                  <span className="bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-block">
                    Resepsi Pernikahan
                  </span>
                  <p className="text-sm font-semibold text-stone-800">
                    {formatIndoDate(d.resepsiDate)}
                  </p>
                  <p className="text-xs text-stone-600">
                    Pukul {d.resepsiTime || d.endTime || 'Selesai'}
                  </p>
                  <p className="text-xs text-stone-700 font-medium">
                    📍 {d.resepsiVenue || d.venueName}
                  </p>
                  <p className="text-[11px] text-stone-500">
                    {d.resepsiAddress || d.venueAddress}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* BUSINESS / SEMINAR: SPEAKERS & INFO */}
        {isBusiness && (
          <section className="py-12 px-6 border-b border-stone-100 space-y-6">
            <div className="text-center space-y-2">
              {d.companyName && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold">
                  <Building2 className="w-3.5 h-3.5 text-cyan-600" />
                  <span>{d.companyName}</span>
                </div>
              )}
              <h3 className="font-serif-display text-2xl font-bold text-stone-900">
                Informasi & Agenda Bisnis
              </h3>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-stone-800 uppercase">Tanggal & Waktu</h4>
                  <p className="text-sm text-stone-600">{formatIndoDate(d.eventDate)} ({d.startTime} - {d.endTime || 'Selesai'} WIB)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-stone-800 uppercase">Lokasi Acara</h4>
                  <p className="text-sm font-semibold text-stone-800">{d.venueName}</p>
                  <p className="text-xs text-stone-500">{d.venueAddress}</p>
                </div>
              </div>

              {d.registrationUrl && (
                <div className="pt-3">
                  <a 
                    href={d.registrationUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm rounded-xl text-center shadow-sm"
                  >
                    Daftar Sekarang
                  </a>
                </div>
              )}
            </div>

            {d.speakers && d.speakers.length > 0 && (
              <div className="pt-4 space-y-4">
                <h4 className="text-center text-xs font-bold uppercase tracking-wider text-stone-600">
                  Pembicara / Narasumber
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {d.speakers.map((spk) => (
                    <div key={spk.id} className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center mx-auto">
                        <User className="w-6 h-6" />
                      </div>
                      <h5 className="font-bold text-sm text-stone-900">{spk.name}</h5>
                      <p className="text-xs text-stone-500">{spk.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* HONOREE SECTION (Birthday / Aqiqah / Khitanan) */}
        {!isSchool && !isWedding && d.honoreeName && (
          <section className="py-12 px-6 text-center space-y-4 border-b border-stone-100 bg-amber-50/50">
            <span className="text-xs uppercase tracking-widest text-amber-700 font-semibold">
              Yang Berbahagia
            </span>
            <h3 className="font-serif-display text-3xl font-bold text-stone-900">
              {d.honoreeName}
            </h3>
            {d.honoreeAge && (
              <span className="inline-block bg-amber-200/60 text-amber-900 font-bold px-4 py-1 rounded-full text-xs">
                {d.honoreeAge}
              </span>
            )}
          </section>
        )}

        {/* STORYLINE SECTION (Wedding only) */}
        {isWedding && d.loveStory && d.loveStory.length > 0 && (
          <section className="py-12 px-6 border-b border-stone-100 space-y-6">
            <div className="text-center space-y-1">
              <span className="text-xs uppercase tracking-widest text-amber-600 font-semibold">
                Kisah Kami
              </span>
              <h3 className="font-serif-display text-2xl font-bold text-stone-900">
                Storyline
              </h3>
            </div>

            <div className="space-y-6 border-l-2 border-amber-200 ml-4 pl-6 relative">
              {d.loveStory.map((story, idx) => (
                <div key={idx} className="relative space-y-1">
                  <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-amber-500 ring-4 ring-white" />
                  <span className="text-xs font-bold text-amber-700 font-mono">{story.year}</span>
                  <h4 className="text-sm font-bold text-stone-900">{story.title}</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">{story.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PHOTO GALLERY */}
        {d.galleryImages && d.galleryImages.length > 0 && (
          <section className="py-12 px-6 border-b border-stone-100 space-y-6">
            <div className="text-center space-y-1">
              <span className="text-xs uppercase tracking-widest text-amber-600 font-semibold">
                {isSchool ? 'Dokumentasi & Karya' : 'Momen Spesial'}
              </span>
              <h3 className="font-serif-display text-2xl font-bold text-stone-900">
                Galeri Foto
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {d.galleryImages.map((imgUrl, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-stone-100 shadow-xs group">
                  <img 
                    src={imgUrl} 
                    alt={`Galeri ${i + 1}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy" 
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* VENUE & LOCATION MAP */}
        <section className="py-12 px-6 border-b border-stone-100 space-y-6 text-center">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-amber-600 font-semibold">
              Denah & Lokasi
            </span>
            <h3 className="font-serif-display text-2xl font-bold text-stone-900">
              Tempat Pelaksanaan
            </h3>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 space-y-4">
            <MapPin className="w-8 h-8 text-amber-600 mx-auto" />
            <h4 className="font-bold text-stone-900 text-lg">{d.venueName}</h4>
            <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">{d.venueAddress}</p>

            {d.dressCode && (
              <div className="pt-2">
                <span className="text-xs text-amber-800 bg-amber-100/70 px-3 py-1.5 rounded-full inline-block font-medium">
                  Dress Code: {d.dressCode}
                </span>
              </div>
            )}

            {d.googleMapsUrl && (
              <div className="pt-3">
                <a
                  href={d.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  <span>Petunjuk Arah Google Maps</span>
                </a>
              </div>
            )}
          </div>
        </section>

        {/* DIGITAL ENVELOPE (WEDDING ONLY) */}
        {isWedding && d.bankAccounts && d.bankAccounts.length > 0 && (
          <section className="py-12 px-6 border-b border-stone-100 space-y-6 text-center">
            <div className="space-y-1">
              <Gift className="w-8 h-8 text-amber-600 mx-auto" />
              <h3 className="font-serif-display text-2xl font-bold text-stone-900">
                Tanda Kasih (Amplop Digital)
              </h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Doa restu Anda adalah hadiah terindah. Jika ingin memberikan tanda kasih secara digital:
              </p>
            </div>

            <div className="space-y-4 max-w-sm mx-auto">
              {d.bankAccounts.map((acc, idx) => (
                <div key={idx} className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-2">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">{acc.bankName}</span>
                  <p className="text-xl font-mono font-bold text-stone-900 tracking-wider">{acc.accountNumber}</p>
                  <p className="text-xs text-stone-500">a.n. {acc.accountHolder}</p>
                  <button
                    onClick={() => copyToClipboard(acc.accountNumber)}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-stone-300 hover:border-amber-500 text-stone-700 px-4 py-1.5 rounded-full transition-all shadow-2xs cursor-pointer"
                  >
                    {copiedAccount === acc.accountNumber ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Berhasil Disalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-stone-500" />
                        <span>Salin No. Rekening</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* RSVP & GUESTBOOK */}
        <section className="py-12 px-6 border-b border-stone-100 space-y-8">
          <div className="text-center space-y-1">
            <span className="text-xs uppercase tracking-widest text-amber-600 font-semibold">
              Buku Tamu Digital
            </span>
            <h3 className="font-serif-display text-2xl font-bold text-stone-900">
              Konfirmasi & Ucapan Kehadiran
            </h3>
          </div>

          <form onSubmit={handleRSVPSubmit} className="bg-stone-50 border border-stone-200 rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={rsvpName}
                onChange={(e) => setRsvpName(e.target.value)}
                placeholder="Masukkan nama Anda..."
                className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Status Kehadiran
                </label>
                <select
                  value={rsvpStatus}
                  onChange={(e) => setRsvpStatus(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="attending">Hadir</option>
                  <option value="uncertain">Mungkin Hadir</option>
                  <option value="not_attending">Tidak Hadir</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Jumlah Orang
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={rsvpCount}
                  onChange={(e) => setRsvpCount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                {isSchool ? 'Pesan & Harapan untuk Acara' : 'Ucapan & Doa Restu'}
              </label>
              <textarea
                rows={3}
                value={rsvpWishes}
                onChange={(e) => setRsvpWishes(e.target.value)}
                placeholder={isSchool ? "Tuliskan salam & dukungan semangat untuk pentas seni sekolah..." : "Tuliskan harapan & doa..."}
                className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Send className="w-4 h-4 text-amber-400" />
              <span>Kirim Konfirmasi Kehadiran</span>
            </button>

            {rsvpSubmitted && (
              <p className="text-center text-xs text-emerald-700 font-medium pt-2">
                ✓ Terima kasih! Konfirmasi kehadiran & ucapan Anda telah berhasil dikirim.
              </p>
            )}
          </form>

          {/* List of wishes */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Daftar Ucapan ({rsvps.length})
            </h4>
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {rsvps.map((item) => (
                <div key={item.id} className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">{item.guestName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      item.status === 'attending' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : item.status === 'uncertain'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-stone-200 text-stone-700'
                    }`}>
                      {item.status === 'attending' ? 'Hadir' : item.status === 'uncertain' ? 'Mungkin' : 'Berhalangan'}
                    </span>
                  </div>
                  {item.wishes && <p className="text-stone-600 italic">"{item.wishes}"</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER OF INVITATION */}
        <footer className="p-8 text-center text-xs text-stone-400 space-y-2 bg-stone-950 text-stone-300">
          <p>Terima kasih atas perhatian dan kehadiran Anda.</p>
          <p className="text-[11px] text-stone-500">
            Dibuat secara profesional melalui <strong className="text-amber-400">SURAT</strong> • Platform Undangan Digital No. 1
          </p>
        </footer>

      </main>

      {/* Share Modal */}
      {shareModalOpen && (
        <ShareModal
          slug={order.slug}
          title={d.title}
          onClose={() => setShareModalOpen(false)}
        />
      )}
    </div>
  );
};
