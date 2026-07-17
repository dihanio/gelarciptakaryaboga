import React from 'react';
import { cn } from '@/lib/utils';

export const ImageFrame: React.FC<{
  src: string;
  alt: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape' | 'auto';
  className?: string;
  hoverZoom?: boolean;
}> = ({ src, alt, aspectRatio = 'video', className, hoverZoom = true }) => {
  
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
    auto: 'aspect-auto'
  };

  return (
    <div className={cn('relative overflow-hidden bg-surface-container', aspectClasses[aspectRatio], className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={cn(
          'w-full h-full object-cover',
          hoverZoom && 'transition-transform duration-700 hover:scale-105'
        )}
        loading="lazy"
      />
    </div>
  );
};
