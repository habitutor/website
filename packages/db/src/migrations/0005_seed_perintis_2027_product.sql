INSERT INTO "product" ("name", "slug", "price", "type")
VALUES ('Paket Perintis 2027', 'perintis2027', '199000', 'subscription')
ON CONFLICT ("slug") DO NOTHING;
