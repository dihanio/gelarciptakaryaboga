'use client';

import React, { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { SearchInput } from '@/components/ui/SearchInput';
import { useToast } from '@/providers/ToastProvider';
import { formatDate, formatCurrency } from '@/lib/utils';
import { DataTable, ColumnDef } from '@/components/admin/DataTable';
import type { ITicketType, ITicket, IVisitor } from '@/types';

// Extended type for populated data
interface PopulatedTicket extends Omit<ITicket, 'visitor' | 'ticketType'> {
  visitor: IVisitor;
  ticketType: ITicketType;
}

export default function AdminTicketsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const toast = useToast();

  const [ticketTypes, setTicketTypes] = useState<ITicketType[]>([]);
  const [issuedTickets, setIssuedTickets] = useState<PopulatedTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<ITicketType | null>(null);
  const [search, setSearch] = useState('');

  const [typeForm, setTypeForm] = useState({
    name: '',
    price: 0,
    quota: 100,
    isActive: true,
    description: '',
  });

  const loadData = () => {
    Promise.resolve().then(() => setIsLoading(true));
    fetch(`/api/events/${eventId}/tickets/types`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTicketTypes(data.data as ITicketType[]);
        }
      });

    fetch(`/api/events/${eventId}/tickets/orders`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setIssuedTickets(data.data as PopulatedTicket[]);
        }
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { loadData(); }, [eventId]);

  const handleCreateType = () => {
    setEditingType(null);
    setTypeForm({ name: '', price: 0, quota: 100, isActive: true, description: '' });
    setIsTypeModalOpen(true);
  };

  const handleEditType = (t: ITicketType) => {
    setEditingType(t);
    setTypeForm({
      name: t.name,
      price: t.price || 0,
      quota: t.quota || 100,
      isActive: t.isActive,
      description: t.description || '',
    });
    setIsTypeModalOpen(true);
  };

  const handleTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingType
        ? `/api/events/${eventId}/tickets/types/${editingType._id}`
        : `/api/events/${eventId}/tickets/types`;

      const res = await fetch(url, {
        method: editingType ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(typeForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || data.error || 'Terjadi kesalahan');

      toast.success('Kategori tiket disimpan');
      setIsTypeModalOpen(false);
      loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  const filteredTickets = issuedTickets.filter(
    (t) =>
      t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.visitor?.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.visitor?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const issuedTicketsColumns: ColumnDef<PopulatedTicket>[] = [
    {
      key: 'ticketNumber',
      header: 'Nomor Tiket',
      render: (item) => <span className="font-mono font-bold text-indigo-600">{item.ticketNumber}</span>,
    },
    {
      key: 'visitorName',
      header: 'Nama Pengunjung',
      render: (item) => <span className="font-bold text-slate-900">{item.visitor?.name || '-'}</span>,
    },
    {
      key: 'visitorContact',
      header: 'Email & No WA',
      render: (item) => (
        <div className="text-xs">
          <p>{item.visitor?.email}</p>
          <p className="text-slate-400">{item.visitor?.phone}</p>
        </div>
      ),
    },
    {
      key: 'ticketType',
      header: 'Kategori Tiket',
      render: (item) => <Badge variant="primary">{item.ticketType?.name || 'Reguler'}</Badge>,
    },
    {
      key: 'status',
      header: 'Status Tiket',
      render: (item) => (
        <Badge variant={item.status === 'active' ? 'success' : item.status === 'used' ? 'primary' : 'danger'}>
          {item.status.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'issuedAt',
      header: 'Tanggal Terbit',
      render: (item) => <span className="text-xs">{formatDate(item.issuedAt)}</span>,
    },
  ];

  const typeColumns: ColumnDef<ITicketType>[] = [
    {
      key: 'name',
      header: 'Nama Tiket',
      render: (item) => <span className="font-bold text-slate-900">{item.name}</span>,
    },
    {
      key: 'price',
      header: 'Harga',
      render: (item) => (
        <span className="font-bold text-emerald-600">
          {item.price === 0 ? 'GRATIS' : formatCurrency(item.price)}
        </span>
      ),
    },
    {
      key: 'quota',
      header: 'Kuota Maksimal',
      render: (item) => `${item.quota} tiket`,
    },
    {
      key: 'sold',
      header: 'Sudah Terjual',
      render: (item) => <span className="font-bold">{item.sold} / {item.quota}</span>,
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (item) => (
        <Badge variant={item.isActive ? 'success' : 'danger'}>
          {item.isActive ? 'AKTIF' : 'NON-AKTIF'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      align: 'right',
      render: (item) => (
        <Button variant="ghost" size="sm" onClick={() => handleEditType(item)}>✏️ Edit</Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Manajemen Tiket & Pengunjung</h1>
          <p className="text-xs text-slate-500">Kelola kuota jenis tiket dan data terbitan E-Ticket pengunjung.</p>
        </div>
      </div>

      <Tabs
        tabs={[
          {
            id: 'issued',
            label: 'Daftar Tiket Terbit',
            badge: issuedTickets.length,
            content: (
              <Card className="p-4 space-y-4">
                <div className="max-w-xs">
                  <SearchInput placeholder="Cari no tiket / nama / email..." onChange={setSearch} />
                </div>
                <DataTable
                  data={filteredTickets}
                  columns={issuedTicketsColumns}
                  isLoading={isLoading}
                  keyExtractor={(item) => item._id || ''}
                  emptyMessage="Belum ada tiket terbit."
                />
              </Card>
            ),
          },
          {
            id: 'types',
            label: 'Pengaturan Kategori Tiket',
            badge: ticketTypes.length,
            content: (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button onClick={handleCreateType}>+ Kategori Tiket Baru</Button>
                </div>
                <Card className="p-4">
                  <DataTable
                    data={ticketTypes}
                    columns={typeColumns}
                    isLoading={isLoading}
                    keyExtractor={(item) => item._id || ''}
                    emptyMessage="Belum ada kategori tiket."
                  />
                </Card>
              </div>
            ),
          },
        ]}
      />

      <Modal isOpen={isTypeModalOpen} onClose={() => setIsTypeModalOpen(false)} title={editingType ? 'Edit Kategori Tiket' : 'Buat Kategori Tiket'}>
        <form onSubmit={handleTypeSubmit} className="space-y-4 pt-2">
          <Input label="Nama Kategori Tiket *" value={typeForm.name} onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input type="number" label="Harga (IDR, 0 jika gratis) *" value={typeForm.price} onChange={(e) => setTypeForm({ ...typeForm, price: Number(e.target.value) })} required />
            <Input type="number" label="Kuota Maksimal Tiket *" value={typeForm.quota} onChange={(e) => setTypeForm({ ...typeForm, quota: Number(e.target.value) })} required />
          </div>
          <Input label="Deskripsi Singkat" value={typeForm.description} onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })} />
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsTypeModalOpen(false)}>Batal</Button>
            <Button type="submit">Simpan</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
