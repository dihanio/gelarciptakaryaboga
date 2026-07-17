import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, User, FileText } from 'lucide-react';
import { News } from '@/models/News';
import type { INews } from '@/types';
import { mockNews } from '@/lib/mockData';
import { formatDate } from '@/lib/utils';

export const NewsPreviewSection: React.FC<{ eventId?: string }> = async ({ eventId }) => {
  if (!eventId) return null;

  const newsDoc = await News.find({ event: eventId, deletedAt: null })
    .sort({ publishedAt: -1 })
    .limit(3)
    .lean();

  let newsList = JSON.parse(JSON.stringify(newsDoc)) as INews[];

  if (newsList.length === 0) {
    newsList = mockNews as unknown as INews[];
  }

  return (
    <section className="py-32 md:py-40 bg-background">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex justify-between items-end mb-16 reveal">
          <div>
            <span className="font-label-caps text-label-caps text-secondary">BERITA</span>
            <h3 className="font-headline-lg text-headline-lg">BERITA TERBARU</h3>
          </div>
          <Link href="/berita" className="hidden md:flex items-center gap-2 text-secondary font-label-caps text-label-caps hover:gap-4 transition-all duration-300">
            LIHAT SEMUA <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {newsList.map((item, index) => (
            <Link href={`/berita/${item.slug}`} key={item._id} className={`group reveal delay-${(index % 3) + 1} flex flex-col h-full`}>
              <div className="aspect-[4/3] overflow-hidden bg-surface-container rounded mb-6">
                {item.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-deep-espresso">
                    <FileText className="w-14 h-14 text-ivory-cream/10" aria-hidden="true" />
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <span className="font-label-caps text-[10px] tracking-widest text-secondary uppercase border border-secondary/30 px-2 py-0.5">
                  {item.category}
                </span>
                <span className="font-label-caps text-[10px] text-outline">
                  {formatDate(item.publishedAt || item.createdAt)}
                </span>
              </div>
              
              <h4 className="font-headline-md text-headline-md mb-3 group-hover:text-secondary transition-colors line-clamp-2">
                {item.title}
              </h4>
              
              <p className="font-body-md text-on-surface-variant line-clamp-2 mb-6 flex-1">
                {item.excerpt}
              </p>
              
              <div className="mt-auto flex items-center gap-2 text-on-surface text-sm font-bold">
                Baca Selengkapnya <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
