'use client';

import React, { useState, useEffect } from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Clock, MapPin, CalendarDays, UserCheck } from 'lucide-react';
import type { IWebsiteSettings, ISchedule } from '@/types';

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<ISchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<IWebsiteSettings | null>(null);

  useEffect(() => {
    fetch('/api/public/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data.data));
  }, []);

  useEffect(() => {
    fetch('/api/public/event/schedules')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSchedules(data.data || []);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <PublicLayout settings={settings}>
      {/* Agenda Board Header */}
        <section className="pt-36 pb-16 border-b border-ivory-cream/10 bg-background">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-label-caps text-[10px] text-secondary tracking-[0.3em] uppercase">
                    PAPAN AGENDA ACARA
                  </span>
                  <span className="text-secondary border border-secondary/30 text-[10px] font-label-caps px-2 py-0.5">
                    {schedules.length} SESI TERJADWAL
                  </span>
                </div>
                <h1 className="font-display-lg text-4xl md:text-6xl lg:text-7xl text-on-surface uppercase leading-none tracking-tight">
                  JADWAL <span className="text-secondary italic font-normal">RANGKAIAN ACARA</span>
                </h1>
              </div>
              <p className="font-body-md text-sm text-outline max-w-sm">
                Rangkaian acara peluncuran, penjurian produk, demonstrasi kuliner, dan malam penganugerahan.
              </p>
            </div>
          </div>
        </section>

        {/* Timeline List */}
        <section className="py-16 md:py-24">
          <div className="max-w-[960px] mx-auto px-6">
            {isLoading ? (
              <div className="space-y-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-surface-container-low border border-ivory-cream/5 p-8 h-32"></div>
                ))}
              </div>
            ) : schedules.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-ivory-cream/10">
                <CalendarDays className="w-10 h-10 text-outline mx-auto mb-4 opacity-40" aria-hidden="true" />
                <h3 className="font-headline-md text-xl text-on-surface-variant mb-2">RANGKAIAN ACARA BELUM DIBUKA</h3>
                <p className="font-body-md text-xs text-outline">Jadwal acara pameran akan diumumkan segera.</p>
              </div>
            ) : (
              <div className="relative border-l border-secondary/30 ml-4 md:ml-32 space-y-12">
                {schedules.map((item, index) => (
                  <article key={item._id} className="relative pl-8 md:pl-12 group">
                    {/* Timeline Node Icon */}
                    <div className="absolute -left-[7px] top-1.5 w-3.5 h-3.5 rounded-full bg-background border-2 border-secondary group-hover:scale-125 transition-transform"></div>

                    {/* Time Pillar (Desktop Left Floating) */}
                    <div className="md:absolute md:-left-36 md:top-0 md:w-28 md:text-right mb-2 md:mb-0">
                      <span className="font-display-lg text-2xl text-secondary block">
                        {item.startTime}
                      </span>
                      {item.endTime && (
                        <span className="font-label-caps text-[10px] text-outline block">
                          s/d {item.endTime}
                        </span>
                      )}
                    </div>

                    {/* Main Event Card */}
                    <div className="border border-ivory-cream/10 bg-surface-container-low/40 p-6 md:p-8 hover:border-secondary/40 transition-all duration-300 space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        {item.type && (
                          <span className="font-label-caps text-[9px] tracking-widest text-secondary border border-secondary/30 px-2.5 py-0.5 uppercase bg-secondary/5">
                            {item.type}
                          </span>
                        )}
                        {item.location && (
                          <span className="font-body-md text-xs text-outline flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-secondary" aria-hidden="true" />
                            {item.location}
                          </span>
                        )}
                      </div>

                      <h3 className="font-headline-md text-xl md:text-2xl text-on-surface uppercase group-hover:text-secondary transition-colors">
                        {item.title}
                      </h3>

                      {item.description && (
                        <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      {item.speaker && (
                        <div className="pt-2 border-t border-ivory-cream/5 flex items-center gap-2 text-xs font-label-caps text-secondary/80">
                          <UserCheck className="w-4 h-4" aria-hidden="true" />
                          <span>SPEAKER / PRESENTER: {item.speaker}</span>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
    </PublicLayout>
  );
}
