import React from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { connectDB } from '@/lib/db';
import { WebsiteSettings } from '@/models/WebsiteSettings';
import { Event } from '@/models/Event';
import type { Metadata } from 'next';
import { MapPin, Calendar } from 'lucide-react';

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
    console.error('Failed to fetch about page data:', error);
    return { settings: null, event: null };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { settings, event } = await getData();
  const title = `Tentang | ${event?.name || settings?.siteName || 'Gelar Cipta'}`;
  const description = event?.description || settings?.siteDescription || '';
  return { title, description, openGraph: { title, description } };
}

export default async function AboutPage() {
  const { settings, event } = await getData();

  return (
    <PublicLayout settings={settings}>
      {/* Museum Profile Opening Header */}
      <section className="pt-36 pb-20 md:pt-44 md:pb-24 border-b border-ivory-cream/10 bg-background">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <span className="font-label-caps text-[10px] md:text-xs text-secondary tracking-[0.35em] block mb-4 uppercase">
                PROFIL RESMI PAMERAN
              </span>
              <h1 className="font-display-lg text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-on-surface uppercase leading-[1.02] tracking-tight">
                TENTANG <span className="text-secondary italic font-normal">PAMERAN</span>
              </h1>
            </div>
            <div className="lg:col-span-4 lg:pb-2">
              <p className="font-body-md text-sm md:text-base text-on-surface-variant/80 border-l border-secondary/40 pl-6 leading-relaxed">
                Gelar Cipta Karya Boga adalah ruang kurasi mahakarya kuliner—menghubungkan akar tradisi cita rasa dengan inovasi gastronomi masa depan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Narrative & Philosophy */}
      {event ? (
        <>
          <section className="py-24 max-w-[1280px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
              {/* Left Side: Curatorial Identity */}
              <div className="lg:col-span-5 space-y-6">
                <span className="font-label-caps text-xs text-secondary tracking-[0.3em] uppercase font-medium block">
                  CURATORIAL VISION
                </span>
                {event.name && (
                  <h2 className="font-display-lg text-3xl md:text-5xl text-on-surface uppercase leading-tight">
                    {event.name}
                  </h2>
                )}
                {event.theme && (
                  <p className="font-label-caps text-xs text-secondary tracking-widest uppercase pt-2">
                    TEMA: {event.theme}
                  </p>
                )}
              </div>

              {/* Right Side: Editorial Prose */}
              <div className="lg:col-span-7 space-y-8">
                {event.description && (
                  <blockquote className="font-headline-md text-xl md:text-2xl italic text-on-surface leading-relaxed border-l-2 border-secondary pl-6">
                    &quot;{event.description}&quot;
                  </blockquote>
                )}
                {event.about?.content && (
                  <p className="font-body-md text-on-surface-variant/90 leading-relaxed whitespace-pre-wrap text-base md:text-lg">
                    {event.about.content}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Vision & Mission Pillars */}
          <section className="py-20 bg-deep-espresso border-y border-ivory-cream/10">
            <div className="max-w-[1280px] mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="p-8 border border-ivory-cream/10 bg-surface-container-low/60 space-y-4">
                  <span className="font-display-lg text-2xl text-secondary font-bold block border-b border-ivory-cream/10 pb-2">01</span>
                  <h3 className="font-headline-md text-xl text-on-surface uppercase">Filosofi Inovasi</h3>
                  <p className="font-body-md text-sm text-outline leading-relaxed">
                    Mengeksplorasi teknik olahan pangan masa kini tanpa menghilangkan esensi budaya kuliner lokal.
                  </p>
                </div>

                <div className="p-8 border border-ivory-cream/10 bg-surface-container-low/60 space-y-4">
                  <span className="font-display-lg text-2xl text-secondary font-bold block border-b border-ivory-cream/10 pb-2">02</span>
                  <h3 className="font-headline-md text-xl text-on-surface uppercase">Visi Akademis</h3>
                  <p className="font-body-md text-sm text-outline leading-relaxed">
                    Menjadi panggung apresiasi utama karya cipta mahasiswa S1 Pendidikan Tata Boga Universitas Negeri Surabaya.
                  </p>
                </div>

                <div className="p-8 border border-ivory-cream/10 bg-surface-container-low/60 space-y-4">
                  <span className="font-display-lg text-2xl text-secondary font-bold block border-b border-ivory-cream/10 pb-2">03</span>
                  <h3 className="font-headline-md text-xl text-on-surface uppercase">Standar Eksibisi</h3>
                  <p className="font-body-md text-sm text-outline leading-relaxed">
                    Menghadirkan standar pameran kelas bisnis kuliner &amp; pengujian sensoris tingkat profesional.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Metadata Footer Info */}
          <section className="py-16 max-w-[1280px] mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-outline font-label-caps text-xs">
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-secondary" aria-hidden="true" />
                  <span>{event.location.name.toUpperCase()} — {event.location.address}</span>
                </div>
              )}
              {event.date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-secondary" aria-hidden="true" />
                  <span>{new Date(event.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              )}
            </div>
          </section>
        </>
      ) : (
        <section className="py-32 text-center">
          <p className="font-body-lg text-on-surface-variant">Profil eksibisi belum dikonfigurasi.</p>
        </section>
      )}
    </PublicLayout>
  );
}
