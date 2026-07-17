export type UserRole =
  | 'super_admin'
  | 'admin_event'
  | 'ticket_officer'
  | 'checkin_officer'
  | 'content_editor'
  | 'media'
  | 'viewer';

export type EventStatus = 'draft' | 'upcoming' | 'active' | 'completed' | 'archived';
export type TicketStatus = 'active' | 'used' | 'cancelled' | 'expired';
export type OrderStatus = 'pending' | 'confirmed' | 'cancelled' | 'refunded';
export type BoothStatus = 'available' | 'assigned' | 'inactive';
export type NewsStatus = 'draft' | 'published' | 'archived';
export type NewsCategory = 'pengumuman' | 'informasi' | 'artikel' | 'liputan';
export type CheckInStatus = 'success' | 'already_used' | 'invalid' | 'cancelled_ticket';
export type CheckInMethod = 'qr_scan' | 'manual';
export type ScheduleType =
  | 'ceremony'
  | 'presentation'
  | 'performance'
  | 'break'
  | 'awarding'
  | 'other';
export type SponsorTier = 'platinum' | 'gold' | 'silver' | 'bronze';
export type PageType = 'landing' | 'about' | 'contact';
export type SectionType =
  | 'hero'
  | 'about'
  | 'highlights'
  | 'gallery_preview'
  | 'cta'
  | 'faq'
  | 'sponsors'
  | 'timeline'
  | 'stats'
  | 'custom'
  | 'news'
  | 'booth'
  | 'committee';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IEvent {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  theme: string;
  logo?: string;
  banner?: string;
  date: Date;
  endDate?: Date;
  time: string;
  location: {
    name: string;
    address: string;
    mapUrl?: string;
    coordinates?: { lat: number; lng: number };
  };
  status: EventStatus;
  registration: {
    isOpen: boolean;
    startDate?: Date;
    endDate?: Date;
    maxCapacity?: number;
  };
  countdown: {
    enabled: boolean;
    targetDate: Date;
  };
  about: {
    content: string;
    images?: string[];
  };
  faq?: Array<{ question: string; answer: string; order: number }>;
  sponsors?: Array<{ name: string; logo: string; url?: string; tier: SponsorTier; order: number }>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWebsiteSettings {
  _id?: string;
  siteName: string;
  siteDescription: string;
  siteLogo?: string;
  favicon?: string;
  contact: { phone?: string; whatsapp?: string; email?: string };
  socialMedia: { instagram?: string; tiktok?: string; youtube?: string; twitter?: string; website?: string };
  navigation: Array<{ label: string; href: string; order: number; isVisible: boolean }>;
  footer: { text?: string; links?: Array<{ label: string; href: string }>; copyright?: string };
  activeEventId?: string;
  updatedAt: Date;
}

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  role: UserRole;
  assignedEvents?: string[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBooth {
  _id?: string;
  event: string;
  number: string;
  name?: string;
  location?: string;
  category?: string;
  description?: string;
  status: BoothStatus;
  order: number;
  createdAt: Date;
  deletedAt?: Date | null;
  deletedBy?: string | null;
}

export interface IParticipant {
  _id?: string;
  event: string;
  name: string;
  photo?: string;
  workName: string;
  description: string;
  booth?: string;
  category?: string;
  members?: Array<{ name: string; role?: string }>;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  deletedBy?: string | null;
}

export interface ITicketType {
  _id?: string;
  event: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  quota: number;
  sold: number;
  isActive: boolean;
  benefits?: string[];
  validFrom?: Date;
  validUntil?: Date;
  order: number;
  createdAt: Date;
  deletedAt?: Date | null;
  deletedBy?: string | null;
}

export interface IVisitor {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  organization?: string;
  createdAt: Date;
}

export interface ITicketOrder {
  _id?: string;
  event: string;
  orderNumber: string;
  visitor: string;
  items: Array<{ ticketType: string; quantity: number; unitPrice: number; subtotal: number }>;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod?: string;
  paymentRef?: string;
  snapToken?: string;
  snapRedirectUrl?: string;
  paymentDetails?: Record<string, unknown>;
  paidAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITicket {
  _id?: string;
  event: string;
  order: string;
  ticketType: string;
  visitor: string;
  ticketNumber: string;
  qrCode: string;
  status: TicketStatus;
  issuedAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  deletedBy?: string | null;
}

export interface ICheckInLog {
  _id?: string;
  event: string;
  ticket: string;
  visitor: string;
  checkedInBy: string;
  checkedInAt: Date;
  method: CheckInMethod;
  location?: string;
  notes?: string;
  status: CheckInStatus;
}

export interface ISchedule {
  _id?: string;
  event: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  speaker?: string;
  location?: string;
  type: ScheduleType;
  order: number;
  createdAt: Date;
  deletedAt?: Date | null;
  deletedBy?: string | null;
}

export interface INews {
  _id?: string;
  event: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  category: NewsCategory;
  status: NewsStatus;
  publishedAt?: Date;
  author: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  deletedBy?: string | null;
}

export interface IGallery {
  _id?: string;
  event: string;
  title: string;
  type: 'photo' | 'video';
  url: string;
  thumbnail?: string;
  album?: string;
  description?: string;
  order: number;
  uploadedBy: string;
  createdAt: Date;
  deletedAt?: Date | null;
  deletedBy?: string | null;
}

export interface IPageSection {
  _id?: string;
  event: string;
  page: PageType;
  sectionType: SectionType;
  title?: string;
  subtitle?: string;
  content?: string;
  media?: Array<{ url: string; alt?: string; type: 'image' | 'video' }>;
  config?: Record<string, unknown>;
  order: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuditLog {
  _id?: string;
  user?: { _id: string; name: string; email: string };
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface ICommitteeMember {
  _id?: string;
  event: string;
  name: string;
  photo: string;
  position: string;
  division: string;
  description?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  deletedBy?: string | null;
}
