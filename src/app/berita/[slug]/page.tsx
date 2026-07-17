import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import { connectDB } from '@/lib/db';
import { WebsiteSettings } from '@/models/WebsiteSettings';
import { News } from '@/models/News';

async function getData(slug: string) {
  await connectDB();

  const settings = await WebsiteSettings.findOne().lean();
  const news = await News.findOne({ slug, status: 'published' })
    .populate('author', 'name avatar')
    .lean();

  return {
    settings: settings ? JSON.parse(JSON.stringify(settings)) : null,
    news: news ? JSON.parse(JSON.stringify(news)) : null,
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { settings, news } = await getData(slug);

  if (!news) {
    notFound();
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar siteName={settings?.siteName} logo={settings?.siteLogo} navItems={settings?.navigation} />

      <main className="flex-1 pt-28 pb-20">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Breadcrumb Back */}
          <Link href="/berita" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline">
            ← Kembali ke Berita
          </Link>

          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant="primary" size="md">
                {news.category}
              </Badge>
              <span className="text-xs text-slate-500">
                {formatDate(news.publishedAt || news.createdAt)}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              {news.title}
            </h1>

            {news.author && (
              <div className="flex items-center gap-3 pt-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  {news.author.name[0]}
                </div>
                <span className="text-xs font-semibold text-slate-700">{news.author.name}</span>
              </div>
            )}
          </div>

          {/* Cover Image */}
          {news.coverImage && (
            <div className="rounded-2xl overflow-hidden shadow-md max-h-96 w-full">
              <img src={news.coverImage} alt={news.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Article Excerpt Card */}
          <div className="p-4 rounded-xl bg-indigo-50/70 border-l-4 border-indigo-600 text-sm font-semibold text-slate-800 leading-relaxed italic">
            &quot;{news.excerpt}&quot;
          </div>

          {/* Main Article Content */}
          <Card className="p-8 prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {news.content}
          </Card>
        </article>
      </main>

      <Footer siteName={settings?.siteName} description={settings?.siteDescription} contact={settings?.contact} socialMedia={settings?.socialMedia} />
    </div>
  );
}
