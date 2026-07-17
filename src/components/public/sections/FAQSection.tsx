'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';

export interface FAQItem {
  question: string;
  answer: string;
}

export const FAQSection: React.FC<{ faqs?: FAQItem[] }> = ({ faqs = [] }) => {
  const defaultFaqs: FAQItem[] = [
    {
      question: 'Apakah acara Gelar Cipta terbuka untuk umum?',
      answer: 'Ya, Gelar Cipta terbuka untuk seluruh kalangan mahasiswa, akademisi, profesional, dan masyarakat umum.',
    },
    {
      question: 'Bagaimana cara masuk ke lokasi pameran?',
      answer: 'Setiap pengunjung cukup mendaftar secara online di website ini, mendapatkan E-Ticket ber-QR Code, dan menunjukkannya ke panitia saat di pintu masuk.',
    },
    {
      question: 'Apakah pendaftaran tiket dipungut biaya?',
      answer: 'Sebagian besar kategori tiket publik bersifat GRATIS. Pastikan mendaftar sebelum kuota tiket habis.',
    },
    {
      question: 'Di mana lokasi pelaksanaan Gelar Cipta?',
      answer: 'Lokasi dan peta detail dapat dilihat pada halaman Kontak atau pada E-Ticket setelah kamu mendaftar.',
    },
  ];

  const items = faqs.length > 0 ? faqs : defaultFaqs;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600">FAQ</span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Pertanyaan Yang Sering Diajukan
          </h2>
        </div>

        <div className="space-y-3">
          {items.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <Card
                key={index}
                variant="default"
                className="cursor-pointer transition-colors p-5 hover:border-slate-300"
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-sm font-bold text-slate-900">{faq.question}</h3>
                  <span className="text-slate-400 font-bold text-lg">{isOpen ? '−' : '+'}</span>
                </div>
                {isOpen && (
                  <p className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 leading-relaxed animate-in fade-in duration-200">
                    {faq.answer}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
