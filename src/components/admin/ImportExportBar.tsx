'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Download, Upload } from 'lucide-react';
import { useToast } from '@/providers/ToastProvider';
import Papa from 'papaparse';

interface ImportExportBarProps<T = Record<string, unknown>> {
  onExport: () => void;
  onImport: (data: T[]) => void;
  exportFileName?: string;
  isImporting?: boolean;
}

export function ImportExportBar<T = Record<string, unknown>>({
  onExport,
  onImport,
  isImporting = false,
}: ImportExportBarProps<T>) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Hanya format file CSV yang didukung saat ini');
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          toast.error(`Gagal memparsing CSV: ${results.errors[0].message}`);
          return;
        }
        onImport(results.data as T[]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      error: (error) => {
        toast.error(`Error membaca file: ${error.message}`);
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="file"
        accept=".csv"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
        className="flex items-center gap-2"
      >
        <Upload className="w-4 h-4" />
        {isImporting ? 'Mengimpor...' : 'Import CSV'}
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onExport}
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        Export CSV
      </Button>
    </div>
  );
}

export function generateCsv<T = Record<string, unknown>>(data: T[], filename: string) {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
