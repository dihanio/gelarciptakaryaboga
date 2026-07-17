# Gelar Cipta Karya Boga — Event Management System (EMS)

Platform manajemen acara terintegrasi yang dibangun khusus untuk **Gelar Cipta Karya Boga**, persembahan mahasiswa S1 Pendidikan Tata Boga Universitas Negeri Surabaya (UNESA).

Sistem ini berfungsi sebagai etalase pameran digital (karya, galeri, jadwal, dll.) sekaligus portal manajemen bagi panitia untuk mengelola tiket, stan pameran, berita, peserta inovasi boga, serta pengaturan konten halaman secara *real-time*.

## ✨ Fitur Utama

- **Pameran Digital & Portofolio:** Tampilan eksklusif dan *premium* untuk melihat katalog karya, sorotan (highlights), galeri foto, serta tata letak stan (booth) pameran.
- **Manajemen Tiket (e-Ticket):** Penjualan, pemesanan, pembagian kuota, serta sistem validasi mandiri menggunakan *QR Code Scanner*.
- **Sistem Pengaturan Konten Terpusat (CMS):** Kontrol penuh atas seluruh teks, logo, navigasi, dan aset gambar pada Landing Page tanpa menyentuh *source code* (semuanya dinamis melalui *Section Renderer*).
- **Penjadwalan Dinamis:** Manajemen *rundown* acara, seminar, dan puncak penganugerahan.
- **Jurnal & Berita:** Modul publikasi untuk *press release* dan informasi seputar acara.

## 🛠️ Stack Teknologi

Sistem ini dikembangkan menggunakan tumpukan teknologi modern untuk skalabilitas dan performa maksimal:

- **Framework Utama:** [Next.js](https://nextjs.org/) (App Router) dengan React
- **Bahasa Pemrograman:** [TypeScript](https://www.typescriptlang.org/)
- **Styling & UI:** [Tailwind CSS v4](https://tailwindcss.com/) dengan pendekatan kustom *design tokens* untuk *brand identity* (Playfair Display, Geist)
- **Database & ORM:** [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Validasi Data:** [Zod](https://zod.dev/)
- **Ikonografi:** [Lucide React](https://lucide.dev/)

## 🚀 Persiapan Menjalankan Proyek (Local Development)

### Prasyarat:
1. **Node.js** versi 18.x atau yang lebih baru.
2. **MongoDB** instance (bisa menggunakan MongoDB Atlas atau instalasi lokal).

### Langkah-langkah Instalasi:

1. **Clone repositori:**
   ```bash
   git clone <repository-url>
   cd gelar-cipta
   ```

2. **Install dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables:**
   Buat file `.env` di root proyek dan konfigurasikan *environment variable* berikut (sesuaikan dengan nilai *database* Anda):
   ```env
   # Database Connection
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/gelar-cipta
   
   # NextAuth / Authentication (Jika nantinya diimplementasikan)
   NEXTAUTH_SECRET=rahasia_untuk_autentikasi_session
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Jalankan *Development Server*:**
   ```bash
   npm run dev
   ```

5. **Akses Aplikasi:**
   Buka [http://localhost:3000](http://localhost:3000) di browser untuk melihat Landing Page publik.

## 📁 Struktur Direktori Utama

```
src/
├── app/               # Next.js App Router (Halaman & Rute API)
├── components/        # Komponen UI React yang dapat digunakan kembali
│   ├── public/        # Komponen khusus untuk tampilan publik pengunjung
│   ├── layout/        # Komponen tata letak (Navbar, Footer, dsb)
│   ├── tickets/       # Komponen khusus E-Ticket
│   └── ui/            # Komponen dasar (Button, Input, dsb)
├── lib/               # Skrip utilitas, koneksi database, helper
├── models/            # Skema Mongoose & Model Database
└── types/             # Definisi antarmuka & tipe data TypeScript
```

## ⚖️ Lisensi & Hak Cipta

© 2026 Gelar Cipta Karya Boga.  
Program Studi S1 Pendidikan Tata Boga  
**Universitas Negeri Surabaya (UNESA)**.  
Hak cipta dilindungi undang-undang.
