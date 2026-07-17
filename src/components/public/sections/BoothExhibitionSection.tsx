import React from 'react';
import Link from 'next/link';
import { ArrowRight, Store } from 'lucide-react';
import { Booth } from '@/models/Booth';
import { Participant } from '@/models/Participant';
import type { IBooth, IParticipant } from '@/types';
import { mockBooths } from '@/lib/mockData';

export const BoothExhibitionSection: React.FC<{ eventId?: string }> = async ({ eventId }) => {
  if (!eventId) return null;

  const boothsDoc = await Booth.find({ event: eventId, deletedAt: null })
    .sort({ number: 1 })
    .limit(4)
    .lean();

  let booths = JSON.parse(JSON.stringify(boothsDoc)) as IBooth[];

  let boothData;

  if (booths.length === 0) {
    boothData = mockBooths;
  } else {
    const boothIds = booths.map(b => b._id);
    const participantsDoc = await Participant.find({ booth: { $in: boothIds }, deletedAt: null }).lean();
    const participants = JSON.parse(JSON.stringify(participantsDoc)) as IParticipant[];

    boothData = booths.map(booth => {
      const participant = participants.find(p => p.booth === booth._id);
      return {
        ...booth,
        participantName: participant?.name || null,
        photo: participant?.photo || null,
      };
    });
  }

  return (
    <section className="py-32 md:py-40 bg-deep-espresso text-on-surface">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex justify-between items-end mb-16 reveal">
          <div>
            <span className="font-label-caps text-label-caps text-secondary">RUANG PAMER</span>
            <h3 className="font-headline-lg text-headline-lg">STAN PAMERAN</h3>
          </div>
          <Link href="/booth" className="hidden md:flex items-center gap-2 text-secondary font-label-caps text-label-caps hover:gap-4 transition-all duration-300">
            LIHAT SEMUA <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {boothData.map((item, index) => (
            <div key={item._id} className={`group reveal delay-${(index % 4) + 1}`}>
              <div className="aspect-[4/3] overflow-hidden bg-background rounded mb-6 relative">
                {item.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={item.photo}
                    alt={item.name || `Booth ${item.number}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center border border-ivory-cream/10">
                    <span className="font-display-lg text-headline-lg text-ivory-cream/10">BOOTH {item.number}</span>
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-background/80 backdrop-blur border border-ivory-cream/20 px-3 py-1">
                  <span className="font-label-caps text-[10px] text-secondary">BOOTH {item.number}</span>
                </div>
              </div>
              
              <h4 className="font-headline-md text-body-lg font-bold mb-1">{item.name || `Area Pameran ${item.number}`}</h4>
              
              {item.participantName && (
                <p className="font-label-caps text-label-caps text-secondary">{item.participantName}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
