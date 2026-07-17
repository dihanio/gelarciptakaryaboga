'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { useToast } from '@/providers/ToastProvider';
import { formatCurrency } from '@/lib/utils';
import { Ticket, CheckCircle2, ShieldCheck, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import type { ITicketType, IWebsiteSettings, IEvent } from '@/types';

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: Record<string, unknown>) => void;
          onPending?: (result: Record<string, unknown>) => void;
          onError?: (result: Record<string, unknown>) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

export default function TicketRegistrationPage() {
  const router = useRouter();
  const toast = useToast();

  const [ticketTypes, setTicketTypes] = useState<ITicketType[]>([]);
  const [selectedType, setSelectedType] = useState<ITicketType | null>(null);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    ticketTypeId: '',
    quantity: 1,
  });

  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; phone?: string }>({});

  const [settings, setSettings] = useState<IWebsiteSettings | null>(null);
  const [event, setEvent] = useState<IEvent | null>(null);

  const fetchTicketTypes = (eventId: string) => {
    fetch(`/api/events/${eventId}/tickets/types`)
      .then((res) => res.json())
      .then((data) => {
        const types = data.data || [];
        setTicketTypes(types);
        if (types.length > 0) {
          setSelectedType(types[0]);
          setFormData((prev) => ({ ...prev, ticketTypeId: types[0]._id }));
        }
      })
      .catch(() => {
        const defaultType = {
          _id: 'default_free',
          name: 'Tiket Reguler (Gratis)',
          price: 0,
          quota: 500,
          sold: 0,
          isActive: true,
          benefits: ['Akses seluruh area pameran', 'E-Ticket QR Code Instan'],
        } as ITicketType;
        setTicketTypes([defaultType]);
        setSelectedType(defaultType);
        setFormData((prev) => ({ ...prev, ticketTypeId: defaultType._id as string }));
      })
      .finally(() => setIsLoadingTypes(false));
  };

  useEffect(() => {
    fetch('/api/public/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data.data));

    fetch('/api/public/event')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setEvent(data.data);
          if (data.data?._id) {
            fetchTicketTypes(data.data._id);
          }
        }
      });
  }, []);

  const handleSelectType = (type: ITicketType) => {
    setSelectedType(type);
    setFormData((prev) => ({ ...prev, ticketTypeId: type._id || '' }));
  };

  const checkPaymentAndRedirect = async (orderNumber: string) => {
    try {
      const statusRes = await fetch(`/api/public/tickets/payment-status/${orderNumber}`);
      const statusData = await statusRes.json();

      if (statusData.success && statusData.data?.ticketNumber) {
        toast.success('Pembayaran terkonfirmasi! Menampilkan E-Ticket...');
        router.push(`/tiket/${statusData.data.ticketNumber}`);
      } else {
        toast.info('Pembayaran telah diproses. E-Ticket akan segera diterbitkan.');
      }
    } catch (err) {
      console.error('Failed to fetch payment status:', err);
    }
  };

  const validateForm = () => {
    const newErrors: { name?: string; email?: string; phone?: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Mohon isi nama lengkap Anda.';
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Mohon isi alamat email aktif yang valid.';
    }
    if (!formData.phone.trim() || formData.phone.length < 8) {
      newErrors.phone = 'Mohon isi nomor WhatsApp atau telepon yang valid.';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Mohon lengkapi data pendaftaran sesuai petunjuk.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/public/tickets/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Pendaftaran gagal');
      }

      // FREE TICKET DIRECT REDIRECT
      if (data.data?.isFree) {
        toast.success('Pendaftaran tiket gratis berhasil!');
        router.push(`/tiket/${data.data.ticketNumber}`);
        return;
      }

      // PAID TICKET MIDTRANS SNAP PAY
      const snapToken = data.data?.snapToken;
      const orderNumber = data.data?.orderNumber;

      if (!snapToken) {
        throw new Error('Token transaksi Midtrans tidak ditemukan');
      }

      if (!window.snap) {
        // Fallback to Midtrans Snap redirect URL if popup SDK is loading
        if (data.data?.redirectUrl) {
          window.location.href = data.data.redirectUrl;
          return;
        }
        throw new Error('SDK Pembayaran Midtrans Snap belum siap. Silakan muat ulang halaman.');
      }

      window.snap.pay(snapToken, {
        onSuccess: async () => {
          toast.success('Pembayaran sukses!');
          await checkPaymentAndRedirect(orderNumber);
        },
        onPending: async () => {
          toast.warning('Pembayaran pending. Silakan selesaikan pembayaran sesuai petunjuk.');
          await checkPaymentAndRedirect(orderNumber);
        },
        onError: () => {
          toast.error('Pembayaran gagal atau ditolak.');
        },
        onClose: () => {
          toast.info('Popup pembayaran ditutup sebelum transaksi selesai.');
        },
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || 'Terjadi kesalahan sistem');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicLayout settings={settings}>
      {/* Pass Reservation Header */}
        <section className="pt-36 pb-16 border-b border-ivory-cream/10 bg-background">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-label-caps text-[10px] text-secondary tracking-[0.3em] uppercase">
                    LOKET TIKET RESMI
                  </span>
                  <span className="text-secondary border border-secondary/30 text-[10px] font-label-caps px-2 py-0.5">
                    AKSES TIKET ELEKTRONIK
                  </span>
                </div>
                <h1 className="font-display-lg text-4xl md:text-6xl lg:text-7xl text-on-surface uppercase leading-none tracking-tight">
                  PESAN TIKET<br />
                  <span className="text-secondary italic font-normal">RESMI PAMERAN</span>
                </h1>
              </div>
              <p className="font-body-md text-sm text-outline max-w-sm">
                Reservasi tiket digital ber-QR Code resmi untuk menghadiri pameran karya inovasi boga.
              </p>
            </div>
          </div>
        </section>

        {/* Ticket Registration Workspace */}
        <section className="py-16 md:py-24">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Left Column: Ticket Tier Selector */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <span className="font-label-caps text-[10px] text-secondary tracking-[0.2em] block mb-2 uppercase">
                    LANGKAH 1
                  </span>
                  <h3 className="font-headline-md text-xl text-on-surface uppercase">PILIH KATEGORI TIKET</h3>
                </div>

                {isLoadingTypes ? (
                  <div className="p-8 text-center border border-ivory-cream/10 bg-surface-container-low text-xs font-label-caps text-outline">
                    MEMUAT KATEGORI TIKET...
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ticketTypes.map((t) => {
                      const isSelected = selectedType?._id === t._id;
                      const isSoldOut = t.sold >= t.quota;

                      return (
                        <div
                          key={t._id}
                          onClick={() => !isSoldOut && handleSelectType(t)}
                          className={`cursor-pointer transition-all duration-300 p-6 border ${
                            isSelected
                              ? 'border-secondary bg-secondary/10 shadow-lg shadow-secondary/5'
                              : 'border-ivory-cream/10 bg-surface-container-low/40 hover:border-secondary/40'
                          } ${isSoldOut ? 'opacity-40 pointer-events-none' : ''}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-headline-md text-lg text-on-surface">{t.name}</h4>
                            {isSoldOut ? (
                              <span className="font-label-caps text-[9px] bg-red-950/80 text-red-400 border border-red-500/30 px-2 py-0.5 uppercase">
                                HABIS
                              </span>
                            ) : (
                              <span className="font-headline-md text-base text-secondary font-bold">
                                {t.price === 0 ? 'GRATIS' : formatCurrency(t.price)}
                              </span>
                            )}
                          </div>

                          {t.description && (
                            <p className="font-body-md text-xs text-on-surface-variant leading-relaxed mb-4">
                              {t.description}
                            </p>
                          )}

                          {t.benefits && t.benefits.length > 0 && (
                            <ul className="space-y-1.5 pt-3 border-t border-ivory-cream/5 text-[11px] font-body-md text-outline">
                              {t.benefits.map((benefit, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-secondary shrink-0" aria-hidden="true" />
                                  <span>{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          )}

                          <div className="mt-4 pt-3 border-t border-ivory-cream/5 flex justify-between items-center text-[10px] font-label-caps text-outline">
                            <span>SISA KUOTA: {t.quota - t.sold} TIKET</span>
                            {isSelected && (
                              <span className="text-secondary flex items-center gap-1 font-bold">
                                TERPILIH <Sparkles className="w-3 h-3" aria-hidden="true" />
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Visitor Form */}
              <div className="lg:col-span-7">
                <div className="border border-ivory-cream/10 bg-surface-container-low/60 p-8 md:p-10 space-y-8">
                  <div>
                    <span className="font-label-caps text-[10px] text-secondary tracking-[0.2em] block mb-2 uppercase">
                      LANGKAH 2
                    </span>
                    <h3 className="font-headline-md text-xl md:text-2xl text-on-surface uppercase">DATA PENGUNJUNG</h3>
                    <p className="font-body-md text-xs text-outline mt-1">
                      E-Ticket resmi ber-QR Code akan dibuat dan langsung dikirimkan setelah pendaftaran.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} noValidate className="space-y-6">
                    <div className="space-y-2">
                      <label className="font-label-caps text-[10px] tracking-widest text-secondary block uppercase">
                        NAMA LENGKAP *
                      </label>
                      <input
                        type="text"
                        placeholder="Masukkan nama lengkap Anda..."
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                        }}
                        className={`w-full bg-surface-container border ${
                          formErrors.name
                            ? 'border-rose-500/80 focus:border-rose-500 bg-rose-950/10'
                            : 'border-ivory-cream/10 focus:border-secondary'
                        } text-on-surface px-4 py-3 font-body-md text-sm placeholder:text-outline focus:outline-none transition-colors`}
                      />
                      {formErrors.name && (
                        <div className="flex items-center gap-1.5 text-xs text-rose-400 font-body-md pt-1">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" aria-hidden="true" />
                          <span>{formErrors.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="font-label-caps text-[10px] tracking-widest text-secondary block uppercase">
                        ALAMAT EMAIL *
                      </label>
                      <input
                        type="email"
                        placeholder="contoh@domain.com"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (formErrors.email) setFormErrors({ ...formErrors, email: undefined });
                        }}
                        className={`w-full bg-surface-container border ${
                          formErrors.email
                            ? 'border-rose-500/80 focus:border-rose-500 bg-rose-950/10'
                            : 'border-ivory-cream/10 focus:border-secondary'
                        } text-on-surface px-4 py-3 font-body-md text-sm placeholder:text-outline focus:outline-none transition-colors`}
                      />
                      {formErrors.email && (
                        <div className="flex items-center gap-1.5 text-xs text-rose-400 font-body-md pt-1">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" aria-hidden="true" />
                          <span>{formErrors.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="font-label-caps text-[10px] tracking-widest text-secondary block uppercase">
                        NOMOR WHATSAPP / TELEPON *
                      </label>
                      <input
                        type="tel"
                        placeholder="Contoh: 081234567890"
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value });
                          if (formErrors.phone) setFormErrors({ ...formErrors, phone: undefined });
                        }}
                        className={`w-full bg-surface-container border ${
                          formErrors.phone
                            ? 'border-rose-500/80 focus:border-rose-500 bg-rose-950/10'
                            : 'border-ivory-cream/10 focus:border-secondary'
                        } text-on-surface px-4 py-3 font-body-md text-sm placeholder:text-outline focus:outline-none transition-colors`}
                      />
                      {formErrors.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-rose-400 font-body-md pt-1">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" aria-hidden="true" />
                          <span>{formErrors.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="font-label-caps text-[10px] tracking-widest text-secondary block uppercase">
                        INSTANSI / SEKOLAH / UNIVERSITAS (OPSIONAL)
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Universitas Negeri Surabaya"
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        className="w-full bg-surface-container border border-ivory-cream/10 text-on-surface px-4 py-3 font-body-md text-sm placeholder:text-outline focus:outline-none focus:border-secondary transition-colors"
                      />
                    </div>

                    {/* Total Summary & Checkout Button */}
                    <div className="pt-6 border-t border-ivory-cream/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                      <div>
                        <span className="font-label-caps text-[10px] text-outline block uppercase">TOTAL BIAYA TIKET</span>
                        <span className="font-display-lg text-2xl text-secondary">
                          {selectedType?.price ? formatCurrency(selectedType.price * formData.quantity) : 'GRATIS'}
                        </span>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto border border-secondary bg-secondary text-dark-chocolate hover:bg-ivory-cream transition-all duration-300 font-label-caps text-xs tracking-widest px-8 py-3.5 font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? 'MEMPROSES...' : 'RESERVASI PASS RESTER'}
                        {!isSubmitting && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-label-caps text-outline pt-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-secondary shrink-0" aria-hidden="true" />
                      <span>E-TICKET RESMI DENGAN QR-SCAN KUNJUNGAN SATU KALI MASUK</span>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
    </PublicLayout>
  );
}
