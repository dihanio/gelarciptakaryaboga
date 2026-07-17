'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';

export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  keyExtractor: (item: T) => string;
  // Selection
  enableSelection?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  // Row styling
  rowClassName?: (item: T) => string;
  // Pagination
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export function DataTable<T>({
  data,
  columns,
  isLoading = false,
  emptyMessage = 'Tidak ada data',
  keyExtractor,
  enableSelection = false,
  selectedIds = [],
  onSelectionChange,
  rowClassName,
  pagination
}: DataTableProps<T>) {
  
  const toggleSelectAll = () => {
    if (!onSelectionChange) return;
    if (selectedIds.length === data.length && data.length > 0) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map(keyExtractor));
    }
  };

  const toggleSelect = (id: string) => {
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(i => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const colSpan = columns.length + (enableSelection ? 1 : 0);

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {enableSelection && (
              <TableHead className="w-12 text-center">
                <input 
                  type="checkbox" 
                  className="rounded border-slate-300"
                  checked={data.length > 0 && selectedIds.length === data.length}
                  onChange={toggleSelectAll}
                  disabled={data.length === 0}
                />
              </TableHead>
            )}
            {columns.map((col) => (
              <TableHead 
                key={col.key} 
                className={`text-${col.align || 'left'} ${col.width ? `w-[${col.width}]` : ''}`}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={colSpan} className="text-center py-8 text-xs text-slate-400">
                Memuat data...
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colSpan} className="text-center py-8 text-xs text-slate-400">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => {
              const id = keyExtractor(item);
              const isSelected = selectedIds.includes(id);
              const customClass = rowClassName ? rowClassName(item) : '';
              
              return (
                <TableRow 
                  key={id} 
                  className={`${isSelected ? 'bg-slate-50' : ''} ${customClass}`}
                >
                  {enableSelection && (
                    <TableCell className="text-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300"
                        checked={isSelected}
                        onChange={() => toggleSelect(id)}
                      />
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell key={col.key} className={`text-${col.align || 'left'}`}>
                      {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '-')}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {pagination && pagination.totalPages > 1 && (
        <div className="p-4 border-t border-slate-100 flex justify-center">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}
    </div>
  );
}
