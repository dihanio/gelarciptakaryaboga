'use client';

import React, { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/providers/ToastProvider';
import { SearchInput } from '@/components/ui/SearchInput';
import { ImportExportBar, generateCsv } from '@/components/admin/ImportExportBar';
import { DataTable, ColumnDef } from '@/components/admin/DataTable';
import { BulkActionBar } from '@/components/admin/BulkActionBar';
import type { IBooth, BoothStatus } from '@/types';

export default function AdminBoothPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const toast = useToast();

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
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IBooth | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkStatus, setBulkStatus] = useState<string>('');

  const [formData, setFormData] = useState({
    number: '',
    name: '',
    location: '',
    category: '',
    status: 'available' as BoothStatus,
  });

  const loadData = () => {
    Promise.resolve().then(() => setIsLoading(true));
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
    });

    fetch(`/api/events/${eventId}/booths?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBooths(data.data as IBooth[]);
          if (data.pagination) {
            setTotalPages(data.pagination.totalPages);
          }
        }
        setSelectedIds([]);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [eventId, page, search]);

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ number: '', name: '', location: '', category: '', status: 'available' });
    setIsModalOpen(true);
  };

  const handleEdit = (item: IBooth) => {
    setEditingItem(item);
    setFormData({
      number: item.number,
      name: item.name || '',
      location: item.location || '',
      category: item.category || '',
      status: item.status || 'available',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingItem
        ? `/api/events/${eventId}/booths/${editingItem._id}`
        : `/api/events/${eventId}/booths`;

      const res = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || data.error || 'Terjadi kesalahan');

      toast.success(editingItem ? 'Booth diperbarui' : 'Booth ditambahkan');
      setIsModalOpen(false);
      loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/events/${eventId}/booths/${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || data.error || 'Gagal hapus');

      toast.success('Booth dihapus');
      setDeleteId(null);
      loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  const handleBulkAction = async (action: 'delete' | 'updateStatus', status?: string) => {
    if (selectedIds.length === 0) return;
    setIsBulkLoading(true);
    
    try {
      const res = await fetch(`/api/events/${eventId}/booths/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids: selectedIds, status }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || data.error || 'Gagal mass action');

      toast.success(data.message || 'Berhasil mass action');
      setSelectedIds([]);
      setBulkStatus('');
      loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleExport = () => {
    const exportData = booths.map(b => ({
      number: b.number,
      name: b.name,
      category: b.category,
      location: b.location,
      status: b.status
    }));
    generateCsv(exportData, `Booth_Gelar_Cipta_${new Date().getTime()}`);
  };

  const handleImport = async (data: Record<string, unknown>[]) => {
    setIsImporting(true);
    try {
      const res = await fetch(`/api/events/${eventId}/booths/bulk`, {
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

  const columns: ColumnDef<IBooth>[] = [
    {
      key: 'number',
      header: 'Nomor Booth',
      render: (item) => <span className="font-bold text-indigo-600">#{item.number}</span>,
    },
    {
      key: 'name',
      header: 'Nama/Label Booth',
      render: (item) => <span className="font-semibold">{item.name || '-'}</span>,
    },
    {
      key: 'category',
      header: 'Kategori',
      render: (item) => item.category || '-',
    },
    {
      key: 'location',
      header: 'Lokasi Area',
      render: (item) => item.location || '-',
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <Badge variant={item.status === 'assigned' ? 'primary' : item.status === 'available' ? 'success' : 'default'}>
          {item.status.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right',
      render: (item) => (
        <div className="space-x-2">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>✏️ Edit</Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteId(item._id || '')}>🗑️</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Manajemen Booth Pameran</h1>
          <p className="text-xs text-slate-500">Kelola nomor booth, lokasi area, dan penetapan status.</p>
        </div>
        <div className="flex items-center gap-2">
          <ImportExportBar 
            onExport={handleExport} 
            onImport={handleImport} 
            isImporting={isImporting} 
          />
          <Button onClick={handleCreate}>+ Tambah Booth</Button>
        </div>
      </div>

      <BulkActionBar 
        selectedCount={selectedIds.length} 
        onClear={() => setSelectedIds([])}
        actions={[
          {
            label: 'Hapus Terpilih',
            onClick: () => {
              if(confirm('Yakin ingin menghapus booth yang dipilih?')) {
                handleBulkAction('delete');
              }
            },
            variant: 'danger',
            isLoading: isBulkLoading
          }
        ]}
      >
        <div className="flex items-center gap-2 mr-4 border-r border-slate-200 pr-4">
          <select 
            className="h-8 text-xs rounded border-slate-200 focus:ring-0 focus:border-slate-300"
            value={bulkStatus}
            onChange={(e) => {
              setBulkStatus(e.target.value);
              if (e.target.value) handleBulkAction('updateStatus', e.target.value);
            }}
            disabled={isBulkLoading}
          >
            <option value="">Ubah Status...</option>
            <option value="available">Tersedia</option>
            <option value="assigned">Terisi</option>
            <option value="inactive">Non-Aktif</option>
          </select>
        </div>
      </BulkActionBar>

      <Card className="p-4 space-y-4">
        <div className="max-w-xs w-full">
          <SearchInput 
            placeholder="Cari nomor / nama booth..." 
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }} 
          />
        </div>

        <DataTable
          data={booths}
          columns={columns}
          isLoading={isLoading}
          keyExtractor={(item) => item._id || ''}
          enableSelection={true}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          emptyMessage="Belum ada booth."
          pagination={{
            currentPage: page,
            totalPages,
            onPageChange: setPage,
          }}
        />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Booth' : 'Tambah Booth'}>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Input label="Nomor Booth *" placeholder="Contoh: A-01" value={formData.number} onChange={(e) => setFormData({ ...formData, number: e.target.value })} required />
          <Input label="Nama / Label Booth" placeholder="Contoh: Booth Utama Sains" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <Input label="Kategori Area" placeholder="Contoh: Teknologi, Kuliner" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
          <Input label="Lokasi Spesifik" placeholder="Contoh: Lantai 1, Sayap Kiri" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
          <Select label="Status Booth" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as BoothStatus })} options={[{ label: 'Available (Tersedia)', value: 'available' }, { label: 'Assigned (Terisi)', value: 'assigned' }, { label: 'Inactive (Non-Aktif)', value: 'inactive' }]} />
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit">Simpan</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Hapus Booth?" message="Booth akan dihapus dari sistem." />
    </div>
  );
}
