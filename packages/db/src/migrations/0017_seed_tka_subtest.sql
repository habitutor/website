INSERT INTO "subtest" ("name", "short_name", "description", "order")
VALUES (
	'Tes Kemampuan Akademik (TKA)',
	'TKA',
	'Persiapan Tes Kemampuan Akademik: modul, latihan soal, dan pembahasan mata pelajaran wajib dan pilihan.',
	9
)
ON CONFLICT ("short_name") DO NOTHING;
