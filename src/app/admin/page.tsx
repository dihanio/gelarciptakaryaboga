import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { connectDB } from '@/lib/db';
import { Event } from '@/models/Event';
import { Ticket } from '@/models/Ticket';
import { CheckInLog } from '@/models/CheckInLog';
import { Participant } from '@/models/Participant';
import { Booth } from '@/models/Booth';
import { formatDateTime } from '@/lib/utils';

async function getDashboardData() {
  await connectDB();

  const activeEvent = await Event.findOne({ status: 'active' }).sort({ date: -1 }).lean();
  const eventId = activeEvent?._id;

  if (!eventId) {
    return { activeEvent: null, stats: null };
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    ticketsSold,
    totalCheckIns,
    checkInsToday,
    participantsCount,
    boothsCount,
    assignedBooths,
    recentActivity,
  ] = await Promise.all([
    Ticket.countDocuments({ event: eventId, status: { $ne: 'cancelled' } }),
    CheckInLog.countDocuments({ event: eventId, status: 'success' }),
    CheckInLog.countDocuments({ event: eventId, status: 'success', checkedInAt: { $gte: startOfToday } }),
    Participant.countDocuments({ event: eventId }),
    Booth.countDocuments({ event: eventId }),
    Booth.countDocuments({ event: eventId, status: 'assigned' }),
    CheckInLog.find({ event: eventId })
      .populate('visitor', 'name email')
      .populate('checkedInBy', 'name')
      .sort({ checkedInAt: -1 })
      .limit(6)
      .lean(),
  ]);

  return {
    activeEvent: JSON.parse(JSON.stringify(activeEvent)),
    stats: {
      ticketsSold,
      totalCheckIns,
      checkInsToday,
      participantsCount,
      boothsCount,
      assignedBooths,
      checkInRate: ticketsSold > 0 ? Math.round((totalCheckIns / ticketsSold) * 100) : 0,
      recentActivity: JSON.parse(JSON.stringify(recentActivity)),
    },
  };
}

export default async function AdminDashboardPage() {
  const { activeEvent, stats } = await getDashboardData();

  if (!activeEvent || !stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-slate-900">Overview Dashboard</h1>
          <Link href="/admin/events/new">
            <Button variant="primary">+ Buat Event Baru</Button>
          </Link>
        </div>
        <Card className="p-12 text-center space-y-4">
          <span className="text-4xl">🗓️</span>
          <h3 className="text-lg font-bold">Belum Ada Event Aktif</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Buat event Gelar Cipta pertama Anda untuk mulai mengelola tiket, peserta, dan check-in.
          </p>
          <Link href="/admin/events/new">
            <Button variant="primary" className="mt-2">Buat Event Baru →</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-slate-900 to-violet-950 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="sm">Active Event Scope</Badge>
            <span className="text-xs text-indigo-200">ID: {activeEvent._id}</span>
          </div>
          <h1 className="text-2xl font-extrabold">{activeEvent.name}</h1>
          <p className="text-xs text-slate-300">Tema: &quot;{activeEvent.theme}&quot;</p>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <Link href={`/admin/events/${activeEvent._id}`}>
            <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              ⚡ Kelola Event
            </Button>
          </Link>
          <Link href="/checkin">
            <Button size="sm" className="bg-amber-400 text-slate-950 font-bold hover:bg-amber-300">
              📱 QR Scanner Check-In
            </Button>
          </Link>
        </div>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Check-in Today */}
        <Card hoverEffect className="space-y-2 p-5 border-l-4 border-indigo-600">
          <div className="flex justify-between items-center text-slate-500 text-xs">
            <span className="font-bold">Check-In Hari Ini</span>
            <span className="text-lg">✅</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.checkInsToday}</p>
          <p className="text-[11px] text-slate-500">Dari total {stats.totalCheckIns} akumulasi check-in</p>
        </Card>

        {/* Card 2: Tickets Sold */}
        <Card hoverEffect className="space-y-2 p-5 border-l-4 border-emerald-500">
          <div className="flex justify-between items-center text-slate-500 text-xs">
            <span className="font-bold">Tiket Terjual / Aktif</span>
            <span className="text-lg">🎫</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.ticketsSold}</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(stats.checkInRate, 100)}%` }} />
          </div>
          <p className="text-[11px] text-slate-500 font-medium">{stats.checkInRate}% Tingkat Kehadiran</p>
        </Card>

        {/* Card 3: Participants */}
        <Card hoverEffect className="space-y-2 p-5 border-l-4 border-amber-500">
          <div className="flex justify-between items-center text-slate-500 text-xs">
            <span className="font-bold">Peserta Karya</span>
            <span className="text-lg">👥</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.participantsCount}</p>
          <p className="text-[11px] text-slate-500">Terdaftar di katalog karya</p>
        </Card>

        {/* Card 4: Booths */}
        <Card hoverEffect className="space-y-2 p-5 border-l-4 border-purple-500">
          <div className="flex justify-between items-center text-slate-500 text-xs">
            <span className="font-bold">Booth Pameran</span>
            <span className="text-lg">🏪</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">
            {stats.assignedBooths} <span className="text-sm font-normal text-slate-400">/ {stats.boothsCount}</span>
          </p>
          <p className="text-[11px] text-slate-500">Booth telah terisi peserta</p>
        </Card>
      </div>

      {/* Main Content Layout: Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Log (2 cols) */}
        <Card className="lg:col-span-2 space-y-4 p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">Aktivitas & Log Check-In Terakhir</h3>
            <Link href={`/admin/events/${activeEvent._id}/tiket`}>
              <span className="text-xs text-indigo-600 font-bold hover:underline">Lihat Semua →</span>
            </Link>
          </div>

          {stats.recentActivity.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Belum ada aktivitas check-in.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentActivity.map((log: { _id: string, status: string, visitor?: { name: string, email: string }, method: string, checkedInAt: Date }) => (
                <div key={log._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <div>
                      <p className="font-bold text-slate-900">{log.visitor?.name || 'Pengunjung'}</p>
                      <p className="text-[11px] text-slate-500">{log.visitor?.email} • Scan: {log.method}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={log.status === 'success' ? 'success' : 'danger'}>
                      {log.status}
                    </Badge>
                    <p className="text-[10px] text-slate-400 mt-1">{formatDateTime(log.checkedInAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Action Panel (1 col) */}
        <Card className="space-y-4 p-6">
          <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">Quick Actions Panitia</h3>
          <div className="space-y-2.5">
            <Link href={`/admin/events/${activeEvent._id}/peserta`} className="block">
              <Button variant="outline" className="w-full justify-start text-xs font-bold gap-2">
                ➕ Tambah Peserta Baru
              </Button>
            </Link>
            <Link href={`/admin/events/${activeEvent._id}/berita`} className="block">
              <Button variant="outline" className="w-full justify-start text-xs font-bold gap-2">
                📝 Tulis Berita / Pengumuman
              </Button>
            </Link>
            <Link href={`/admin/events/${activeEvent._id}/galeri`} className="block">
              <Button variant="outline" className="w-full justify-start text-xs font-bold gap-2">
                📷 Upload Galeri Foto
              </Button>
            </Link>
            <Link href={`/admin/events/${activeEvent._id}/sections`} className="block">
              <Button variant="outline" className="w-full justify-start text-xs font-bold gap-2">
                🎨 Edit CMS Landing Page
              </Button>
            </Link>
            <Link href="/admin/users" className="block">
              <Button variant="outline" className="w-full justify-start text-xs font-bold gap-2">
                👤 Kelola User & Role Panitia
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
