import {
  AdminUser,
  Customer,
  Category,
  Template,
  Order,
  MediaItem,
  SiteSettings,
  ActivityLog,
  RSVPItem,
  ChatMessage,
  ChatConversation,
  BannedUser,
  Announcement
} from '../types';
import { hashPassword } from './auth';
import { securityService } from './security';
import { COMPREHENSIVE_TEMPLATES } from '../data/templatesData';

// Storage keys
const STORAGE_KEYS = {
  ADMINS: 'surat_db_admins',
  CUSTOMERS: 'surat_db_customers',
  CATEGORIES: 'surat_db_categories',
  TEMPLATES: 'surat_db_templates',
  ORDERS: 'surat_db_orders',
  MEDIA: 'surat_db_media',
  SETTINGS: 'surat_db_settings',
  LOGS: 'surat_db_logs',
  RSVPS: 'surat_db_rsvps',
  CHATS: 'surat_db_chats',
  CONVERSATIONS: 'surat_db_conversations',
  BANNED_USERS: 'surat_db_banned_users',
  ANNOUNCEMENTS: 'surat_db_announcements',
  INITIALIZED: 'surat_db_initialized_v2'
};

// Default high-res QRIS mockup (Standard Indonesian National QRIS styling)
const DEFAULT_QRIS_IMAGE = 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=500&auto=format&fit=crop&q=80';

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'SURAT',
  logoText: 'SURAT.',
  faviconUrl: '/favicon.ico',
  basePrice: 5000,
  priceNote: 'Satu kali bayar untuk selamanya. Tanpa biaya bulanan atau batasan tamu.',
  promoBadgeText: 'HARGA SPESIAL BULAN INI',
  showPromoBadge: true,
  
  // Hero & Homepage CMS
  heroBadgeText: '✦ Platform Undangan Digital No. 1 di Indonesia',
  heroHeadline: 'Satu Undangan. Banyak Kemungkinan.',
  heroSubheadline: 'Buat undangan digital profesional, bagikan dengan mudah ke WhatsApp & medsos, dan miliki file website mandiri hanya Rp5.000.',
  heroCtaText: 'Buat Undangan Sekarang (Rp5.000)',
  heroSecondaryCtaText: 'Lihat 50+ Pilihan Desain',
  
  // Top Announcement Banner
  bannerEnabled: true,
  bannerText: '🎉 PROMO SPESIAL: Buat undangan digital eksklusif siap sebar hanya Rp5.000 sekali bayar!',
  bannerLink: '/create',
  bannerBgColor: '#b45309',
  bannerTextColor: '#ffffff',

  // Features List
  featuresList: [
    { id: 'f1', title: 'Siap Pakai & Instan', description: 'Isi data acaramu dalam 3 menit, langsung siap dibagikan ke keluarga dan kerabat.', iconName: 'Sparkles' },
    { id: 'f2', title: 'Dapat File Website (.ZIP)', description: 'Setelah aktif, kamu bisa unduh source code HTML/CSS mandiri untuk disimpan selamanya.', iconName: 'Download' },
    { id: 'f3', title: 'Tamu Tanpa Batas & RSVP', description: 'Buat nama tamu personal tanpa batas (contoh: ?to=Budi) disertai form ucapan & konfirmasi kehadiran.', iconName: 'Users' },
    { id: 'f4', title: 'Musik, Peta & Galeri Foto', description: 'Dilengkapi background music waltz, peta Google Maps akurat, galeri foto, dan amplop digital.', iconName: 'Music' }
  ],

  // FAQ Items
  faqItems: [
    { id: 'faq-1', question: 'Berapa biaya pembuatan undangan digital di SURAT?', answer: 'Hanya Rp5.000 untuk satu undangan aktif selamanya! Tidak ada biaya bulanan, tidak ada biaya langganan, dan tidak ada batasan jumlah tamu.' },
    { id: 'faq-2', question: 'Bagaimana cara melakukan pembayaran?', answer: 'Pembayaran sangat mudah menggunakan QRIS Nasional (mendukung GoPay, OVO, DANA, ShopeePay, BCA Mobile, Mandiri Livin, BRImo, dan seluruh mobile banking). Cukup scan QRIS dan unggah bukti transfer.' },
    { id: 'faq-3', question: 'Berapa lama proses verifikasi undangan saya?', answer: 'Tim admin kami memverifikasi pembayaran secara cepat (rata-rata 2-10 menit). Setelah terverifikasi, undangan langsung aktif dan bisa disebar serta diunduh file ZIP-nya.' },
    { id: 'faq-4', question: 'Apakah saya bisa mengubah data setelah undangan dibuat?', answer: 'Bisa! Anda dapat menghubungi CS kami melalui WhatsApp dengan menyebutkan ID Pesanan Anda untuk pembaruan data.' },
    { id: 'faq-5', question: 'Apakah link undangan bisa mencantumkan nama tamu khusus?', answer: 'Tentu! Di halaman status pesanan Anda tersedia generator nama tamu instan (misal: surattt.netlify.app/undangan?to=Budi+Santoso) yang langsung siap disalin ke WhatsApp.' }
  ],

  // Contact & Support
  supportEmail: 'halo@surattt.netlify.app',
  supportWhatsapp: '6281234567890',
  operationalHours: 'Setiap Hari (08:00 - 22:00 WIB)',
  footerText: '© 2026 SURAT. Satu Undangan. Banyak Kemungkinan. Platform Undangan Digital No. 1 di Indonesia.',
  
  // SEO
  seoTitle: 'SURAT - Platform Pembuatan & Publikasi Undangan Digital',
  seoDescription: 'Buat undangan digital profesional, bagikan dengan mudah, dan miliki file website-nya sendiri hanya Rp5.000.',
  siteDescription: 'Buat undangan digital profesional, bagikan dengan mudah, dan miliki file website-nya sendiri hanya Rp5.000.',
  maintenanceMode: false,
  
  // Merchant & Payment
  merchantName: 'SURAT DIGITAL INDONESIA',
  merchantBank: 'DANA Bisnis / QRIS Nasional (NMID: ID1020268899123)',
  merchantAccount: '0812-3456-7890 (a.n SURAT Digital)',
  qrisImageUrl: DEFAULT_QRIS_IMAGE,
  transferInstructions: '1. Buka aplikasi GoPay, OVO, DANA, BCA, Mandiri, atau m-banking lainnya.\n2. Scan kode QRIS di atas dan periksa nama merchant: SURAT DIGITAL INDONESIA.\n3. Masukkan nominal sesuai harga pesanan.\n4. Simpan screenshot/foto bukti transfer, lalu unggah pada formulir di bawah ini.',

  primaryColor: 'amber',

  // Telegram Bot Defaults
  telegramBotToken: '',
  telegramChatId: '',
  telegramEnabled: false,
  telegramNotifyOnOrder: true,
  telegramNotifyOnReminder: true,

  // Customer Support Live Chat Floating Widget Defaults
  chatWidgetEnabled: true,
  chatWidgetPosition: 'bottom-right',
  chatWidgetOffsetX: 24,
  chatWidgetOffsetY: 24,
  chatWidgetCustomX: 24,
  chatWidgetCustomY: 24,
  chatWidgetLabel: 'Tanya Admin / Live Chat',
  chatWidgetDraggable: true
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Undangan Pernikahan', slug: 'pernikahan', iconName: 'Heart', description: 'Undangan resepsi & akad nikah modern nan romantis', isActive: true, sortOrder: 1 },
  { id: 'cat-2', name: 'Undangan Ulang Tahun', slug: 'ulang-tahun', iconName: 'Cake', description: 'Rayakan pesta milad, sweet seventeen & syukuran usia', isActive: true, sortOrder: 2 },
  { id: 'cat-3', name: 'Undangan Aqiqah', slug: 'aqiqah', iconName: 'Baby', description: 'Syukuran kelahiran putra & putri tercinta', isActive: true, sortOrder: 3 },
  { id: 'cat-4', name: 'Undangan Khitanan', slug: 'khitanan', iconName: 'Sparkles', description: 'Walimatul khitan dengan doa restu sanak keluarga', isActive: true, sortOrder: 4 },
  { id: 'cat-5', name: 'Undangan Tasyakuran', slug: 'tasyakuran', iconName: 'Home', description: 'Tasyakuran rumah baru, hajat, dan rasa syukur', isActive: true, sortOrder: 5 },
  { id: 'cat-6', name: 'Undangan Pengajian', slug: 'pengajian', iconName: 'BookOpen', description: 'Kajian akbar, tabligh, doa bersama & majelis taklim', isActive: true, sortOrder: 6 },
  { id: 'cat-7', name: 'Undangan Reuni', slug: 'reuni', iconName: 'Users', description: 'Temu kangen alumni sekolah, kampus & angkatan', isActive: true, sortOrder: 7 },
  { id: 'cat-8', name: 'Undangan Rapat', slug: 'rapat', iconName: 'Calendar', description: 'Rapat kerja formal, pleno & koordinasi tahunan', isActive: true, sortOrder: 8 },
  { id: 'cat-9', name: 'Undangan Bisnis', slug: 'bisnis', iconName: 'Briefcase', description: 'Peluncuran produk, corporate gathering & networking', isActive: true, sortOrder: 9 },
  { id: 'cat-10', name: 'Undangan Seminar', slug: 'seminar', iconName: 'Award', description: 'Seminar nasional, talkshow inspiratif & panel ahli', isActive: true, sortOrder: 10 },
  { id: 'cat-11', name: 'Undangan Workshop', slug: 'workshop', iconName: 'Wrench', description: 'Kelas pelatihan, bootcamp intensif & masterclass', isActive: true, sortOrder: 11 },
  { id: 'cat-12', name: 'Undangan Grand Opening', slug: 'grand-opening', iconName: 'Store', description: 'Pembukaan cabang baru, cafe, resto & toko usaha', isActive: true, sortOrder: 12 },
  { id: 'cat-13', name: 'Undangan Event', slug: 'event', iconName: 'Music', description: 'Festival seni, konser musik, pentas & komunitas', isActive: true, sortOrder: 13 },
  { id: 'cat-14', name: 'Undangan Wisuda', slug: 'wisuda', iconName: 'GraduationCap', description: 'Perayaan kelulusan sarjana & graduation party', isActive: true, sortOrder: 14 },
  { id: 'cat-15', name: 'Undangan Organisasi', slug: 'organisasi', iconName: 'Shield', description: 'Musyawarah besar, pelantikan dewan & deklarasi', isActive: true, sortOrder: 15 },
  { id: 'cat-16', name: 'Undangan Sekolah', slug: 'sekolah', iconName: 'School', description: 'Pentas seni, perpisahan kelas & orientasi siswa', isActive: true, sortOrder: 16 },
  { id: 'cat-17', name: 'Undangan Custom', slug: 'custom', iconName: 'Sliders', description: 'Kebutuhan undangan serbaguna dengan form dinamis', isActive: true, sortOrder: 17 }
];

