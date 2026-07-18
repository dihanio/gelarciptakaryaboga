'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  order?: number;
  isVisible?: boolean;
}

const defaultNavItems: NavItem[] = [
  { label: 'BERANDA', href: '/' },
  { label: 'TENTANG', href: '/tentang' },
  { label: 'PESERTA', href: '/peserta' },
  { label: 'BOOTH', href: '/booth' },
  { label: 'JADWAL', href: '/jadwal' },
  { label: 'BERITA', href: '/berita' },
  { label: 'GALERI', href: '/galeri' },
  { label: 'KONTAK', href: '/kontak' },
];

export const Navbar: React.FC<{ siteName?: string; logo?: string; navItems?: NavItem[] }> = ({
  siteName = 'GELAR CIPTA',
  logo,
  navItems = defaultNavItems,
}) => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const visibleNavs = navItems.filter((item) => item.isVisible !== false);

  return (
    <nav
      aria-label="Main Navigation"
      className={cn(
        'fixed top-0 w-full max-w-[100vw] z-50 transition-all duration-500',
        isScrolled
          ? 'bg-background/85 backdrop-blur-xl border-b border-ivory-cream/10 py-3.5 md:py-4 shadow-2xl shadow-black/40'
          : 'bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm border-b border-ivory-cream/5 py-4 md:py-6'
      )}
    >
      <div className="flex justify-between items-center px-4 sm:px-6 md:px-10 max-w-[1400px] mx-auto">
        {/* Brand Focal Point */}
        <Link href="/" className="group flex items-center gap-2.5 sm:gap-3.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Logo_Universitas_Negeri_Surabaya.png"
            alt="Universitas Negeri Surabaya"
            className="h-9 sm:h-10 w-auto object-contain shrink-0"
          />
          <div className="h-6 sm:h-7 w-[1px] bg-ivory-cream/20 shrink-0"></div>
          {logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt={siteName} className="h-9 sm:h-10 w-auto object-contain shrink-0" />
          )}
          <span className="font-headline-md text-base sm:text-lg md:text-xl tracking-[0.12em] text-secondary uppercase group-hover:text-ivory-cream transition-colors duration-300 font-bold">
            {siteName}
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex gap-7 xl:gap-9 items-center">
          {visibleNavs.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'font-label-caps text-[11px] tracking-[0.2em] transition-all duration-300 relative py-1',
                  isActive
                    ? 'text-secondary font-semibold'
                    : 'text-on-surface-variant/80 hover:text-secondary'
                )}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-secondary animate-in fade-in duration-300" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Action Button: Always visible on both mobile & desktop */}
        <div className="flex items-center">
          <Link href="/tiket">
            <button className="border border-secondary bg-secondary/15 text-secondary hover:bg-secondary hover:text-dark-chocolate px-4 sm:px-6 py-2 sm:py-2.5 font-label-caps text-[10px] sm:text-[11px] tracking-[0.2em] transition-all duration-500 shadow-md">
              DAPATKAN PASS
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
