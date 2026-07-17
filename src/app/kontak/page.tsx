import React from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { connectDB } from '@/lib/db';
import { WebsiteSettings } from '@/models/WebsiteSettings';
import { Event } from '@/models/Event';
import type { Metadata } from 'next';
import { MapPin, Mail, Phone, MessageSquare } from 'lucide-react';
import { InstagramIcon, TikTokIcon, YouTubeIcon, TwitterXIcon } from '@/components/ui/BrandIcons';

export const revalidate = 60;

async function getData() {
  try {
    await connectDB();
    const settingsDoc = await WebsiteSettings.findOne().lean();
    let activeEventId = settingsDoc?.activeEventId;
    if (!activeEventId) {
      const activeEvent = await Event.findOne({ status: 'active' }).sort({ date: -1 }).lean();
      activeEventId = activeEvent?._id;
    }
    const event = activeEventId ? await Event.findById(activeEventId).lean() : null;
    return {
      settings: settingsDoc ? JSON.parse(JSON.stringify(settingsDoc)) : null,
      event: event ? JSON.parse(JSON.stringify(event)) : null,
    };
  } catch (error) {
    console.error('Failed to fetch contact page data:', error);
    return { settings: null, event: null };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { settings, event } = await getData();
  const title = `Kontak | ${event?.name || settings?.siteName || 'Gelar Cipta'}`;
  return { title, description: `Pusat Informasi dan Layanan Eksibisi ${event?.name || 'Gelar Cipta'}` };
}

export default async function ContactPage() {
  const { settings, event } = await getData();

  const contact = settings?.contact;
  const socialMedia = settings?.socialMedia;
  const location = event?.location;

  return (
    <PublicLayout settings={settings}>
      {/* Concierge Desk Header */}
      <section className="pt-36 pb-16 border-b border-ivory-cream/10 bg-background">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <span className="font-label-caps text-[10px] text-secondary tracking-[0.3em] uppercase block mb-3">
                PUSAT LAYANAN &amp; INFORMASI PAMERAN
              </span>
              <h1 className="font-display-lg text-4xl md:text-6xl lg:text-7xl text-on-surface uppercase leading-none tracking-tight">
                PUSAT <span className="text-secondary italic font-normal">INFORMASI</span>
              </h1>
            </div>
            <p className="font-body-md text-sm text-outline max-w-sm">
              Pusat layanan informasi pengunjung, reservasi tiket, kemitraan media, dan lokasi pameran.
            </p>
          </div>
        </div>
      </section>

      {/* Concierge Services Grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card 1: Venue & Location */}
          <div className="border border-ivory-cream/10 bg-surface-container-low/50 p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="font-label-caps text-[10px] text-secondary tracking-[0.25em] uppercase block border-b border-ivory-cream/10 pb-2">
                01 • LOKASI &amp; TEMPAT
              </span>
              {location ? (
                <div className="space-y-2 pt-2">
                  <h3 className="font-headline-md text-xl text-on-surface">{location.name}</h3>
                  {location.address && (
                    <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">{location.address}</p>
                  )}
                </div>
              ) : (
                <p className="font-body-md text-xs text-outline pt-2">Lokasi pameran akan segera diumumkan.</p>
              )}

              {event?.date && (
                <div className="pt-4 border-t border-ivory-cream/5 space-y-1">
                  <span className="font-label-caps text-[9px] text-outline uppercase block">TANGGAL PELAKSANAAN</span>
                  <p className="font-headline-md text-sm text-on-surface">
                    {new Date(event.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              )}
            </div>

            {location?.mapUrl && (
              <a
                href={location.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-secondary/40 bg-secondary/10 text-secondary hover:bg-secondary hover:text-dark-chocolate px-4 py-2.5 font-label-caps text-[10px] tracking-widest transition-all duration-300 w-fit"
              >
                <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                PETUNJUK LOKASI MAPS
              </a>
            )}
          </div>

          {/* Card 2: Direct Contact */}
          <div className="border border-ivory-cream/10 bg-surface-container-low/50 p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="font-label-caps text-[10px] text-secondary tracking-[0.25em] uppercase block border-b border-ivory-cream/10 pb-2">
                02 • KONTAK LANGSUNG
              </span>
              <div className="space-y-4 pt-2">
                {contact?.email && (
                  <a href={`mailto:${contact.email}`} className="flex items-center gap-3 group">
                    <Mail className="w-4 h-4 text-secondary shrink-0" aria-hidden="true" />
                    <span className="font-body-md text-xs text-on-surface-variant group-hover:text-secondary transition-colors truncate">{contact.email}</span>
                  </a>
                )}
                {contact?.phone && (
                  <a href={`tel:${contact.phone}`} className="flex items-center gap-3 group">
                    <Phone className="w-4 h-4 text-secondary shrink-0" aria-hidden="true" />
                    <span className="font-body-md text-xs text-on-surface-variant group-hover:text-secondary transition-colors">{contact.phone}</span>
                  </a>
                )}
                {contact?.whatsapp && (
                  <a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                    <MessageSquare className="w-4 h-4 text-secondary shrink-0" aria-hidden="true" />
                    <span className="font-body-md text-xs text-on-surface-variant group-hover:text-secondary transition-colors">WhatsApp Panitia: {contact.whatsapp}</span>
                  </a>
                )}
                {!contact?.email && !contact?.phone && !contact?.whatsapp && (
                  <p className="font-body-md text-xs text-outline">Kontak informasi panitia belum dikonfigurasi.</p>
                )}
              </div>
            </div>

            {contact?.whatsapp && (
              <a
                href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-secondary bg-secondary text-dark-chocolate px-4 py-2.5 font-label-caps text-[10px] font-bold tracking-widest transition-all duration-300 w-fit"
              >
                <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                HUBUNGI VIA WHATSAPP
              </a>
            )}
          </div>

          {/* Card 3: Social & Press Channels */}
          <div className="border border-ivory-cream/10 bg-surface-container-low/50 p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="font-label-caps text-[10px] text-secondary tracking-[0.25em] uppercase block border-b border-ivory-cream/10 pb-2">
                03 • SALURAN RESMI
              </span>
              <div className="space-y-3 pt-1">
                {socialMedia?.instagram && (
                  <a href={socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group p-2 border border-ivory-cream/5 bg-black/20 hover:border-secondary/30 transition-colors">
                    <InstagramIcon className="w-4 h-4 text-secondary shrink-0" />
                    <span className="font-body-md text-xs text-on-surface-variant group-hover:text-secondary transition-colors">Instagram Resmi</span>
                  </a>
                )}
                {socialMedia?.youtube && (
                  <a href={socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group p-2 border border-ivory-cream/5 bg-black/20 hover:border-secondary/30 transition-colors">
                    <YouTubeIcon className="w-4 h-4 text-secondary shrink-0" />
                    <span className="font-body-md text-xs text-on-surface-variant group-hover:text-secondary transition-colors">YouTube Channel</span>
                  </a>
                )}
                {socialMedia?.tiktok && (
                  <a href={socialMedia.tiktok} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group p-2 border border-ivory-cream/5 bg-black/20 hover:border-secondary/30 transition-colors">
                    <TikTokIcon className="w-4 h-4 text-secondary shrink-0" />
                    <span className="font-body-md text-xs text-on-surface-variant group-hover:text-secondary transition-colors">TikTok Showcase</span>
                  </a>
                )}
                {socialMedia?.twitter && (
                  <a href={socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group p-2 border border-ivory-cream/5 bg-black/20 hover:border-secondary/30 transition-colors">
                    <TwitterXIcon className="w-4 h-4 text-secondary shrink-0" />
                    <span className="font-body-md text-xs text-on-surface-variant group-hover:text-secondary transition-colors">Twitter / X Updates</span>
                  </a>
                )}
                {!socialMedia?.instagram && !socialMedia?.youtube && !socialMedia?.tiktok && !socialMedia?.twitter && (
                  <p className="font-body-md text-xs text-outline">Kanal sosial resmi belum dikonfigurasi.</p>
                )}
              </div>
            </div>

            <div className="text-[10px] font-label-caps text-outline border-t border-ivory-cream/5 pt-3">
              PANITIA GELAR CIPTA KARYA BOGA — UNESA
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