export const INITIAL_TEMPLATES: Template[] = COMPREHENSIVE_TEMPLATES;

// Initial seed orders demonstrating both Wedding and Business live slugs
export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-2026-00001',
    customerName: 'Rendi Pratama',
    email: 'rendi@example.com',
    whatsapp: '081234567890',
    categoryId: 'cat-1',
    templateId: 'tpl-wedding-royal',
    slug: 'undangan-nikah-rendi-jihan',
    price: 5000,
    paymentStatus: 'PAID',
    invitationStatus: 'ACTIVE',
    createdAt: '2026-02-01T08:30:00Z',
    updatedAt: '2026-02-01T09:15:00Z',
    paymentProofUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80',
    paymentProofName: 'bukti_transfer_rendi.jpg',
    viewsCount: 342,
    invitationData: {
      title: 'Pernikahan Rendi & Jihan',
      categorySlug: 'pernikahan',
      tagline: 'Walimatul ‘Ursy',
      description: 'Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan. Kami mengundang Bapak/Ibu/Saudara/i untuk hadir di hari bahagia kami.',
      eventDate: '2026-10-24',
      startTime: '08:00',
      endTime: '14:00',
      venueName: 'Grand Ballroom Hotel Mulia',
      venueAddress: 'Jl. Asia Afrika No. 6, Senayan, Gelora, Tanah Abang, Jakarta Pusat',
      googleMapsUrl: 'https://maps.google.com/?q=Hotel+Mulia+Senayan+Jakarta',
      whatsappContact: '6281234567890',
      coverImageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&auto=format&fit=crop&q=80'
      ],
      backgroundMusicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      dressCode: 'Batik Formal / Pastel Elegant',
      additionalNotes: 'Tanpa mengurangi rasa hormat, mohon hadir tepat waktu dan mengisi buku tamu digital di meja penerimaan.',
      groomName: 'Rendi Pratama, S.T.',
      groomNickname: 'Rendi',
      groomParents: 'Putra pertama dari Bpk. H. Bambang Subagyo & Ibu Hj. Siti Rahayu',
      groomPhotoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80',
      groomInstagram: '@rendipratama',
      brideName: 'Jihan Anindya, S.Ked.',
      brideNickname: 'Jihan',
      brideParents: 'Putri kedua dari Bpk. Ir. Hendro Wibowo & Ibu Dra. Nurul Hidayah',
      bridePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      brideInstagram: '@jihan.anindya',
      akadDate: '2026-10-24',
      akadTime: '08:00 - 10:00 WIB',
      akadVenue: 'Masjid Agung Al-Azhar, Kebayoran Baru',
      akadAddress: 'Jl. Sisingamangaraja No.1, Selong, Kebayoran Baru, Jakarta Selatan',
      resepsiDate: '2026-10-24',
      resepsiTime: '11:00 - 14:00 WIB',
      resepsiVenue: 'Grand Ballroom Mulia Hotel',
      resepsiAddress: 'Jl. Asia Afrika No. 6, Senayan, Jakarta Pusat',
      loveStory: [
        { year: '2019', title: 'Pertemuan Pertama', description: 'Bertemu di kampus Universitas Indonesia saat kegiatan seminar teknologi.' },
        { year: '2022', title: 'Menjalin Hubungan Serius', description: 'Memutuskan untuk saling mendampingi dan merencanakan masa depan bersama.' },
        { year: '2025', title: 'Lamaran Khidmat', description: 'Pertemuan kedua keluarga besar untuk mengikat janji suci menuju pelaminan.' }
      ],
      bankAccounts: [
        { bankName: 'BCA', accountNumber: '8820391204', accountHolder: 'Rendi Pratama' },
        { bankName: 'Bank Mandiri', accountNumber: '1370019283748', accountHolder: 'Jihan Anindya' }
      ]
    }
  },
  {
    id: 'ORD-2026-00002',
    customerName: 'Acme Innovation Corp',
    email: 'event@acme.co.id',
    whatsapp: '081399887766',
    categoryId: 'cat-9',
    templateId: 'tpl-business-navy',
    slug: 'undangan-bisnis-acme',
    price: 5000,
    paymentStatus: 'PAID',
    invitationStatus: 'ACTIVE',
    createdAt: '2026-02-05T11:00:00Z',
    updatedAt: '2026-02-05T11:45:00Z',
    paymentProofUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80',
    paymentProofName: 'bukti_tf_acme.png',
    viewsCount: 185,
    invitationData: {
      title: 'Acme Annual Tech Summit 2026',
      categorySlug: 'bisnis',
      tagline: 'Empowering Next-Gen AI & Cloud Infrastructure',
      description: 'Bergabunglah bersama 500+ pemimpin industri teknologi, CIO, dan founder startup terkemuka untuk mendiskusikan inovasi otomasi digital.',
      eventDate: '2026-11-15',
      startTime: '09:00',
      endTime: '17:00',
      venueName: 'Jakarta Convention Center (JCC) Assembly Hall',
      venueAddress: 'Jl. Gatot Subroto No.1, Gelora, Tanah Abang, Jakarta Pusat',
      googleMapsUrl: 'https://maps.google.com/?q=Jakarta+Convention+Center',
      whatsappContact: '6281399887766',
      coverImageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&auto=format&fit=crop&q=80'
      ],
      dressCode: 'Business Formal / Smart Casual',
      companyName: 'PT Acme Solusi Nusantara',
      eventCategory: 'Technology Conference & Expo',
      registrationUrl: 'https://acme.co.id/register',
      websiteUrl: 'https://acme.co.id',
      companyLogoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=300&auto=format&fit=crop&q=80',
      speakers: [
        { id: 'spk-1', name: 'Dr. Kevin Sanjaya', title: 'VP of Artificial Intelligence, Acme Global' },
        { id: 'spk-2', name: 'Alina Hartono, M.Sc.', title: 'Head of Cloud Architecture, FinTech Nusantara' }
      ]
    }
  },
  {
    id: 'ORD-2026-00003',
    customerName: 'Farhan Maulana',
    email: 'farhan@mail.com',
    whatsapp: '081299001122',
    categoryId: 'cat-2',
    templateId: 'tpl-birthday-festive',
    slug: 'undangan-ulangtahun-andi',
    price: 5000,
    paymentStatus: 'PENDING',
    invitationStatus: 'INACTIVE',
    createdAt: '2026-02-12T14:20:00Z',
    updatedAt: '2026-02-12T14:20:00Z',
    paymentProofUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80',
    paymentProofName: 'transfer_bca_5000.jpg',
    viewsCount: 12,
    invitationData: {
      title: 'Pesta Ulang Tahun Andi ke-17',
      categorySlug: 'ulang-tahun',
      tagline: 'Sweet Seventeen Celebration',
      description: 'Ayo rayakan momen spesial kedewasaan Andi dengan musik, game seru, dan makan malam bersama kawan-kawan terbaik!',
      eventDate: '2026-10-30',
      startTime: '18:30',
      endTime: '21:30',
      venueName: 'Sky Lounge Cafe & Bistro',
      venueAddress: 'Rooftop Fl. 8, Mall Kelapa Gading 3, Jakarta Utara',
      googleMapsUrl: 'https://maps.google.com/?q=Mall+Kelapa+Gading',
      whatsappContact: '6281299001122',
      coverImageUrl: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1200&auto=format&fit=crop&q=80',
      galleryImages: [],
      dressCode: 'Monochrome (Hitam / Putih)',
      honoreeName: 'Andi Pratama Putra',
      honoreeAge: '17 Tahun'
    }
  },
  {
    id: 'ORD-2026-00004',
    customerName: 'Panitia Pensi OSIS SMAN 1',
    email: 'osis.sman1@example.com',
    whatsapp: '081298765432',
    categoryId: 'cat-16',
    templateId: 'tpl-sekolah-pensi',
    slug: 'undangan-pensi-sekolah-sman1',
    price: 5000,
    paymentStatus: 'PAID',
    invitationStatus: 'ACTIVE',
    createdAt: '2026-02-15T09:00:00Z',
    updatedAt: '2026-02-15T09:30:00Z',
    paymentProofUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80',
    paymentProofName: 'bukti_bayar_sekolah.jpg',
    viewsCount: 642,
    invitationData: {
      title: 'Pentas Seni & Gelar Budaya 2026',
      categorySlug: 'sekolah',
      tagline: 'Simfoni Harmoni Kreativitas Pelajar Nusantara',
      description: 'Dengan penuh rasa bangga dan sukacita, kami mengundang segenap Dewan Guru, Orang Tua/Wali Murid, Alumni, serta Siswa-Siswi untuk menghadiri dan memeriahkan pagelaran seni tahunan SMA Negeri 1 Jakarta.',
      eventDate: '2026-11-20',
      startTime: '08:30',
      endTime: '16:00',
      venueName: 'Auditorium Graha Wicaksana & Lapangan Utama SMAN 1',
      venueAddress: 'Jl. Budi Utomo No. 7, Pasar Baru, Sawah Besar, Jakarta Pusat',
      googleMapsUrl: 'https://maps.google.com/?q=SMA+Negeri+1+Jakarta',
      whatsappContact: '6281298765432',
      coverImageUrl: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?w=1200&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80'
      ],
      backgroundMusicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      dressCode: 'Batik Pelajar / Pakaian Rapi Bebas Sopan',
      additionalNotes: 'Harap membawa barcode undangan digital ini atau kartu identitas saat registrasi di meja piket gerbang utama.',
      institutionName: 'SMA Negeri 1 Jakarta',
      principalOrHead: 'Drs. H. Suwandi, M.Pd.',
      committeeHead: 'Muhammad Rayhan (Ketua OSIS)',
      academicYear: 'Tahun Ajaran 2025/2026',
      ticketPrice: 'Gratis (Wajib Konfirmasi Kehadiran / RSVP)',
      agendaRundown: [
        { time: '08:00 - 08:30', activity: 'Registrasi & Kedatangan Tamu Undangan', performer: 'Panitia OSIS' },
        { time: '08:30 - 09:15', activity: 'Tari Saman Pembuka & Sambutan Kepala Sekolah', performer: 'Ekskul Tari Tradisional & Kepala Sekolah' },
        { time: '09:15 - 10:45', activity: 'Gelar Teater & Orkestra Musik Pelajar', performer: 'Sanggar Seni SMA 1' },
        { time: '10:45 - 12:00', activity: 'Parade Musik Band Antar Kelas & Eksibisi Karya', performer: 'Finalis Akustik Kelas X - XII' },
        { time: '13:00 - 15:30', activity: 'Penampilan Bintang Tamu (Guest Star) & Penganugerahan Juara', performer: 'Bintang Tamu & Seluruh Panitia' }
      ]
    }
  }
];

