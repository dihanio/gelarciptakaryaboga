import mongoose from 'mongoose';
import { Event } from '../src/models/Event';
import { PageSection } from '../src/models/PageSection';
import { WebsiteSettings } from '../src/models/WebsiteSettings';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gelar-cipta';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create Event
    const event = await Event.findOneAndUpdate(
      { slug: 'gelar-cipta-2026' },
      {
        name: 'Gelar Cipta Karya Boga 2026',
        slug: 'gelar-cipta-2026',
        theme: 'Inovasi Boga S1 Pendidikan Tata Boga 2023',
        description: 'Pameran karya inovasi boga persembahan S1 Pendidikan Tata Boga 2023 Universitas Negeri Surabaya.',
        date: new Date('2026-11-21T08:00:00'),
        time: '08:00 - selesai',
        location: {
          name: 'Graha UNESA',
          address: 'Kampus UNESA Lidah Wetan, Surabaya',
          mapUrl: 'https://maps.google.com/?q=Graha+UNESA',
        },
        logo: '/logogelarciptaboga.png',
        status: 'active',
        createdBy: new mongoose.Types.ObjectId(),
      },
      { upsert: true, new: true }
    );

    console.log('Event seeded:', event.name);

    // Create Website Settings
    await WebsiteSettings.findOneAndUpdate(
      {},
      {
        siteName: 'Gelar Cipta Karya Boga',
        siteDescription: 'Pameran Inovasi Boga S1 Pendidikan Tata Boga Universitas Negeri Surabaya',
        siteLogo: '/logogelarciptaboga.png',
        favicon: '/logogelarciptaboga.png',
        activeEventId: event._id,
        contact: {
          email: 'ciptakaryabogaunesa@gmail.com',
        },
        socialMedia: {
          instagram: 'https://instagram.com/ciptakaryabogaunesa',
          tiktok: 'https://tiktok.com/@ciptakaryabogaunesa',
          youtube: 'https://www.youtube.com/@ciptakaryabogaunesa8394',
        },
      },
      { upsert: true }
    );

    console.log('Website Settings seeded');

    // Create Page Sections for Landing Page
    const sections = [
      { sectionType: 'hero', order: 1 },
      {
        sectionType: 'about',
        order: 2,
        title: 'EXHIBITION & KRITERIA INOVASI KARYA BOGA 2026',
        subtitle: 'KARYA PUNCAK GASTRONOMI MAHASISWA S1 PENDIDIKAN TATA BOGA 2023',
        content:
          'Gelar Cipta Karya Boga 2026 adalah perwujudan simfoni antara warisan citra rasa Nusantara, riset sains bahan pangan, dan eksplorasi seni penyajian modern berstandar industri kuliner global persembahan S1 Pendidikan Tata Boga 2023 Universitas Negeri Surabaya.',
      },
      { sectionType: 'stats', order: 3 },
      { sectionType: 'highlights', order: 4 },
      { sectionType: 'booth', order: 5 },
      { sectionType: 'gallery_preview', order: 6 },
      { sectionType: 'timeline', order: 7 },
      { sectionType: 'news', order: 8 },
      { sectionType: 'committee', order: 9 },
      { sectionType: 'sponsors', order: 10 },
      { sectionType: 'cta', order: 11 },
    ];

    await PageSection.deleteMany({ event: event._id, page: 'landing' });

    for (const sec of sections) {
      await PageSection.create({
        event: event._id,
        page: 'landing',
        sectionType: sec.sectionType,
        title: sec.title,
        subtitle: sec.subtitle,
        content: sec.content,
        order: sec.order,
        isVisible: true,
      });
    }

    console.log('Page Sections seeded');

    // Create Ticket Types
    const TicketType = mongoose.models.TicketType || (await import('../src/models/TicketType')).TicketType;
    await TicketType.deleteMany({ event: event._id });

    await TicketType.create([
      {
        event: event._id,
        name: 'Tiket Civitas / Mahasiswa Tata Boga UNESA',
        description: 'Khusus mahasiswa, alumni, dan dosen S1 Pendidikan Tata Boga UNESA.',
        price: 15000,
        currency: 'IDR',
        quota: 500,
        sold: 0,
        isActive: true,
        benefits: [
          'Akses Seluruh Area Pameran Graha UNESA',
          'Katalog Digital Inovasi Karya Boga 2026',
          'E-Ticket QR Code Verifikasi Instan',
        ],
        order: 1,
      },
      {
        event: event._id,
        name: 'Tiket Umum & Pengunjung Publik',
        description: 'Akses pameran inovasi boga untuk profesional industri kuliner dan masyarakat umum.',
        price: 25000,
        currency: 'IDR',
        quota: 1000,
        sold: 0,
        isActive: true,
        benefits: [
          'Akses Seluruh Area Pameran Graha UNESA',
          'Sesi Presentasi & Tasting Inovasi Kuliner',
          'Katalog Digital Inovasi Karya Boga 2026',
          'E-Ticket QR Code Verifikasi Instan',
        ],
        order: 2,
      },
    ]);

    console.log('Ticket Types seeded');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
