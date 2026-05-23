-- ============================================
-- HABITUTOR TRYOUT TEST DATA
-- ============================================

-- 1. Update existing siswa@test.com to have proper data
UPDATE public."user" SET email_verified = true WHERE email = 'siswa@test.com';

-- 2. Create admin user (password will be set via API)
-- We'll update the role to 'admin' for admin@test.com

-- 3. Create Tryout: "UTBK 2026 - Simulasi 1" (published)
INSERT INTO tryout (id, dibuat_oleh, judul, deskripsi, status, mulai_at, selesai_at) VALUES
  ('a0000000-0000-0000-0000-000000000001',
   (SELECT id FROM public."user" LIMIT 1),
   'UTBK 2026 - Simulasi 1',
   'Tryout simulasi UTBK SNBT 2026 lengkap. Berisi subtest Penalaran Matematika dan Literasi Bahasa Indonesia.',
   'published',
   '2026-01-01 00:00:00',
   '2026-12-31 23:59:59');

-- 4. Subtest 1: Penalaran Matematika (5 soal, 15 menit)
INSERT INTO tryout_subtes (id, tryout_id, nama_subtes, jumlah_soal, durasi_menit, urutan) VALUES
  ('b0000000-0000-0000-0000-000000000001',
   'a0000000-0000-0000-0000-000000000001',
   'Penalaran Matematika', 5, 15, 1);

-- 5. Subtest 2: Literasi Bahasa Indonesia (5 soal, 15 menit)
INSERT INTO tryout_subtes (id, tryout_id, nama_subtes, jumlah_soal, durasi_menit, urutan) VALUES
  ('b0000000-0000-0000-0000-000000000002',
   'a0000000-0000-0000-0000-000000000001',
   'Literasi Bahasa Indonesia', 5, 15, 2);

-- ============================================
-- SOAL SUBTEST 1: PENALARAN MATEMATIKA
-- ============================================

-- Soal PM-1
INSERT INTO tryout_soal (id, subtes_id, pertanyaan, tipe, poin) VALUES
  ('c0000000-0000-0000-0000-000000000001',
   'b0000000-0000-0000-0000-000000000001',
   'Jika 2x + 3 = 11, berapakah nilai x?',
   'pilgan', 20);

INSERT INTO tryout_pilihan_jawaban (soal_id, label, isi, is_benar) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'A', '2', false),
  ('c0000000-0000-0000-0000-000000000001', 'B', '3', false),
  ('c0000000-0000-0000-0000-000000000001', 'C', '4', true),
  ('c0000000-0000-0000-0000-000000000001', 'D', '5', false),
  ('c0000000-0000-0000-0000-000000000001', 'E', '6', false);

-- Soal PM-2
INSERT INTO tryout_soal (id, subtes_id, pertanyaan, tipe, poin, pembahasan) VALUES
  ('c0000000-0000-0000-0000-000000000002',
   'b0000000-0000-0000-0000-000000000001',
   'Sebuah segitiga memiliki alas 10 cm dan tinggi 8 cm. Berapakah luas segitiga tersebut?',
   'pilgan', 20,
   'Luas segitiga = 1/2 × alas × tinggi = 1/2 × 10 × 8 = 40 cm²');

INSERT INTO tryout_pilihan_jawaban (soal_id, label, isi, is_benar) VALUES
  ('c0000000-0000-0000-0000-000000000002', 'A', '30 cm²', false),
  ('c0000000-0000-0000-0000-000000000002', 'B', '40 cm²', true),
  ('c0000000-0000-0000-0000-000000000002', 'C', '50 cm²', false),
  ('c0000000-0000-0000-0000-000000000002', 'D', '60 cm²', false),
  ('c0000000-0000-0000-0000-000000000002', 'E', '80 cm²', false);

-- Soal PM-3
INSERT INTO tryout_soal (id, subtes_id, pertanyaan, tipe, poin, pembahasan) VALUES
  ('c0000000-0000-0000-0000-000000000003',
   'b0000000-0000-0000-0000-000000000001',
   'Berapakah nilai dari 3⁴ + 2³?',
   'pilgan', 20,
   '3⁴ = 81, 2³ = 8. Maka 81 + 8 = 89');

