import React from 'react';
import { cn } from '@/lib/utils';

export const SectionTitle: React.FC<{
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}> = ({ title, subtitle, align = 'center', className }) => {
  return (
    <div className={cn('mb-16 reveal', align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left', className)}>
      {subtitle && (
        <span className="font-label-caps text-[10px] md:text-xs text-secondary uppercase tracking-[0.2em] block mb-4">
          {subtitle}
        </span>
      )}
      <h2 className="font-display-lg text-4xl md:text-5xl lg:text-6xl text-on-surface uppercase leading-tight">
        {title}
      </h2>
    </div>
  );
};
