import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Smartphone,
  Monitor,
  Calendar,
  Clock,
  MapPin,
  Heart,
  Briefcase,
  Cake,
  Music,
  Plus,
  Trash2,
  HelpCircle,
  Eye,
  Search,
  SlidersHorizontal,
  School,
  GraduationCap,
  Users,
  Ticket,
  UserCheck,
  LogIn
} from 'lucide-react';
import { Category, Template, InvitationData, Order, UserAccount } from '../types';
import { db } from '../services/storage';
import { customerAuth } from '../services/customerAuth';
import { SlugAvailability } from '../components/SlugAvailability';
import { InvitationView } from './InvitationView';
import { MediaGalleryManager } from '../components/MediaGalleryManager';
import { GiftBankManager } from '../components/GiftBankManager';
import { LoveStoryManager } from '../components/LoveStoryManager';
import { SpeakersManager } from '../components/SpeakersManager';

interface CreateWizardProps {
  onComplete: (newOrder: Order) => void;
  onCancel: () => void;
  initialCategoryId?: string;
  initialTemplateId?: string;
  onOpenAuth?: (tab: 'login' | 'register') => void;
}

export const CreateWizard: React.FC<CreateWizardProps> = ({
  onComplete,
  onCancel,
  initialCategoryId,
  initialTemplateId,
  onOpenAuth
}) => {
  const categories = useMemo(() => db.getCategories().filter(c => c.isActive), []);
  const allTemplates = useMemo(() => db.getTemplates().filter(t => t.isActive), []);

  const settings = useMemo(() => db.getSettings(), []);
  const basePrice = settings.basePrice || 5000;

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialCategoryId || 'cat-1');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialTemplateId || allTemplates[0]?.id || 'tpl-wedding-royal');
  const [templateFilterCategory, setTemplateFilterCategory] = useState<string>('all');
  const [templateSearchQuery, setTemplateSearchQuery] = useState<string>('');

  // Customer Contact for Order (Auto fill if logged in)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => customerAuth.getCurrentUser());
  const [customerName, setCustomerName] = useState(() => currentUser?.name || currentUser?.username || '');
  const [email, setEmail] = useState(() => currentUser?.email || '');
  const [whatsapp, setWhatsapp] = useState(() => currentUser?.phone || '');

  // Keep customer auth in sync
  useEffect(() => {
    const syncUser = () => {
      const active = customerAuth.getCurrentUser();
      setCurrentUser(active);
      if (active) {
        setCustomerName(prev => prev.trim() ? prev : (active.name || active.username || ''));
        setEmail(prev => prev.trim() ? prev : (active.email || ''));
        setWhatsapp(prev => prev.trim() ? prev : (active.phone || ''));
      }
    };
    window.addEventListener('surat:auth-changed', syncUser);
    return () => window.removeEventListener('surat:auth-changed', syncUser);
  }, []);

  // Slug
  const [slug, setSlug] = useState('');

  // Preview device mode in Step 4
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');

  // Active category and template
  const activeCategory = categories.find(c => c.id === selectedCategoryId) || categories[0];
  const isSchool = activeCategory?.slug === 'sekolah' || selectedCategoryId === 'cat-16';
  const isGraduation = activeCategory?.slug === 'wisuda' || selectedCategoryId === 'cat-14';
  const isReunion = activeCategory?.slug === 'reuni' || selectedCategoryId === 'cat-7';
  const isWedding = (activeCategory?.slug === 'pernikahan' || selectedCategoryId === 'cat-1') && !isSchool && !isGraduation && !isReunion;
  const isBusiness = ['bisnis', 'seminar', 'workshop', 'rapat', 'organisasi'].includes(activeCategory?.slug || '');
  const isCelebration = !isWedding && !isBusiness && !isSchool && !isGraduation && !isReunion;

  // Invitation Form Data - Pure manual data entry with category initial values
  const [formData, setFormData] = useState<InvitationData>(() => {
    if (initialCategoryId === 'cat-16') {
      return {
        title: 'Pentas Seni & Gelar Budaya 2026',
        categorySlug: 'sekolah',
        tagline: 'Pentas Seni & Gelar Budaya Pelajar',
        institutionName: 'SMA Negeri 1 Harapan Bangsa',
        principalOrHead: 'Drs. H. Bambang Suwandi, M.Pd.',
        committeeHead: 'Muhammad Fadhil (Ketua OSIS)',
        academicYear: 'Tahun Ajaran 2025/2026',
        description: 'Dengan penuh rasa bangga dan sukacita, kami mengundang segenap Dewan Guru, Orang Tua/Wali Murid, Alumni, serta Siswa-Siswi untuk menghadiri dan memeriahkan pagelaran pentas seni tahunan sekolah.',
        eventDate: '2026-11-20',
        startTime: '08:00',
        endTime: '15:00',
        venueName: 'Auditorium & Lapangan Utama Sekolah',
        venueAddress: 'Jl. Pemuda Pendidikan No. 12, Jakarta',
        ticketPrice: 'Gratis (Wajib Membawa Undangan Digital)',
        dressCode: 'Batik Pelajar / Pakaian Rapi Bebas Sopan',
        coverImageUrl: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?w=1200&auto=format&fit=crop&q=80',
        galleryImages: [
          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80'
        ],
        backgroundMusicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        agendaRundown: [
          { time: '08:00 - 08:30', activity: 'Registrasi & Penyambutan Tamu Undangan', performer: 'Panitia OSIS' },
          { time: '08:30 - 09:15', activity: 'Tari Tradisional Pembuka & Sambutan Kepala Sekolah', performer: 'Ekskul Tari Tradisional' },
          { time: '09:15 - 11:30', activity: 'Parade Musik Band Pelajar & Teater Drama', performer: 'Siswa Kelas X - XII' },
          { time: '13:00 - 15:00', activity: 'Penampilan Bintang Tamu & Penganugerahan Juara', performer: 'Guest Star & Tim OSIS' }
        ]
      };
    }

    return {
      title: '',
      categorySlug: 'pernikahan',
      tagline: 'Undangan Pernikahan',
      description: '',
      eventDate: '',
      startTime: '09:00',
      endTime: '13:00',
      venueName: '',
      venueAddress: '',
      googleMapsUrl: '',
      whatsappContact: '',
      coverImageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80',
      galleryImages: [
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop&q=80'
      ],
      backgroundMusicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      dressCode: '',
      additionalNotes: '',

      // Wedding specifics
      groomName: '',
      groomNickname: '',
      groomParents: '',
      groomPhotoUrl: '',
      groomInstagram: '',
      brideName: '',
      brideNickname: '',
      brideParents: '',
      bridePhotoUrl: '',
      brideInstagram: '',
      akadDate: '',
      akadTime: '08:00 - 10:00 WIB',
      akadVenue: '',
      akadAddress: '',
      resepsiDate: '',
      resepsiTime: '11:00 - 14:00 WIB',
      resepsiVenue: '',
      resepsiAddress: '',
      loveStory: [],
      bankAccounts: [],

      // Business specifics
      companyName: '',
      eventCategory: 'Corporate Gathering',
      registrationUrl: '',
      websiteUrl: '',
      speakers: [],

      // Birthday / Aqiqah specifics
      honoreeName: '',
      honoreeAge: ''
    };
  });

  // Filter templates matching category & search
  const filteredTemplates = useMemo(() => {
    let list = allTemplates;
    if (templateFilterCategory !== 'all') {
      list = list.filter(t => t.categoryId === templateFilterCategory);
    }
    if (templateSearchQuery.trim()) {
      const q = templateSearchQuery.toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    return list;
  }, [allTemplates, templateFilterCategory, templateSearchQuery]);

  // Handle category change
  const handleCategorySelect = (cat: Category) => {
    setSelectedCategoryId(cat.id);
    setTemplateFilterCategory(cat.id);
    const updatedTagline = `Undangan ${cat.name}`;

    if (cat.slug === 'sekolah' || cat.id === 'cat-16') {
      setFormData(prev => ({
        ...prev,
        categorySlug: 'sekolah',
        tagline: 'Pentas Seni & Gelar Budaya Pelajar',
        title: prev.title || 'Pentas Seni & Gelar Budaya 2026',
        institutionName: prev.institutionName || 'SMA Negeri 1 Harapan Bangsa',
        principalOrHead: prev.principalOrHead || 'Drs. H. Bambang Suwandi, M.Pd.',
        committeeHead: prev.committeeHead || 'Muhammad Fadhil (Ketua OSIS)',
        academicYear: prev.academicYear || 'Tahun Ajaran 2025/2026',
        description: prev.description || 'Dengan penuh rasa bangga dan sukacita, kami mengundang segenap Dewan Guru, Orang Tua/Wali Murid, Alumni, serta Siswa-Siswi untuk menghadiri dan memeriahkan pagelaran pentas seni tahunan sekolah.',
        eventDate: prev.eventDate || '2026-11-20',
        startTime: prev.startTime || '08:00',
        endTime: prev.endTime || '15:00',
        venueName: prev.venueName || 'Auditorium & Lapangan Utama Sekolah',
        venueAddress: prev.venueAddress || 'Jl. Pemuda Pendidikan No. 12, Jakarta',
        ticketPrice: prev.ticketPrice || 'Gratis (Wajib Membawa Undangan Digital)',
        dressCode: prev.dressCode || 'Batik Pelajar / Pakaian Rapi Bebas Sopan',
        coverImageUrl: prev.coverImageUrl && !prev.coverImageUrl.includes('photo-1519741497674') ? prev.coverImageUrl : 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?w=1200&auto=format&fit=crop&q=80',
        galleryImages: [
          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80'
        ],
        backgroundMusicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        agendaRundown: [
          { time: '08:00 - 08:30', activity: 'Registrasi & Penyambutan Tamu Undangan', performer: 'Panitia OSIS' },
          { time: '08:30 - 09:15', activity: 'Tari Tradisional Pembuka & Sambutan Kepala Sekolah', performer: 'Ekskul Tari Tradisional' },
          { time: '09:15 - 11:30', activity: 'Parade Musik Band Pelajar & Teater Drama', performer: 'Siswa Kelas X - XII' },
          { time: '13:00 - 15:00', activity: 'Penampilan Bintang Tamu & Penganugerahan Juara', performer: 'Guest Star & Tim OSIS' }
        ],
        groomName: '',
        brideName: '',
        groomNickname: '',
        brideNickname: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        categorySlug: cat.slug,
        tagline: updatedTagline
      }));
    }

    // Auto switch template if any matched
    const match = allTemplates.find(t => t.categoryId === cat.id);
    if (match) setSelectedTemplateId(match.id);
  };

  // Auto-generate sample slug if empty
  const autoGenerateSlug = () => {
    if (slug.trim()) return; // Keep user manually entered slug!

    let base = 'undangan';
    if (isSchool && (formData.institutionName || formData.title)) {
      base = `undangan-sekolah-${formData.institutionName || formData.title}`;
    } else if (isWedding && (formData.groomNickname || formData.brideNickname)) {
      base = `undangan-nikah-${formData.groomNickname || 'pria'}-${formData.brideNickname || 'wanita'}`;
    } else if (isBusiness && (formData.companyName || formData.title)) {
      base = `undangan-bisnis-${formData.companyName || formData.title}`;
    } else if (formData.honoreeName) {
      base = `undangan-${activeCategory?.slug || 'acara'}-${formData.honoreeName}`;
    } else if (formData.title) {
      base = `undangan-${formData.title}`;
    } else {
      base = `undangan-${activeCategory?.slug || 'acara'}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const clean = base
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    setSlug(clean);
  };

  // Construct preview order object for Step 4 Preview
  const previewOrder: Order = useMemo(() => ({
    id: 'ORD-PREVIEW',
    customerName: customerName || 'Nama Pemesan',
    email: email || 'user@example.com',
    whatsapp: whatsapp || '081234567890',
    categoryId: selectedCategoryId,
    templateId: selectedTemplateId,
    slug: slug || 'undangan-preview-slug',
    price: basePrice,
    paymentStatus: 'PAID',
    invitationStatus: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    invitationData: {
      ...formData,
      categorySlug: activeCategory?.slug || formData.categorySlug,
      eventDate: formData.eventDate || '2026-11-20',
      title: formData.title || (
        isSchool ? 'Pentas Seni & Gelar Budaya 2026'
        : isGraduation ? 'Wisuda & Pelepasan Akademik 2026'
        : isReunion ? 'Reuni Akbar & Temu Kangen Alumni'
        : isWedding ? `${formData.groomNickname || formData.groomName || 'Romeo'} & ${formData.brideNickname || formData.brideName || 'Juliet'}`
        : formData.companyName ? `${formData.companyName} Event`
        : `${activeCategory?.name || 'Undangan Digital'}`
      ),
      venueName: formData.venueName || (isSchool ? 'Auditorium & Lapangan Utama Sekolah' : 'Grand Ballroom Hotel Indonesia'),
      venueAddress: formData.venueAddress || (isSchool ? 'Jl. Budi Utomo No. 7, Jakarta Pusat' : 'Jl. M.H. Thamrin No. 1, Jakarta Pusat'),
      institutionName: isSchool ? (formData.institutionName || 'SMA Negeri 1 Harapan Bangsa') : formData.institutionName,
      principalOrHead: isSchool ? (formData.principalOrHead || 'Drs. H. Bambang Suwandi, M.Pd.') : formData.principalOrHead,
      committeeHead: isSchool ? (formData.committeeHead || 'Muhammad Fadhil (Ketua OSIS)') : formData.committeeHead,
      academicYear: isSchool ? (formData.academicYear || 'Tahun Ajaran 2025/2026') : formData.academicYear,
      ticketPrice: isSchool ? (formData.ticketPrice || 'Gratis (Wajib Membawa Undangan Digital)') : formData.ticketPrice,
      dressCode: formData.dressCode || (isSchool ? 'Batik Pelajar / Pakaian Rapi Bebas Sopan' : ''),
      groomName: isWedding ? (formData.groomName || 'Rendi Pratama, S.T.') : '',
      brideName: isWedding ? (formData.brideName || 'Jihan Anindya, S.Ked.') : '',
      groomNickname: isWedding ? (formData.groomNickname || 'Rendi') : '',
      brideNickname: isWedding ? (formData.brideNickname || 'Jihan') : '',
      groomPhotoUrl: isWedding ? (formData.groomPhotoUrl || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80') : '',
      bridePhotoUrl: isWedding ? (formData.bridePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80') : '',
      coverImageUrl: formData.coverImageUrl || (
        isSchool ? 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?w=1200&auto=format&fit=crop&q=80'
        : isGraduation ? 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80'
        : isReunion ? 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&auto=format&fit=crop&q=80'
        : isBusiness ? 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80'
      ),
      backgroundMusicUrl: formData.backgroundMusicUrl || (
        isSchool ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
        : 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
      ),
      galleryImages: formData.galleryImages && formData.galleryImages.length > 0 ? formData.galleryImages : (
        isSchool ? [
          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80'
        ] : [
          'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop&q=80'
        ]
      ),
      agendaRundown: formData.agendaRundown && formData.agendaRundown.length > 0 ? formData.agendaRundown : (
        isSchool ? [
          { time: '08:00 - 08:30', activity: 'Registrasi & Penyambutan Tamu Undangan', performer: 'Panitia OSIS' },
          { time: '08:30 - 09:15', activity: 'Tari Tradisional Pembuka & Sambutan Kepala Sekolah', performer: 'Ekskul Tari Tradisional' },
          { time: '09:15 - 11:30', activity: 'Parade Musik Band Pelajar & Teater Drama', performer: 'Siswa Kelas X - XII' },
          { time: '13:00 - 15:00', activity: 'Penampilan Bintang Tamu & Penganugerahan Juara', performer: 'Guest Star & Tim OSIS' }
        ] : []
      )
    },
    viewsCount: 1
  }), [customerName, email, whatsapp, selectedCategoryId, selectedTemplateId, slug, formData, isWedding, isBusiness, isSchool, isGraduation, isReunion, activeCategory, basePrice]);

  const canProceedFromStep3 = () => {
    if (isSchool) {
      return Boolean(formData.institutionName && formData.title && formData.eventDate && formData.venueName);
    }
    if (isWedding) {
      return Boolean(formData.groomName && formData.brideName && (formData.eventDate || formData.akadDate) && formData.venueName);
    }
    if (isBusiness) {
      return Boolean(formData.companyName && formData.title && formData.eventDate && formData.venueName);
    }
    return Boolean(formData.title && formData.eventDate && formData.venueName);
  };

  const handleCreateCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug.trim()) {
      autoGenerateSlug();
      return;
    }

    // Refresh current user and link order to account
    const activeUser = customerAuth.getCurrentUser();
    const matchedUser = activeUser || (email.trim() ? customerAuth.getUserByEmail(email.trim()) : null);

    const newOrder: Order = {
      id: `ORD-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: matchedUser?.id || undefined,
      customerName: customerName.trim() || 'Tamu Undangan',
      email: email.trim(),
      whatsapp: whatsapp.trim(),
      categoryId: selectedCategoryId,
      templateId: selectedTemplateId,
      slug: slug.trim().toLowerCase(),
      price: basePrice,
      paymentStatus: 'PENDING',
      invitationStatus: 'INACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewsCount: 0,
      invitationData: {
        ...formData,
        title: formData.title || (isWedding ? `Pernikahan ${formData.groomNickname || formData.groomName} & ${formData.brideNickname || formData.brideName}` : formData.title)
      }
    };

    db.saveOrder(newOrder);

    if (matchedUser) {
      customerAuth.logActivity(
        matchedUser.id,
        matchedUser.email,
        'Membuat Pesanan Undangan',
        `Membuat pesanan baru ${newOrder.id} untuk undangan digital /${newOrder.slug} (Rp${basePrice.toLocaleString('id-ID')}).`,
        'ShoppingBag'
      );
    }
    onComplete(newOrder);
  };

  return (
    <div className="min-h-screen bg-stone-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Wizard Header Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 mb-8">
          <div className="flex items-center justify-between pb-6 border-b border-stone-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Langkah {currentStep} dari 6
              </span>
              <h1 className="text-xl font-bold text-stone-900 mt-0.5">
                {currentStep === 1 && 'Pilih Jenis Undangan'}
                {currentStep === 2 && 'Pilih Desain Template'}
                {currentStep === 3 && 'Isi Data Undangan'}
                {currentStep === 4 && 'Preview Realtime'}
                {currentStep === 5 && 'Tentukan Alamat Slug & Kontak'}
                {currentStep === 6 && 'Ringkasan & Siap Checkout'}
              </h1>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-stone-500 hover:text-stone-800 font-medium px-3 py-1.5 rounded-lg hover:bg-stone-100"
            >
              Batal
            </button>
          </div>

          {/* Stepper indicators */}
          <div className="grid grid-cols-6 gap-2 pt-6">
            {[1, 2, 3, 4, 5, 6].map((st) => (
              <div key={st} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === st 
                    ? 'bg-amber-600 text-white ring-4 ring-amber-100' 
                    : currentStep > st 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-stone-100 text-stone-400'
                }`}>
                  {currentStep > st ? <Check className="w-4 h-4" /> : st}
                </div>
                <span className="hidden sm:inline-block text-[10px] text-stone-500 font-medium mt-1">
                  {st === 1 && 'Jenis'}
                  {st === 2 && 'Template'}
                  {st === 3 && 'Isi Data'}
                  {st === 4 && 'Preview'}
                  {st === 5 && 'Slug URL'}
                  {st === 6 && 'Checkout'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1: PILIH JENIS UNDANGAN */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sm:p-8 space-y-6 animate-in fade-in">
            <div className="max-w-xl">
              <h2 className="text-lg font-bold text-stone-900">Pilih Kategori Acara Anda</h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Formulir data akan menyesuaikan secara dinamis sesuai kategori yang Anda pilih.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {categories.map((cat) => {
                const isSelected = cat.id === selectedCategoryId;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat)}
                    className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20 shadow-xs'
                        : 'border-stone-200 hover:border-amber-300 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                        isSelected ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-700'
                      }`}>
                        {cat.slug === 'pernikahan' ? <Heart className="w-4 h-4" /> : cat.slug === 'bisnis' ? <Briefcase className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-amber-600" />}
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-stone-900 block leading-tight">
                      {cat.name}
                    </span>
                    <span className="text-[11px] text-stone-500 line-clamp-2 mt-1">
                      {cat.description}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-6 border-t border-stone-100 flex justify-end">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all"
              >
                <span>Lanjut Pilih Template</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PILIH TEMPLATE */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sm:p-8 space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <span>Pilih Desain Template</span>
                  <span className="text-xs font-normal text-stone-500">
                    ({filteredTemplates.length} dari {allTemplates.length} desain)
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Semua template responsif, interaktif dengan musik, galeri foto, countdown, dan amplop digital.
                </p>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1.5 rounded-full self-start sm:self-auto border border-amber-200">
                Harga: Rp{basePrice.toLocaleString('id-ID')} (Semua Template)
              </span>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-stone-50 p-3 rounded-xl border border-stone-200">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setTemplateFilterCategory('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    templateFilterCategory === 'all'
                      ? 'bg-stone-900 text-white shadow-2xs'
                      : 'bg-white text-stone-600 hover:bg-stone-200 border border-stone-200'
                  }`}
                >
                  Semua ({allTemplates.length})
                </button>
                {categories.map((c) => {
                  const count = allTemplates.filter(t => t.categoryId === c.id).length;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setTemplateFilterCategory(c.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                        templateFilterCategory === c.id
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'bg-white text-stone-600 hover:bg-stone-200 border border-stone-200'
                      }`}
                    >
                      {c.name} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Search Box */}
              <div className="relative shrink-0 md:w-64">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama template..."
                  value={templateSearchQuery}
                  onChange={(e) => setTemplateSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs text-stone-800 focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            {filteredTemplates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {filteredTemplates.map((tpl) => {
                  const isSelected = tpl.id === selectedTemplateId;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      className={`rounded-2xl border overflow-hidden cursor-pointer transition-all ${
                        isSelected
                          ? 'border-amber-500 ring-2 ring-amber-500/30 shadow-md transform -translate-y-1'
                          : 'border-stone-200 hover:border-stone-400 hover:shadow-xs'
                      }`}
                    >
                      <div className="aspect-[4/3] bg-stone-100 relative overflow-hidden">
                        <img 
                          src={tpl.thumbnail} 
                          alt={tpl.name}
                          className="w-full h-full object-cover" 
                        />
                        {isSelected && (
                          <div className="absolute top-3 right-3 bg-amber-500 text-white p-1 rounded-full shadow">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 bg-stone-900/70 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-mono">
                          {tpl.id}
                        </div>
                      </div>
                      <div className="p-4 space-y-1 bg-white">
                        <h3 className="font-bold text-sm text-stone-900">{tpl.name}</h3>
                        <p className="text-xs text-stone-500 line-clamp-2">{tpl.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200">
                <p className="text-sm text-stone-600 font-medium">Tidak ada template yang cocok dengan pencarian Anda.</p>
                <button
                  type="button"
                  onClick={() => {
                    setTemplateSearchQuery('');
                    setTemplateFilterCategory('all');
                  }}
                  className="mt-3 text-xs text-amber-700 hover:underline font-semibold"
                >
                  Reset Filter & Tampilkan Semua
                </button>
              </div>
            )}

            <div className="pt-6 border-t border-stone-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 text-stone-600 hover:text-stone-900 text-sm font-medium flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all"
              >
                <span>Lanjut Isi Data</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: ISI DATA DINAMIS */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sm:p-8 space-y-8 animate-in fade-in">
            <div className="border-b border-stone-100 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Kategori: {activeCategory.name}
              </span>
              <h2 className="text-lg font-bold text-stone-900 mt-1">
                Lengkapi Rincian Acara Anda
              </h2>
              <p className="text-xs text-stone-500">
                Kolom formulir ini disesuaikan khusus untuk {activeCategory.name}.
              </p>
            </div>

            {/* FORM PERNIKAHAN */}
            {isWedding && (
              <div className="space-y-8">
                {/* Mempelai Pria & Wanita */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                    1. Data Calon Mempelai
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Groom */}
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
                      <span className="text-xs font-bold text-amber-800 uppercase">Mempelai Pria</span>
                      <div>
                        <label className="block text-xs text-stone-600 mb-1">Nama Lengkap & Gelar *</label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: Rendi Pratama, S.T."
                          value={formData.groomName}
                          onChange={(e) => setFormData({ ...formData, groomName: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-stone-600 mb-1">Nama Panggilan *</label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: Rendi"
                          value={formData.groomNickname}
                          onChange={(e) => setFormData({ ...formData, groomNickname: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-stone-600 mb-1">Nama Orang Tua</label>
                        <input
                          type="text"
                          placeholder="Putra dari Bpk. Bambang & Ibu Siti"
                          value={formData.groomParents}
                          onChange={(e) => setFormData({ ...formData, groomParents: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-stone-600 mb-1">Instagram (@)</label>
                        <input
                          type="text"
                          placeholder="@rendi.p"
                          value={formData.groomInstagram}
                          onChange={(e) => setFormData({ ...formData, groomInstagram: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs sm:text-sm"
                        />
                      </div>
                    </div>

                    {/* Bride */}
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
                      <span className="text-xs font-bold text-amber-800 uppercase">Mempelai Wanita</span>
                      <div>
                        <label className="block text-xs text-stone-600 mb-1">Nama Lengkap & Gelar *</label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: Jihan Anindya, S.Ked."
                          value={formData.brideName}
                          onChange={(e) => setFormData({ ...formData, brideName: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-stone-600 mb-1">Nama Panggilan *</label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: Jihan"
                          value={formData.brideNickname}
                          onChange={(e) => setFormData({ ...formData, brideNickname: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-stone-600 mb-1">Nama Orang Tua</label>
                        <input
                          type="text"
                          placeholder="Putri dari Bpk. Hendro & Ibu Nurul"
                          value={formData.brideParents}
                          onChange={(e) => setFormData({ ...formData, brideParents: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-stone-600 mb-1">Instagram (@)</label>
                        <input
                          type="text"
                          placeholder="@jihan.anindya"
                          value={formData.brideInstagram}
                          onChange={(e) => setFormData({ ...formData, brideInstagram: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Akad & Resepsi */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                    2. Rangkaian Akad & Resepsi
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
                      <span className="text-xs font-bold text-amber-800 uppercase">Akad Nikah</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-stone-600 mb-1">Tanggal Akad</label>
                          <input
                            type="date"
                            value={formData.akadDate}
                            onChange={(e) => setFormData({ ...formData, akadDate: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-stone-600 mb-1">Waktu</label>
                          <input
                            type="text"
                            placeholder="08:00 - 10:00 WIB"
                            value={formData.akadTime}
                            onChange={(e) => setFormData({ ...formData, akadTime: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-stone-600 mb-1">Tempat / Gedung Akad</label>
                        <input
                          type="text"
                          placeholder="Masjid Agung / Rumah Mempelai"
                          value={formData.akadVenue}
                          onChange={(e) => setFormData({ ...formData, akadVenue: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
                      <span className="text-xs font-bold text-amber-800 uppercase">Resepsi</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-stone-600 mb-1">Tanggal Resepsi *</label>
                          <input
                            type="date"
                            required
                            value={formData.eventDate}
                            onChange={(e) => setFormData({ ...formData, eventDate: e.target.value, resepsiDate: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-stone-600 mb-1">Waktu Resepsi</label>
                          <input
                            type="text"
                            placeholder="11:00 - 14:00 WIB"
                            value={formData.resepsiTime}
                            onChange={(e) => setFormData({ ...formData, resepsiTime: e.target.value, startTime: '11:00' })}
                            className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-stone-600 mb-1">Nama Tempat / Gedung *</label>
                        <input
                          type="text"
                          required
                          placeholder="Grand Ballroom Mulia Hotel"
                          value={formData.venueName}
                          onChange={(e) => setFormData({ ...formData, venueName: e.target.value, resepsiVenue: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FORM BISNIS / SEMINAR / WORKSHOP */}
            {isBusiness && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Perusahaan / Organisasi *</label>
                    <input
                      type="text"
                      required
                      placeholder="PT Acme Inovasi Global"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Judul Acara / Event *</label>
                    <input
                      type="text"
                      required
                      placeholder="Tech Summit & Partner Gathering 2026"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Tanggal Pelaksanaan *</label>
                    <input
                      type="date"
                      required
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Waktu Mulai</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Waktu Selesai</label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Lokasi Gedung / Ruangan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Jakarta Convention Center, Assembly Hall 3"
                    value={formData.venueName}
                    onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Tautan Pendaftaran Online (Opsional)</label>
                  <input
                    type="url"
                    placeholder="https://event.acme.com/register"
                    value={formData.registrationUrl}
                    onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>
              </div>
            )}

            {/* FORM SEKOLAH / KAMPUS / PENSI */}
            {isSchool && (
              <div className="space-y-6">
                <div className="bg-sky-50/70 border border-sky-200 p-4 rounded-xl flex items-start gap-3">
                  <School className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-sky-900 uppercase tracking-wide">Formulir Khusus Undangan Sekolah & Pensi</h4>
                    <p className="text-xs text-sky-700 mt-0.5">
                      Format acara disesuaikan untuk pentas seni, pameran karya, pelepasan murid, atau festival sekolah.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Sekolah / Lembaga Pendidikan *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: SMA Negeri 1 Harapan Bangsa"
                      value={formData.institutionName || ''}
                      onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Judul Kegiatan / Pensi *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Pentas Seni & Gelar Budaya 2026"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Tema / Slogan Acara</label>
                    <input
                      type="text"
                      placeholder="Contoh: Harmoni Jiwa Muda Berkarya"
                      value={formData.tagline || ''}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Kepala Sekolah / Penanggung Jawab</label>
                    <input
                      type="text"
                      placeholder="Drs. H. Bambang Suwandi, M.Pd."
                      value={formData.principalOrHead || ''}
                      onChange={(e) => setFormData({ ...formData, principalOrHead: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Ketua Panitia / OSIS</label>
                    <input
                      type="text"
                      placeholder="Muhammad Fadhil (Ketua OSIS)"
                      value={formData.committeeHead || ''}
                      onChange={(e) => setFormData({ ...formData, committeeHead: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Tanggal Pelaksanaan *</label>
                    <input
                      type="date"
                      required
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Jam Mulai</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Jam Selesai</label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Lokasi Gedung / Lapangan Sekolah *</label>
                    <input
                      type="text"
                      required
                      placeholder="Auditorium Utama & Lapangan Sekolah"
                      value={formData.venueName}
                      onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Ketentuan Tiket / HTM</label>
                    <input
                      type="text"
                      placeholder="Gratis (Wajib Membawa Undangan Digital)"
                      value={formData.ticketPrice || ''}
                      onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                </div>

                {/* RUNDOWN SUSUNAN ACARA SEKOLAH */}
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800 uppercase flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600" />
                      Susunan Acara (Rundown Panggung)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const existing = formData.agendaRundown || [];
                        setFormData({
                          ...formData,
                          agendaRundown: [
                            ...existing,
                            { time: '10:00 - 11:00', activity: 'Sesi Acara Baru', performer: 'Panitia' }
                          ]
                        });
                      }}
                      className="text-xs text-amber-700 font-semibold hover:text-amber-800 flex items-center gap-1 bg-amber-100/70 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition"
                    >
                      <Plus className="w-3 h-3" /> Tambah Sesi
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(formData.agendaRundown || []).map((item, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 bg-white p-2.5 rounded-lg border border-stone-200">
                        <input
                          type="text"
                          placeholder="08:00 - 09:00"
                          value={item.time}
                          onChange={(e) => {
                            const updated = [...(formData.agendaRundown || [])];
                            updated[idx] = { ...updated[idx], time: e.target.value };
                            setFormData({ ...formData, agendaRundown: updated });
                          }}
                          className="w-full sm:w-32 px-2 py-1 text-xs border border-stone-200 rounded font-mono"
                        />
                        <input
                          type="text"
                          placeholder="Nama Agenda / Kegiatan"
                          value={item.activity}
                          onChange={(e) => {
                            const updated = [...(formData.agendaRundown || [])];
                            updated[idx] = { ...updated[idx], activity: e.target.value };
                            setFormData({ ...formData, agendaRundown: updated });
                          }}
                          className="w-full sm:flex-1 px-2 py-1 text-xs border border-stone-200 rounded"
                        />
                        <input
                          type="text"
                          placeholder="Pengisi / Penampil"
                          value={item.performer || ''}
                          onChange={(e) => {
                            const updated = [...(formData.agendaRundown || [])];
                            updated[idx] = { ...updated[idx], performer: e.target.value };
                            setFormData({ ...formData, agendaRundown: updated });
                          }}
                          className="w-full sm:w-40 px-2 py-1 text-xs border border-stone-200 rounded"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (formData.agendaRundown || []).filter((_, i) => i !== idx);
                            setFormData({ ...formData, agendaRundown: updated });
                          }}
                          className="p-1 text-stone-400 hover:text-red-600 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {(!formData.agendaRundown || formData.agendaRundown.length === 0) && (
                      <p className="text-xs text-stone-400 italic py-1 text-center">Belum ada rundown acara yang ditambahkan.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* FORM WISUDA / KELULUSAN */}
            {isGraduation && (
              <div className="space-y-6">
                <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl flex items-start gap-3">
                  <GraduationCap className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">Formulir Undangan Wisuda & Pelepasan</h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Disesuaikan untuk upacara wisuda sarjana, diploma, atau pelepasan siswa tingkat akhir.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Universitas / Institusi *</label>
                    <input
                      type="text"
                      required
                      placeholder="Universitas Indonesia / Institut Teknologi"
                      value={formData.institutionName || ''}
                      onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Judul Acara Wisuda *</label>
                    <input
                      type="text"
                      required
                      placeholder="Sidang Terbuka Senat & Wisuda Lulusan 2026"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Tanggal Wisuda *</label>
                    <input
                      type="date"
                      required
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Waktu</label>
                    <input
                      type="text"
                      placeholder="08:00 - 12:00 WIB"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Tahun Akademik</label>
                    <input
                      type="text"
                      placeholder="Tahun Akademik 2025/2026"
                      value={formData.academicYear || ''}
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Lokasi Gedung Wisuda *</label>
                  <input
                    type="text"
                    required
                    placeholder="Balairung Kampus / Convention Center"
                    value={formData.venueName}
                    onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>
              </div>
            )}

            {/* FORM REUNI & TEMU KANGEN */}
            {isReunion && (
              <div className="space-y-6">
                <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                  <Users className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">Formulir Undangan Reuni & Temu Alumni</h4>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Didesain untuk temu kangen angkatan sekolah, alumni kampus, atau komunitas lintas generasi.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Angkatan / Komunitas *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Alumni SMAN 1 Angkatan 2015"
                      value={formData.institutionName || ''}
                      onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Judul Reuni *</label>
                    <input
                      type="text"
                      required
                      placeholder="Reuni Satu Dekade: Merajut Kenangan"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Tanggal Acara *</label>
                    <input
                      type="date"
                      required
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Waktu</label>
                    <input
                      type="text"
                      placeholder="10:00 - 16:00 WIB"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Lokasi Pertemuan Reuni *</label>
                  <input
                    type="text"
                    required
                    placeholder="Restoran / Ballroom / Villa Reuni"
                    value={formData.venueName}
                    onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>
              </div>
            )}

            {/* FORM UMUM / CELEBRATION (Ulang Tahun, Aqiqah, etc) */}
            {isCelebration && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Yang Dirayakan *</label>
                    <input
                      type="text"
                      required
                      placeholder="Andi Pratama Putra"
                      value={formData.honoreeName}
                      onChange={(e) => setFormData({ ...formData, honoreeName: e.target.value, title: `Syukuran ${activeCategory.name} ${e.target.value}` })}
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Usia / Keterangan</label>
                    <input
                      type="text"
                      placeholder="Contoh: Sweet Seventeen (17 Tahun) / Kelahiran Putra Ke-2"
                      value={formData.honoreeAge}
                      onChange={(e) => setFormData({ ...formData, honoreeAge: e.target.value })}
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Tanggal Acara *</label>
                    <input
                      type="date"
                      required
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Waktu</label>
                    <input
                      type="text"
                      placeholder="18:30 WIB - Selesai"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Lokasi Tempat Acara *</label>
                  <input
                    type="text"
                    required
                    placeholder="Sky Lounge Bistro / Kediaman Keluarga"
                    value={formData.venueName}
                    onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>
              </div>
            )}

            {/* COMMON FIELDS: ALAMAT, MAPS, DESKRIPSI, DRESSCODE */}
            <div className="border-t border-stone-100 pt-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                Alamat Lengkap & Petunjuk Arah
              </h3>

              <div>
                <label className="block text-xs text-stone-600 mb-1">Alamat Lengkap Lokasi</label>
                <textarea
                  rows={2}
                  placeholder="Jl. Asia Afrika No. 6, Senayan, Jakarta Pusat"
                  value={formData.venueAddress}
                  onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-stone-600 mb-1">Tautan Google Maps</label>
                  <input
                    type="url"
                    placeholder="https://maps.google.com/?q=..."
                    value={formData.googleMapsUrl}
                    onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-600 mb-1">Dress Code (Baju)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Batik Elegan / Pastel"
                    value={formData.dressCode}
                    onChange={(e) => setFormData({ ...formData, dressCode: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-stone-600 mb-1">Kata Sambutan / Deskripsi Undangan</label>
                <textarea
                  rows={3}
                  placeholder="Ungkapkan rasa syukur dan kalimat undangan untuk para hadirin..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* PENGATURAN FOTO & GALERI */}
            <MediaGalleryManager
              categorySlug={activeCategory.slug}
              coverImageUrl={formData.coverImageUrl || ''}
              onCoverChange={(url) => setFormData({ ...formData, coverImageUrl: url })}
              galleryImages={formData.galleryImages || []}
              onGalleryChange={(imgs) => setFormData({ ...formData, galleryImages: imgs })}
              backgroundMusicUrl={formData.backgroundMusicUrl || ''}
              onMusicChange={(url) => setFormData({ ...formData, backgroundMusicUrl: url })}
              isWedding={isWedding}
              groomPhotoUrl={formData.groomPhotoUrl || ''}
              onGroomPhotoChange={(url) => setFormData({ ...formData, groomPhotoUrl: url })}
              bridePhotoUrl={formData.bridePhotoUrl || ''}
              onBridePhotoChange={(url) => setFormData({ ...formData, bridePhotoUrl: url })}
            />

            {/* KISAH CINTA (JIKA PERNIKAHAN) */}
            {isWedding && (
              <LoveStoryManager
                loveStory={formData.loveStory || []}
                onChange={(story) => setFormData({ ...formData, loveStory: story })}
              />
            )}

            {/* PEMBICARA (JIKA BISNIS/SEMINAR) */}
            {isBusiness && (
              <SpeakersManager
                speakers={formData.speakers || []}
                onChange={(spks) => setFormData({ ...formData, speakers: spks })}
              />
            )}

            {/* AMPLOP DIGITAL & REKENING HADIAH */}
            <GiftBankManager
              bankAccounts={formData.bankAccounts || []}
              onChange={(accounts) => setFormData({ ...formData, bankAccounts: accounts })}
            />

            {/* Navigation Buttons */}
            <div className="pt-6 border-t border-stone-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 text-stone-600 hover:text-stone-900 text-sm font-medium flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  autoGenerateSlug();
                  setCurrentStep(4);
                }}
                disabled={!canProceedFromStep3()}
                className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold text-sm px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all"
              >
                <span>Lihat Preview Realtime</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PREVIEW REALTIME */}
        {currentStep === 4 && (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-amber-600" />
                  <span>Preview Realtime Undangan</span>
                </h2>
                <p className="text-xs text-stone-500">
                  Berikut tampilan langsung undangan Anda dengan data yang telah diisi.
                </p>
              </div>

              {/* Toggle Device Frame */}
              <div className="flex items-center bg-stone-100 p-1 rounded-xl self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                    previewDevice === 'mobile' ? 'bg-white shadow text-stone-900' : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                    previewDevice === 'desktop' ? 'bg-white shadow text-stone-900' : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop View</span>
                </button>
              </div>
            </div>

            {/* Embedded Live Preview */}
            <div className="bg-stone-900/5 p-4 sm:p-6 rounded-2xl flex justify-center overflow-hidden">
              <div className={`transition-all duration-300 overflow-hidden bg-white shadow-xl ${
                previewDevice === 'mobile' 
                  ? 'w-[375px] max-w-full rounded-[36px] border-[10px] border-stone-900 min-h-[640px] max-h-[700px] overflow-y-auto' 
                  : 'w-full max-w-2xl rounded-xl border border-stone-300 max-h-[700px] overflow-y-auto'
              }`}>
                <InvitationView order={previewOrder} isEmbedPreview={true} />
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 text-stone-600 hover:text-stone-900 text-sm font-medium flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Ubah Data</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all"
              >
                <span>Desain Sudah Cocok, Lanjut</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: TENTUKAN SLUG & KONTAK PELANGGAN */}
        {currentStep === 5 && (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sm:p-8 space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-lg font-bold text-stone-900">Alamat Website & Kontak Anda</h2>
              <p className="text-xs text-stone-500 mt-1">
                Tentukan slug URL permanen untuk link undangan digital Anda.
              </p>
            </div>

            <SlugAvailability
              value={slug}
              onChange={(val) => setSlug(val)}
              titleSuggestion={formData.title}
            />

            <div className="border-t border-stone-100 pt-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  Informasi Pemesan untuk Verifikasi Pembayaran
                </h3>
                {currentUser ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-medium">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tersambung ke akun: <strong>{currentUser.username}</strong></span>
                  </div>
                ) : onOpenAuth ? (
                  <button
                    type="button"
                    onClick={() => onOpenAuth('login')}
                    className="inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-800 font-semibold underline underline-offset-2"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sudah punya akun? Masuk disini</span>
                  </button>
                ) : null}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-stone-600 mb-1">Nama Pemesan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Anda"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-600 mb-1">Email Aktif *</label>
                  <input
                    type="email"
                    required
                    placeholder="email@anda.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-600 mb-1">Nomor WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="081234567890"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-stone-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-5 py-2.5 text-stone-600 hover:text-stone-900 text-sm font-medium flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(6)}
                disabled={!slug || !customerName || !email || !whatsapp || db.isSlugTaken(slug)}
                className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold text-sm px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all"
              >
                <span>Lanjut ke Ringkasan Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: RINGKASAN & CHECKOUT */}
        {currentStep === 6 && (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sm:p-8 space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-lg font-bold text-stone-900">Ringkasan Order</h2>
              <p className="text-xs text-stone-500 mt-1">
                Periksa kembali data undangan sebelum melakukan pembayaran Rp{basePrice.toLocaleString('id-ID')} melalui QRIS.
              </p>
            </div>

            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-4 text-xs sm:text-sm">
              <div className="flex justify-between py-1.5 border-b border-stone-200">
                <span className="text-stone-500">Kategori Acara</span>
                <span className="font-semibold text-stone-900">{activeCategory.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-200">
                <span className="text-stone-500">Desain Template</span>
                <span className="font-semibold text-stone-900">
                  {allTemplates.find(t => t.id === selectedTemplateId)?.name || 'Default Template'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-200">
                <span className="text-stone-500">URL Undangan</span>
                <span className="font-mono font-bold text-amber-700">
                  {typeof window !== 'undefined' ? `${window.location.host}/${slug}` : `surattt.netlify.app/${slug}`}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-stone-200">
                <span className="text-stone-500">Pemesan & WhatsApp</span>
                <span className="font-semibold text-stone-900">{customerName} ({whatsapp})</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <div>
                  <span className="text-stone-800 font-bold block text-sm">TOTAL PEMBAYARAN</span>
                  <span className="text-[11px] text-stone-500">Biaya satu kali, tanpa langganan</span>
                </div>
                <span className="text-2xl font-black text-amber-600 font-mono">Rp{basePrice.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 space-y-1">
              <p className="font-bold">Informasi Pembayaran:</p>
              <p>
                Setelah menekan tombol di bawah, Anda akan diarahkan ke halaman QRIS Nasional untuk scan pembayaran Rp{basePrice.toLocaleString('id-ID')} dan mengunggah bukti transfer.
              </p>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="px-5 py-2.5 text-stone-600 hover:text-stone-900 text-sm font-medium flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={handleCreateCheckout}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-md flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                id="btn-confirm-checkout"
              >
                <Sparkles className="w-4 h-4" />
                <span>Bayar Sekarang (Rp5.000)</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
