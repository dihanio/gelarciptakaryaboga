import React from 'react';
import Link from 'next/link';

export const CTASection: React.FC<{ eventName?: string }> = ({ eventName }) => {
  if (!eventName) return null;

  return (
    <section className="py-32 md:py-40 bg-secondary text-dark-chocolate relative overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6 text-center space-y-8 relative z-10 reveal">
        <span className="font-label-caps text-label-caps uppercase tracking-[0.2em] block font-bold">
          ACARA PUNCAK
        </span>
        <h2 className="font-display-lg text-headline-lg md:text-display-lg uppercase max-w-3xl mx-auto">
          HADIRI {eventName}
        </h2>
        <p className="font-body-lg text-body-lg max-w-xl mx-auto font-medium">
          Kuota tiket terbatas. Amankan akses Anda sekarang.
        </p>
        <div className="flex flex-wrap justify-center gap-6 pt-4">
          <Link href="/tiket">
            <button className="border border-dark-chocolate bg-dark-chocolate text-secondary px-10 py-4 font-label-caps text-label-caps hover:bg-ivory-cream hover:text-dark-chocolate transition-all duration-500 font-bold shadow-lg">
              PESAN TIKET
            </button>
          </Link>
          <Link href="/kontak">
            <button className="border border-dark-chocolate text-dark-chocolate px-10 py-4 font-label-caps text-label-caps hover:bg-dark-chocolate hover:text-secondary transition-all duration-500 font-bold">
              HUBUNGI PANITIA
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};
