import type { UserRole } from '@/types';

export const ROLES: Record<UserRole, { label: string; description: string; level: number }> = {
  super_admin: {
    label: 'Super Admin',
    description: 'Full system access, kelola semua event dan user',
    level: 100,
  },
  admin_event: {
    label: 'Admin Event',
    description: 'Full access ke event yang di-assign',
    level: 80,
  },
  ticket_officer: {
    label: 'Ticket Officer',
    description: 'Manajemen tiket & order',
    level: 60,
  },
  checkin_officer: {
    label: 'Check-In Officer',
    description: 'Scan QR & check-in',
    level: 50,
  },
  content_editor: {
    label: 'Content Editor',
    description: 'Kelola berita, galeri, dan CMS',
    level: 40,
  },
  media: {
    label: 'Media',
    description: 'Upload galeri (foto/video)',
    level: 30,
  },
  viewer: {
    label: 'Viewer',
    description: 'Read-only dashboard',
    level: 10,
  },
};

export const EVENT_STATUSES = {
  draft: { label: 'Draft', color: 'gray' },
  upcoming: { label: 'Upcoming', color: 'blue' },
  active: { label: 'Active', color: 'green' },
  completed: { label: 'Completed', color: 'purple' },
  archived: { label: 'Archived', color: 'gray' },
} as const;

export const TICKET_STATUSES = {
  active: { label: 'Active', color: 'green' },
  used: { label: 'Used', color: 'blue' },
  cancelled: { label: 'Cancelled', color: 'red' },
  expired: { label: 'Expired', color: 'gray' },
} as const;

export const ORDER_STATUSES = {
  pending: { label: 'Pending', color: 'yellow' },
  confirmed: { label: 'Confirmed', color: 'green' },
  cancelled: { label: 'Cancelled', color: 'red' },
  refunded: { label: 'Refunded', color: 'orange' },
} as const;

export const BOOTH_STATUSES = {
  available: { label: 'Available', color: 'green' },
  assigned: { label: 'Assigned', color: 'blue' },
  inactive: { label: 'Inactive', color: 'gray' },
} as const;

export const NEWS_STATUSES = {
  draft: { label: 'Draft', color: 'gray' },
  published: { label: 'Published', color: 'green' },
  archived: { label: 'Archived', color: 'yellow' },
} as const;

export const NEWS_CATEGORIES = {
  pengumuman: { label: 'Pengumuman', color: 'red' },
  informasi: { label: 'Informasi', color: 'blue' },
  artikel: { label: 'Artikel', color: 'purple' },
  liputan: { label: 'Liputan', color: 'green' },
} as const;

export const SCHEDULE_TYPES = {
  ceremony: { label: 'Upacara', icon: '🎊' },
  presentation: { label: 'Presentasi', icon: '🎤' },
  performance: { label: 'Penampilan', icon: '🎭' },
  break: { label: 'Istirahat', icon: '☕' },
  awarding: { label: 'Penghargaan', icon: '🏆' },
  other: { label: 'Lainnya', icon: '📌' },
} as const;

export const SPONSOR_TIERS = {
  platinum: { label: 'Platinum', color: '#E5E4E2' },
  gold: { label: 'Gold', color: '#FFD700' },
  silver: { label: 'Silver', color: '#C0C0C0' },
  bronze: { label: 'Bronze', color: '#CD7F32' },
} as const;

export const ITEMS_PER_PAGE = 10;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
