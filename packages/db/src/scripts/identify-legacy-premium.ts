/**
 * READ-ONLY report. Identifies users who currently have `is_premium = true`
 * with no `premium_expires_at` (legacy grants from before expiration was
 * enforced), excluding anyone with a successful, non-simulated purchase in
 * the last N days (default 50).
 *
 * This script never writes to the database. Run it against production via a
 * read replica or a controlled one-off connection before deciding to revoke
 * anything with `revoke-legacy-premium.ts`.
 *
 * Usage: bun run src/scripts/identify-legacy-premium.ts [--days=50]
 */
import { config } from "dotenv";
import { resolve } from "node:path";
import { sql } from "drizzle-orm";

config({ path: resolve("../../apps/server/.env"), quiet: true });

const daysArg = process.argv.find((arg) => arg.startsWith("--days="));
const protectionWindowDays = daysArg ? Number(daysArg.split("=")[1]) : 50;

if (!Number.isFinite(protectionWindowDays) || protectionWindowDays <= 0) {
	throw new Error(`Invalid --days value: ${daysArg}`);
}

const { db } = await import("../index");

const summary = await db.execute(sql`
	SELECT
		count(*) AS total_users,
		count(*) FILTER (WHERE is_premium) AS premium_users,
		count(*) FILTER (WHERE is_premium AND premium_expires_at IS NULL) AS premium_no_expiry,
		count(*) FILTER (WHERE is_premium AND premium_expires_at IS NOT NULL) AS premium_with_expiry
	FROM "user"
`);

const candidates = await db.execute(sql`
	SELECT
		u.id,
		u.email,
		u.premium_tier,
		u.created_at AS user_created_at,
		(
			SELECT max(t.paid_at)
			FROM transaction t
			WHERE t.user_id = u.id AND t.status = 'success' AND t.is_simulation = false
		) AS last_successful_purchase_at
	FROM "user" u
	WHERE u.is_premium = true
		AND u.premium_expires_at IS NULL
		AND NOT EXISTS (
			SELECT 1
			FROM transaction t
			WHERE t.user_id = u.id
				AND t.status = 'success'
				AND t.is_simulation = false
				AND t.paid_at >= now() - interval '1 day' * ${protectionWindowDays}
		)
	ORDER BY u.created_at ASC
`);

const protectedByRecentPurchase = await db.execute(sql`
	SELECT
		u.id,
		u.email,
		u.premium_tier,
		(
			SELECT max(t.paid_at)
			FROM transaction t
			WHERE t.user_id = u.id AND t.status = 'success' AND t.is_simulation = false
		) AS last_successful_purchase_at
	FROM "user" u
	WHERE u.is_premium = true
		AND u.premium_expires_at IS NULL
		AND EXISTS (
			SELECT 1
			FROM transaction t
			WHERE t.user_id = u.id
				AND t.status = 'success'
				AND t.is_simulation = false
				AND t.paid_at >= now() - interval '1 day' * ${protectionWindowDays}
		)
	ORDER BY u.created_at ASC
`);

console.log(`Protection window: last ${protectionWindowDays} day(s)\n`);
console.log("=== Summary ===");
console.log(JSON.stringify(summary.rows, null, 2));

console.log(`\n=== Candidates for revocation (${candidates.rows.length}) ===`);
console.log(JSON.stringify(candidates.rows, null, 2));

console.log(`\n=== Protected by recent purchase, NOT touched (${protectedByRecentPurchase.rows.length}) ===`);
console.log(JSON.stringify(protectedByRecentPurchase.rows, null, 2));

process.exit(0);
