'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export const RevealAnimation: React.FC<{
  children: React.ReactNode;
  delay?: 1 | 2 | 3 | 4 | 5;
  className?: string;
}> = ({ children, delay, className }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Optional: stop observing once revealed
          // observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div 
      ref={ref} 
      className={cn(
        'reveal', 
        delay && `delay-${delay}`,
        className
      )}
    >
      {children}
    </div>
  );
};