INSERT INTO tryout_pilihan_jawaban (soal_id, label, isi, is_benar) VALUES
  ('c0000000-0000-0000-0000-000000000003', 'A', '73', false),
  ('c0000000-0000-0000-0000-000000000003', 'B', '81', false),
  ('c0000000-0000-0000-0000-000000000003', 'C', '89', true),
  ('c0000000-0000-0000-0000-000000000003', 'D', '97', false),
  ('c0000000-0000-0000-0000-000000000003', 'E', '105', false);

-- Soal PM-4
INSERT INTO tryout_soal (id, subtes_id, pertanyaan, tipe, poin, pembahasan) VALUES
  ('c0000000-0000-0000-0000-000000000004',
   'b0000000-0000-0000-0000-000000000001',
   'Sebuah toko memberikan diskon 25% untuk harga Rp 200.000. Berapakah harga setelah diskon?',
   'pilgan', 20,
   'Diskon = 25% × 200.000 = 50.000. Harga setelah diskon = 200.000 - 50.000 = Rp 150.000');

INSERT INTO tryout_pilihan_jawaban (soal_id, label, isi, is_benar) VALUES
  ('c0000000-0000-0000-0000-000000000004', 'A', 'Rp 100.000', false),
  ('c0000000-0000-0000-0000-000000000004', 'B', 'Rp 125.000', false),
  ('c0000000-0000-0000-0000-000000000004', 'C', 'Rp 150.000', true),
  ('c0000000-0000-0000-0000-000000000004', 'D', 'Rp 175.000', false),
  ('c0000000-0000-0000-0000-000000000004', 'E', 'Rp 180.000', false);

-- Soal PM-5
INSERT INTO tryout_soal (id, subtes_id, pertanyaan, tipe, poin, pembahasan) VALUES
  ('c0000000-0000-0000-0000-000000000005',
   'b0000000-0000-0000-0000-000000000001',
   'Jika rata-rata dari 5 bilangan adalah 12, maka jumlah kelima bilangan tersebut adalah...',
   'pilgan', 20,
   'Rata-rata = jumlah / banyak data. Maka jumlah = rata-rata × banyak data = 12 × 5 = 60');

INSERT INTO tryout_pilihan_jawaban (soal_id, label, isi, is_benar) VALUES
  ('c0000000-0000-0000-0000-000000000005', 'A', '48', false),
  ('c0000000-0000-0000-0000-000000000005', 'B', '52', false),
  ('c0000000-0000-0000-0000-000000000005', 'C', '56', false),
  ('c0000000-0000-0000-0000-000000000005', 'D', '60', true),
  ('c0000000-0000-0000-0000-000000000005', 'E', '72', false);

-- ============================================
-- SOAL SUBTEST 2: LITERASI BAHASA INDONESIA
-- ============================================

-- Soal LBI-1
INSERT INTO tryout_soal (id, subtes_id, pertanyaan, tipe, poin) VALUES
  ('c0000000-0000-0000-0000-000000000006',
   'b0000000-0000-0000-0000-000000000002',
   'Bacalah paragraf berikut:\n\n"Pendidikan karakter menjadi salah satu fokus utama kurikulum terbaru. Melalui pendidikan karakter, siswa diharapkan tidak hanya cerdas secara akademis, tetapi juga memiliki budi pekerti yang luhur."\n\nIde pokok paragraf di atas adalah...',
   'pilgan', 20);

INSERT INTO tryout_pilihan_jawaban (soal_id, label, isi, is_benar) VALUES
  ('c0000000-0000-0000-0000-000000000006', 'A', 'Kurikulum terbaru sangat sulit', false),
  ('c0000000-0000-0000-0000-000000000006', 'B', 'Pendidikan karakter menjadi fokus utama kurikulum terbaru', true),
  ('c0000000-0000-0000-0000-000000000006', 'C', 'Siswa harus cerdas secara akademis', false),
  ('c0000000-0000-0000-0000-000000000006', 'D', 'Budi pekerti tidak penting dalam pendidikan', false),
  ('c0000000-0000-0000-0000-000000000006', 'E', 'Kurikulum lama lebih baik', false);

