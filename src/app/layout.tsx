import type { Metadata } from 'next';
import Script from 'next/script';
import { Playfair_Display } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import { ToastProvider } from '@/providers/ToastProvider';

// Import Google Fonts
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-playfair',
  display: 'swap',
});

// Geist can be loaded via localFont if it's available locally, or we can use next/font/google if available
// Actually Next.js 14+ supports Geist via next/font/local if installed, but since we are not sure, we will just use Inter as a fallback or standard import.
// For now, let's load Google Fonts directly via a <link> in the head for Material Symbols and Geist if needed, but since we want to be performant, let's just use Inter for sans-serif if Geist is not in next/font/google, wait Next.js provides Geist since v15!
import { Geist, Geist_Mono } from 'next/font/google';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'Gelar Cipta Karya Boga 2026 — S1 Pendidikan Tata Boga UNESA',
    template: '%s | Gelar Cipta Karya Boga UNESA',
  },
  description: 'Platform resmi pameran karya inovasi boga dan ticketing digital mahasiswa S1 Pendidikan Tata Boga Universitas Negeri Surabaya.',
  keywords: ['Gelar Cipta Karya Boga', 'Pameran Tata Boga UNESA', 'UNESA Culinary', 'Tata Boga 2023 UNESA', 'Graha UNESA'],
  icons: {
    icon: '/logogelarciptaboga.png',
    shortcut: '/logogelarciptaboga.png',
    apple: '/logogelarciptaboga.png',
  },
};

import type { Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        {/* Material Symbols Outlined */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${playfair.variable} ${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900 overflow-x-hidden max-w-[100vw]`}>
        <ToastProvider>{children}</ToastProvider>
        <Script
          src={
            process.env.MIDTRANS_IS_PRODUCTION === 'true'
              ? 'https://app.midtrans.com/snap/snap.js'
              : 'https://app.sandbox.midtrans.com/snap/snap.js'
          }
          data-client-key={process.env.MIDTRANS_CLIENT_KEY || ''}
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
