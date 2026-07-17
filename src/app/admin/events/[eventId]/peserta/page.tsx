'use client';

import React, { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { SearchInput } from '@/components/ui/SearchInput';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/providers/ToastProvider';
import { ImportExportBar, generateCsv } from '@/components/admin/ImportExportBar';
import { DataTable, ColumnDef } from '@/components/admin/DataTable';
import { BulkActionBar } from '@/components/admin/BulkActionBar';
import type { IParticipant, IBooth } from '@/types';

// Extended type for populated data
interface PopulatedParticipant extends Omit<IParticipant, 'booth'> {
  booth?: IBooth;
}

export default function AdminParticipantsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const toast = useToast();

  const [participants, setParticipants] = useState<PopulatedParticipant[]>([]);
  const [booths, setBooths] = useState<IBooth[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Bulk action state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PopulatedParticipant | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    workName: '',
    category: '',
    description: '',
    booth: '',
  });

  const loadData = () => {
    Promise.resolve().then(() => setIsLoading(true));
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
    });
    
    fetch(`/api/events/${eventId}/participants?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setParticipants(data.data as PopulatedParticipant[]);
          if (data.pagination) {
            setTotalPages(data.pagination.totalPages);
          }
        }
        setSelectedIds([]);
      })
      .finally(() => setIsLoading(false));

    fetch(`/api/events/${eventId}/booths`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBooths(data.data as IBooth[]);
        }
      });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [eventId, page, search]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({ name: '', workName: '', category: '', description: '', booth: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: PopulatedParticipant) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      workName: item.workName || '',
      category: item.category || '',
      description: item.description || '',
      booth: item.booth?._id || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingItem
        ? `/api/events/${eventId}/participants/${editingItem._id}`
        : `/api/events/${eventId}/participants`;

      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Gagal menyimpan data');
      }

      toast.success(editingItem ? 'Data diperbarui' : 'Peserta baru ditambahkan');
      setIsModalOpen(false);
      loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/events/${eventId}/participants/${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || data.error || 'Gagal hapus');

      toast.success('Peserta berhasil dihapus');
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
      const res = await fetch(`/api/events/${eventId}/participants/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', ids: selectedIds }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || data.error || 'Gagal hapus massal');

      toast.success(data.message || 'Berhasil hapus massal');
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

  const handleExport = () => {
    const exportData = participants.map((p) => ({
      name: p.name,
      workName: p.workName,
      category: p.category,
      booth: p.booth ? p.booth.number : '',
      description: p.description
    }));
    generateCsv(exportData, `Peserta_Gelar_Cipta_${new Date().getTime()}`);
  };

  const handleImport = async (data: Record<string, unknown>[]) => {
    setIsImporting(true);
    try {
      const res = await fetch(`/api/events/${eventId}/participants/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'import', data }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || result.error || 'Gagal import');

      toast.success(result.message || 'Berhasil import massal');
      loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    } finally {
      setIsImporting(false);
    }
  };

  const columns: ColumnDef<PopulatedParticipant>[] = [
    {
      key: 'name',
      header: 'Nama Peserta / Kelompok',
      render: (item) => <span className="font-bold text-slate-900">{item.name}</span>,
    },
    {
      key: 'workName',
      header: 'Nama Karya / Menu',
    },
    {
      key: 'category',
      header: 'Kategori',
      render: (item) => item.category ? <Badge variant="primary">{item.category}</Badge> : '-',
    },
    {
      key: 'booth',
      header: 'Booth',
      render: (item) => item.booth ? <Badge variant="warning">#{item.booth.number}</Badge> : '-',
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right',
      render: (item) => (
        <div className="space-x-2">
          <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(item)}>✏️ Edit</Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteId(item._id || '')}>🗑️</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Manajemen Peserta Karya</h1>
          <p className="text-xs text-slate-500">Kelola katalog karya, kelompok peserta, dan penempatan booth.</p>
        </div>
        <div className="flex items-center gap-2">
          <ImportExportBar 
            onExport={handleExport} 
            onImport={handleImport} 
            isImporting={isImporting} 
          />
          <Button onClick={handleOpenCreate}>+ Tambah Peserta</Button>
        </div>
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

      <Card className="p-4 space-y-4">
        <div className="max-w-xs w-full">
          <SearchInput 
            placeholder="Cari nama / karya..." 
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }} 
          />
        </div>

        <DataTable
          data={participants}
          columns={columns}
          isLoading={isLoading}
          keyExtractor={(item) => item._id || ''}
          enableSelection={true}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          emptyMessage="Tidak ada peserta."
          pagination={{
            currentPage: page,
            totalPages,
            onPageChange: setPage,
          }}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Data Peserta' : 'Tambah Peserta Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Input
            label="Nama Peserta / Kelompok *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Nama Karya / Menu Inovasi *"
            value={formData.workName}
            onChange={(e) => setFormData({ ...formData, workName: e.target.value })}
            required
          />

          <Input
            label="Kategori Karya (Opsional)"
            placeholder="Contoh: Teknologi, Kuliner, Fashion"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />

          <div className="space-y-1 flex flex-col">
            <label className="text-sm font-medium text-slate-700">Booth (Opsional)</label>
            <select
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.booth}
              onChange={(e) => setFormData({ ...formData, booth: e.target.value })}
            >
              <option value="">Pilih Booth (Tidak Ada)</option>
              {booths.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.number} {b.name ? `- ${b.name}` : ''}
                </option>
              ))}
            </select>
          </div>

          <Textarea
            label="Deskripsi Karya *"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Simpan
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Data Peserta?"
        message="Data yang dihapus tidak dapat dikembalikan."
      />
    </div>
  );
}
