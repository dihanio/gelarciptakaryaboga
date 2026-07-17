'use client';

import React, { useState, useEffect, useRef } from 'react';
import QrScanner from 'qr-scanner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/providers/ToastProvider';
import type { IEvent, IVisitor } from '@/types';

export default function CheckInScannerPage() {
  const toast = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  const [activeEvent, setActiveEvent] = useState<IEvent | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [scanResult, setScanResult] = useState<{
    status: 'success' | 'already_used' | 'invalid' | null;
    message: string;
    visitor?: IVisitor;
    ticketNumber?: string;
  }>({ status: null, message: '' });

  useEffect(() => {
    fetch('/api/public/event')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setActiveEvent(data.data);
      });
  }, []);

  useEffect(() => {
    if (videoRef.current && activeEvent) {
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => handleScan(result.data),
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );
    }

    return () => {
      scannerRef.current?.destroy();
    };
  }, [activeEvent]);

  const startScanner = async () => {
    try {
      await scannerRef.current?.start();
      setIsScanning(true);
      setScanResult({ status: null, message: '' });
    } catch {
      toast.error('Gagal mengakses kamera. Pastikan izin kamera telah diberikan.');
    }
  };

  const stopScanner = () => {
    scannerRef.current?.stop();
    setIsScanning(false);
  };

  async function handleScan(code: string) {
    if (isSubmitting || !activeEvent) return;

    // Pause scanner briefly
    scannerRef.current?.stop();
    setIsScanning(false);
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/events/${activeEvent._id}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: code }),
      });

      const data = await res.json();

      if (data.success) {
        setScanResult({
          status: 'success',
          message: data.message,
          visitor: data.data.visitor,
          ticketNumber: data.data.ticketNumber,
        });
        toast.success(data.message);
      } else {
        setScanResult({
          status: data.status || 'invalid',
          message: data.message,
          visitor: data.visitor,
          ticketNumber: data.ticketNumber,
        });
        toast.error(data.message);
      }
    } catch {
      toast.error('Gagal memproses check-in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode) return;
    handleScan(manualCode);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-4 sm:p-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-lg font-bold">Portal Check-In Panitia</h1>
          <p className="text-xs text-slate-400">{activeEvent?.name || 'Gelar Cipta 2026'}</p>
        </div>
        <Badge variant="primary">Camera Scanner Active</Badge>
      </div>

      {/* Main Scanner Body */}
      <div className="max-w-md w-full mx-auto my-6 space-y-6">
        {/* Camera Box */}
        <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-950 border-2 border-slate-800 flex items-center justify-center">
          <video ref={videoRef} className="w-full h-full object-cover" />

          {!isScanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-950/90">
              <span className="text-4xl">📷</span>
              <p className="text-xs text-slate-400">Arahkan kamera ke QR Code pada E-Ticket pengunjung</p>
              <Button onClick={startScanner} size="md" className="rounded-full">
                Mulai Kamera Scanner
              </Button>
            </div>
          )}

          {isScanning && (
            <div className="absolute top-4 right-4 z-10">
              <Button onClick={stopScanner} variant="danger" size="sm" className="rounded-full">
                Matikan Kamera
              </Button>
            </div>
          )}
        </div>

        {/* Scan Result Box */}
        {scanResult.status && (
          <Card
            className={`p-5 space-y-3 border-2 text-center animate-in zoom-in-95 duration-200 ${
              scanResult.status === 'success'
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-100'
                : scanResult.status === 'already_used'
                ? 'bg-amber-950/80 border-amber-500 text-amber-100'
                : 'bg-rose-950/80 border-rose-500 text-rose-100'
            }`}
          >
            <p className="text-sm font-bold">{scanResult.message}</p>
            {scanResult.visitor && (
              <div className="text-xs space-y-1 pt-2 border-t border-white/20">
                <p className="font-bold text-white text-sm">{scanResult.visitor.name}</p>
                <p className="opacity-80">{scanResult.visitor.email}</p>
                {scanResult.visitor.organization && (
                  <p className="opacity-70">{scanResult.visitor.organization}</p>
                )}
              </div>
            )}
            <Button onClick={startScanner} variant="outline" size="sm" className="w-full mt-2 rounded-xl">
              Scan Tiket Selanjutnya →
            </Button>
          </Card>
        )}

        {/* Manual Input Form */}
        <Card variant="flat" className="p-4 bg-slate-800 border-slate-700 text-slate-200 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Input Manual Nomor Tiket</p>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <Input
              placeholder="Contoh: GC-A1B2C3D4"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
            />
            <Button type="submit" isLoading={isSubmitting} size="sm" className="rounded-xl shrink-0">
              Check-In
            </Button>
          </form>
        </Card>
      </div>

      {/* Footer Info */}
      <div className="text-center text-[11px] text-slate-500 pt-4 border-t border-slate-800">
        Status check-in akan diperbarui secara real-time ke sistem utama.
      </div>
    </div>
  );
}
