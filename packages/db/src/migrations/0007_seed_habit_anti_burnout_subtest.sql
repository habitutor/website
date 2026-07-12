INSERT INTO "subtest" ("name", "short_name", "description", "order")
VALUES (
	'Habit Anti-Burnout',
	'HAB',
	'Bangun kebiasaan belajar yang sehat dan berkelanjutan biar kamu tetap konsisten sampai hari-H tanpa tumbang.',
	8
)
ON CONFLICT ("short_name") DO NOTHING;
