import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export interface SponsorItem {
  name: string;
  logo: string;
  url?: string;
  tier?: 'platinum' | 'gold' | 'silver' | 'bronze' | 'media';
  order?: number;
}

export const SponsorsSection: React.FC<{ sponsors?: SponsorItem[] }> = ({ sponsors = [] }) => {
  const hasSponsors = sponsors && sponsors.length > 0;

  return (
    <section className="py-32 md:py-40 bg-surface-container-lowest border-t border-ivory-cream/10">
      <div className="max-w-[1280px] mx-auto px-6">
        {/* Header */}
        <div className="text-center space-y-4 mb-16 reveal">
          <span className="font-label-caps text-[10px] md:text-xs text-secondary tracking-[0.35em] block uppercase">
            JARINGAN KEMITRAAN
          </span>
          <h2 className="font-display-lg text-3xl md:text-5xl text-on-surface uppercase tracking-tight">
            MITRA RESMI &amp; <span className="text-secondary italic font-normal">MEDIA PARTNER</span>
          </h2>
          <div className="editorial-line w-16 mx-auto mt-6"></div>
        </div>

        {/* Sponsor Logos Grid or Partnership Callout */}
        {hasSponsors ? (
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
            {sponsors.map((s, i) => (
              <a
                key={i}
                href={s.url || '#'}
                target={s.url ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="group relative border border-ivory-cream/5 bg-surface-container-low/40 p-6 hover:border-secondary/40 transition-all duration-500 rounded"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.logo}
                  alt={s.name}
                  className="h-10 md:h-14 w-auto object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                />
                {s.url && (
                  <ExternalLink className="w-3.5 h-3.5 text-secondary absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                )}
              </a>
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h3 className="font-headline-md text-xl text-on-surface uppercase">TERBUKA UNTUK KEMITRAAN</h3>
            <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
              Jadilah mitra resmi Gelar Cipta Karya Boga 2026.
            </p>
            <Link href="/kontak" className="inline-flex items-center gap-2 border border-secondary bg-secondary/15 text-secondary hover:bg-secondary hover:text-dark-chocolate px-6 py-3 font-label-caps text-xs tracking-widest transition-all font-bold">
              HUBUNGI PANITIA
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};
