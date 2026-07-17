'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/providers/ToastProvider';

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Mohon isi email dan password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login gagal');
      }

      toast.success(`Selamat datang kembali, ${data.data.name}!`);

      if (data.data.role === 'checkin_officer') {
        router.push('/checkin');
      } else {
        router.push('/admin');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'Terjadi kesalahan tidak terduga');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />

      <Card className="max-w-md w-full p-8 space-y-6 glass-dark border-slate-800 text-white relative z-10">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-amber-400 flex items-center justify-center text-white font-black text-2xl mx-auto shadow-lg shadow-indigo-950">
            GC
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Portal Log In Panitia</h1>
          <p className="text-xs text-slate-400">Gelar Cipta Event Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email *"
            placeholder="admin@gelarcipta.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
            required
          />

          <Input
            type="password"
            label="Password *"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
            required
          />

          <Button type="submit" isLoading={isLoading} size="lg" className="w-full rounded-xl py-3 mt-2 font-bold">
            Masuk ke Dashboard →
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800/80">
          <Link href="/" className="text-xs text-slate-400 hover:text-indigo-400 transition-colors">
            ← Kembali ke Website Utama
          </Link>
        </div>
      </Card>
    </div>
  );
}
