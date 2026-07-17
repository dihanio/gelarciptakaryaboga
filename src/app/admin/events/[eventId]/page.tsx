import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { connectDB } from '@/lib/db';
import { Event } from '@/models/Event';

async function getEvent(eventId: string) {
  await connectDB();
  const event = await Event.findById(eventId).lean();
  return event ? JSON.parse(JSON.stringify(event)) : null;
}

export default async function EventOverviewPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getEvent(eventId);

  if (!event) {
    notFound();
  }

  const modules = [
    { label: 'Peserta & Karya', desc: 'Kelola data peserta, karya inovasi, dan anggota tim', href: `/admin/events/${eventId}/peserta`, icon: '👥' },
    { label: 'Booth Pameran', desc: 'Atur nomor booth, denah lokasi, dan kategori booth', href: `/admin/events/${eventId}/booth`, icon: '🏪' },
    { label: 'Rundown & Jadwal', desc: 'Susun timeline agenda dan pembicara acara', href: `/admin/events/${eventId}/jadwal`, icon: '📅' },
    { label: 'Tiket & Order', desc: 'Atur jenis tiket, kuota, dan ekspor data pengunjung', href: `/admin/events/${eventId}/tiket`, icon: '🎫' },
    { label: 'Berita & Artikel', desc: 'Tulis pengumuman dan publikasi liputan acara', href: `/admin/events/${eventId}/berita`, icon: '📰' },
    { label: 'Galeri Momen', desc: 'Upload album foto dan video dokumentasi', href: `/admin/events/${eventId}/galeri`, icon: '📷' },
    { label: 'CMS Landing Page', desc: 'Atur section hero, FAQ, sponsor, dan urutan layout', href: `/admin/events/${eventId}/sections`, icon: '🎨' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Card className="p-6 bg-slate-900 text-white space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="primary">{event.status.toUpperCase()}</Badge>
          <span className="text-xs text-slate-400">Slug: {event.slug}</span>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold">{event.name}</h1>
          <p className="text-xs text-indigo-300 font-semibold mt-1">"{event.theme}"</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs text-slate-300 border-t border-slate-800">
          <p>📅 Tanggal: <span className="font-bold text-white">{formatDate(event.date)}</span></p>
          <p>📍 Lokasi: <span className="font-bold text-white">{event.location?.name}</span></p>
          <p>🎟️ Status Registrasi: <span className="font-bold text-white">{event.registration?.isOpen ? 'Buka' : 'Tutup'}</span></p>
        </div>
      </Card>

      {/* Module Navigation Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Modul Pengelolaan Event</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((m, i) => (
            <Link key={i} href={m.href}>
              <Card hoverEffect className="p-5 space-y-2 h-full flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
                    {m.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{m.label}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{m.desc}</p>
                </div>
                <div className="pt-2 text-xs font-bold text-indigo-600 flex items-center justify-between">
                  <span>Buka Modul</span>
                  <span>→</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
