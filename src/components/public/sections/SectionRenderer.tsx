import React from 'react';
import { HeroBanner } from './HeroBanner';
import { AboutSection } from './AboutSection';
import { StatisticsSection } from './StatisticsSection';
import { HighlightsSection } from './HighlightsSection';
import { BoothExhibitionSection } from './BoothExhibitionSection';
import { GalleryMasonrySection } from './GalleryMasonrySection';
import { TimelineSection } from './TimelineSection';
import { NewsPreviewSection } from './NewsPreviewSection';
import { CommitteeSection } from './CommitteeSection';
import { CTASection } from './CTASection';
import { FAQSection } from './FAQSection';
import { SponsorsSection } from './SponsorsSection';
import type { IPageSection, IEvent } from '@/types';

export const SectionRenderer: React.FC<{ sections?: IPageSection[]; event?: IEvent }> = ({
  sections = [],
  event,
}) => {
  // Default fallback section flow if no PageSection configuration exists yet
  const defaultSectionsList: Array<{ _id: string; sectionType: IPageSection['sectionType']; isVisible: boolean }> = [
    { _id: 'def-hero', sectionType: 'hero', isVisible: true },
    { _id: 'def-about', sectionType: 'about', isVisible: true },
    { _id: 'def-stats', sectionType: 'stats', isVisible: true },
    { _id: 'def-highlights', sectionType: 'highlights', isVisible: true },
    { _id: 'def-booth', sectionType: 'booth', isVisible: true },
    { _id: 'def-gallery', sectionType: 'gallery_preview', isVisible: true },
    { _id: 'def-timeline', sectionType: 'timeline', isVisible: true },
    { _id: 'def-news', sectionType: 'news', isVisible: true },
    { _id: 'def-committee', sectionType: 'committee', isVisible: true },
    { _id: 'def-sponsors', sectionType: 'sponsors', isVisible: true },
    { _id: 'def-cta', sectionType: 'cta', isVisible: true },
  ];

  const activeSections = sections && sections.length > 0 ? sections : (defaultSectionsList as IPageSection[]);

  return (
    <>
      {activeSections.map((sec) => {
        if (!sec.isVisible) return null;

        switch (sec.sectionType) {
          case 'hero':
            return <HeroBanner key={sec._id} event={event} />;
          case 'about':
            return <AboutSection key={sec._id} title={sec.title} subtitle={sec.subtitle} content={sec.content} />;
          case 'stats':
            return <StatisticsSection key={sec._id} eventId={event?._id} />;
          case 'highlights':
            return <HighlightsSection key={sec._id} eventId={event?._id} />;
          case 'booth':
            return <BoothExhibitionSection key={sec._id} eventId={event?._id} />;
          case 'gallery_preview':
            return <GalleryMasonrySection key={sec._id} eventId={event?._id} />;
          case 'timeline':
            return <TimelineSection key={sec._id} eventId={event?._id} />;
          case 'news':
            return <NewsPreviewSection key={sec._id} eventId={event?._id} />;
          case 'committee':
            return <CommitteeSection key={sec._id} eventId={event?._id} />;
          case 'faq': {
            type FaqType = NonNullable<IEvent['faq']>;
            const configFaqs = (sec.config as { faqs?: FaqType })?.faqs;
            return <FAQSection key={sec._id} faqs={configFaqs || event?.faq} />;
          }
          case 'sponsors': {
            const mediaSponsors = sec.media?.map((m) => ({
              name: m.alt || 'Sponsor',
              logo: m.url,
              tier: 'bronze' as const,
              order: 0,
            }));
            return <SponsorsSection key={sec._id} sponsors={mediaSponsors || event?.sponsors} />;
          }
          case 'cta':
            return <CTASection key={sec._id} eventName={event?.name} />;
          case 'custom':
            return (
              <section key={sec._id} className="py-[120px] bg-surface-container-low text-on-surface">
                <div className="max-w-[1280px] mx-auto px-6 text-center space-y-4 reveal">
                  {sec.title && <h2 className="font-headline-lg text-headline-lg mb-4">{sec.title}</h2>}
                  {sec.content && <p className="font-body-md text-on-surface-variant leading-relaxed whitespace-pre-wrap">{sec.content}</p>}
                </div>
              </section>
            );
          default:
            return null;
        }
      })}
    </>
  );
};
