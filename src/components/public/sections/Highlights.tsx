import React from 'react';
import { Card } from '@/components/ui/Card';

export const Highlights: React.FC = () => {
  const highlights = [
    {
      icon: '🎨',
      title: 'Pameran Karya Inovatif',
      description: 'Menampilkan puluhan karya riset, teknologi, sains, dan industri kreatif mahasiswa.',
    },
    {
      icon: '🏪',
      title: 'Puluhan Booth Interaktif',
      description: 'Pengunjung dapat berinteraksi langsung dengan para pembuat karya di setiap booth.',
    },
    {
      icon: '🎟️',
      title: 'Sistem Tiket Digital QR',
      description: 'Pendaftaran cepat dengan E-Ticket resmi ber-QR Code untuk check-in instan di lokasi.',
    },
    {
      icon: '🎭',
      title: 'Pertunjukan & Awarding',
      description: 'Sesi hiburan menarik, talkshow, serta pengumuman penganugerahan karya terbaik.',
    },
  ];

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600">Keunggulan Acara</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Mengapa Kamu Harus Hadir di Gelar Cipta?
          </h2>
          <p className="text-sm text-slate-600">
            Dapatkan pengalaman berharga, jejaring baru, dan inspirasi karya kreatif terbaik.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((h, index) => (
            <Card key={index} hoverEffect variant="default" className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl font-bold border border-indigo-100">
                {h.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900">{h.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{h.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
