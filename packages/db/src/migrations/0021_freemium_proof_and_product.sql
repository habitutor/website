ALTER TABLE "tryout_freemium_access" ADD COLUMN "requirements_proof_urls" text[];--> statement-breakpoint
INSERT INTO "product" ("name", "slug", "price", "type")
VALUES ('Akses Freemium TryOut', 'tryout-freemium', '10000', 'product')
ON CONFLICT ("slug") DO NOTHING;
