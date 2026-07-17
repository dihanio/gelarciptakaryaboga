'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/providers/ToastProvider';
import { ROLES } from '@/lib/constants';
import { DataTable, ColumnDef } from '@/components/admin/DataTable';
import type { IUser, UserRole } from '@/types';

export default function AdminUsersPage() {
  const toast = useToast();

  const [users, setUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IUser | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'viewer' as UserRole,
    isActive: true,
  });

  const loadData = () => {
    Promise.resolve().then(() => setIsLoading(true));
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUsers(data.data as IUser[]);
        }
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ name: '', email: '', password: '', role: 'ticket_officer', isActive: true });
    setIsModalOpen(true);
  };

  const handleEdit = (item: IUser) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      email: item.email,
      password: '',
      role: item.role,
      isActive: item.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingItem ? `/api/users/${editingItem._id}` : '/api/users';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || data.error || 'Terjadi kesalahan');

      toast.success(editingItem ? 'User diperbarui' : 'User baru dibuat');
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
      const res = await fetch(`/api/users/${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || data.error || 'Terjadi kesalahan');

      toast.success('User dihapus');
      setDeleteId(null);
      loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  const columns: ColumnDef<IUser>[] = [
    {
      key: 'name',
      header: 'Nama Panitia',
      render: (item) => <span className="font-bold text-slate-900">{item.name}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (item) => <span className="text-xs">{item.email}</span>,
    },
    {
      key: 'role',
      header: 'Role / Hak Akses',
      render: (item) => (
        <Badge variant={item.role === 'super_admin' ? 'danger' : 'primary'}>
          {ROLES[item.role as keyof typeof ROLES]?.label || item.role}
        </Badge>
      ),
    },
    {
      key: 'isActive',
      header: 'Status Akun',
      render: (item) => (
        <Badge variant={item.isActive ? 'success' : 'default'}>
          {item.isActive ? 'AKTIF' : 'NON-AKTIF'}
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
          {item.role !== 'super_admin' && (
            <Button variant="danger" size="sm" onClick={() => setDeleteId(item._id || '')}>🗑️</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Manajemen User & Role Panitia</h1>
          <p className="text-xs text-slate-500">Kelola akun panitia, hak akses role (RBAC), dan status keaktifan.</p>
        </div>
        <Button onClick={handleCreate}>+ Buat Akun Panitia</Button>
      </div>

      <Card className="p-4">
        <DataTable
          data={users}
          columns={columns}
          isLoading={isLoading}
          keyExtractor={(item) => item._id || ''}
          emptyMessage="Belum ada akun pengguna."
        />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Akun Panitia' : 'Buat Akun Panitia Baru'}>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Input label="Nama Lengkap *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          <Input type="email" label="Alamat Email *" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          <Input type="password" label={editingItem ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password *'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required={!editingItem} />
          <Select label="Role / Hak Akses *" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })} options={[
            { label: 'Super Admin (Akses Penuh)', value: 'super_admin' },
            { label: 'Admin Event (Kelola Event)', value: 'admin_event' },
            { label: 'Ticket Officer (Manajemen Tiket)', value: 'ticket_officer' },
            { label: 'Check-In Officer (Scanner QR)', value: 'checkin_officer' },
            { label: 'Content Editor (Berita & CMS)', value: 'content_editor' },
            { label: 'Media (Upload Galeri)', value: 'media' },
            { label: 'Viewer (Lihat Saja)', value: 'viewer' },
          ]} />
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit">Simpan Akun</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Hapus Akun User?" message="Pengguna tidak akan dapat login lagi ke portal." />
    </div>
  );
}
