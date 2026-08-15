-- Remove any persisted group-buy data from databases where the feature was deployed.
DROP TABLE IF EXISTS "group_buy_member";
--> statement-breakpoint
DROP TABLE IF EXISTS "group_buy";
--> statement-breakpoint
DROP TYPE IF EXISTS "public"."group_buy_member_status_enum";
--> statement-breakpoint
DROP TYPE IF EXISTS "public"."group_buy_status_enum";
--> statement-breakpoint
DELETE FROM "product"
WHERE "slug" IN ('perintis2027-groupbuy', 'perintis2027-groupbuy-topup');
--> statement-breakpoint
UPDATE "product"
SET "price" = '299000'
WHERE "slug" = 'perintis2027';