export const INITIAL_RSVPS: RSVPItem[] = [
  {
    id: 'rsvp-1',
    invitationSlug: 'undangan-nikah-rendi-jihan',
    guestName: 'Budi Santoso & Keluarga',
    status: 'attending',
    guestCount: 2,
    wishes: 'Selamat menempuh hidup baru untuk Rendi & Jihan! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah. Aamiin.',
    createdAt: '2026-02-02T10:00:00Z'
  },
  {
    id: 'rsvp-2',
    invitationSlug: 'undangan-nikah-rendi-jihan',
    guestName: 'Dewi Lestari',
    status: 'attending',
    guestCount: 1,
    wishes: 'Barakallahu lakuma wa baraka alaikuma wa jama’a bainakuma fii khair. Turut berbahagia untuk kalian berdua!',
    createdAt: '2026-02-03T14:12:00Z'
  },
  {
    id: 'rsvp-3',
    invitationSlug: 'undangan-bisnis-acme',
    guestName: 'PT Digital Nusantara (Derry H.)',
    status: 'attending',
    guestCount: 3,
    wishes: 'Kami mengonfirmasi kehadiran untuk delegasi 3 orang. Sukses besar untuk Acme Tech Summit 2026!',
    createdAt: '2026-02-06T09:20:00Z'
  }
];

