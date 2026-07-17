import React from 'react';
import { User } from 'lucide-react';
import { CommitteeMember } from '@/models/CommitteeMember';
import type { ICommitteeMember } from '@/types';
import { mockCommittee } from '@/lib/mockData';

export const CommitteeSection: React.FC<{ eventId?: string }> = async ({ eventId }) => {
  if (!eventId) return null;

  const membersDoc = await CommitteeMember.find({ event: eventId, isActive: true, deletedAt: null })
    .sort({ order: 1, createdAt: 1 })
    .lean();

  let members = JSON.parse(JSON.stringify(membersDoc)) as ICommitteeMember[];

  if (members.length === 0) {
    members = mockCommittee as unknown as ICommitteeMember[];
  }

  return (
    <section className="py-32 md:py-40 max-w-[1280px] mx-auto px-6">
      <div className="text-center mb-16 reveal">
        <span className="font-label-caps text-label-caps text-secondary uppercase tracking-[0.2em] block mb-4">
          TIM KURATOR
        </span>
        <h2 className="font-display-lg text-headline-lg md:text-display-lg uppercase">
          PANITIA PENYELENGGARA
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {members.map((member, index) => (
          <div key={member._id} className={`group text-center reveal delay-${(index % 4) + 1}`}>
            <div className="aspect-[3/4] mb-6 overflow-hidden bg-surface-container relative grayscale group-hover:grayscale-0 transition-all duration-700">
              {member.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={member.photo} 
                  alt={member.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-deep-espresso">
                  <User className="w-14 h-14 text-ivory-cream/10 mb-2" aria-hidden="true" />
                </div>
              )}
            </div>
            <h3 className="font-headline-md text-headline-md mb-1">{member.name}</h3>
            <p className="font-label-caps text-label-caps text-secondary mb-2">{member.position}</p>
            <p className="font-body-sm text-body-sm text-outline">{member.division}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
