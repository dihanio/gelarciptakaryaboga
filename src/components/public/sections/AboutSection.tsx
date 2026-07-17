import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const AboutSection: React.FC<{
  title?: string;
  subtitle?: string;
  content?: string;
}> = ({ title, subtitle, content }) => {
  const displayTitle = title || 'PAMERAN INOVASI KARYA BOGA 2026';
  const displaySubtitle = subtitle || 'S1 PENDIDIKAN TATA BOGA UNESA';
  const displayContent =
    content ||
    'Simfoni antara warisan citra rasa Nusantara, riset sains pangan, dan seni penyajian modern berstandar industri kuliner global.';

  return (
    <section className="py-32 md:py-40 relative overflow-hidden bg-background border-t border-b border-ivory-cream/10">
      {/* Watermark */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 opacity-[0.02] font-display-lg text-[200px] md:text-[320px] pointer-events-none select-none text-white whitespace-nowrap z-0">
        GELAR CIPTA
      </div>

      <div className="max-w-[1280px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-end">
          {/* Left: Big headline */}
          <div className="lg:col-span-7 space-y-4 reveal">
            <span className="font-label-caps text-xs text-secondary tracking-[0.35em] block uppercase font-medium">
              {displaySubtitle}
            </span>
            <h2 className="font-display-lg text-3xl md:text-5xl lg:text-6xl text-on-surface uppercase tracking-tight leading-tight">
              {displayTitle}
            </h2>
          </div>

          {/* Right: Short description + CTA */}
          <div className="lg:col-span-5 border-l-2 border-secondary pl-8 py-1 reveal delay-1">
            <p className="font-body-md text-sm md:text-base text-outline leading-relaxed mb-8">
              {displayContent}
            </p>
            <Link
              href="/tentang"
              className="inline-flex items-center gap-2.5 text-secondary font-label-caps text-xs tracking-[0.2em] uppercase hover:gap-4 transition-all duration-300 font-bold"
            >
              SELENGKAPNYA <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
