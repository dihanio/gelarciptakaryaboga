import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Participant } from '@/models/Participant';
import type { IParticipant } from '@/types';
import { mockHighlights } from '@/lib/mockData';

export const HighlightsSection: React.FC<{ eventId?: string }> = async ({ eventId }) => {
  if (!eventId) return null;

  const participantsDoc = await Participant.find({ event: eventId, deletedAt: null, photo: { $exists: true, $ne: '' } })
    .sort({ order: 1, createdAt: -1 })
    .limit(3)
    .lean();
    
  let participants = JSON.parse(JSON.stringify(participantsDoc)) as IParticipant[];

  if (participants.length === 0) {
    participants = mockHighlights as unknown as IParticipant[];
  }

  const [mainItem, ...sideItems] = participants;

  return (
    <section className="py-32 md:py-40 bg-surface-container-lowest">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex justify-between items-end mb-16 reveal">
          <div>
            <span className="font-label-caps text-label-caps text-secondary">SOROTAN KARYA</span>
            <h3 className="font-headline-lg text-headline-lg">KARYA UNGGULAN</h3>
          </div>
          <Link href="/peserta" className="hidden md:flex items-center gap-2 text-secondary font-label-caps text-label-caps hover:gap-4 transition-all duration-300">
            LIHAT SEMUA <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[800px] reveal delay-1">
          {/* Large Feature */}
          <div className="md:col-span-8 group relative overflow-hidden bg-deep-espresso rounded">
            <div 
              className="w-full h-full min-h-[400px] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url('${mainItem.photo}')` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-10 left-10">
              <span className="font-display-lg text-secondary opacity-30 block -mb-6">01</span>
              <h4 className="font-headline-md text-headline-md text-on-surface mb-2">{mainItem.workName}</h4>
              <p className="font-label-caps text-label-caps text-secondary/80">{mainItem.name}</p>
            </div>
          </div>

          {/* Vertical Stack */}
          <div className="md:col-span-4 flex flex-col gap-6">
            {sideItems[0] && (
              <div className="flex-1 group relative overflow-hidden bg-deep-espresso rounded">
                <div 
                  className="w-full h-full min-h-[250px] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url('${sideItems[0].photo}')` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-8 left-8">
                  <span className="font-headline-md text-secondary opacity-30 block -mb-2">02</span>
                  <h4 className="font-body-lg font-bold text-on-surface">{sideItems[0].workName}</h4>
                  <p className="font-label-caps text-[10px] text-secondary/80">{sideItems[0].name}</p>
                </div>
              </div>
            )}
            
            {sideItems[1] ? (
              <div className="flex-1 group relative overflow-hidden bg-deep-espresso rounded">
                <div 
                  className="w-full h-full min-h-[250px] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url('${sideItems[1].photo}')` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-8 left-8">
                  <span className="font-headline-md text-secondary opacity-30 block -mb-2">03</span>
                  <h4 className="font-body-lg font-bold text-on-surface">{sideItems[1].workName}</h4>
                  <p className="font-label-caps text-[10px] text-secondary/80">{sideItems[1].name}</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 glass-panel p-8 flex flex-col justify-center rounded">
                <h4 className="font-headline-md text-secondary mb-4">Jelajahi Lebih</h4>
                <p className="font-body-md text-on-surface-variant mb-6 italic">&quot;Inovasi adalah jembatan antara tradisi dan penemuan.&quot;</p>
                <Link href="/peserta" className="flex items-center gap-2 text-secondary font-label-caps text-label-caps hover:gap-4 transition-all duration-300">
                  LIHAT SEMUA PESERTA <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
