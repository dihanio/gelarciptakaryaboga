'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Select } from '@/components/ui/Select';

export interface EventOption {
  _id: string;
  name: string;
  status: string;
}

export const EventSwitcher: React.FC<{
  events: EventOption[];
  currentEventId?: string;
}> = ({ events, currentEventId }) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleSelect = (eventId: string) => {
    if (!eventId) {
      router.push('/admin/events');
      return;
    }

    // Replace current event ID in route path if on event-scoped page
    if (pathname.includes('/admin/events/')) {
      const parts = pathname.split('/');
      const eventIndex = parts.indexOf('events') + 1;
      if (eventIndex > 0 && parts[eventIndex]) {
        parts[eventIndex] = eventId;
        router.push(parts.join('/'));
        return;
      }
    }

    router.push(`/admin/events/${eventId}`);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold text-slate-500 hidden sm:inline">Event:</span>
      <Select
        value={currentEventId || ''}
        onChange={(e) => handleSelect(e.target.value)}
        options={[
          { label: '-- Pilih Event --', value: '' },
          ...events.map((e) => ({
            label: `${e.name} (${e.status.toUpperCase()})`,
            value: e._id,
          })),
        ]}
        className="text-xs py-1.5 w-48 sm:w-60 bg-slate-50 border-slate-200"
      />
    </div>
  );
};
