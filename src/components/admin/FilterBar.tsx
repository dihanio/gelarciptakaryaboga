'use client';

import React from 'react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterDef {
  key: string;
  placeholder: string;
  options: FilterOption[];
}

interface FilterBarProps {
  filters: FilterDef[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export function FilterBar({ filters, values, onChange }: FilterBarProps) {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {filters.map((filter) => (
        <select
          key={filter.key}
          className="h-9 px-3 py-1 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={values[filter.key] || ''}
          onChange={(e) => onChange(filter.key, e.target.value)}
        >
          <option value="">{filter.placeholder}</option>
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
