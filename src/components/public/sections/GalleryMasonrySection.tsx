import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Gallery } from '@/models/Gallery';
import type { IGallery } from '@/types';
import { mockGalleries } from '@/lib/mockData';

export const GalleryMasonrySection: React.FC<{ eventId?: string }> = async ({ eventId }) => {
  if (!eventId) return null;

  const galleryDoc = await Gallery.find({ event: eventId, deletedAt: null })
    .sort({ order: 1, createdAt: -1 })
    .limit(6)
    .lean();

  let galleries = JSON.parse(JSON.stringify(galleryDoc)) as IGallery[];

  if (galleries.length === 0) {
    galleries = mockGalleries as unknown as IGallery[];
  }

  // Create columns for masonry layout
  const col1 = galleries.filter((_, i) => i % 3 === 0);
  const col2 = galleries.filter((_, i) => i % 3 === 1);
  const col3 = galleries.filter((_, i) => i % 3 === 2);

  return (
    <section className="py-32 md:py-40 px-6">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex justify-between items-end mb-20 reveal">
          <h2 className="font-display-lg text-headline-lg-mobile md:text-display-lg tracking-tighter">
            LENSA <span className="italic text-secondary">SINEMATIK</span>
          </h2>
          <Link href="/galeri" className="hidden md:flex items-center gap-2 text-secondary font-label-caps text-label-caps hover:gap-4 transition-all duration-300">
            LIHAT GALERI <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="columns-1 md:columns-3 gap-6 space-y-6">
          {galleries.map((item, index) => (
            <div key={item._id} className={`relative group overflow-hidden reveal delay-${(index % 3) + 1}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={item.url} 
                alt={item.title || 'Gallery image'}
                loading="lazy"
                className="w-full grayscale group-hover:grayscale-0 transition-all duration-500 rounded"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <p className="text-on-surface font-body-md font-semibold">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
