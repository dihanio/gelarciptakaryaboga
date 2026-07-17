'use client';

import React, { useState, useEffect } from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Search, User, Filter } from 'lucide-react';
import type { IParticipant, IWebsiteSettings, IBooth } from '@/types';

interface PopulatedParticipant extends Omit<IParticipant, 'booth'> {
  booth?: IBooth;
}

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<PopulatedParticipant[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [settings, setSettings] = useState<IWebsiteSettings | null>(null);

  useEffect(() => {
    fetch('/api/public/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data.data));
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchParticipants = async () => {
      const query = new URLSearchParams();
      if (search) query.set('search', search);
      if (category) query.set('category', category);

      const res = await fetch(`/api/public/event/participants?${query.toString()}`);
      const data = await res.json();
      if (isMounted && data.success) {
        setParticipants(data.data || []);
        if (data.categories) setCategories(data.categories);
        setIsLoading(false);
      }
    };

    fetchParticipants();
    return () => {
      isMounted = false;
    };
  }, [search, category]);

  return (
    <PublicLayout settings={settings}>
      {/* Exhibition Catalog Header */}
        <section className="pt-36 pb-16 border-b border-ivory-cream/10 bg-background">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-label-caps text-[10px] text-secondary tracking-[0.3em] uppercase">
                    KATALOG KARYA
                  </span>
                  <span className="text-secondary border border-secondary/30 text-[10px] font-label-caps px-2 py-0.5">
                    {participants.length} KARYA TERDAFTAR
                  </span>
                </div>
                <h1 className="font-display-lg text-4xl md:text-6xl lg:text-7xl text-on-surface uppercase leading-none tracking-tight">
                  INOVASI <span className="text-secondary italic font-normal">KARYA BOGA</span>
                </h1>
              </div>
              <p className="font-body-md text-sm text-outline max-w-sm">
                Jelajahi ide visual, karya inovasi produk boga, dan portofolio kreasi mahasiswa angkatan 2023.
              </p>
            </div>
          </div>
        </section>

        {/* Filter & Search Toolbar */}
        <section className="py-6 border-b border-ivory-cream/10 bg-deep-espresso/50 backdrop-blur-md sticky top-[73px] z-30">
          <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar py-1">
              <button
                onClick={() => setCategory('')}
                className={`font-label-caps text-[10px] tracking-[0.15em] px-3.5 py-2 whitespace-nowrap border transition-all ${
                  category === ''
                    ? 'border-secondary bg-secondary text-dark-chocolate font-bold'
                    : 'border-ivory-cream/10 text-on-surface-variant hover:border-secondary/40'
                }`}
              >
                ALL CATEGORIES
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`font-label-caps text-[10px] tracking-[0.15em] px-3.5 py-2 whitespace-nowrap border transition-all ${
                    category === c
                      ? 'border-secondary bg-secondary text-dark-chocolate font-bold'
                      : 'border-ivory-cream/10 text-on-surface-variant hover:border-secondary/40'
                  }`}
                >
                  {c.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                type="text"
                placeholder="Cari karya atau nama..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface-container border border-ivory-cream/10 text-on-surface pl-10 pr-4 py-2 font-body-md text-xs placeholder:text-outline focus:outline-none focus:border-secondary/50 transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Catalog Grid */}
        <section className="py-16 md:py-24">
          <div className="max-w-[1280px] mx-auto px-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-surface-container-low border border-ivory-cream/5 p-4 space-y-4">
                    <div className="aspect-[4/3] bg-surface-container"></div>
                    <div className="h-4 bg-surface-container w-3/4"></div>
                    <div className="h-3 bg-surface-container w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : participants.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-ivory-cream/10">
                <Filter className="w-10 h-10 text-outline mx-auto mb-4 opacity-40" aria-hidden="true" />
                <h3 className="font-headline-md text-xl text-on-surface-variant mb-2">KATALOG BELUM TERSEDIA</h3>
                <p className="font-body-md text-xs text-outline">Karya peserta akan segera ditampilkan dalam katalog eksibisi.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {participants.map((p) => (
                  <article key={p._id} className="group border border-ivory-cream/10 bg-surface-container-low/40 hover:border-secondary/40 transition-all duration-500 flex flex-col justify-between">
                    <div>
                      {/* Work Image Frame */}
                      <div className="aspect-[4/3] overflow-hidden bg-surface-container relative">
                        {p.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.photo}
                            alt={p.workName}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-deep-espresso">
                            <User className="w-12 h-12 text-ivory-cream/10" aria-hidden="true" />
                          </div>
                        )}
                        {p.booth && (
                          <div className="absolute top-3 left-3 bg-black/80 backdrop-blur border border-secondary/30 px-2.5 py-1">
                            <span className="font-label-caps text-[9px] text-secondary tracking-widest">
                              BOOTH #{(p.booth as IBooth).number}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content Info */}
                      <div className="p-6 space-y-3">
                        {p.category && (
                          <span className="font-label-caps text-[9px] tracking-widest text-secondary border border-secondary/30 px-2 py-0.5 uppercase inline-block">
                            {p.category}
                          </span>
                        )}
                        <h3 className="font-headline-md text-xl text-on-surface group-hover:text-secondary transition-colors leading-snug">
                          {p.workName}
                        </h3>
                        <p className="font-label-caps text-xs text-secondary/90 font-medium">
                          Oleh: {p.name}
                        </p>
                        {p.description && (
                          <p className="font-body-md text-xs text-on-surface-variant line-clamp-3 leading-relaxed">
                            {p.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Team Members List */}
                    {p.members && p.members.length > 0 && (
                      <div className="px-6 py-3 border-t border-ivory-cream/5 bg-black/20 text-[11px] text-outline">
                        <span className="font-semibold text-on-surface-variant">Tim:</span>{' '}
                        {p.members.map((m: { name: string }) => m.name).join(', ')}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
    </PublicLayout>
  );
}
