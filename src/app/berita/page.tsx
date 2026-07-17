'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { FileText, ArrowRight, BookOpen } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { IWebsiteSettings, INews } from '@/types';

export default function NewsPage() {
  const [newsList, setNewsList] = useState<INews[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<IWebsiteSettings | null>(null);

  useEffect(() => {
    fetch('/api/public/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data.data));
  }, []);

  useEffect(() => {
    fetch('/api/public/event/news')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setNewsList(data.data || []);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const heroArticle = newsList[0];
  const otherArticles = newsList.slice(1);

  return (
    <PublicLayout settings={settings}>
      {/* Magazine Masthead Header */}
        <section className="pt-36 pb-16 border-b border-ivory-cream/10 bg-background">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <span className="font-label-caps text-[10px] text-secondary tracking-[0.3em] uppercase block mb-3">
                  RUANG BERITA &amp; LIPUTAN
                </span>
                <h1 className="font-display-lg text-4xl md:text-6xl lg:text-7xl text-on-surface uppercase leading-none tracking-tight">
                  BERITA <span className="text-secondary italic font-normal">TERKINI</span>
                </h1>
              </div>
              <p className="font-body-md text-sm text-outline max-w-sm">
                Rilis berita resmi, liputan karya, artikel inovasi kuliner, dan dokumentasi eksibisi.
              </p>
            </div>
          </div>
        </section>

        {/* Magazine Content Grid */}
        <section className="py-16 md:py-24">
          <div className="max-w-[1280px] mx-auto px-6">
            {isLoading ? (
              <div className="space-y-12">
                <div className="animate-pulse aspect-[21/9] bg-surface-container"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-surface-container h-64"></div>
                  ))}
                </div>
              </div>
            ) : newsList.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-ivory-cream/10">
                <BookOpen className="w-10 h-10 text-outline mx-auto mb-4 opacity-40" aria-hidden="true" />
                <h3 className="font-headline-md text-xl text-on-surface-variant mb-2">PRESS ROOM MASIH KOSONG</h3>
                <p className="font-body-md text-xs text-outline">Berita dan artikel kegiatan akan diterbitkan secara berkala.</p>
              </div>
            ) : (
              <div className="space-y-16">
                {/* Featured Headline Article */}
                {heroArticle && (
                  <Link href={`/berita/${heroArticle.slug}`} className="group block">
                    <article className="grid grid-cols-1 lg:grid-cols-12 gap-8 border border-ivory-cream/10 bg-surface-container-low/40 hover:border-secondary/40 transition-all duration-500 overflow-hidden">
                      <div className="lg:col-span-7 aspect-video lg:aspect-auto overflow-hidden bg-surface-container relative">
                        {heroArticle.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={heroArticle.coverImage}
                            alt={heroArticle.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full min-h-[360px] flex items-center justify-center bg-deep-espresso">
                            <FileText className="w-16 h-16 text-ivory-cream/10" aria-hidden="true" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4 bg-secondary text-dark-chocolate font-label-caps text-[9px] px-2.5 py-1 font-bold tracking-widest uppercase">
                          FEATURED STORY
                        </div>
                      </div>
                      <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col justify-center space-y-5">
                        <div className="flex items-center gap-3">
                          <span className="font-label-caps text-[10px] tracking-widest text-secondary border border-secondary/30 px-2.5 py-0.5 uppercase">
                            {heroArticle.category}
                          </span>
                          <span className="font-label-caps text-[10px] text-outline">
                            {formatDate(heroArticle.publishedAt || heroArticle.createdAt)}
                          </span>
                        </div>
                        <h2 className="font-headline-lg text-2xl md:text-3xl text-on-surface group-hover:text-secondary transition-colors leading-snug">
                          {heroArticle.title}
                        </h2>
                        <p className="font-body-md text-sm text-on-surface-variant leading-relaxed line-clamp-3">
                          {heroArticle.excerpt}
                        </p>
                        <div className="pt-4 flex items-center gap-2 text-xs font-label-caps text-secondary font-semibold">
                          BACA SELENGKAPNYA <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" aria-hidden="true" />
                        </div>
                      </div>
                    </article>
                  </Link>
                )}

                {/* Secondary Magazine Grid */}
                {otherArticles.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {otherArticles.map((item) => (
                      <Link href={`/berita/${item.slug}`} key={item._id} className="group flex flex-col justify-between border border-ivory-cream/10 bg-surface-container-low/30 hover:border-secondary/40 transition-all duration-500 p-6">
                        <div className="space-y-4">
                          <div className="aspect-video overflow-hidden bg-surface-container relative">
                            {item.coverImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.coverImage}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-deep-espresso">
                                <FileText className="w-12 h-12 text-ivory-cream/10" aria-hidden="true" />
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-label-caps text-[9px] tracking-widest text-secondary border border-secondary/30 px-2 py-0.5 uppercase">
                              {item.category}
                            </span>
                            <span className="font-label-caps text-[10px] text-outline">
                              {formatDate(item.publishedAt || item.createdAt)}
                            </span>
                          </div>
                          <h3 className="font-headline-md text-lg text-on-surface group-hover:text-secondary transition-colors leading-snug line-clamp-2">
                            {item.title}
                          </h3>
                          <p className="font-body-md text-xs text-on-surface-variant line-clamp-3 leading-relaxed">
                            {item.excerpt}
                          </p>
                        </div>

                        <div className="pt-6 mt-4 border-t border-ivory-cream/5 flex items-center gap-2 text-xs font-label-caps text-on-surface group-hover:text-secondary transition-colors">
                          BACA ARTIKEL <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" aria-hidden="true" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
    </PublicLayout>
  );
}
