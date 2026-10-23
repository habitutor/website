-- The four premium packages that replace Perintis 2027 and Paket 2 Bulan.
-- price is the normal price; the amount charged (promo or normal) is decided
-- by the API (PREMIUM_PACKAGES in packages/api/src/lib/constants.ts).
-- Old product rows stay so existing transactions keep their product.
INSERT INTO "product" ("name", "slug", "price", "type")
VALUES
  ('Paket Sampai Mandiri', 'paketmandiri2027', '350000', 'subscription'),
  ('Paket Sampai UTBK', 'paketutbk2027', '250000', 'subscription'),
  ('Paket 3 Bulan', 'paket3bulan', '150000', 'subscription'),
  ('Paket 1 Bulan', 'paket1bulan', '100000', 'subscription')
ON CONFLICT ("slug") DO NOTHING;
