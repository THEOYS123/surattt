export type PaymentStatus = 'PENDING' | 'PAID' | 'REJECTED';
export type InvitationStatus = 'ACTIVE' | 'INACTIVE';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // SHA-256 hash
  role: 'superadmin' | 'admin' | 'finance';
  createdAt: string;
  lastLogin?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  orderCount: number;
  lastOrderDate: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
}

export type TemplateTheme =
  | 'royal-gold'
  | 'minimal-modern'
  | 'romantic-blush'
  | 'corporate-navy'
  | 'islamic-emerald'
  | 'festive-sunset'
  | string;

export interface SpeakerItem {
  id: string;
  name: string;
  title: string;
  company?: string;
  avatarUrl?: string;
  photoUrl?: string;
}

export type Speaker = SpeakerItem;

export interface BankAccountItem {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export type BankAccount = BankAccountItem;

export interface MediaItem {
  id: string;
  orderId?: string;
  url: string;
  name: string;
  type: 'image' | 'audio' | 'document';
  size?: number;
  uploadedAt: string;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  whatsapp: string;
  categoryId: string;
  templateId: string;
  slug: string;
  price: number;
  paymentStatus: PaymentStatus;
  invitationStatus: InvitationStatus;
  createdAt: string;
  updatedAt: string;
  paymentProofUrl?: string;
  paymentProofName?: string;
  rejectionReason?: string;
  viewsCount?: number;
  invitationData: InvitationData;
}

export interface TemplateFieldConfig {
  brideGroom?: boolean;
  parents?: boolean;
  akadResepsi?: boolean;
  companyEvent?: boolean;
  speakers?: boolean;
  birthdayPerson?: boolean;
  agenda?: boolean;
  storyTimeline?: boolean;
  giftBank?: boolean;
  dressCode?: boolean;
  googleMaps?: boolean;
  rsvp?: boolean;
  photoGallery?: boolean;
  backgroundMusic?: boolean;
}

export interface Template {
  id: string;
  name: string;
  categoryId: string;
  thumbnail: string;
  description: string;
  price: number;
  theme: TemplateTheme;
  fields: TemplateFieldConfig;
  isActive: boolean;
  createdAt: string;
}

export interface StoryTimelineItem {
  year: string;
  title: string;
  description: string;
}

export interface InvitationData {
  // Common / General
  title: string;
  categorySlug: string;
  tagline?: string;
  description?: string;
  eventDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string;
  venueName: string;
  venueAddress: string;
  googleMapsUrl?: string;
  whatsappContact?: string;
  coverImageUrl?: string;
  galleryImages: string[];
  backgroundMusicUrl?: string;
  dressCode?: string;
  additionalNotes?: string;
  liveStreamUrl?: string;
  familyGreeting?: string;

  // Wedding specifics
  groomName?: string;
  groomNickname?: string;
  groomParents?: string;
  groomPhotoUrl?: string;
  groomInstagram?: string;

  brideName?: string;
  brideNickname?: string;
  brideParents?: string;
  bridePhotoUrl?: string;
  brideInstagram?: string;

  akadDate?: string;
  akadTime?: string;
  akadVenue?: string;
  akadAddress?: string;

  resepsiDate?: string;
  resepsiTime?: string;
  resepsiVenue?: string;
  resepsiAddress?: string;

  loveStory?: StoryTimelineItem[];
  bankAccounts?: BankAccountItem[];

  // Business & Seminar specifics
  companyName?: string;
  eventCategory?: string;
  speakers?: SpeakerItem[];
  registrationUrl?: string;
  websiteUrl?: string;
  companyLogoUrl?: string;

  // Birthday / Aqiqah / Khitanan specifics
  honoreeName?: string;
  honoreeAge?: string;
  blessingPrayer?: string;

  // School, Campus, Reunion & Graduation specifics
  institutionName?: string;
  principalOrHead?: string;
  committeeHead?: string;
  academicYear?: string;
  ticketPrice?: string;
  agendaRundown?: { time: string; activity: string; performer?: string }[];
  graduationDegree?: string;
  graduationFaculty?: string;
  alumniGeneration?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  iconName?: string;
}

export interface SiteSettings {
  siteName: string;
  logoText: string;
  faviconUrl: string;
  basePrice: number;
  priceNote?: string;
  promoBadgeText?: string;
  showPromoBadge?: boolean;
  
  // Hero & Homepage CMS
  heroBadgeText?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  heroCtaText?: string;
  heroSecondaryCtaText?: string;
  
  // Top Announcement Banner
  bannerEnabled?: boolean;
  bannerText?: string;
  bannerLink?: string;
  bannerBgColor?: string;
  bannerTextColor?: string;

  // Features and FAQs
  featuresList?: FeatureItem[];
  faqItems?: FaqItem[];

  // Contact & Support
  supportEmail: string;
  supportWhatsapp: string;
  operationalHours?: string;
  footerText: string;
  
  // SEO & General
  seoTitle: string;
  seoDescription: string;
  siteDescription?: string;
  maintenanceMode: boolean;
  
  // Payment & QRIS
  merchantName: string;
  merchantBank: string;
  merchantAccount?: string;
  qrisImageUrl: string;
  transferInstructions?: string;

  // Theme styling
  primaryColor?: string;
}

export interface ActivityLog {
  id: string;
  adminEmail: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface RSVPItem {
  id: string;
  invitationSlug: string;
  guestName: string;
  status: 'attending' | 'not_attending' | 'uncertain';
  guestCount: number;
  wishes: string;
  createdAt: string;
}
