import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'glass' | 'flat';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = 'default',
  hoverEffect = false,
  children,
  ...props
}) => {
  const base = 'rounded-2xl p-6 transition-all duration-200';

  const variants = {
    default: 'bg-white shadow-sm border border-slate-100',
    outlined: 'bg-white border border-slate-200',
    glass: 'glass',
    flat: 'bg-slate-100',
  };

  const hover = hoverEffect
    ? 'hover:-translate-y-1 hover:shadow-md hover:border-indigo-100'
    : '';

  return (
    <div className={cn(base, variants[variant], hover, className)} {...props}>
      {children}
    </div>
  );
};
