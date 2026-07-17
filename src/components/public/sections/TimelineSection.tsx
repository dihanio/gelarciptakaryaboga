import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Schedule } from '@/models/Schedule';
import type { ISchedule } from '@/types';
import { mockTimeline } from '@/lib/mockData';

export const TimelineSection: React.FC<{ eventId?: string }> = async ({ eventId }) => {
  if (!eventId) return null;

  const scheduleDoc = await Schedule.find({ event: eventId, deletedAt: null })
    .sort({ order: 1, startTime: 1 })
    .lean();

  let schedules = JSON.parse(JSON.stringify(scheduleDoc)) as ISchedule[];

  if (schedules.length === 0) {
    schedules = mockTimeline as unknown as ISchedule[];
  }

  return (
    <section className="py-32 md:py-40 bg-primary-container relative overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6 relative z-10">
        <div className="flex justify-between items-end mb-24 reveal">
          <div>
            <span className="font-label-caps text-label-caps text-secondary">RANGKAIAN ACARA</span>
            <h2 className="font-headline-lg text-headline-lg">SUSUNAN ACARA</h2>
          </div>
          <Link href="/jadwal" className="hidden md:flex items-center gap-2 text-secondary font-label-caps text-label-caps hover:gap-4 transition-all duration-300">
            JADWAL LENGKAP <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
        
        <div className="space-y-0">
          {schedules.map((item, index) => (
            <div key={item._id} className={`grid grid-cols-1 md:grid-cols-12 border-t border-ivory-cream/10 py-12 group hover:bg-secondary/5 transition-colors cursor-default reveal delay-${(index % 3) + 1} ${index === schedules.length - 1 ? 'border-b' : ''}`}>
              <div className="md:col-span-2 font-display-lg text-headline-lg text-secondary/30 group-hover:text-secondary transition-colors">
                {item.startTime}
              </div>
              <div className="md:col-span-7 flex flex-col justify-center">
                <h4 className="font-headline-md text-headline-md mb-2">{item.title}</h4>
                {item.speaker && (
                  <p className="font-label-caps text-label-caps text-secondary/80">{item.speaker}</p>
                )}
              </div>
              <div className="md:col-span-3 flex items-center justify-end mt-4 md:mt-0">
                <ArrowUpRight className="w-5 h-5 text-outline group-hover:text-secondary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" aria-hidden="true" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
