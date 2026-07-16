# 🌽 Antrian Jagung — Sistem Kasir Sederhana

Website kasir sederhana untuk usaha **Antrian Jagung**, menggunakan Bootstrap 5, HTML, CSS, JavaScript murni, dan **Google Spreadsheet** sebagai database (tanpa MySQL). Backend berjalan di **Google Apps Script**.

## ✨ Fitur

- Nomor antrian otomatis (format `A001`, `A002`, ...), tetap berlanjut walau halaman direfresh.
- Menu: Jagung Bakar (Original/Coklat), Jagung Manis (Original/Coklat), Corn Ribs — dengan tombol `+` / `-`.
- Perhitungan subtotal & total otomatis, format Rupiah.
- Pilihan metode pembayaran: QRIS atau Cash (wajib dipilih).
- Validasi sebelum simpan (minimal 1 menu dipilih & metode pembayaran dipilih).
- Data tersimpan otomatis ke baris terakhir Google Spreadsheet.
- Riwayat transaksi hari ini.
- Statistik hari ini: jumlah transaksi, total omzet, menu terlaris.
- Cetak struk sederhana.
- Dark mode (tersimpan di browser).
- Notifikasi menggunakan SweetAlert2 & loading spinner saat menyimpan.
- Tampilan responsive (desktop, tablet, smartphone).

## 📁 Struktur Folder

```
Jagung-Antrian/
├── index.html   → Halaman utama (SPA)
├── style.css    → Tampilan (warna hijau & kuning jagung, dark mode)
├── script.js    → Logika kasir & komunikasi ke Google Apps Script
├── Code.gs      → Backend Google Apps Script (disimpan ke Spreadsheet)
└── README.md    → Panduan ini
```

## 🚀 Cara Instalasi

### 1. Siapkan Google Spreadsheet

1. Buka [Google Sheets](https://sheets.google.com) dan buat spreadsheet baru, beri nama misalnya **Data Antrian Jagung**.
2. Buka menu **Extensions > Apps Script**.
3. Hapus isi default `Code.gs`, lalu salin-tempel seluruh isi file `Code.gs` dari folder ini.
4. Di dropdown fungsi (bagian atas editor), pilih fungsi **`setupSheet`**, lalu klik **Run** ▶️ satu kali. Ini akan membuat sheet **"Transaksi"** beserta header kolom secara otomatis.
   - Saat pertama kali menjalankan, Google akan meminta izin akses (Authorize). Ikuti langkah izinnya (klik akun Anda → Advanced → Go to project (unsafe) → Allow). Ini normal karena script milik Anda sendiri.

### 2. Deploy sebagai Web App

1. Di editor Apps Script, klik **Deploy > New deployment**.
2. Pilih tipe **Web app**.
3. Atur:
   - **Execute as**: Me (email Anda)
   - **Who has access**: Anyone
4. Klik **Deploy**, lalu salin **URL Web App** yang muncul (berbentuk `https://script.google.com/macros/s/xxxxxxx/exec`).

> Setiap kali Anda mengubah isi `Code.gs`, buat **New deployment** baru (atau **Manage deployments > Edit > New version**) agar perubahan aktif di URL yang sama.

### 3. Hubungkan Website ke Web App

1. Buka file `script.js`.
2. Cari baris berikut di bagian paling atas:
   ```js
   const API_URL = "GANTI_DENGAN_URL_WEB_APP_ANDA";
   ```
3. Ganti dengan URL Web App yang sudah Anda salin di langkah sebelumnya.

### 4. Jalankan Website

- Buka file `index.html` langsung di browser, **atau**
- Upload seluruh folder ke hosting statis (GitHub Pages, Netlify, Vercel, dll).

Website siap digunakan oleh kasir untuk mencatat pesanan.

## 🎨 Kustomisasi Harga Menu

Buka `script.js`, cari objek `HARGA` di bagian atas file:

```js
const HARGA = {
  bakarOriginal: { nama: "Jagung Bakar Original", harga: 10000 },
  bakarCoklat: { nama: "Jagung Bakar Coklat", harga: 12000 },
  manisOriginal: { nama: "Jagung Manis Original", harga: 8000 },
  manisCoklat: { nama: "Jagung Manis Coklat", harga: 10000 },
  cornRibs: { nama: "Corn Ribs", harga: 15000 },
};
```

Ubah angka `harga` sesuai kebutuhan — tampilan & perhitungan akan otomatis mengikuti.

## 📊 Struktur Kolom Spreadsheet (Sheet: `Transaksi`)

| No | Tanggal | Jam | Nomor Antrian | Jagung Bakar Original | Jagung Bakar Coklat | Jagung Manis Original | Jagung Manis Coklat | Corn Ribs | Total | Metode Pembayaran | Timestamp |
|----|---------|-----|----------------|------------------------|----------------------|-------------------------|------------------------|-----------|-------|--------------------|-----------|

Setiap transaksi baru otomatis ditambahkan ke baris paling bawah.

## ❓ Catatan Teknis (CORS)

Google Apps Script Web App tidak mendukung header CORS kustom. Agar permintaan dari browser tidak diblokir oleh *preflight* `OPTIONS`, `script.js` mengirim data dengan header `Content-Type: text/plain;charset=utf-8` saat `POST`. Ini adalah trik yang umum digunakan agar Apps Script Web App bisa diakses langsung dari website statis tanpa server tambahan.

## 🛠️ Troubleshooting

- **Nomor antrian selalu kembali ke A001** → pastikan `API_URL` di `script.js` sudah benar dan fungsi `setupSheet` sudah dijalankan.
- **Gagal menyimpan / error saat klik "Tambah Pesanan"** → pastikan Web App di-deploy dengan akses **Anyone**, dan URL yang dipakai adalah URL deployment terbaru.
- **Data tidak muncul di riwayat hari ini** → periksa zona waktu skrip (`Project Settings > Time zone` di Apps Script) agar sesuai dengan zona waktu lokal Anda.

---

Dibuat dengan 🌽 untuk usaha Antrian Jagung.
