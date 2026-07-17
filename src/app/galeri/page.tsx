'use client';

import React, { useState, useEffect } from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Image as ImageIcon } from 'lucide-react';
import type { IWebsiteSettings, IGallery } from '@/types';

export default function GalleryPage() {
  const [gallery, setGallery] = useState<IGallery[]>([]);
  const [albums, setAlbums] = useState<string[]>([]);
  const [activeAlbum, setActiveAlbum] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<IWebsiteSettings | null>(null);

  useEffect(() => {
    fetch('/api/public/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data.data));
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchGallery = async () => {
      setIsLoading(true);
      const query = new URLSearchParams();
      if (activeAlbum) query.set('album', activeAlbum);

      const res = await fetch(`/api/public/event/gallery?${query.toString()}`);
      const data = await res.json();
      if (isMounted && data.success) {
        setGallery(data.data || []);
        if (data.albums && albums.length === 0) {
          setAlbums(data.albums);
        }
        setIsLoading(false);
      }
    };

    fetchGallery();
    return () => {
      isMounted = false;
    };
  }, [activeAlbum, albums.length]);

  return (
    <PublicLayout settings={settings}>
      {/* Visual Archive Header */}
        <section className="pt-36 pb-12 border-b border-ivory-cream/10 bg-background">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-label-caps text-[10px] text-secondary tracking-[0.3em] uppercase">
                    ARSIP DOKUMENTASI VISUAL
                  </span>
                  <span className="text-secondary border border-secondary/30 text-[10px] font-label-caps px-2 py-0.5">
                    {gallery.length} DOKUMENTASI DITAMPILKAN
                  </span>
                </div>
                <h1 className="font-display-lg text-4xl md:text-6xl lg:text-7xl text-on-surface uppercase leading-none tracking-tight">
                  GALERI <span className="text-secondary italic font-normal">DOKUMENTASI</span>
                </h1>
              </div>
              <p className="font-body-md text-sm text-outline max-w-sm">
                Dokumentasi estetis karya boga, proses kreasi, dan suasana ruang pameran.
              </p>
            </div>
          </div>
        </section>

        {/* Album Filter Bar */}
        {albums.length > 0 && (
          <section className="border-b border-ivory-cream/10 bg-deep-espresso/40 backdrop-blur-md sticky top-[73px] z-30">
            <div className="max-w-[1280px] mx-auto px-6 py-3 flex gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveAlbum('')}
                className={`font-label-caps text-[10px] tracking-[0.2em] px-4 py-2 border transition-all ${
                  activeAlbum === ''
                    ? 'border-secondary bg-secondary text-dark-chocolate font-bold'
                    : 'border-ivory-cream/10 text-on-surface-variant hover:border-secondary/40'
                }`}
              >
                ALL ALBUMS
              </button>
              {albums.map((album) => (
                <button
                  key={album}
                  onClick={() => setActiveAlbum(album)}
                  className={`font-label-caps text-[10px] tracking-[0.2em] px-4 py-2 border transition-all uppercase ${
                    activeAlbum === album
                      ? 'border-secondary bg-secondary text-dark-chocolate font-bold'
                      : 'border-ivory-cream/10 text-on-surface-variant hover:border-secondary/40'
                  }`}
                >
                  {album}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Pure Masonry Photo Wall */}
        <section className="py-12 md:py-20">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6">
            {isLoading ? (
              <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-surface-container-low mb-4 break-inside-avoid" style={{ height: `${220 + (i % 3) * 80}px` }}></div>
                ))}
              </div>
            ) : gallery.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-ivory-cream/10 max-w-[1280px] mx-auto">
                <ImageIcon className="w-10 h-10 text-outline mx-auto mb-4 opacity-40" aria-hidden="true" />
                <h3 className="font-headline-md text-xl text-on-surface-variant mb-2">ARSIP VISUAL BELUM TERSEDIA</h3>
                <p className="font-body-md text-xs text-outline">Foto dan video pameran akan diunggah sepanjang pelaksanaan event.</p>
              </div>
            ) : (
              <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
                {gallery.map((item) => (
                  <figure key={item._id} className="group mb-4 break-inside-avoid relative overflow-hidden bg-surface-container-low border border-ivory-cream/5">
                    {item.type === 'photo' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <video
                        src={item.url}
                        poster={item.thumbnail || undefined}
                        className="w-full h-auto"
                        controls
                        preload="none"
                      />
                    )}
                    {/* Hover Visual Caption */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent group-hover:opacity-100 opacity-0 transition-opacity duration-500 flex items-end justify-start p-6 pointer-events-none">
                      <div>
                        {item.album && (
                          <span className="font-label-caps text-[9px] text-secondary tracking-widest uppercase block mb-1">
                            {item.album}
                          </span>
                        )}
                        <figcaption className="font-headline-md text-base text-on-surface leading-tight">
                          {item.title}
                        </figcaption>
                      </div>
                    </div>
                  </figure>
                ))}
              </div>
            )}
          </div>
        </section>
    </PublicLayout>
  );
}
