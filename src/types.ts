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

export interface UserAccount {
  id: string;
  username: string; // nama pengguna
  name: string;
  phone: string; // nomor WhatsApp / HP
  email: string;
  passwordHash: string;
  referralSource?: string; // Dari mana Anda tahu website ini (opsional)
  avatarUrl?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface UserActivityLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  details: string;
  timestamp: string;
  icon?: string;
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
  userId?: string; // Linked customer user account ID
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

export interface RundownItem {
  id?: string;
  time: string; // e.g. "08:00 - 09:30 WIB"
  title: string; // e.g. "Akad Nikah / Temu Manten"
  description?: string; // e.g. "Prosesi ijab kabul dan penyerahan mahar"
  location?: string; // e.g. "Masjid Agung / Ballroom"
  performer?: string; // e.g. "Ustadz / Grup Akustik"
  iconName?: string;
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

  // Susunan Acara / Rundown Kegiatan (Bisa diisi manual untuk semua jenis acara)
  rundown?: RundownItem[];
  rundownItems?: RundownItem[];

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
  agendaRundown?: { time: string; activity?: string; title?: string; performer?: string; description?: string }[];
  graduationDegree?: string;
  graduationFaculty?: string;
  alumniGeneration?: string;

  // Cyber Security & Privacy Protection
  isPasswordProtected?: boolean;
  accessPin?: string;
  hideBankDetailsUntilUnlocked?: boolean;
  disableRsvpForm?: boolean;
  maxRsvpPerGuest?: number;
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

  // Telegram Bot Integration
  telegramBotToken?: string;
  telegramChatId?: string;
  telegramEnabled?: boolean;
  telegramNotifyOnOrder?: boolean;
  telegramNotifyOnReminder?: boolean;

  // Customer Support Live Chat Floating Widget Settings
  chatWidgetEnabled?: boolean;
  chatWidgetPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'custom';
  chatWidgetOffsetX?: number; // distance in px from horizontal edge (default 24)
  chatWidgetOffsetY?: number; // distance in px from vertical edge (default 24)
  chatWidgetCustomX?: number; // optional custom X coordinate
  chatWidgetCustomY?: number; // optional custom Y coordinate
  chatWidgetLabel?: string; // e.g. "Tanya Admin / Live Chat"
  chatWidgetDraggable?: boolean; // whether users can freely drag the button on screen (default true)
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

// Live Chat & Support Types
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId?: string; // user email/id or admin email/id
  senderName: string;
  senderRole: 'user' | 'admin' | 'system';
  text: string;
  timestamp: string;
  isNudge?: boolean;
  isSystemAlert?: boolean;
}

export interface ChatConversation {
  id: string;
  userId?: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  orderId?: string;
  orderSlug?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadAdminCount: number;
  unreadUserCount: number;
  status?: 'open' | 'resolved' | 'pending' | 'archived' | string;
  adminNotes?: string;
  isBanned?: boolean;
  bannedReason?: string;
  bannedAt?: string;
  lastNudgeAt?: string;
  nudgeCount?: number;
  createdAt: string;
}

export interface BannedUser {
  id: string;
  identifier: string; // email, userId, or phone
  name?: string;
  userName?: string;
  reason: string;
  spamCount?: number;
  bannedAt: string;
  bannedBy: string;
}

// Broadcast & Announcements Types
export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'promo' | 'warning' | 'success' | 'update';
  isActive: boolean;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  targetAudience?: 'all' | 'customers';
  actionText?: string;
  actionUrl?: string;
  createdAt: string;
  expiresAt?: string;
}

// Cyber Security & Audit Log Types
export interface SecurityAuditLog {
  id: string;
  eventType: 
    | 'XSS_ATTEMPT_BLOCKED'
    | 'BRUTE_FORCE_LOCKOUT'
    | 'FAILED_LOGIN'
    | 'SUCCESSFUL_LOGIN'
    | 'USER_BANNED'
    | 'USER_UNBANNED'
    | 'BOT_HONEYPOT_TRIGGERED'
    | 'RATE_LIMIT_EXCEEDED'
    | 'STORAGE_TAMPER_DETECTED'
    | 'UNAUTHORIZED_ACCESS_ATTEMPT'
    | 'SUSPICIOUS_PAYLOAD_SANITIZED'
    | 'INVITATION_PIN_SUCCESS'
    | 'INVITATION_PIN_FAILED'
    | 'SETTINGS_CHANGED';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
  sourceIp?: string;
  target?: string;
  timestamp: string;
}

export interface SecurityScanResult {
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'F';
  lastScannedAt: string;
  checks: {
    name: string;
    description: string;
    passed: boolean;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }[];
}

