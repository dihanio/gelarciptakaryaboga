'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/providers/ToastProvider';

import type { IEvent } from '@/types';

export default function AdminSettingsPage() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [events, setEvents] = useState<IEvent[]>([]);

  const [formData, setFormData] = useState({
    siteName: 'Gelar Cipta',
    siteDescription: 'Pameran Karya & Inovasi Mahasiswa',
    activeEventId: '',
    contactPhone: '',
    contactWhatsapp: '',
    contactEmail: '',
    socialInstagram: '',
    socialTiktok: '',
    socialYoutube: '',
  });

  useEffect(() => {
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => setEvents(data.data || []));

    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          const s = data.data;
          setFormData({
            siteName: s.siteName || 'Gelar Cipta',
            siteDescription: s.siteDescription || '',
            activeEventId: s.activeEventId || '',
            contactPhone: s.contact?.phone || '',
            contactWhatsapp: s.contact?.whatsapp || '',
            contactEmail: s.contact?.email || '',
            socialInstagram: s.socialMedia?.instagram || '',
            socialTiktok: s.socialMedia?.tiktok || '',
            socialYoutube: s.socialMedia?.youtube || '',
          });
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName: formData.siteName,
          siteDescription: formData.siteDescription,
          activeEventId: formData.activeEventId || undefined,
          contact: {
            phone: formData.contactPhone,
            whatsapp: formData.contactWhatsapp,
            email: formData.contactEmail,
          },
          socialMedia: {
            instagram: formData.socialInstagram,
            tiktok: formData.socialTiktok,
            youtube: formData.socialYoutube,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);

      toast.success('Pengaturan website berhasil disimpan!');
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-slate-400">Memuat pengaturan...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Pengaturan Website Utama</h1>
        <p className="text-xs text-slate-500">Konfigurasi event aktif publik, identitas website, dan kontak narahubung.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Active Event Card */}
        <Card className="p-6 space-y-4 border-l-4 border-indigo-600">
          <h3 className="font-bold text-slate-900 text-sm">1. Penentuan Active Event</h3>
          <p className="text-xs text-slate-500">
            Pilih event mana yang saat ini aktif dan akan ditampilkan secara publik di halaman depan website.
          </p>
          <Select
            label="Active Event Publik *"
            value={formData.activeEventId}
            onChange={(e) => setFormData({ ...formData, activeEventId: e.target.value })}
            options={[
              { label: '-- Otomatis Event Terbaru --', value: '' },
              ...events.map((e) => ({ label: `${e.name} (${e.status.toUpperCase()})`, value: e._id || '' })),
            ]}
          />
        </Card>

        {/* Identity Card */}
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">2. Identitas Website</h3>
          <Input
            label="Nama Sistem / Website *"
            value={formData.siteName}
            onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
            required
          />
          <Textarea
            label="Deskripsi Meta Website"
            value={formData.siteDescription}
            onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
            rows={2}
          />
        </Card>

        {/* Contact Card */}
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">3. Narahubung & Sosial Media</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nomor WhatsApp Panitia"
              placeholder="6281234567890"
              value={formData.contactWhatsapp}
              onChange={(e) => setFormData({ ...formData, contactWhatsapp: e.target.value })}
            />
            <Input
              type="email"
              label="Email Official"
              placeholder="info@gelarcipta.com"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Instagram URL"
              placeholder="https://instagram.com/..."
              value={formData.socialInstagram}
              onChange={(e) => setFormData({ ...formData, socialInstagram: e.target.value })}
            />
            <Input
              label="TikTok URL"
              placeholder="https://tiktok.com/@..."
              value={formData.socialTiktok}
              onChange={(e) => setFormData({ ...formData, socialTiktok: e.target.value })}
            />
            <Input
              label="YouTube URL"
              placeholder="https://youtube.com/@..."
              value={formData.socialYoutube}
              onChange={(e) => setFormData({ ...formData, socialYoutube: e.target.value })}
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" isLoading={isSubmitting} size="lg" className="rounded-xl px-8 shadow-md">
            Simpan Seluruh Pengaturan
          </Button>
        </div>
      </form>
    </div>
  );
}