// Initialize storage with seeds
export async function initializeDatabase(): Promise<void> {
  if (typeof window === 'undefined') return;

  const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  if (initialized) return;

  // Initial Admin account (admin@surat.id / admin123)
  const defaultPasswordHash = await hashPassword('admin123');
  const defaultAdmin: AdminUser = {
    id: 'adm-root-001',
    name: 'Super Administrator',
    email: 'admin@surat.id',
    passwordHash: defaultPasswordHash,
    role: 'superadmin',
    createdAt: new Date().toISOString()
  };

  localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify([defaultAdmin]));
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(INITIAL_TEMPLATES));
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  localStorage.setItem(STORAGE_KEYS.RSVPS, JSON.stringify(INITIAL_RSVPS));
  localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify([]));

  // Customers seeded from initial orders
  const customers: Customer[] = [
    {
      id: 'cust-1',
      name: 'Rendi Pratama',
      email: 'rendi@example.com',
      whatsapp: '081234567890',
      orderCount: 1,
      lastOrderDate: '2026-02-01T08:30:00Z',
      createdAt: '2026-02-01T08:30:00Z'
    },
    {
      id: 'cust-2',
      name: 'Acme Innovation Corp',
      email: 'event@acme.co.id',
      whatsapp: '081399887766',
      orderCount: 1,
      lastOrderDate: '2026-02-05T11:00:00Z',
      createdAt: '2026-02-05T11:00:00Z'
    },
    {
      id: 'cust-3',
      name: 'Farhan Maulana',
      email: 'farhan@mail.com',
      whatsapp: '081299001122',
      orderCount: 1,
      lastOrderDate: '2026-02-12T14:20:00Z',
      createdAt: '2026-02-12T14:20:00Z'
    }
  ];
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));

  const logs: ActivityLog[] = [
    {
      id: 'log-1',
      adminEmail: 'admin@surat.id',
      action: 'SYSTEM_BOOT',
      details: 'Sistem SURAT diinisialisasi dengan 17 kategori dan template dasar.',
      timestamp: new Date().toISOString()
    }
  ];
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));

  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
}

