# Program Afiliasi Habitutor ("Ajak Teman")

Dokumen ini menjelaskan keputusan bisnis dan teknis program afiliasi, untuk presentasi ke owner dan tim.

## Skema satu kalimat

Siswa membagikan kode atau link. Teman yang daftar lewat kode itu **hemat 15%** di pembelian Premium pertamanya, dan siswa yang mengajak mendapat **komisi 10%** dari uang yang benar-benar dibayar teman, tercatat sebagai saldo di akunnya. Pencairan saldo dilakukan manual lewat admin.

## Keputusan dan alasannya

| Keputusan | Pilihan | Alasan |
|---|---|---|
| Dasar komisi | 10% dari **jumlah yang dibayar** (setelah diskon 15%) | Afiliator tidak pernah dibayar dari uang yang tidak masuk. Contoh paket Rp200.000: teman bayar Rp170.000, afiliator Rp17.000, Habitutor menerima Rp153.000 (76,5% dari harga normal). |
| Diskon 15% | Berlaku di atas harga promo yang sedang jalan | Sesuai brief ("potongan langsung di awal"). Efek ke margin: di masa promo, harga akhir teman = harga promo x 0,85. Kalau margin terasa tipis, opsi cepat: ubah `BUYER_DISCOUNT_PERCENT` di `affiliate/logic.ts`. |
| Produk yang kena | Hanya paket Premium (5 paket) | Produk kecil (TryOut Rp10.000, event) komisinya hanya Rp1.000 dan rawan disalahgunakan. |
| Hanya pembelian pertama | Ya, satu pembeli = satu komisi | Fokus ke "konsumen baru", mencegah komisi berulang dari orang yang sama, dan memangkas penyalahgunaan. Sistem lama sudah membatasi satu pengguna = satu kode. |
| Masa tahan komisi | 7 hari sebelum bisa dicairkan | Memberi ruang untuk refund/chargeback. Komisi dari pembayaran yang di-refund otomatis dibatalkan. |
| Minimal pencairan | Rp50.000 | Biaya transfer dan waktu admin tidak sebanding untuk nominal kecil. |
| Pencairan | Manual: siswa isi rekening, admin transfer lalu isi nomor referensi | Midtrans tidak membagi saldo ke pengguna secara otomatis, dan volume awal kecil. Tidak butuh izin tambahan atau integrasi payout. |
| Midtrans payout otomatis | Ditunda | Ditinjau lagi kalau permintaan pencairan rutin melebihi kapasitas admin (perlu produk Midtrans Iris dan verifikasi bisnis). |

## Cara kerja untuk siswa

1. Menu **Ajak Teman** menampilkan kode, link pendek (`habitutor.id/r/KODE`), dan tombol bagikan ke WhatsApp dengan teks siap kirim.
2. Teman membuka link, halaman daftar terisi kode otomatis. Kode juga bisa diketik di halaman Premium.
3. Di halaman Premium, teman melihat harga setelah diskon sebelum membayar. Nominal akhir dihitung di server.
4. Setelah pembayaran sukses, komisi muncul di halaman afiliator sebagai "ditahan", lalu menjadi saldo setelah 7 hari.
5. Siswa mengajukan pencairan (nama bank, nomor, nama pemilik, jumlah). Admin transfer, lalu status berubah dan siswa mendapat notifikasi.

Siswa hanya melihat nama teman yang disamarkan ("Budi S."), tanpa email atau data pribadi.

## Cara kerja untuk admin

Menu **Afiliasi**: ringkasan (afiliator aktif, teman daftar, pembelian, omzet dari afiliasi, total komisi, menunggu ditransfer, sudah dibayar), antrean pencairan (tandai sudah ditransfer dengan nomor referensi, atau tolak dengan alasan), dan daftar afiliator beserta performanya.

## Pengaman (anti-curang)

- Tidak bisa memakai kode sendiri.
- Satu akun hanya bisa terikat ke satu kode, dan diskon hanya untuk pembelian Premium pertama.
- Saldo selalu dihitung dari catatan komisi dikurangi pencairan, jadi tidak ada angka saldo yang bisa menyimpang.
- Satu permintaan pencairan terbuka per orang, dikunci di database sehingga klik ganda tidak bisa menggandakan pencairan.
- Admin hanya bisa memproses permintaan yang masih terbuka (tidak bisa diproses dua kali).
- Refund membatalkan komisi otomatis. Jika pencairan sudah terlanjur dibayar, saldo tidak menjadi negatif, tetapi selisihnya perlu ditangani manual (karena itu ada masa tahan 7 hari).

## Saran promosi (bisa dijalankan tanpa menambah kode)

- **Momen utama:** tampilkan ajakan di halaman hasil try out dan setelah pembelian Premium, saat siswa paling puas. Tombol "Bagikan ke WhatsApp" sudah siap pakai.
- **Pesan yang dibawa teman:** "hemat 15%" lebih mudah dijual daripada "komisi". Untuk afiliator, tonjolkan contoh nyata ("2 teman beli = ratusan ribu").
- **Kampanye musiman:** naikkan diskon sementara menjelang UTBK lewat satu konstanta, umumkan lewat channel WA.
- **Pengakuan:** papan peringkat afiliator (nama disamarkan) dan hadiah non-tunai untuk top 3 bulanan, misalnya merchandise atau kelas tambahan.
- **Pantau tiga angka:** teman daftar, rasio beli, dan komisi sebagai persen dari omzet afiliasi (target sehat: di bawah 10-12% dari omzet).

## Ketentuan hukum dan pajak (perlu dicek dengan akuntan)

Komisi yang dibayarkan ke individu bisa menjadi objek pajak penghasilan. Sebelum nominal pencairan besar, putuskan kebijakan pencatatan dan pemotongan, dan cantumkan di syarat program. Skema ini satu tingkat (tidak ada komisi dari rekrutan afiliator lain), sehingga bukan skema berjenjang.

## Catatan teknis

- Tabel baru: `affiliate_commission` (satu baris per pembelian pertama teman) dan `affiliate_payout` (permintaan pencairan). Kode referral memakai tabel yang sudah ada.
- Kode baru 8 karakter huruf besar tanpa huruf yang mirip (mudah diketik). Kode lama 11 karakter tetap berlaku; pemilik yang belum dipakai teman boleh menukarnya.
- Semua angka bisnis ada di `packages/api/src/routers/affiliate/logic.ts` (`AFFILIATE`) dan teruji di `logic.test.ts`.
- Checkout mobile (`transaction/mobile.ts`) belum memakai diskon referral; web sudah.
- Migrasi: dibuat sebagai 0029 di branch ini. Kalau branch PTN Tour (migrasi 0029-0035) di-merge lebih dulu, migrasi ini perlu dibuat ulang (`bun run db:generate`) di atas nomor terakhir.
