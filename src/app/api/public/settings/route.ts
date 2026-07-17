import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { WebsiteSettings } from '@/models/WebsiteSettings';
import type { IWebsiteSettings, ApiResponse } from '@/types';

export async function GET(): Promise<NextResponse<ApiResponse<IWebsiteSettings>>> {
  try {
    await connectDB();

    const settings = await WebsiteSettings.findOne().populate('activeEventId', 'name slug date location theme logo banner').lean();

    if (!settings) {
      return NextResponse.json({
        success: true,
        data: {
          siteName: 'Gelar Cipta UNESA',
          siteDescription: 'Pameran Karya & Inovasi Mahasiswa S1 Pendidikan Tata Boga Universitas Negeri Surabaya',
          contact: { phone: '', whatsapp: '', email: '' },
          socialMedia: {},
          navigation: [
            { label: 'Beranda', href: '/', order: 1, isVisible: true },
            { label: 'Tentang', href: '/tentang', order: 2, isVisible: true },
            { label: 'Peserta', href: '/peserta', order: 3, isVisible: true },
            { label: 'Booth', href: '/booth', order: 4, isVisible: true },
            { label: 'Jadwal', href: '/jadwal', order: 5, isVisible: true },
            { label: 'Berita', href: '/berita', order: 6, isVisible: true },
            { label: 'Galeri', href: '/galeri', order: 7, isVisible: true },
            { label: 'Kontak', href: '/kontak', order: 8, isVisible: true },
          ],
          footer: { copyright: '© 2026 S1 Pendidikan Tata Boga UNESA' },
        } as unknown as IWebsiteSettings,
      });
    }

    return NextResponse.json({ success: true, data: settings as unknown as IWebsiteSettings });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
