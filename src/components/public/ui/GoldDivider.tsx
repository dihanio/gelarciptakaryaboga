import React from 'react';
import { cn } from '@/lib/utils';

export const GoldDivider: React.FC<{
  className?: string;
  width?: string;
}> = ({ className, width = 'w-24' }) => {
  return (
    <div className={cn(`h-[1px] bg-secondary ${width}`, className)} />
  );
};
