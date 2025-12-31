CREATE TYPE "status" AS ENUM('pending', 'success', 'failed');
ALTER TABLE "transaction" ADD COLUMN "status" "status" DEFAULT 'pending' NOT NULL;