-- Soal LBI-2
INSERT INTO tryout_soal (id, subtes_id, pertanyaan, tipe, poin) VALUES
  ('c0000000-0000-0000-0000-000000000007',
   'b0000000-0000-0000-0000-000000000002',
   'Kata "efektif" dalam kalimat "Metode pembelajaran ini sangat efektif untuk meningkatkan pemahaman siswa" memiliki makna...',
   'pilgan', 20);

INSERT INTO tryout_pilihan_jawaban (soal_id, label, isi, is_benar) VALUES
  ('c0000000-0000-0000-0000-000000000007', 'A', 'Mudah dilakukan', false),
  ('c0000000-0000-0000-0000-000000000007', 'B', 'Berhasil guna atau tepat sasaran', true),
  ('c0000000-0000-0000-0000-000000000007', 'C', 'Murah dan terjangkau', false),
  ('c0000000-0000-0000-0000-000000000007', 'D', 'Rumit dan kompleks', false),
  ('c0000000-0000-0000-0000-000000000007', 'E', 'Modern dan canggih', false);

-- Soal LBI-3
INSERT INTO tryout_soal (id, subtes_id, pertanyaan, tipe, poin) VALUES
  ('c0000000-0000-0000-0000-000000000008',
   'b0000000-0000-0000-0000-000000000002',
   'Kalimat yang menggunakan ejaan yang benar adalah...',
   'pilgan', 20);

INSERT INTO tryout_pilihan_jawaban (soal_id, label, isi, is_benar) VALUES
  ('c0000000-0000-0000-0000-000000000008', 'A', 'Ibu pergi ke pasar untuk membeli sayur mayur.', true),
  ('c0000000-0000-0000-0000-000000000008', 'B', 'ibu pergi ke Pasar untuk membeli Sayur Mayur.', false),
  ('c0000000-0000-0000-0000-000000000008', 'C', 'Ibu pergi ke Pasar untuk Membeli sayur mayur.', false),
  ('c0000000-0000-0000-0000-000000000008', 'D', 'ibu Pergi ke pasar untuk membeli sayur mayur.', false),
  ('c0000000-0000-0000-0000-000000000008', 'E', 'Ibu Pergi Ke Pasar Untuk Membeli Sayur Mayur.', false);

-- Soal LBI-4
INSERT INTO tryout_soal (id, subtes_id, pertanyaan, tipe, poin) VALUES
  ('c0000000-0000-0000-0000-000000000009',
   'b0000000-0000-0000-0000-000000000002',
   'Sinonim dari kata "konklusi" adalah...',
   'pilgan', 20);

INSERT INTO tryout_pilihan_jawaban (soal_id, label, isi, is_benar) VALUES
  ('c0000000-0000-0000-0000-000000000009', 'A', 'Pendahuluan', false),
  ('c0000000-0000-0000-0000-000000000009', 'B', 'Pembahasan', false),
  ('c0000000-0000-0000-0000-000000000009', 'C', 'Kesimpulan', true),
  ('c0000000-0000-0000-0000-000000000009', 'D', 'Analisis', false),
  ('c0000000-0000-0000-0000-000000000009', 'E', 'Argumentasi', false);

-- Soal LBI-5
INSERT INTO tryout_soal (id, subtes_id, pertanyaan, tipe, poin) VALUES
  ('c0000000-0000-0000-0000-000000000010',
   'b0000000-0000-0000-0000-000000000002',
   '"Hujan turun dengan sangat deras sehingga banyak jalan yang tergenang air."\n\nKata hubung dalam kalimat di atas adalah...',
   'pilgan', 20);

INSERT INTO tryout_pilihan_jawaban (soal_id, label, isi, is_benar) VALUES
  ('c0000000-0000-0000-0000-000000000010', 'A', 'dengan', false),
  ('c0000000-0000-0000-0000-000000000010', 'B', 'sangat', false),
  ('c0000000-0000-0000-0000-000000000010', 'C', 'sehingga', true),
  ('c0000000-0000-0000-0000-000000000010', 'D', 'banyak', false),
  ('c0000000-0000-0000-0000-000000000010', 'E', 'yang', false);

-- Done!
SELECT 'Tryout test data seeded successfully!' AS result;
