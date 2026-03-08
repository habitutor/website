ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "premium_tier" text;--> statement-breakpoint

UPDATE "user"
SET "premium_tier" = 'premium'
WHERE "is_premium" = true
  AND "premium_expires_at" IS NOT NULL
  AND "premium_expires_at" > now()
  AND "premium_tier" IS NULL;--> statement-breakpoint