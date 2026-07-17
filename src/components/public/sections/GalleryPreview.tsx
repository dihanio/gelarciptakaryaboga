import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export interface GalleryPhotoItem {
  url: string;
  title?: string;
  alt?: string;
}

export const GalleryPreview: React.FC<{ photos?: GalleryPhotoItem[] }> = ({
  photos = [],
}) => {
  const defaultPhotos: GalleryPhotoItem[] = [
    { url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop', title: 'Suasana Pameran Gelar Cipta', alt: 'Pameran Karya' },
    { url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop', title: 'Sesi Presentasi Karya', alt: 'Presentasi Karya' },
    { url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop', title: 'Interaksi Pengunjung & Booth', alt: 'Interaksi Booth' },
    { url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop', title: 'Awarding & Penutupan', alt: 'Awarding Penutupan' },
  ];

  const items = photos.length > 0 ? photos : defaultPhotos;

  return (
    <section className="py-20 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600">Dokumentasi</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Galeri Kegiatan & Momen Terbaik
            </h2>
          </div>
          <Link href="/galeri">
            <Button variant="outline" size="sm" className="rounded-full">
              Lihat Seluruh Galeri →
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item, i) => (
            <div
              key={i}
              className="group relative h-64 rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-slate-100"
            >
              <img
                src={item.url}
                alt={item.title || item.alt || 'Dokumentasi'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex items-end">
                <p className="text-xs font-bold text-white leading-snug">{item.title || item.alt || 'Dokumentasi Acara'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
