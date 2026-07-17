import React from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50',
        className
      )}
    >
      {icon ? (
        <div className="mb-3 text-slate-400 p-3 rounded-2xl bg-white shadow-xs border border-slate-100">{icon}</div>
      ) : (
        <div className="mb-3 text-2xl p-3 rounded-2xl bg-white shadow-xs border border-slate-100">📦</div>
      )}
      <h4 className="text-sm font-bold text-slate-900 mb-1">{title}</h4>
      {description && <p className="text-xs text-slate-500 max-w-xs mb-4">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
};
