# SURAT — Platform Pembuatan & Publikasi Undangan Digital SaaS

SURAT adalah platform SaaS modern untuk pembuatan dan publikasi surat/undangan digital profesional berbasis satu aplikasi utama (*Single-Site Architecture*) dengan *dynamic routing* berbasis slug (`https://surat.netlify.com/:slug`).

---

## 🌟 Fitur Utama

1. **Harga Tetap Rp5.000 (Satu Kali Bayar)**: Tanpa biaya berlangganan atau perpanjangan.
2. **Dynamic Slug Routing**: Tidak membuat situs Netlify baru per pelanggan. Semua undangan (`/undangan-nikah-Ax`, `/undangan-bisnis-X7`) dilayani secara dinamis oleh aplikasi utama.
3. **17 Kategori Acara**: Pernikahan, Ulang Tahun, Aqiqah, Khitanan, Tasyakuran, Pengajian, Reuni, Rapat, Bisnis, Seminar, Workshop, Grand Opening, Event, Wisuda, Organisasi, Sekolah, dan Custom.
4. **Formulir Dinamis**: Kolom input secara otomatis menyesuaikan kategori yang dipilih (misal: data mempelai untuk pernikahan vs nama perusahaan/pembicara untuk bisnis).
5. **Real-time Slug Validator**: Memeriksa ketersediaan slug secara langsung dengan rekomendasi alternatif otomatis jika slug sudah digunakan.
6. **Live Mobile & Desktop Preview**: Pengguna dapat melihat tampilan undangan secara langsung sebelum melakukan pembayaran.
7. **Verifikasi Pembayaran QRIS Manual**:
   - Total pembayaran Rp5.000 via scan QRIS resmi.
   - Pengguna mengunggah bukti transfer (struk/screenshot) dengan validasi tipe file gambar (JPG/PNG/WEBP) dan ukuran maksimal 5MB.
   - Status awal: `PENDING` (MENUNGGU VERIFIKASI ADMIN).
   - Akses publik dan download ZIP hanya aktif setelah admin menyetujui (`PAID`).
8. **Ekspor Standalone Website ZIP**:
   - Mengenerate file `.zip` mandiri berisi `index.html`, `style.css`, `script.js`, dan aset gambar.
   - File ZIP dapat di-hosting mandiri di Netlify Drop, GitHub Pages, atau cPanel mana pun tanpa dependensi ke server utama.
9. **Personal Guest Greeting (`?to=Nama+Tamu`)**:
   - Menghasilkan tautan personal untuk dibagikan via WhatsApp dengan nama tamu tertulis elegan di sampul depan (contoh: `/undangan-nikah-rendi-jihan?to=Budi+Santoso`).
10. **Admin Panel Komprehensif (`/admin`)**:
    - Login aman dengan hashing password (tanpa plaintext).
    - Dashboard Analytics (omset, konversi, undangan aktif, template terpopuler).
    - Verifikasi pesanan (Approve / Reject dengan alasan penolakan).
    - Integrasi notifikasi WhatsApp 1-klik ke pelanggan.
    - Manajemen template, kategori, media, QRIS merchant, dan pengaturan website.

---

## 🚀 Panduan Instalasi & Pengembangan Lokal

```bash
# 1. Clone repositori
git clone <repo-url>
cd surat

# 2. Install dependensi
npm install

# 3. Jalankan server pengembangan lokal (Port 3000)
npm run dev
```

Buka browser di `http://localhost:3000`.

---

## 🌐 Deployment ke Netlify

1. **Build Command**: `npm run build`
2. **Publish Directory**: `dist`
3. **Konfigurasi Single Page Application (SPA)**:
   File `netlify.toml` sudah dikonfigurasi secara otomatis:
   ```toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```
   Hal ini memastikan semua URL dinamis seperti `/undangan-nikah-rendi-jihan` atau `/admin` ditangani oleh router frontend.

---

## 🔐 Kredensial Default Admin Panel

- **URL Akses**: `/admin` atau klik link "Admin Portal" di navbar/footer.
- **Username**: `admin`
- **Password**: `admin123`
*(Password di-hash menggunakan SHA-256 dan sesi disimpan secara aman).*

---

## 📁 Struktur Direktori

```
├── netlify.toml                # Konfigurasi SPA routing Netlify
├── index.html                  # HTML entry point dengan Google Fonts
├── metadata.json               # Metadata aplikasi
├── src/
│   ├── main.tsx                # Entry point React
│   ├── App.tsx                 # Router dinamis (Landing, Wizard, Status, Admin, :slug)
│   ├── index.css               # Tailwind CSS & custom typography
│   ├── types.ts                # Model data TypeScript (Order, Category, Template, dll)
│   ├── services/
│   │   ├── storage.ts          # Layanan mock database localStorage dengan data bibit
│   │   ├── auth.ts             # Layanan hashing SHA-256 & sesi admin
│   │   └── zipGenerator.ts     # Generator file ZIP website mandiri (JSZip)
│   ├── components/
│   │   ├── Navbar.tsx          # Navigasi responsif
│   │   ├── Footer.tsx          # Footer informatif
│   │   ├── SlugAvailability.tsx# Validator ketersediaan slug real-time
│   │   └── ShareModal.tsx      # Modal generator tautan WhatsApp tamu khusus
│   └── views/
│       ├── LandingPage.tsx     # Landing page (Hero, Cara Kerja, Kategori, Harga, FAQ)
│       ├── CreateWizard.tsx    # 6-Step pembuatan undangan berformulir dinamis
│       ├── CheckoutPage.tsx    # Halaman QRIS Rp5.000 & upload bukti transfer
│       ├── OrderStatusPage.tsx # Status order (Pending, Paid, Rejected) & download ZIP
│       ├── InvitationView.tsx  # Tampilan interaktif undangan digital (cover, RSVP, audio)
│       ├── AdminPanel.tsx      # Dashboard admin lengkap
│       └── AdminLogin.tsx      # Login portal admin
```

---

## 📄 Lisensi
Apache-2.0
