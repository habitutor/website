-- Paket Sampai UTBK Tanpa Live Class: akses premium penuh sampai UTBK, kecuali Live Class.
-- price is the normal price (Rp200.000); the amount charged (promo Rp150.000 sampai 14 Nov 2026,
-- lalu normal) is decided by the API (PREMIUM_PACKAGES in packages/api/src/lib/constants.ts).
INSERT INTO "product" ("name", "slug", "price", "type")
VALUES ('Paket Sampai UTBK Tanpa Live Class', 'paketutbk2027nolive', '200000', 'subscription')
ON CONFLICT ("slug") DO NOTHING;