// Database helper operations
export const db = {
  // SETTINGS
  getSettings(): SiteSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!raw) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },
  updateSettings(settings: Partial<SiteSettings>): SiteSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('surat:settings-updated', { detail: updated }));
    return updated;
  },
  saveSettings(settings: SiteSettings): SiteSettings {
    return this.updateSettings(settings);
  },

  // CATEGORIES
  getCategories(): Category[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return raw ? JSON.parse(raw) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  },
  saveCategory(category: Category): void {
    const list = this.getCategories();
    const idx = list.findIndex(c => c.id === category.id);
    if (idx >= 0) {
      list[idx] = category;
    } else {
      list.push(category);
    }
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(list));
  },
  deleteCategory(id: string): void {
    const list = this.getCategories().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(list));
  },

  // TEMPLATES
  getTemplates(): Template[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
      if (!raw) return INITIAL_TEMPLATES;
      const list: Template[] = JSON.parse(raw);
      // If the saved list has fewer templates than INITIAL_TEMPLATES (e.g. from previous run),
      // merge in any missing new initial templates seamlessly
      if (list.length < INITIAL_TEMPLATES.length) {
        const existingIds = new Set(list.map(t => t.id));
        const missing = INITIAL_TEMPLATES.filter(t => !existingIds.has(t.id));
        const merged = [...list, ...missing];
        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(merged));
        return merged;
      }
      return list;
    } catch {
      return INITIAL_TEMPLATES;
    }
  },
  getTemplateById(id: string): Template | undefined {
    return this.getTemplates().find(t => t.id === id);
  },
  saveTemplate(tpl: Template): void {
    const list = this.getTemplates();
    const idx = list.findIndex(t => t.id === tpl.id);
    if (idx >= 0) {
      list[idx] = tpl;
    } else {
      list.push(tpl);
    }
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(list));
  },
  deleteTemplate(id: string): void {
    const list = this.getTemplates().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(list));
  },

  // ORDERS & INVITATIONS
  getOrders(): Order[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (!raw) return INITIAL_ORDERS;
      const list: Order[] = JSON.parse(raw);
      // Merge missing initial orders (e.g. school demo order)
      const existingSlugs = new Set(list.map(o => o.slug));
      const missing = INITIAL_ORDERS.filter(o => !existingSlugs.has(o.slug));
      if (missing.length > 0) {
        const merged = [...list, ...missing];
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(merged));
        return merged;
      }
      return list;
    } catch {
      return INITIAL_ORDERS;
    }
  },
  getOrderById(id: string): Order | undefined {
    if (!id) return undefined;
    return this.getOrders().find(o => o.id === id);
  },
  getOrderBySlug(slug: string): Order | undefined {
    if (!slug) return undefined;
    try {
      const decoded = decodeURIComponent(slug).split('?')[0].replace(/^\//, '').toLowerCase().trim();
      return this.getOrders().find(o => {
        const orderSlug = (o.slug || '').replace(/^\//, '').toLowerCase().trim();
        return orderSlug === decoded;
      });
    } catch {
      const raw = slug.split('?')[0].replace(/^\//, '').toLowerCase().trim();
      return this.getOrders().find(o => (o.slug || '').replace(/^\//, '').toLowerCase().trim() === raw);
    }
  },
  isSlugTaken(slug: string, excludeOrderId?: string): boolean {
    if (!slug) return false;
    try {
      const decoded = decodeURIComponent(slug).split('?')[0].replace(/^\//, '').toLowerCase().trim();
      return this.getOrders().some(o => {
        const orderSlug = (o.slug || '').replace(/^\//, '').toLowerCase().trim();
        return orderSlug === decoded && o.id !== excludeOrderId;
      });
    } catch {
      const raw = slug.split('?')[0].replace(/^\//, '').toLowerCase().trim();
      return this.getOrders().some(o => (o.slug || '').replace(/^\//, '').toLowerCase().trim() === raw && o.id !== excludeOrderId);
    }
  },
  saveOrder(order: Order): void {
    const list = this.getOrders();
    const idx = list.findIndex(o => o.id === order.id);
    if (idx >= 0) {
      list[idx] = order;
    } else {
      list.unshift(order);
    }
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(list));

    // Update customer CRM record
    this.syncCustomerFromOrder(order);
  },
  deleteOrder(id: string): void {
    const list = this.getOrders().filter(o => o.id !== id);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(list));
  },
  incrementViewCount(slug: string): void {
    const order = this.getOrderBySlug(slug);
    if (order) {
      order.viewsCount = (order.viewsCount || 0) + 1;
      this.saveOrder(order);
    }
  },

  // CUSTOMERS
  getCustomers(): Customer[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  syncCustomerFromOrder(order: Order): void {
    const customers = this.getCustomers();
    const existingIdx = customers.findIndex(c => c.email.toLowerCase() === order.email.toLowerCase());
    if (existingIdx >= 0) {
      customers[existingIdx].orderCount += 1;
      customers[existingIdx].lastOrderDate = order.createdAt;
      customers[existingIdx].whatsapp = order.whatsapp || customers[existingIdx].whatsapp;
    } else {
      customers.push({
        id: 'cust-' + Date.now(),
        name: order.customerName,
        email: order.email,
        whatsapp: order.whatsapp,
        orderCount: 1,
        lastOrderDate: order.createdAt,
        createdAt: order.createdAt
      });
    }
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  },

  // RSVPS
  getRSVPs(slug?: string): RSVPItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.RSVPS);
      const list: RSVPItem[] = raw ? JSON.parse(raw) : INITIAL_RSVPS;
      if (slug) {
        return list.filter(r => r.invitationSlug === slug);
      }
      return list;
    } catch {
      return [];
    }
  },
  addRSVP(rsvp: RSVPItem): void {
    const list = this.getRSVPs();
    list.unshift(rsvp);
    localStorage.setItem(STORAGE_KEYS.RSVPS, JSON.stringify(list));
  },

  // MEDIA
  getMedia(): MediaItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.MEDIA);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  addMedia(item: MediaItem): void {
    const list = this.getMedia();
    list.unshift(item);
    localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(list));
  },
  deleteMedia(id: string): void {
    const list = this.getMedia().filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(list));
  },

  // ADMIN USERS
  getAdmins(): AdminUser[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ADMINS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  saveAdmin(admin: AdminUser): void {
    const list = this.getAdmins();
    const idx = list.findIndex(a => a.id === admin.id);
    if (idx >= 0) {
      list[idx] = admin;
    } else {
      list.push(admin);
    }
    localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(list));
  },

  // ACTIVITY LOGS
  getLogs(): ActivityLog[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  logActivity(adminEmail: string, action: string, details: string): void {
    const list = this.getLogs();
    list.unshift({
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      adminEmail,
      action,
      details,
      timestamp: new Date().toISOString()
    });
    // Keep max 200 logs
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(list.slice(0, 200)));
  },

  // ==========================================
  // LIVE CHAT & CONVERSATIONS
  // ==========================================
  getConversations(): ChatConversation[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  getConversationById(id: string): ChatConversation | undefined {
    return this.getConversations().find(c => c.id === id);
  },
  getConversationByEmail(email: string): ChatConversation | undefined {
    if (!email) return undefined;
    return this.getConversations().find(c => c.userEmail.toLowerCase() === email.toLowerCase());
  },
  saveConversation(convo: ChatConversation): void {
    const list = this.getConversations();
    const idx = list.findIndex(c => c.id === convo.id);
    if (idx >= 0) {
      list[idx] = convo;
    } else {
      list.unshift(convo);
    }
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('surat:chat-updated', { detail: { conversationId: convo.id } }));
  },
  deleteConversation(id: string): void {
    const list = this.getConversations().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(list));
    // Also delete messages
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CHATS);
      if (raw) {
        const allMsgs: ChatMessage[] = JSON.parse(raw);
        const filtered = allMsgs.filter(m => m.conversationId !== id);
        localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(filtered));
      }
    } catch {
      // safe
    }
    window.dispatchEvent(new CustomEvent('surat:chat-updated', { detail: { conversationId: id } }));
  },
  getMessages(conversationId?: string): ChatMessage[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CHATS);
      const all: ChatMessage[] = raw ? JSON.parse(raw) : [];
      if (conversationId) {
        return all.filter(m => m.conversationId === conversationId);
      }
      return all;
    } catch {
      return [];
    }
  },
  sendMessage(msg: ChatMessage): void {
    const all = this.getMessages();
    all.push(msg);
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(all));

    // Update conversation last message & unread count
    const convo = this.getConversationById(msg.conversationId);
    if (convo) {
      convo.lastMessage = msg.text;
      convo.lastMessageAt = msg.timestamp;
      if (msg.senderRole === 'user') {
        convo.unreadAdminCount = (convo.unreadAdminCount || 0) + 1;
        if (msg.isNudge) {
          convo.lastNudgeAt = msg.timestamp;
          convo.nudgeCount = (convo.nudgeCount || 0) + 1;
        }
      } else {
        convo.unreadUserCount = (convo.unreadUserCount || 0) + 1;
      }
      this.saveConversation(convo);
    }

    window.dispatchEvent(new CustomEvent('surat:chat-message-sent', { detail: msg }));
  },
  deleteMessage(messageId: string): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CHATS);
      if (!raw) return;
      let all: ChatMessage[] = JSON.parse(raw);
      all = all.filter(m => m.id !== messageId);
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(all));
      window.dispatchEvent(new CustomEvent('surat:chat-updated'));
    } catch {}
  },
  clearMessages(conversationId: string): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CHATS);
      if (!raw) return;
      let all: ChatMessage[] = JSON.parse(raw);
      all = all.filter(m => m.conversationId !== conversationId);
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(all));

      const convo = this.getConversationById(conversationId);
      if (convo) {
        convo.lastMessage = 'Riwayat obrolan telah dibersihkan oleh Administrator.';
        convo.unreadAdminCount = 0;
        convo.unreadUserCount = 0;
        this.saveConversation(convo);
      }
      window.dispatchEvent(new CustomEvent('surat:chat-updated'));
    } catch {}
  },
  updateConversationStatus(conversationId: string, status: string): void {
    const convo = this.getConversationById(conversationId);
    if (!convo) return;
    convo.status = status;
    this.saveConversation(convo);
    window.dispatchEvent(new CustomEvent('surat:chat-updated'));
  },
  updateConversationNotes(conversationId: string, notes: string): void {
    const convo = this.getConversationById(conversationId);
    if (!convo) return;
    convo.adminNotes = notes;
    this.saveConversation(convo);
    window.dispatchEvent(new CustomEvent('surat:chat-updated'));
  },
  markConversationRead(conversationId: string, role: 'admin' | 'user'): void {
    const convo = this.getConversationById(conversationId);
    if (!convo) return;
    if (role === 'admin') {
      convo.unreadAdminCount = 0;
    } else {
      convo.unreadUserCount = 0;
    }
    this.saveConversation(convo);
  },

  // ==========================================
  // BANNED USERS MANAGEMENT (SECURE & RELIABLE)
  // ==========================================
  getBannedUsers(): BannedUser[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.BANNED_USERS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  banUser(banned: BannedUser): void {
    const rawId = (banned.identifier || '').trim();
    if (!rawId) return;
    const cleanId = rawId.toLowerCase();

    const list = this.getBannedUsers();
    const cleanBanned: BannedUser = {
      ...banned,
      identifier: cleanId,
      name: banned.name?.trim() || banned.userName?.trim(),
      reason: banned.reason?.trim() || 'Pelanggaran ketentuan sistem atau spamming.',
      bannedAt: banned.bannedAt || new Date().toISOString(),
      bannedBy: banned.bannedBy || 'Administrator SURAT'
    };

    const idx = list.findIndex(b => (b.identifier || '').trim().toLowerCase() === cleanId);
    if (idx >= 0) {
      list[idx] = cleanBanned;
    } else {
      list.unshift(cleanBanned);
    }
    localStorage.setItem(STORAGE_KEYS.BANNED_USERS, JSON.stringify(list));

    // Synchronize all matching conversations
    const convos = this.getConversations();
    let convosUpdated = false;
    convos.forEach(c => {
      const cEmail = (c.userEmail || '').trim().toLowerCase();
      const cUserId = (c.userId || '').trim().toLowerCase();
      const cName = (c.userName || '').trim().toLowerCase();
      const cId = (c.id || '').trim().toLowerCase();

      if (cEmail === cleanId || cUserId === cleanId || cName === cleanId || cId === cleanId) {
        c.isBanned = true;
        c.bannedReason = cleanBanned.reason;
        c.bannedAt = cleanBanned.bannedAt;
        convosUpdated = true;
      }
    });
    if (convosUpdated) {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(convos));
    }

    // Also mark customer account if registered
    try {
      const usersRaw = localStorage.getItem('surat_db_user_accounts');
      if (usersRaw) {
        const users = JSON.parse(usersRaw);
        if (Array.isArray(users)) {
          let userTouched = false;
          users.forEach((u: any) => {
            const uEmail = (u.email || '').trim().toLowerCase();
            const uName = (u.username || '').trim().toLowerCase();
            const uPhone = (u.phone || '').trim().toLowerCase();
            const uId = (u.id || '').trim().toLowerCase();
            if (uEmail === cleanId || uName === cleanId || uPhone === cleanId || uId === cleanId) {
              u.isBanned = true;
              u.bannedReason = cleanBanned.reason;
              u.bannedAt = cleanBanned.bannedAt;
              userTouched = true;
            }
          });
          if (userTouched) {
            localStorage.setItem('surat_db_user_accounts', JSON.stringify(users));
          }
        }
      }
    } catch {}

    // Security Audit Log
    securityService.logSecurityEvent({
      eventType: 'USER_BANNED',
      severity: 'high',
      details: `Pengguna diblokir: "${cleanBanned.identifier}" (${cleanBanned.name || 'Tanpa Nama'}). Alasan: ${cleanBanned.reason}`,
      target: cleanBanned.identifier
    });

    window.dispatchEvent(new CustomEvent('surat:banned-updated'));
    window.dispatchEvent(new CustomEvent('surat:chat-updated'));
  },

  unbanUser(identifier: string): void {
    const rawId = (identifier || '').trim();
    if (!rawId) return;
    const cleanId = rawId.toLowerCase();

    const list = this.getBannedUsers().filter(
      b => (b.identifier || '').trim().toLowerCase() !== cleanId &&
           (b.id || '').trim().toLowerCase() !== cleanId
    );
    localStorage.setItem(STORAGE_KEYS.BANNED_USERS, JSON.stringify(list));

    // Unmark all matching conversations
    const convos = this.getConversations();
    let convosUpdated = false;
    convos.forEach(c => {
      const cEmail = (c.userEmail || '').trim().toLowerCase();
      const cUserId = (c.userId || '').trim().toLowerCase();
      const cName = (c.userName || '').trim().toLowerCase();
      const cId = (c.id || '').trim().toLowerCase();

      if (cEmail === cleanId || cUserId === cleanId || cName === cleanId || cId === cleanId) {
        c.isBanned = false;
        c.bannedReason = undefined;
        c.bannedAt = undefined;
        convosUpdated = true;
      }
    });
    if (convosUpdated) {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(convos));
    }

    // Also unmark customer account if registered
    try {
      const usersRaw = localStorage.getItem('surat_db_user_accounts');
      if (usersRaw) {
        const users = JSON.parse(usersRaw);
        if (Array.isArray(users)) {
          let userTouched = false;
          users.forEach((u: any) => {
            const uEmail = (u.email || '').trim().toLowerCase();
            const uName = (u.username || '').trim().toLowerCase();
            const uPhone = (u.phone || '').trim().toLowerCase();
            const uId = (u.id || '').trim().toLowerCase();
            if (uEmail === cleanId || uName === cleanId || uPhone === cleanId || uId === cleanId) {
              u.isBanned = false;
              u.bannedReason = undefined;
              u.bannedAt = undefined;
              userTouched = true;
            }
          });
          if (userTouched) {
            localStorage.setItem('surat_db_user_accounts', JSON.stringify(users));
          }
        }
      }
    } catch {}

    // Security Audit Log
    securityService.logSecurityEvent({
      eventType: 'USER_UNBANNED',
      severity: 'medium',
      details: `Pemblokiran dibuka (Unbanned): "${cleanId}". Akses live chat dan pesanan dipulihkan.`,
      target: cleanId
    });

    window.dispatchEvent(new CustomEvent('surat:banned-updated'));
    window.dispatchEvent(new CustomEvent('surat:chat-updated'));
  },

  isUserBanned(identifier?: string, additionalIdentifiers?: (string | undefined)[]): { isBanned: boolean; reason?: string; bannedAt?: string } {
    if (!identifier && (!additionalIdentifiers || additionalIdentifiers.length === 0)) {
      return { isBanned: false };
    }

    const list = this.getBannedUsers();
    if (list.length === 0) return { isBanned: false };

    const candidates: string[] = [];
    if (identifier) candidates.push(identifier.trim().toLowerCase());
    if (additionalIdentifiers) {
      additionalIdentifiers.forEach(id => {
        if (id && id.trim()) candidates.push(id.trim().toLowerCase());
      });
    }

    // 1. Direct match in banned list
    for (const cand of candidates) {
      const found = list.find(b => {
        const bId = (b.identifier || '').trim().toLowerCase();
        const bName = (b.name || b.userName || '').trim().toLowerCase();
        return bId === cand || (bName && bName === cand);
      });
      if (found) {
        return { isBanned: true, reason: found.reason, bannedAt: found.bannedAt };
      }
    }

    // 2. Check in conversations to see if marked banned
    const convos = this.getConversations();
    for (const cand of candidates) {
      const convoMatch = convos.find(c => {
        const cEmail = (c.userEmail || '').trim().toLowerCase();
        const cUserId = (c.userId || '').trim().toLowerCase();
        return (cEmail === cand || cUserId === cand) && c.isBanned;
      });
      if (convoMatch && convoMatch.isBanned) {
        return { isBanned: true, reason: convoMatch.bannedReason || 'Akun dalam daftar pemblokiran.', bannedAt: convoMatch.bannedAt };
      }
    }

    return { isBanned: false };
  },

  // ==========================================
  // ANNOUNCEMENTS & BROADCASTS
  // ==========================================
  getAnnouncements(): Announcement[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
      if (raw) return JSON.parse(raw);
      // Default initial announcements
      const initial: Announcement[] = [
        {
          id: 'anc-welcome',
          title: '🎉 Selamat Datang di SURAT Platform!',
          content: 'Kini Anda dapat membuat undangan digital modern hanya Rp5.000 dengan fitur Susunan Acara lengkap, Live Chat Admin, dan file download mandiri.',
          type: 'promo',
          isActive: true,
          priority: 'high',
          targetAudience: 'all',
          actionText: 'Buat Undangan',
          actionUrl: '/create',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(initial));
      return initial;
    } catch {
      return [];
    }
  },
  getActiveAnnouncements(): Announcement[] {
    return this.getAnnouncements().filter(a => a.isActive);
  },
  saveAnnouncement(announcement: Announcement): void {
    const list = this.getAnnouncements();
    const idx = list.findIndex(a => a.id === announcement.id);
    if (idx >= 0) {
      list[idx] = announcement;
    } else {
      list.unshift(announcement);
    }
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('surat:announcements-updated'));
  },
  deleteAnnouncement(id: string): void {
    const list = this.getAnnouncements().filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('surat:announcements-updated'));
  }
};
