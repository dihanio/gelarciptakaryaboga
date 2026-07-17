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
import { formatDate } from '@/lib/utils';
import { DataTable, ColumnDef } from '@/components/admin/DataTable';
import type { INews, NewsCategory, NewsStatus } from '@/types';

export default function AdminNewsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const toast = useToast();

  const [newsList, setNewsList] = useState<INews[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<INews | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'informasi' as NewsCategory,
    excerpt: '',
    content: '',
    coverImage: '',
    status: 'draft' as NewsStatus,
  });

  const loadData = () => {
    Promise.resolve().then(() => setIsLoading(true));
    fetch(`/api/events/${eventId}/news`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setNewsList(data.data as INews[]);
        }
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { loadData(); }, [eventId]);

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ title: '', category: 'informasi', excerpt: '', content: '', coverImage: '', status: 'draft' });
    setIsModalOpen(true);
  };

  const handleEdit = (item: INews) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category || 'informasi',
      excerpt: item.excerpt || '',
      content: item.content || '',
      coverImage: item.coverImage || '',
      status: item.status || 'draft',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingItem
        ? `/api/events/${eventId}/news/${editingItem._id}`
        : `/api/events/${eventId}/news`;

      const res = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || data.error || 'Terjadi kesalahan');

      toast.success(editingItem ? 'Artikel diperbarui' : 'Artikel dibuat');
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
      const res = await fetch(`/api/events/${eventId}/news/${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || data.error || 'Terjadi kesalahan');

      toast.success('Artikel dihapus');
      setDeleteId(null);
      loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  const columns: ColumnDef<INews>[] = [
    {
      key: 'title',
      header: 'Judul Artikel',
      render: (item) => <span className="font-bold text-slate-900 max-w-md truncate block">{item.title}</span>,
    },
    {
      key: 'category',
      header: 'Kategori',
      render: (item) => <Badge variant="primary">{item.category}</Badge>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <Badge variant={item.status === 'published' ? 'success' : item.status === 'draft' ? 'warning' : 'default'}>
          {item.status.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'publishedAt',
      header: 'Tanggal Dipublikasi',
      render: (item) => <span className="text-xs">{formatDate(item.publishedAt || item.createdAt)}</span>,
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
          <h1 className="text-xl font-bold text-slate-900">Manajemen Berita & Pengumuman</h1>
          <p className="text-xs text-slate-500">Kelola publikasi artikel, pengumuman teknis, dan liputan event.</p>
        </div>
        <Button onClick={handleCreate}>+ Tulis Berita</Button>
      </div>

      <Card className="p-4">
        <DataTable
          data={newsList}
          columns={columns}
          isLoading={isLoading}
          keyExtractor={(item) => item._id || ''}
          emptyMessage="Belum ada artikel berita."
        />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="lg" title={editingItem ? 'Edit Berita' : 'Tulis Berita Baru'}>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Input label="Judul Artikel *" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Kategori" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as NewsCategory })} options={[
              { label: 'Informasi Umum', value: 'informasi' },
              { label: 'Pengumuman Penting', value: 'pengumuman' },
              { label: 'Artikel & Edukasi', value: 'artikel' },
              { label: 'Liputan Acara', value: 'liputan' },
            ]} />
            <Select label="Status Publikasi" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as NewsStatus })} options={[
              { label: 'Draft (Simpan Dulu)', value: 'draft' },
              { label: 'Published (Terbitkan)', value: 'published' },
              { label: 'Archived (Arsip)', value: 'archived' },
            ]} />
          </div>
          <Input label="URL Gambar Sampul (Opsional)" placeholder="https://..." value={formData.coverImage} onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })} />
          <Textarea label="Ringkasan Singkat (Excerpt) *" value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} rows={2} required />
          <Textarea label="Konten Artikel Berita *" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={6} required />
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit">Simpan & Publikasikan</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Hapus Artikel?" message="Artikel berita akan dihapus permanen." />
    </div>
  );
}
