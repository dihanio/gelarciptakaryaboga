'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ROLES } from '@/lib/constants';
import type { UserRole } from '@/types';
import { useToast } from '@/providers/ToastProvider';

export interface AdminHeaderProps {
  user?: {
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
  };
  eventSwitcher?: React.ReactNode;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ user, eventSwitcher }) => {
  const router = useRouter();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.info('Anda telah keluar.');
      router.push('/login');
    } catch {
      toast.error('Gagal logout');
    }
  };

  const roleInfo = user?.role ? ROLES[user.role] : null;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left Slot: Event Switcher or Title */}
      <div className="flex items-center gap-4">
        {eventSwitcher}
      </div>

      {/* Right Slot: User Info & Logout */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <Avatar name={user.name} src={user.avatar} size="sm" />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-none">{user.name}</p>
              <div className="mt-1">
                <Badge variant="primary" size="sm">
                  {roleInfo?.label || user.role}
                </Badge>
              </div>
            </div>
          </div>
        )}

        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 hover:text-rose-600">
          🚪 Logout
        </Button>
      </div>
    </header>
  );
};
