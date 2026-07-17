import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ETicket } from '@/components/tickets/ETicket';
import { connectDB } from '@/lib/db';
import { WebsiteSettings } from '@/models/WebsiteSettings';
import { Ticket } from '@/models/Ticket';
import { ArrowLeft, PlusCircle } from 'lucide-react';

async function getData(ticketNumber: string) {
  try {
    await connectDB();

    const settings = await WebsiteSettings.findOne().lean();
    const ticket = await Ticket.findOne({ ticketNumber: ticketNumber.toUpperCase() })
      .populate('event', 'name date time location theme logo')
      .populate('visitor', 'name email phone organization')
      .populate('ticketType', 'name price benefits')
      .lean();

    return {
      settings: settings ? JSON.parse(JSON.stringify(settings)) : null,
      ticket: ticket ? JSON.parse(JSON.stringify(ticket)) : null,
    };
  } catch (error) {
    console.error('Failed to fetch ticket view data:', error);
    return { settings: null, ticket: null };
  }
}

export default async function ETicketViewPage({
  params,
}: {
  params: Promise<{ ticketNumber: string }>;
}) {
  const { ticketNumber } = await params;
  const { settings, ticket } = await getData(ticketNumber);

  if (!ticket) {
    notFound();
  }

  return (
    <PublicLayout settings={settings}>
      <div className="pt-36 pb-24">
        <div className="max-w-xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-3">
            <span className="font-label-caps text-[10px] uppercase tracking-[0.3em] text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 inline-block">
              E-TICKET RESMI BERHASIL DITERBITKAN
            </span>
            <h1 className="font-display-lg text-3xl md:text-4xl text-on-surface uppercase tracking-tight">E-TICKET PENGUNJUNG</h1>
            <p className="font-body-md text-xs text-outline leading-relaxed max-w-sm mx-auto">
              Simpan halaman ini atau ambil tangkapan layar (screenshot) QR Code di bawah untuk ditunjukkan kepada petugas saat memasuki area pameran.
            </p>
          </div>

          <ETicket ticket={ticket} />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 print:hidden">
            <Link href="/tiket" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto border border-ivory-cream/20 text-on-surface-variant hover:text-on-surface hover:border-ivory-cream/40 px-6 py-3 font-label-caps text-xs tracking-widest transition-all inline-flex items-center justify-center gap-2">
                <PlusCircle className="w-4 h-4 text-secondary" aria-hidden="true" />
                DAFTAR TIKET LAIN
              </button>
            </Link>
            <Link href="/" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto border border-secondary bg-secondary/15 text-secondary hover:bg-secondary hover:text-dark-chocolate px-6 py-3 font-label-caps text-xs tracking-widest transition-all font-bold inline-flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                KEMBALI KE BERANDA
              </button>
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
