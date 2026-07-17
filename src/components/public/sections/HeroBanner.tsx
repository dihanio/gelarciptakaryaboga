'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowDown, Sparkles, Volume2, VolumeX } from 'lucide-react';
import type { IEvent } from '@/types';

export const HeroBanner: React.FC<{ event?: IEvent }> = ({ event }) => {
  const heroBgRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (heroBgRef.current) {
        const scrolled = window.scrollY;
        heroBgRef.current.style.transform = `translateY(${scrolled * 0.35}px) scale(1.05)`;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleAudio = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (!event) return null;

  const formattedDate = event.date
    ? new Date(event.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()
    : '';
  const locationName = event.location?.name?.toUpperCase() || 'GRAHA UNESA';

  return (
    <section className="relative h-screen flex items-end justify-end overflow-hidden bg-black">
      {/* Video Background with parallax */}
      <div className="absolute inset-0 z-0" ref={heroBgRef}>
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          poster={event.banner || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1920&q=80'}
          className="w-full h-full object-cover filter brightness-[0.85] contrast-[1.05] scale-105"
        >
          <source src="/aftermovie2025.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/50 z-10" />
      </div>

      {/* Audio Toggle */}
      <div className="absolute top-28 left-8 md:left-12 z-30">
        <button
          onClick={toggleAudio}
          type="button"
          className="inline-flex items-center gap-2 border border-secondary/40 text-secondary bg-black/70 backdrop-blur-md px-4 py-2 font-label-caps text-xs tracking-widest uppercase hover:bg-secondary hover:text-dark-chocolate transition-all duration-300 shadow-xl"
          title={isMuted ? 'Aktifkan Suara Video' : 'Matikan Suara Video'}
        >
          {isMuted ? (
            <><VolumeX className="w-4 h-4 text-secondary" aria-hidden="true" /><span>AKTIFKAN SUARA</span></>
          ) : (
            <><Volume2 className="w-4 h-4 text-secondary animate-pulse" aria-hidden="true" /><span className="text-secondary font-bold">SUARA AKTIF</span></>
          )}
        </button>
      </div>

      {/* Content Overlay */}
      <div className="relative z-20 px-8 md:px-16 pb-20 md:pb-28 max-w-2xl text-right ml-auto space-y-5">
        <div className="space-y-1">
          <h1 className="font-display-lg text-3xl sm:text-5xl md:text-6xl text-on-surface uppercase tracking-tight leading-none">
            GELAR CIPTA <span className="text-secondary italic font-normal">KARYA BOGA</span>
          </h1>
          <p className="font-label-caps text-xs md:text-sm text-on-surface-variant/90 tracking-[0.2em] uppercase font-medium">
            {formattedDate}{locationName ? ` \u2022 ${locationName}` : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-4 pt-2">
          <Link href="/tiket">
            <button className="border border-secondary bg-secondary text-dark-chocolate px-7 py-3 font-label-caps text-xs tracking-[0.2em] font-bold hover:bg-ivory-cream transition-all duration-300 inline-flex items-center gap-2 shadow-lg shadow-black/50">
              PESAN TIKET
            </button>
          </Link>
          <Link href="/peserta">
            <button className="border border-ivory-cream/20 text-on-surface hover:border-ivory-cream/60 bg-black/60 backdrop-blur-md px-7 py-3 font-label-caps text-xs tracking-[0.2em] transition-all duration-300">
              LIHAT PAMERAN
            </button>
          </Link>
        </div>
      </div>

      {/* Scroll Indicator - icon only */}
      <div className="absolute bottom-8 left-8 md:left-12 z-20">
        <ArrowDown className="w-4 h-4 text-secondary/80 animate-bounce" aria-hidden="true" />
      </div>
    </section>
  );
};
