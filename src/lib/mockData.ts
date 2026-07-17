export const mockStatistics = {
  participantsCount: 45,
  boothsCount: 20,
  galleryCount: 150
};

export const mockHighlights = [
  {
    _id: 'mock-hl-1',
    name: 'Andi Pratama',
    workName: 'Inovasi Rendang Nabati Berbasis Jamur Tiram',
    photo: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
  },
  {
    _id: 'mock-hl-2',
    name: 'Siti Rahmawati',
    workName: 'Pemanfaatan Tepung Porang untuk Pastry',
    photo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    _id: 'mock-hl-3',
    name: 'Budi Santoso',
    workName: 'Fermentasi Tempe Koro Pedang',
    photo: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  }
];

export const mockTimeline = [
  {
    _id: 'mock-tl-1',
    startTime: '08:00',
    title: 'Registrasi & Pembukaan Pameran',
    speaker: 'Panitia Penyelenggara',
  },
  {
    _id: 'mock-tl-2',
    startTime: '10:00',
    title: 'Penilaian Karya Inovasi Boga',
    speaker: 'Dewan Juri (Dosen & Chef Profesional)',
  },
  {
    _id: 'mock-tl-3',
    startTime: '13:00',
    title: 'Talkshow Kewirausahaan Kuliner',
    speaker: 'Chef Vindex Tengker',
  },
  {
    _id: 'mock-tl-4',
    startTime: '15:30',
    title: 'Pengumuman Pemenang & Penutupan',
    speaker: 'Ketua Program Studi S1 Pendidikan Tata Boga',
  }
];

export const mockBooths = [
  {
    _id: 'mock-b-1',
    number: 'A1',
    name: 'Inovasi Pastry Lokal',
    participantName: 'Kelompok 1 - Angkatan 2023',
    photo: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    _id: 'mock-b-2',
    number: 'A2',
    name: 'Gastronomi Nusantara',
    participantName: 'Kelompok 2 - Angkatan 2023',
    photo: 'https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    _id: 'mock-b-3',
    number: 'B1',
    name: 'F&B Modern',
    participantName: 'Kelompok 3 - Angkatan 2023',
    photo: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    _id: 'mock-b-4',
    number: 'B2',
    name: 'Plant-based Diet',
    participantName: 'Kelompok 4 - Angkatan 2023',
    photo: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  }
];

export const mockGalleries = [
  {
    _id: 'mock-g-1',
    title: 'Persiapan Bahan Baku Lokal',
    url: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    _id: 'mock-g-2',
    title: 'Teknik Plating Modern',
    url: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    _id: 'mock-g-3',
    title: 'Uji Sensori',
    url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    _id: 'mock-g-4',
    title: 'Display Karya',
    url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    _id: 'mock-g-5',
    title: 'Presentasi Mahasiswa',
    url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    _id: 'mock-g-6',
    title: 'Sesi Penjurian',
    url: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
];

export const mockNews = [
  {
    _id: 'mock-n-1',
    slug: 'persiapan-gelar-cipta-2026',
    title: 'Persiapan Mahasiswa Jelang Gelar Cipta Karya Boga 2026',
    excerpt: 'Mahasiswa S1 Pendidikan Tata Boga UNESA tengah sibuk melakukan riset resep dan uji coba produk untuk dipamerkan.',
    category: 'Persiapan',
    publishedAt: new Date().toISOString(),
    coverImage: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    _id: 'mock-n-2',
    slug: 'pengumuman-dewan-juri',
    title: 'Profil Dewan Juri Profesional Gelar Cipta',
    excerpt: 'Tahun ini, acara akan mendatangkan tiga juri profesional dari industri F&B terkemuka di Indonesia.',
    category: 'Pengumuman',
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    coverImage: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    _id: 'mock-n-3',
    slug: 'tema-inovasi-pangan',
    title: 'Tema Tahun Ini: Inovasi Pangan Lokal Berkelanjutan',
    excerpt: 'Meningkatkan nilai jual bahan lokal nusantara menjadi hidangan standar industri global.',
    category: 'Artikel',
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    coverImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  }
];

export const mockCommittee = [
  {
    _id: 'mock-c-1',
    name: 'Dr. Siti Maimunah',
    position: 'Penanggung Jawab',
    division: 'Dosen Pembimbing',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    _id: 'mock-c-2',
    name: 'Ahmad Fauzi',
    position: 'Ketua Pelaksana',
    division: 'Mahasiswa Angkatan 2023',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    _id: 'mock-c-3',
    name: 'Rina Kusuma',
    position: 'Koordinator Acara',
    division: 'Seksi Acara',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    _id: 'mock-c-4',
    name: 'Deni Setiawan',
    position: 'Koordinator Pameran',
    division: 'Seksi Perlengkapan',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  }
];
