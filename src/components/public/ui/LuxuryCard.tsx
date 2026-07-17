import React from 'react';
import { cn } from '@/lib/utils';

export const LuxuryCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}> = ({ children, className, hoverEffect = true }) => {
  return (
    <div className={cn(
      'bg-surface-container-low border border-ivory-cream/10 p-6 md:p-8 flex flex-col h-full',
      hoverEffect && 'transition-all duration-500 hover:border-ivory-cream/30 hover:bg-surface-container',
      className
    )}>
      {children}
    </div>
  );
};
