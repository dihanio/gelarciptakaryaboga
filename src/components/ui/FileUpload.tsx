'use client';

import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  onFilesSelected: (files: File[]) => void;
  className?: string;
  label?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept = 'image/*',
  multiple = false,
  maxSizeMB = 10,
  onFilesSelected,
  className,
  label = 'Drag & Drop file ke sini atau klik untuk browse',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach((file) => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`File ${file.name} melebihi batas ${maxSizeMB}MB`);
        return;
      }
      validFiles.push(file);

      if (file.type.startsWith('image/')) {
        newPreviews.push(URL.createObjectURL(file));
      }
    });

    setPreviews(newPreviews);
    onFilesSelected(validFiles);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2',
          isDragOver
            ? 'border-indigo-500 bg-indigo-50/50'
            : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
          ↑
        </div>
        <p className="text-xs font-semibold text-slate-700">{label}</p>
        <p className="text-[10px] text-slate-400">
          Format: {accept} • Maksimal {maxSizeMB}MB
        </p>
      </div>

      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {previews.map((src, i) => (
            <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shadow-xs">
              <img src={src} alt="Preview" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
