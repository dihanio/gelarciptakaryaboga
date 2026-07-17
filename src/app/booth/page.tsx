'use client';

import React, { useState, useEffect } from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { LayoutGrid, CheckCircle2, Circle, Store } from 'lucide-react';
import type { IWebsiteSettings, IBooth, IParticipant } from '@/types';

interface PopulatedBooth extends IBooth {
  participant?: IParticipant;
}

export default function BoothPage() {
  const [booths, setBooths] = useState<PopulatedBooth[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<IWebsiteSettings | null>(null);

  useEffect(() => {
    fetch('/api/public/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data.data));
  }, []);

  useEffect(() => {
    fetch('/api/public/event/booths')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBooths(data.data || []);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const assignedCount = booths.filter((b) => b.status === 'assigned' || b.participant).length;
  const availableCount = booths.length - assignedCount;

  return (
    <PublicLayout settings={settings}>
      {/* Floorplan Header */}
        <section className="pt-36 pb-16 border-b border-ivory-cream/10 bg-background">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-label-caps text-[10px] text-secondary tracking-[0.3em] uppercase">
                    PETA DENAH &amp; ZONA
                  </span>
                  <div className="flex gap-2">
                    <span className={`text-[10px] font-label-caps px-2.5 py-0.5 ${assignedCount > 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-secondary border border-secondary/30'}`}>
                      {assignedCount} TERISI
                    </span>
                    {availableCount > 0 && (
                      <span className="text-secondary border border-secondary/30 text-[10px] font-label-caps px-2.5 py-0.5">
                        {availableCount} TERSEDIA
                      </span>
                    )}
                  </div>
                </div>
                <h1 className="font-display-lg text-4xl md:text-6xl lg:text-7xl text-on-surface uppercase leading-none tracking-tight">
                  PETA <span className="text-secondary italic font-normal">STAN PAMERAN</span>
                </h1>
              </div>
              <p className="font-body-md text-sm text-outline max-w-sm">
                Peta lokasi &amp; pembagian zona stan pameran produk boga karya mahasiswa.
              </p>
            </div>
          </div>
        </section>

        {/* Floor Plan Grid */}
        <section className="py-16 md:py-24">
          <div className="max-w-[1280px] mx-auto px-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-surface-container-low border border-ivory-cream/5 p-6 h-64"></div>
                ))}
              </div>
            ) : booths.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-ivory-cream/10">
                <Store className="w-10 h-10 text-outline mx-auto mb-4 opacity-40" aria-hidden="true" />
                <h3 className="font-headline-md text-xl text-on-surface-variant mb-2">PETA BOOTH BELUM DIKONFIGURASI</h3>
                <p className="font-body-md text-xs text-outline">Layout stan pameran akan diumumkan menjelang pelaksanaan event.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {booths.map((booth) => {
                  const isOccupied = booth.status === 'assigned' || !!booth.participant;
                  return (
                    <div
                      key={booth._id}
                      className="group border border-ivory-cream/10 bg-surface-container-low/50 hover:border-secondary/40 transition-all duration-500 relative flex flex-col justify-between"
                    >
                      {/* Image Area or Number Banner */}
                      <div className="aspect-[16/9] overflow-hidden bg-deep-espresso relative border-b border-ivory-cream/5">
                        {booth.participant?.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={booth.participant.photo}
                            alt={booth.name || `Booth ${booth.number}`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-deep-espresso to-black">
                            <span className="font-display-lg text-6xl text-secondary/20 group-hover:text-secondary/40 transition-colors">
                              #{booth.number}
                            </span>
                          </div>
                        )}

                        {/* Status Badge Top Right */}
                        <div className="absolute top-3 right-3">
                          {isOccupied ? (
                            <span className="inline-flex items-center gap-1.5 bg-emerald-950/80 backdrop-blur text-emerald-400 border border-emerald-500/30 px-2.5 py-1 text-[9px] font-label-caps tracking-widest uppercase">
                              <CheckCircle2 className="w-3 h-3" aria-hidden="true" /> OCCUPIED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-black/80 backdrop-blur text-secondary border border-secondary/30 px-2.5 py-1 text-[9px] font-label-caps tracking-widest uppercase">
                              <Circle className="w-3 h-3 text-secondary" aria-hidden="true" /> OPEN
                            </span>
                          )}
                        </div>

                        {/* Booth Number Tag Top Left */}
                        <div className="absolute top-3 left-3 bg-black/80 backdrop-blur border border-ivory-cream/20 px-2.5 py-1">
                          <span className="font-label-caps text-[10px] text-secondary tracking-widest font-bold">
                            BOOTH #{booth.number}
                          </span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-6 space-y-3 flex-1">
                        {booth.name && (
                          <h3 className="font-headline-md text-lg text-on-surface group-hover:text-secondary transition-colors">
                            {booth.name}
                          </h3>
                        )}
                        {booth.category && (
                          <span className="font-label-caps text-[9px] tracking-widest text-secondary border border-secondary/30 px-2 py-0.5 uppercase inline-block">
                            {booth.category}
                          </span>
                        )}
                        {booth.description && (
                          <p className="font-body-md text-xs text-on-surface-variant leading-relaxed line-clamp-3">
                            {booth.description}
                          </p>
                        )}
                      </div>

                      {/* Participant Footer */}
                      {booth.participant && (
                        <div className="px-6 py-3 border-t border-ivory-cream/5 bg-black/30 text-xs font-label-caps text-secondary">
                          CREATOR: {booth.participant.name}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
    </PublicLayout>
  );
}
