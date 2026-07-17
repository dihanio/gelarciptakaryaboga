'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/providers/ToastProvider';

export default function CreateEventPage() {
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    theme: '',
    description: '',
    date: '',
    time: '08:00 - 17:00 WIB',
    locationName: '',
    locationAddress: '',
    status: 'draft',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.theme || !formData.date || !formData.locationName) {
      toast.error('Mohon lengkapi seluruh kolom wajib.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug || undefined,
          theme: formData.theme,
          description: formData.description,
          date: formData.date,
          time: formData.time,
          location: {
            name: formData.locationName,
            address: formData.locationAddress,
          },
          status: formData.status,
          countdown: {
            enabled: true,
            targetDate: formData.date,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal membuat event');
      }

      toast.success('Event baru berhasil dibuat!');
      router.push(`/admin/events/${data.data._id}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'Terjadi kesalahan sistem');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Buat Event Gelar Cipta Baru</h1>
          <p className="text-xs text-slate-500">Inisialisasi penyelenggaraan acara tahunan baru.</p>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Event *"
            placeholder="Contoh: Gelar Cipta 2027"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Tema Acara *"
            placeholder="Contoh: Terobosan Inovasi Masa Depan"
            value={formData.theme}
            onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
            required
          />

          <Textarea
            label="Deskripsi Singkat Acara"
            placeholder="Penjelasan umum mengenai acara Gelar Cipta tahun ini..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="date"
              label="Tanggal Acara *"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />

            <Input
              label="Waktu Pelaksanaan *"
              placeholder="08:00 - 17:00 WIB"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nama Lokasi / Gedung *"
              placeholder="Contoh: Gedung Auditorium Utama"
              value={formData.locationName}
              onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
              required
            />

            <Input
              label="Alamat Lengkap Lokasi"
              placeholder="Jl. Pemuda No. 100, Surabaya"
              value={formData.locationAddress}
              onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })}
            />
          </div>

          <Select
            label="Status Publikasi Event"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { label: 'Draft (Belum Dipublikasi)', value: 'draft' },
              { label: 'Upcoming (Akan Datang)', value: 'upcoming' },
              { label: 'Active (Sedang Berlangsung)', value: 'active' },
            ]}
          />

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Simpan & Buat Event →
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
