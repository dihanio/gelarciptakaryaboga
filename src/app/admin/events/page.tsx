import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { connectDB } from '@/lib/db';
import { Event } from '@/models/Event';
import { WebsiteSettings } from '@/models/WebsiteSettings';
import type { IEvent } from '@/types';

async function getEventsData() {
  await connectDB();

  const events = await Event.find().sort({ date: -1 }).lean();
  const settings = await WebsiteSettings.findOne().lean();

  return {
    events: JSON.parse(JSON.stringify(events)),
    activeEventId: settings?.activeEventId?.toString(),
  };
}

export default async function AdminEventsListPage() {
  const { events, activeEventId } = await getEventsData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Manajemen Multi-Event</h1>
          <p className="text-xs text-slate-500">Kelola seluruh penyelenggaraan Gelar Cipta per tahun.</p>
        </div>

        <Link href="/admin/events/new">
          <Button variant="primary">+ Buat Event Baru</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((e: IEvent) => {
          const isSelectedActive = activeEventId === e._id;

          return (
            <Card key={e._id} hoverEffect className="space-y-4 p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={e.status === 'active' ? 'success' : 'default'}>
                    {e.status.toUpperCase()}
                  </Badge>
                  {isSelectedActive && (
                    <Badge variant="primary">LIVE DI WEBSITE</Badge>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">{e.name}</h3>
                  <p className="text-xs text-indigo-600 font-semibold mt-0.5">&quot;{e.theme}&quot;</p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <p>📅 Tanggal: <span className="font-semibold text-slate-900">{formatDate(e.date)}</span></p>
                  <p>📍 Lokasi: <span className="font-semibold text-slate-900">{e.location?.name}</span></p>
                  <p>🎟️ Registrasi: <span className="font-semibold text-slate-900">{e.registration?.isOpen ? 'Terbuka' : 'Tutup'}</span></p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link href={`/admin/events/${e._id}`} className="w-full">
                  <Button variant="outline" size="sm" className="w-full justify-center">
                    Kelola Event →
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
