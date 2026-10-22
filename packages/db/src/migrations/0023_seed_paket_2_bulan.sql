INSERT INTO "product" ("name", "slug", "price", "type")
VALUES ('Paket 2 Bulan', 'paket2bulan', '50000', 'subscription')
ON CONFLICT ("slug") DO NOTHING;
