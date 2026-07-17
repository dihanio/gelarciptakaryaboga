'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';

interface BulkAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  isLoading?: boolean;
}

interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  actions: BulkAction[];
  children?: React.ReactNode;
}

export function BulkActionBar({
  selectedCount,
  onClear,
  actions,
  children,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between bg-indigo-50 px-4 py-3 rounded-xl border border-indigo-100 mb-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-indigo-700 whitespace-nowrap bg-indigo-100 px-3 py-1 rounded-full">
          {selectedCount} Item Terpilih
        </span>
        <div className="h-6 w-px bg-indigo-200 hidden sm:block"></div>
        <div className="flex items-center gap-2">
          {children}
          {actions.map((action, idx) => (
            <Button
              key={idx}
              variant={action.variant || 'secondary'}
              size="sm"
              onClick={action.onClick}
              isLoading={action.isLoading}
              className={action.variant === 'danger' ? 'bg-rose-500 hover:bg-rose-600 text-white' : ''}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>
      
      <Button variant="ghost" size="sm" onClick={onClear} className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100">
        Batal Pilih
      </Button>
    </div>
  );
}
