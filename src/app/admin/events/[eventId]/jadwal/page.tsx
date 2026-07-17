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
import type { ISchedule, ScheduleType } from '@/types';

export default function AdminSchedulePage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const toast = useToast();

  const [schedules, setSchedules] = useState<ISchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ISchedule | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    speaker: '',
    location: '',
    type: 'presentation' as ScheduleType,
    description: '',
  });

  const loadData = () => {
    Promise.resolve().then(() => setIsLoading(true));
    fetch(`/api/events/${eventId}/schedules`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSchedules(data.data as ISchedule[]);
        }
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { loadData(); }, [eventId]);

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ title: '', startTime: '08:00', endTime: '09:00', speaker: '', location: '', type: 'presentation', description: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (item: ISchedule) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      startTime: item.startTime || '',
      endTime: item.endTime || '',
      speaker: item.speaker || '',
      location: item.location || '',
      type: item.type || 'presentation',
      description: item.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingItem
        ? `/api/events/${eventId}/schedules/${editingItem._id}`
        : `/api/events/${eventId}/schedules`;

      const res = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || data.error || 'Terjadi kesalahan');

      toast.success(editingItem ? 'Jadwal diperbarui' : 'Jadwal ditambahkan');
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
      const res = await fetch(`/api/events/${eventId}/schedules/${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || data.error || 'Terjadi kesalahan');

      toast.success('Jadwal dihapus');
      setDeleteId(null);
      loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  const columns: ColumnDef<ISchedule>[] = [
    {
      key: 'waktu',
      header: 'Waktu Sesi',
      render: (item) => (
        <span className="font-mono text-xs font-bold text-indigo-600">
          {item.startTime} {item.endTime && `- ${item.endTime}`}
        </span>
      ),
    },
    {
      key: 'title',
      header: 'Agenda / Judul',
      render: (item) => <span className="font-bold text-slate-900">{item.title}</span>,
    },
    {
      key: 'type',
      header: 'Kategori',
      render: (item) => <Badge variant="primary">{item.type}</Badge>,
    },
    {
      key: 'speaker',
      header: 'Pembicara / Pengisi',
      render: (item) => item.speaker || '-',
    },
    {
      key: 'location',
      header: 'Lokasi Sesi',
      render: (item) => item.location || '-',
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
          <h1 className="text-xl font-bold text-slate-900">Manajemen Rundown Acara</h1>
          <p className="text-xs text-slate-500">Kelola susunan jadwal kegiatan, pembicara, dan lokasi sesi.</p>
        </div>
        <Button onClick={handleCreate}>+ Tambah Agenda</Button>
      </div>

      <Card className="p-4">
        <DataTable
          data={schedules}
          columns={columns}
          isLoading={isLoading}
          keyExtractor={(item) => item._id || ''}
        />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Agenda' : 'Tambah Agenda Baru'}>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Input label="Judul Agenda *" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Jam Mulai *" placeholder="08:00" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} required />
            <Input label="Jam Selesai" placeholder="09:30" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} />
          </div>
          <Input label="Pembicara / Pengisi Sesi" placeholder="Contoh: Dr. Budi Santoso" value={formData.speaker} onChange={(e) => setFormData({ ...formData, speaker: e.target.value })} />
          <Input label="Lokasi Sesi Spesifik" placeholder="Contoh: Panggung Utama" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
          <Select label="Kategori Sesi" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as ScheduleType })} options={[
            { label: 'Presentasi / Talkshow', value: 'presentation' },
            { label: 'Upacara / Pembukaan', value: 'ceremony' },
            { label: 'Pertunjukan / Hiburan', value: 'performance' },
            { label: 'Istirahat / Break', value: 'break' },
            { label: 'Penganugerahan / Awarding', value: 'awarding' },
            { label: 'Lainnya', value: 'other' },
          ]} />
          <Textarea label="Deskripsi Sesi" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit">Simpan</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Hapus Agenda?" message="Agenda akan dihapus dari rundown." />
    </div>
  );
}
