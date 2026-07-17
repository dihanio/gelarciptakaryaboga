import React from 'react';
import { cn } from '@/lib/utils';

export const EditorialContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  id?: string;
}> = ({ children, className, id }) => {
  return (
    <section id={id} className={cn('py-24 md:py-32 w-full', className)}>
      <div className="max-w-[1280px] mx-auto px-6">
        {children}
      </div>
    </section>
  );
};
