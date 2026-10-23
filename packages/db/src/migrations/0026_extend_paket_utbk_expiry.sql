-- Paket Sampai UTBK: masa aktif direvisi dari 30 April 2027 menjadi 1 Mei 2027 (23.59.59 WIB).
-- Hanya user yang masa aktifnya tepat akhir paket lama (disimpan UTC) dan punya pembelian paket ini yang sukses.
UPDATE "user"
SET "premium_expires_at" = '2027-05-01 16:59:59.999'
WHERE "premium_expires_at" = '2027-04-30 16:59:59.999'
  AND "id" IN (
    SELECT t."user_id"
    FROM "transaction" t
    JOIN "product" p ON p."id" = t."product_id"
    WHERE p."slug" = 'paketutbk2027' AND t."status" = 'success'
  );
