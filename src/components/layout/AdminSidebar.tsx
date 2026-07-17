'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';
import { checkPermission } from '@/lib/rbac';

export interface AdminSidebarProps {
  userRole?: UserRole;
  activeEventId?: string;
  activeEventName?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  userRole = 'super_admin',
  activeEventId,
  activeEventName = 'Semua Event',
}) => {
  const pathname = usePathname();

  const navGroups = [
    {
      title: 'EVENTS & OVERVIEW',
      items: [
        { label: 'Dashboard Utama', href: '/admin', icon: '📊', resource: 'stats' as const },
        { label: 'Manajemen Event', href: '/admin/events', icon: '🗓️', resource: 'events' as const },
      ],
    },
    ...(activeEventId
      ? [
          {
            title: `EVENT: ${activeEventName.toUpperCase()}`,
            items: [
              { label: 'Overview Event', href: `/admin/events/${activeEventId}`, icon: '⚡', resource: 'events' as const },
              { label: 'Peserta & Karya', href: `/admin/events/${activeEventId}/peserta`, icon: '👥', resource: 'participants' as const },
              { label: 'Booth Pameran', href: `/admin/events/${activeEventId}/booth`, icon: '🏪', resource: 'booths' as const },
              { label: 'Rundown Jadwal', href: `/admin/events/${activeEventId}/jadwal`, icon: '📅', resource: 'schedules' as const },
              { label: 'Tiket & Pesanan', href: `/admin/events/${activeEventId}/tiket`, icon: '🎫', resource: 'tickets' as const },
              { label: 'Berita & Pengumuman', href: `/admin/events/${activeEventId}/berita`, icon: '📰', resource: 'news' as const },
              { label: 'Galeri Dokumentasi', href: `/admin/events/${activeEventId}/galeri`, icon: '📷', resource: 'gallery' as const },
              { label: 'CMS Landing Page', href: `/admin/events/${activeEventId}/sections`, icon: '🎨', resource: 'sections' as const },
            ],
          },
        ]
      : []),
    {
      title: 'SISTEM & AKUN',
      items: [
        { label: 'Kelola Pengguna', href: '/admin/users', icon: '👤', resource: 'users' as const },
        { label: 'Pengaturan Website', href: '/admin/pengaturan', icon: '⚙️', resource: 'settings' as const },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
          GC
        </div>
        <div>
          <span className="font-extrabold text-white text-sm block">Gelar Cipta EMS</span>
          <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">Admin Portal</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {navGroups.map((group, gIdx) => {
          const filteredItems = group.items.filter((item) =>
            checkPermission(userRole, item.resource, 'read')
          );

          if (filteredItems.length === 0) return null;

          return (
            <div key={gIdx} className="space-y-1.5">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 px-3">
                {group.title}
              </p>
              {filteredItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-150',
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    )}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Quick QR Checkin Shortcut */}
      <div className="p-4 border-t border-slate-800">
        <Link href="/checkin">
          <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 hover:bg-indigo-900/60 transition-colors flex items-center justify-between text-xs font-bold">
            <span>📱 Mode Scanner QR</span>
            <span>→</span>
          </div>
        </Link>
      </div>
    </aside>
  );
};
