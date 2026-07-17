'use client';

import React from 'react';
import QRCode from 'react-qr-code';
import { formatDate, formatCurrency } from '@/lib/utils';
import { ShieldCheck, Calendar, MapPin, CheckCircle2 } from 'lucide-react';

export interface ETicketProps {
  ticket: {
    ticketNumber: string;
    qrCode: string;
    status: string;
    issuedAt: string;
    event?: {
      name: string;
      date: string;
      time: string;
      location: { name: string; address: string };
      theme?: string;
    };
    visitor?: {
      name: string;
      email: string;
      phone: string;
      organization?: string;
    };
    ticketType?: {
      name: string;
      price: number;
      benefits?: string[];
    };
  };
}

export const ETicket: React.FC<ETicketProps> = ({ ticket }) => {
  const { ticketNumber, qrCode, status, event, visitor, ticketType } = ticket;

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 px-3 py-1 font-label-caps text-[10px] tracking-widest uppercase">
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> VALID ACCESS PASS
          </span>
        );
      case 'used':
        return (
          <span className="inline-flex items-center gap-1 bg-zinc-900 text-zinc-400 border border-zinc-700 px-3 py-1 font-label-caps text-[10px] tracking-widest uppercase">
            CHECK-IN SUDAH DIGUNAKAN
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 bg-red-950/80 text-red-400 border border-red-500/30 px-3 py-1 font-label-caps text-[10px] tracking-widest uppercase">
            DIBATALKAN
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-secondary/15 text-secondary border border-secondary/30 px-3 py-1 font-label-caps text-[10px] tracking-widest uppercase">
            {s.toUpperCase()}
          </span>
        );
    }
  };

  return (
    <div className="max-w-md mx-auto border border-secondary/30 bg-surface-container-low shadow-2xl overflow-hidden text-on-surface">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-deep-espresso via-black to-deep-espresso p-6 text-center space-y-2 border-b border-secondary/20 relative">
        <div className="flex items-center justify-center gap-3 mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Logo_Universitas_Negeri_Surabaya.png" alt="UNESA" className="h-9 w-auto object-contain" />
          <div className="h-6 w-[1px] bg-ivory-cream/20"></div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logogelarciptaboga.png" alt="Gelar Cipta" className="h-9 w-auto object-contain" />
        </div>
        <span className="font-label-caps text-[9px] uppercase tracking-[0.3em] text-secondary">
          E-TIKET RESMI PAMERAN
        </span>
        <h2 className="font-display-lg text-2xl uppercase tracking-wide text-on-surface">{event?.name || 'GELAR CIPTA'}</h2>
        {event?.theme && <p className="font-body-md text-xs text-on-surface-variant/80 italic font-light">&quot;{event.theme}&quot;</p>}
      </div>

      {/* Ticket Body */}
      <div className="p-6 space-y-6">
        {/* QR Code Pass Box */}
        <div className="flex flex-col items-center justify-center space-y-4 bg-black/40 p-6 border border-ivory-cream/10">
          <div className="bg-white p-3 border-2 border-secondary/40 shadow-xl">
            <QRCode value={qrCode} size={150} level="H" />
          </div>
          <div className="text-center space-y-2">
            <p className="font-display-lg text-sm text-secondary tracking-widest uppercase">
              {ticketNumber}
            </p>
            <div>{getStatusBadge(status)}</div>
          </div>
        </div>

        {/* Visitor Details */}
        <div className="space-y-3 text-xs border-b border-ivory-cream/10 pb-5 font-body-md">
          <div className="flex justify-between items-center">
            <span className="text-outline font-label-caps text-[10px] uppercase">NAMA PEMEGANG:</span>
            <span className="font-bold text-on-surface text-sm">{visitor?.name || '-'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-outline font-label-caps text-[10px] uppercase">EMAIL:</span>
            <span className="text-on-surface-variant">{visitor?.email || '-'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-outline font-label-caps text-[10px] uppercase">WHATSAPP / HP:</span>
            <span className="text-on-surface-variant">{visitor?.phone || '-'}</span>
          </div>
          {visitor?.organization && (
            <div className="flex justify-between items-center">
              <span className="text-outline font-label-caps text-[10px] uppercase">INSTANSI / ORG:</span>
              <span className="text-on-surface-variant">{visitor.organization}</span>
            </div>
          )}
        </div>

        {/* Event Details */}
        <div className="space-y-3 text-xs font-body-md">
          <div className="flex justify-between items-center">
            <span className="text-outline font-label-caps text-[10px] uppercase">KATEGORI TIKET:</span>
            <span className="font-headline-md text-sm text-secondary uppercase">{ticketType?.name || 'REGULER'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-outline font-label-caps text-[10px] uppercase">BIAYA TIKET:</span>
            <span className="font-headline-md text-sm text-secondary">
              {ticketType?.price ? formatCurrency(ticketType.price) : 'GRATIS'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-outline font-label-caps text-[10px] uppercase">TANGGAL:</span>
            <span className="text-on-surface">{event?.date ? formatDate(event.date) : '-'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-outline font-label-caps text-[10px] uppercase">WAKTU:</span>
            <span className="text-on-surface">{event?.time || '-'}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-outline font-label-caps text-[10px] uppercase pt-0.5">LOKASI:</span>
            <span className="text-on-surface text-right max-w-[200px]">
              {event?.location?.name}, {event?.location?.address}
            </span>
          </div>
        </div>
      </div>

      {/* Ticket Footer Notes */}
      <div className="bg-black/60 p-4 border-t border-ivory-cream/10 text-[10px] font-label-caps text-outline text-center space-y-1">
        <p className="text-secondary/80">Tunjukkan QR Code ini pada meja registrasi di lokasi pameran.</p>
        <p className="text-outline/60">Setiap QR Code berlaku untuk 1 kali verifikasi check-in.</p>
      </div>
    </div>
  );
};
