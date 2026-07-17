'use client';

import React, { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { FileUpload } from '@/components/ui/FileUpload';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/providers/ToastProvider';
import { DataTable, ColumnDef } from '@/components/admin/DataTable';
import { BulkActionBar } from '@/components/admin/BulkActionBar';
import { formatDate } from '@/lib/utils';
import type { IGallery } from '@/types';

export default function AdminGalleryPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const toast = useToast();

  const [gallery, setGallery] = useState<IGallery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    album: 'Umum',
    url: '',
  });

  const loadData = () => {
    Promise.resolve().then(() => setIsLoading(true));
    fetch(`/api/events/${eventId}/gallery`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setGallery(data.data as IGallery[]);
        }
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { loadData(); }, [eventId]);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    setIsUploading(true);

    try {
      const uploadFormData = new FormData();
      files.forEach((file) => uploadFormData.append('file', file));
      uploadFormData.append('folder', 'gallery');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || data.error || 'Gagal upload');

      const fileResults = Array.isArray(data.data) ? data.data : [data.data];

      const payload = fileResults.map((f: Record<string, unknown>, idx: number) => ({
        title: files[idx]?.name || 'Foto Dokumentasi',
        album: formData.album || 'Umum',
        type: 'photo',
        url: f.url as string,
      }));

      const saveRes = await fetch(`/api/events/${eventId}/gallery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const saveData = await saveRes.json();
      if (!saveRes.ok || !saveData.success) throw new Error(saveData.message || saveData.error || 'Gagal simpan galeri');

      toast.success(`${files.length} media berhasil di-upload!`);
      setIsModalOpen(false);
      loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'Gagal upload media');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/events/${eventId}/gallery/${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || data.error || 'Gagal hapus');

      toast.success('Media dihapus');
      setDeleteId(null);
      loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);
    try {
      const res = await fetch(`/api/events/${eventId}/gallery/bulk`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || data.error || 'Gagal hapus massal');

      toast.success(`${selectedIds.length} media berhasil dihapus`);
      setSelectedIds([]);
      loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const columns: ColumnDef<IGallery>[] = [
    {
      key: 'preview',
      header: 'Preview',
      render: (item) => (
        <img src={item.url} alt={item.title} className="w-16 h-16 object-cover rounded" />
      ),
    },
    {
      key: 'title',
      header: 'Judul',
      render: (item) => <span className="font-bold text-slate-900 truncate max-w-[200px] block">{item.title}</span>,
    },
    {
      key: 'album',
      header: 'Album',
    },
    {
      key: 'createdAt',
      header: 'Diupload',
      render: (item) => <span className="text-xs">{formatDate(item.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right',
      render: (item) => (
        <Button variant="danger" size="sm" onClick={() => setDeleteId(item._id || '')}>🗑️ Hapus</Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Manajemen Galeri Dokumentasi</h1>
          <p className="text-xs text-slate-500">Upload multiple foto/video dokumentasi acara dengan drag & drop.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>+ Upload Multiple Media</Button>
      </div>

      <BulkActionBar 
        selectedCount={selectedIds.length} 
        onClear={() => setSelectedIds([])}
        actions={[
          {
            label: 'Hapus Terpilih',
            onClick: handleBulkDelete,
            variant: 'danger',
            isLoading: isBulkDeleting
          }
        ]}
      />

      <Card className="p-4">
        <DataTable
          data={gallery}
          columns={columns}
          isLoading={isLoading}
          keyExtractor={(item) => item._id || ''}
          enableSelection={true}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          emptyMessage="Belum ada media galeri."
        />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload Multiple Media Dokumentasi">
        <div className="space-y-4 pt-2">
          <Input
            label="Nama Album Galeri *"
            placeholder="Contoh: Pembukaan, Sesi Pameran, Awarding"
            value={formData.album}
            onChange={(e) => setFormData({ ...formData, album: e.target.value })}
            required
          />

          <FileUpload
            multiple
            accept="image/*"
            onFilesSelected={handleFilesSelected}
            label="Drag & Drop multiple foto di sini untuk upload otomatis"
          />

          {isUploading && (
            <p className="text-xs text-center text-indigo-600 font-bold animate-pulse">
              Sedang memproses & mengunggah media...
            </p>
          )}
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Hapus Media Galeri?" message="Foto/video akan dihapus dari album." />
    </div>
  );
}
