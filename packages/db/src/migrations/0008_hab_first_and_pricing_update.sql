-- Idempotent: safe to run multiple times
UPDATE "subtest"
SET
	"order" = CASE "short_name"
		WHEN 'HAB' THEN 1
		WHEN 'PU' THEN 2
		WHEN 'PPU' THEN 3
		WHEN 'PBM' THEN 4
		WHEN 'PK' THEN 5
		WHEN 'LBI' THEN 6
		WHEN 'LBing' THEN 7
		WHEN 'PM' THEN 8
		ELSE "order"
	END,
	"name" = CASE
		WHEN "short_name" = 'HAB' THEN 'Habit Anti Burnout - Buka ini sebelum Belajar!'
		ELSE "name"
	END
WHERE "short_name" IN ('HAB', 'PU', 'PPU', 'PBM', 'PK', 'LBI', 'LBing', 'PM');

UPDATE "product" SET "price" = '249000' WHERE "slug" = 'perintis2027';
