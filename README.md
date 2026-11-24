# Misi Anti-Korosi

Game edukatif Redoks-Korosi (3 misi, SDG 9 / SDG 12 / ESD 2).

## Menjalankan
Buka `index.html` langsung di browser, atau jalankan server lokal:

```bash
python3 -m http.server 8000
```

lalu buka http://localhost:8000 (atau buka via GitHub Pages jika di-hosting online).

## Fitur & Aturan Pengerjaan Siswa
- **1x Pengerjaan untuk Misi yang Tuntas**: Setiap misi yang sudah berhasil diselesaikan dan mencapai target KKM (minimal 60 poin, dapat diatur di Menu Guru) dinyatakan **Tuntas** dan tidak bisa diulang lagi.
- **Remedial / Coba Lagi jika Belum Tercapai**: Jika nilai siswa pada suatu misi belum mencapai target KKM, siswa diberi kesempatan untuk mencoba kembali (*remedial*) sampai mencapai target kelulusan.
- **Papan Skor Kelas Transparan (Melihat Hasil Teman)**: Siswa dapat melihat peringkat dan perolehan skor teman-teman sekelasnya secara langsung di Papan Skor.
- **Sinkronisasi Online Kelas (Google Sheets)**: Nilai dari HP/laptop semua siswa otomatis terkumpul rapi ke Google Spreadsheet guru secara *real-time*.
- **Menu Guru (PIN bawaan: `guru123`)**:
  - Salin Rekap Nilai kelas (format tabel Excel).
  - Pengaturan Target KKM Misi (misal: 60, 70, 75).
  - Pengaturan koneksi Google Sheets & Uji Koneksi.
  - Reset Skor jika diperlukan.

Untuk panduan lengkap menghubungkan Google Sheets agar data semua siswa tersimpan secara terpusat, baca [PANDUAN_PAPAN_SKOR_ONLINE.md](PANDUAN_PAPAN_SKOR_ONLINE.md).

## Catatan
- Semua kode (HTML, CSS, JS, ilustrasi SVG) ada di berkas `index.html`.
- Font Lilita One dan Nunito dimuat dari Google Fonts (perlu internet; tanpa itu tampil dengan font cadangan).
- PIN guru bawaan: `guru123` (Menu Papan Skor > Menu Guru). Dapat diganti di Menu Guru.
