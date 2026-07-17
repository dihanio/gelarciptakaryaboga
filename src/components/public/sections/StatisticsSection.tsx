import React from 'react';
import { Participant } from '@/models/Participant';
import { Booth } from '@/models/Booth';
import { Gallery } from '@/models/Gallery';
import type { IEvent } from '@/types';
import { mockStatistics } from '@/lib/mockData';

export const StatisticsSection: React.FC<{ eventId?: string }> = async ({ eventId }) => {
  if (!eventId) return null;

  let [participantsCount, boothsCount, galleryCount] = await Promise.all([
    Participant.countDocuments({ event: eventId, deletedAt: null }),
    Booth.countDocuments({ event: eventId, deletedAt: null }),
    Gallery.countDocuments({ event: eventId, deletedAt: null })
  ]);

  // Use mock data if db is empty (Temporary)
  if (participantsCount === 0 && boothsCount === 0 && galleryCount === 0) {
    participantsCount = mockStatistics.participantsCount;
    boothsCount = mockStatistics.boothsCount;
    galleryCount = mockStatistics.galleryCount;
  }

  const stats = [
    { value: `${participantsCount}+`, label: 'Karya Inovatif' },
    { value: `${boothsCount}+`, label: 'Stan Pameran' },
    { value: `${galleryCount}+`, label: 'Momen Terabadikan' },
    { value: '1', label: 'Pengalaman Tak Terlupakan' }
  ];

  return (
    <section className="py-32 md:py-40 bg-background border-y border-ivory-cream/10">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-6 divide-x-0 md:divide-x md:divide-ivory-cream/10">
          {stats.map((stat, idx) => (
            <div key={idx} className={`text-center reveal delay-${(idx % 4) + 1} px-4`}>
              <div className="font-display-lg text-[64px] md:text-[80px] leading-none text-secondary mb-2">
                {stat.value}
              </div>
              <div className="font-label-caps text-label-caps tracking-widest text-on-surface-variant uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
