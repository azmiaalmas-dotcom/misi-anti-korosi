# Panduan Integrasi Papan Skor Online (Google Sheets)

Game **Misi Anti-Korosi** kini mendukung sinkronisasi nilai secara otomatis dari HP/laptop semua siswa ke satu **Google Sheets terpusat milik guru**.

---

## ❓ Mengapa Sebelumnya Nilai Tidak Muncul?

Sebelum integrasi ini diaktifkan, game bekerja dengan sistem:
1. **Penyimpanan Lokal (`localStorage`)**: Skor siswa tersimpan di memori browser HP masing-masing, sehingga guru atau siswa lain di perangkat berbeda tidak bisa melihatnya.
2. **Syarat 3 Level**: Sebelumnya, nama siswa baru muncul jika sudah menuntaskan ketiga level dengan skor minimal 1 bintang. Sekarang, **siswa yang menyelesaikan minimal 1 level pun langsung tercatat**.

Dengan menghubungkan **Google Sheets**, setiap kali siswa menyelesaikan level di HP-nya, nilainya **langsung masuk ke Google Spreadsheet guru secara otomatis dan real-time**.

---

## 🚀 Langkah 1: Buat Google Spreadsheet & Apps Script (Hanya 2 Menit)

1. Buka browser dan buat spreadsheet baru di **[Google Sheets](https://sheets.new)**.
2. Beri nama file spreadsheet, misalnya: `Nilai Game Misi Anti-Korosi`.
3. Pada menu atas, klik **Ekstensi (Extensions)** > **Apps Script**.
4. Hapus semua kode bawaan yang ada di editor Apps Script (`myFunction`), lalu **ganti dengan seluruh kode di bawah ini**:

```javascript
// =========================================================================
// KODE GOOGLE APPS SCRIPT - PAPAN SKOR MISI ANTI-KOROSI
// =========================================================================

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  setupSheetIfNeeded(sheet);
  
  var p = e ? e.parameter : {};
  if (p && p.data) {
    try {
      var item = JSON.parse(p.data);
      saveOrUpdateScore(sheet, item);
    } catch (err) {}
  }
  
  return ContentService.createTextOutput(JSON.stringify(getScores(sheet)))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  setupSheetIfNeeded(sheet);
  
  if (e && e.postData && e.postData.contents) {
    try {
      var item = JSON.parse(e.postData.contents);
      saveOrUpdateScore(sheet, item);
    } catch (err) {}
  }
  
  return ContentService.createTextOutput(JSON.stringify(getScores(sheet)))
    .setMimeType(ContentService.MimeType.JSON);
}

function setupSheetIfNeeded(s) {
  if (s.getLastRow() === 0) {
    s.appendRow([
      "Nama Siswa",
      "Level 1",
      "Level 2",
      "Level 3",
      "Nilai Akhir",
      "Bintang",
      "Total Waktu (detik)",
      "Status",
      "Terakhir Diperbarui"
    ]);
    s.getRange(1, 1, 1, 9).setFontWeight("bold").setBackground("#d9edf7");
    s.setFrozenRows(1);
  }
}

function saveOrUpdateScore(s, d) {
  if (!d || !d.name) return;
  var rows = s.getDataRange().getValues();
  var key = String(d.name).trim().toLowerCase();
  var rowIdx = -1;
  
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim().toLowerCase() === key) {
      rowIdx = i + 1;
      break;
    }
  }
  
  var rowData = [
    d.name,
    d.lv1 || 0,
    d.lv2 || 0,
    d.lv3 || 0,
    d.score || 0,
    d.stars || 0,
    d.time || 0,
    d.status || (d.completed ? "Selesai" : "Progres"),
    new Date().toLocaleString("id-ID")
  ];
  
  if (rowIdx > 0) {
    s.getRange(rowIdx, 1, 1, 9).setValues([rowData]);
  } else {
    s.appendRow(rowData);
  }
}

function getScores(s) {
  var rows = s.getDataRange().getValues();
  if (rows.length <= 1) return [];
  var out = [];
  for (var i = 1; i < rows.length; i++) {
    out.push({
      name: rows[i][0],
      lv1: Number(rows[i][1]) || 0,
      lv2: Number(rows[i][2]) || 0,
      lv3: Number(rows[i][3]) || 0,
      score: Number(rows[i][4]) || 0,
      stars: Number(rows[i][5]) || 0,
      time: Number(rows[i][6]) || 0,
      status: rows[i][7] || "",
      updatedAt: rows[i][8] || ""
    });
  }
  return out;
}
```

5. Klik tombol **Simpan (ikon disket)** di atas.

---

## 🌐 Langkah 2: Terapkan Sebagai Aplikasi Web (Deploy as Web App)

1. Di pojok kanan atas Apps Script, klik tombol biru **Terapkan (Deploy)** > **Penerapan baru (New deployment)**.
2. Klik ikon roda gigi di samping *Select type* (Pilih jenis), pilih **Aplikasi Web (Web App)**.
3. Konfigurasikan:
   - **Deskripsi**: `Papan Skor Game`
   - **Jalankan sebagai (Execute as)**: `Saya (email Google Anda)`
   - **Siapa yang memiliki akses (Who has access)**: **Siapa saja (Anyone)** *(Wajib dipilih agar siswa tidak perlu login akun Google pengembang)*.
4. Klik **Terapkan (Deploy)**.
5. Jika muncul jendela *"Beri otorisasi akses (Authorize access)"*, klik akun Google Anda, klik *Advanced* / *Lanjutan*, lalu klik *Go to (buka proyek)*, dan klik **Allow / Izinkan**.
6. Salin **URL Aplikasi Web (Web App URL)** yang berakhiran `/exec`.
   *(Format URL: `https://script.google.com/macros/s/AKfycb.../exec`)*

---

## 🔗 Langkah 3: Masukkan URL ke Game

Ada 2 cara mudah:

### Cara A: Masukkan Lewat Tampilan Game (Menu Guru)
1. Buka game di browser.
2. Klik tombol **Papan Skor** di menu utama.
3. Klik tombol **Menu Guru** di bagian bawah papan skor.
4. Masukkan PIN guru bawaan: `guru123`.
5. Tempel URL Web App ke kolom **Papan Skor Online (Google Sheets)**, lalu klik **Simpan URL** dan **Uji Koneksi**.

### Cara B: Tempel Permanen di `index.html` (Sangat Disarankan!)
Jika game di-hosting di GitHub Pages agar semua siswa otomatis terhubung:
1. Buka file `index.html`.
2. Pada baris ke-511, cari:
   ```javascript
   var SYNC_CONFIG = {
     sheetUrl: ''
   };
   ```
3. Tempel URL Web App di dalam tanda kutip:
   ```javascript
   var SYNC_CONFIG = {
     sheetUrl: 'https://script.google.com/macros/s/AKfycb.../exec'
   };
   ```
4. Simpan file, lalu commit dan push ke GitHub:
   ```bash
   git add index.html
   git commit -m "Aktifkan sinkronisasi papan skor Google Sheets"
   git push origin main
   ```

---

## ✨ Hasil & Keuntungan
- Siswa bermain di HP/laptop masing-masing: nilai **Level 1, Level 2, Level 3, Nilai Rata-rata, Bintang, dan Waktu** otomatis terisi rapi di Google Sheets guru.
- Jika siswa mengulang level untuk memperbaiki nilai, baris siswa tersebut otomatis **diperbarui (tidak dobel/duplikat)**.
- Guru dapat langsung mengunduh rekap nilai ke format **Excel (.xlsx)** atau **PDF** kapan saja.
- Papan skor di game memiliki tombol **🔄 Segarkan Skor** untuk memuat skor terbaru dari seluruh kelas secara real-time.
