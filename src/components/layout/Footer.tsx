import React from 'react';
import Link from 'next/link';
import { Globe } from 'lucide-react';
import { InstagramIcon, TikTokIcon, YouTubeIcon, TwitterXIcon } from '@/components/ui/BrandIcons';

interface FooterProps {
  siteName?: string;
  logo?: string;
  description?: string;
  contact?: {
    phone?: string;
    whatsapp?: string;
    email?: string;
  };
  socialMedia?: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    twitter?: string;
    website?: string;
  };
}

const NAV_LINKS = [
  { label: 'BERANDA', href: '/' },
  { label: 'TENTANG', href: '/tentang' },
  { label: 'PESERTA', href: '/peserta' },
  { label: 'BOOTH', href: '/booth' },
  { label: 'JADWAL', href: '/jadwal' },
  { label: 'BERITA', href: '/berita' },
  { label: 'GALERI', href: '/galeri' },
  { label: 'KONTAK', href: '/kontak' },
] as const;

export const Footer: React.FC<FooterProps> = ({
  siteName = 'Gelar Cipta',
  logo,
  description,
  socialMedia,
}) => {
  const hasSocials =
    socialMedia?.instagram ||
    socialMedia?.tiktok ||
    socialMedia?.youtube ||
    socialMedia?.twitter ||
    socialMedia?.website;

  return (
    <footer className="bg-surface-container-lowest border-t border-ivory-cream/10 w-full py-14 mt-auto">
      {/* Top Row */}
      <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
        {/* Brand */}
        <div className="text-center md:text-left shrink-0">
          <div className="flex items-center justify-center md:justify-start gap-3.5 mb-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Logo_Universitas_Negeri_Surabaya.png"
              alt="Universitas Negeri Surabaya"
              className="h-10 md:h-12 w-auto object-contain shrink-0"
            />
            <div className="h-7 w-[1px] bg-ivory-cream/20 shrink-0"></div>
            {logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt={siteName} className="h-10 md:h-12 w-auto object-contain shrink-0" />
            )}
          </div>
          <div className="font-headline-md text-secondary uppercase tracking-[0.15em] text-xs font-bold">
            {siteName}
          </div>
          {description && (
            <p className="text-outline text-[11px] mt-1 max-w-[220px] font-body-md leading-relaxed">{description}</p>
          )}
        </div>

        {/* Navigation Links */}
        <nav aria-label="Footer Navigation" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-label-caps text-[10px] tracking-[0.2em] text-on-surface-variant/80 hover:text-secondary transition-colors duration-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Social SVG Brand Icons */}
        {hasSocials && (
          <div className="flex items-center gap-4 shrink-0">
            {socialMedia?.instagram && (
              <a
                href={socialMedia.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-on-surface-variant/80 hover:text-secondary transition-colors duration-300 p-1"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
            )}
            {socialMedia?.tiktok && (
              <a
                href={socialMedia.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="text-on-surface-variant/80 hover:text-secondary transition-colors duration-300 p-1"
                aria-label="TikTok"
              >
                <TikTokIcon className="w-4 h-4" />
              </a>
            )}
            {socialMedia?.youtube && (
              <a
                href={socialMedia.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="text-on-surface-variant/80 hover:text-secondary transition-colors duration-300 p-1"
                aria-label="YouTube"
              >
                <YouTubeIcon className="w-4 h-4" />
              </a>
            )}
            {socialMedia?.twitter && (
              <a
                href={socialMedia.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-on-surface-variant/80 hover:text-secondary transition-colors duration-300 p-1"
                aria-label="Twitter"
              >
                <TwitterXIcon className="w-4 h-4" />
              </a>
            )}
            {socialMedia?.website && (
              <a
                href={socialMedia.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-on-surface-variant/80 hover:text-secondary transition-colors duration-300 p-1"
                aria-label="Website"
              >
                <Globe className="w-4 h-4" aria-hidden="true" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Copyright Bar */}
      <div className="max-w-[1280px] mx-auto px-6 mt-10 pt-6 border-t border-ivory-cream/5 text-center">
        <p className="font-label-caps text-[10px] tracking-[0.2em] text-outline">
          © {new Date().getFullYear()} GELAR CIPTA KARYA BOGA. S1 PENDIDIKAN TATA BOGA — UNIVERSITAS NEGERI SURABAYA
        </p>
      </div>
    </footer>
  );
};
