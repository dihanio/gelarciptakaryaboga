'use client';

import React, { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/providers/ToastProvider';
import { DataTable, ColumnDef } from '@/components/admin/DataTable';
import type { IPageSection, PageType, SectionType } from '@/types';

export default function AdminSectionsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const toast = useToast();

  const [sections, setSections] = useState<IPageSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IPageSection | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    page: 'landing' as PageType,
    sectionType: 'hero' as SectionType,
    title: '',
    subtitle: '',
    content: '',
    order: 0,
    isVisible: true,
  });

  const loadData = () => {
    Promise.resolve().then(() => setIsLoading(true));
    fetch(`/api/events/${eventId}/sections`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSections(data.data as IPageSection[]);
        }
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { loadData(); }, [eventId]);

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ page: 'landing', sectionType: 'hero', title: '', subtitle: '', content: '', order: sections.length + 1, isVisible: true });
    setIsModalOpen(true);
  };

  const handleEdit = (item: IPageSection) => {
    setEditingItem(item);
    setFormData({
      page: item.page || 'landing',
      sectionType: item.sectionType,
      title: item.title || '',
      subtitle: item.subtitle || '',
      content: item.content || '',
      order: item.order || 0,
      isVisible: item.isVisible !== false,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingItem
        ? `/api/events/${eventId}/sections/${editingItem._id}`
        : `/api/events/${eventId}/sections`;

      const res = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || data.error || 'Terjadi kesalahan');

      toast.success(editingItem ? 'Section diperbarui' : 'Section ditambahkan');
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
      const res = await fetch(`/api/events/${eventId}/sections/${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || data.error || 'Gagal hapus');

      toast.success('Section dihapus');
      setDeleteId(null);
      loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  const columns: ColumnDef<IPageSection>[] = [
    {
      key: 'order',
      header: 'Urutan',
      render: (item) => <span className="font-bold text-slate-900">#{item.order}</span>,
    },
    {
      key: 'sectionType',
      header: 'Tipe Section',
      render: (item) => <Badge variant="primary">{item.sectionType.toUpperCase()}</Badge>,
    },
    {
      key: 'page',
      header: 'Halaman Target',
      render: (item) => <span className="font-mono text-xs">{item.page}</span>,
    },
    {
      key: 'title',
      header: 'Judul Block',
      render: (item) => <span className="font-semibold text-slate-900">{item.title || '-'}</span>,
    },
    {
      key: 'isVisible',
      header: 'Status Tampil',
      render: (item) => (
        <Badge variant={item.isVisible ? 'success' : 'danger'}>
          {item.isVisible ? 'TAMPIL' : 'SEMBUNYI'}
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Manajemen CMS Landing Page</h1>
          <p className="text-xs text-slate-500">Konfigurasi blok section, urutan visual, dan visibilitas landing page.</p>
        </div>
        <Button onClick={handleCreate}>+ Tambah Section Layout</Button>
      </div>

      <Card className="p-4">
        <DataTable
          data={sections}
          columns={columns}
          isLoading={isLoading}
          keyExtractor={(item) => item._id || ''}
          emptyMessage="Belum ada section kustom. Menggunakan layout default."
        />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Section CMS' : 'Tambah Section CMS'}>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <Select label="Tipe Section *" value={formData.sectionType} onChange={(e) => setFormData({ ...formData, sectionType: e.target.value as SectionType })} options={[
              { label: 'Hero Banner', value: 'hero' },
              { label: 'Highlights Keunggulan', value: 'highlights' },
              { label: 'Preview Galeri', value: 'gallery_preview' },
              { label: 'FAQ Accordion', value: 'faq' },
              { label: 'Daftar Sponsor', value: 'sponsors' },
              { label: 'CTA Registrasi', value: 'cta' },
              { label: 'Konten Kustom', value: 'custom' },
            ]} />
            <Input type="number" label="Urutan Visual *" value={formData.order} onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })} required />
          </div>
          <Input label="Judul Block" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          <Input label="Sub-Judul / Subtitle" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} />
          <Textarea label="Konten Teks / Keterangan" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={4} />
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit">Simpan Section</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Hapus Section CMS?" message="Section akan dihapus dari layout landing page." />
    </div>
  );
}
