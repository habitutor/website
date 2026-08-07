-- Idempotent: safe to run multiple times
UPDATE "product" SET "price" = '349000' WHERE "slug" = 'perintis2027';
--> statement-breakpoint
INSERT INTO "product" ("name", "slug", "price", "type")
VALUES ('Paket Perintis 2027 (Patungan Bertiga)', 'perintis2027-groupbuy', '199000', 'product')
ON CONFLICT ("slug") DO UPDATE SET "price" = EXCLUDED."price", "name" = EXCLUDED."name";
--> statement-breakpoint
INSERT INTO "product" ("name", "slug", "price", "type")
VALUES ('Pelunasan Paket Perintis 2027 (Patungan)', 'perintis2027-groupbuy-topup', '150000', 'product')
ON CONFLICT ("slug") DO UPDATE SET "price" = EXCLUDED."price", "name" = EXCLUDED."name";
