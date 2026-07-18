/**
 * Revokes premium access for legacy users who have `is_premium = true` with
 * no `premium_expires_at`, EXCLUDING anyone with a successful, non-simulated
 * purchase in the last N days (default 50).
 *
 * SAFE BY DEFAULT: without `--confirm`, this only prints what WOULD change
 * and performs no writes. Review that output (and re-run
 * `identify-legacy-premium.ts`) before ever passing `--confirm`.
 *
 * Usage:
 *   bun run src/scripts/revoke-legacy-premium.ts [--days=50]              # dry run (default)
 *   bun run src/scripts/revoke-legacy-premium.ts [--days=50] --confirm    # actually revokes
 */
import { config } from "dotenv";
import { resolve } from "node:path";
import { sql } from "drizzle-orm";

config({ path: resolve("../../apps/server/.env"), quiet: true });

const daysArg = process.argv.find((arg) => arg.startsWith("--days="));
const protectionWindowDays = daysArg ? Number(daysArg.split("=")[1]) : 50;
const isConfirmed = process.argv.includes("--confirm");

if (!Number.isFinite(protectionWindowDays) || protectionWindowDays <= 0) {
	throw new Error(`Invalid --days value: ${daysArg}`);
}

const { db } = await import("../index");

const candidatesQuery = sql`
	SELECT u.id, u.email, u.premium_tier, u.created_at AS user_created_at
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
`;

const candidates = await db.execute(candidatesQuery);

console.log(`Protection window: last ${protectionWindowDays} day(s)`);
console.log(`Mode: ${isConfirmed ? "CONFIRM (will write)" : "DRY RUN (no writes)"}`);
console.log(`\nUsers that ${isConfirmed ? "will be" : "would be"} revoked (${candidates.rows.length}):`);
console.log(JSON.stringify(candidates.rows, null, 2));

if (!isConfirmed) {
	console.log("\nDry run only. Re-run with --confirm to apply these changes.");
	process.exit(0);
}

if (candidates.rows.length === 0) {
	console.log("\nNo matching users. Nothing to do.");
	process.exit(0);
}

const result = await db.execute(sql`
	UPDATE "user"
	SET
		is_premium = false,
		premium_tier = NULL,
		updated_at = now()
	WHERE is_premium = true
		AND premium_expires_at IS NULL
		AND NOT EXISTS (
			SELECT 1
			FROM transaction t
			WHERE t.user_id = "user".id
				AND t.status = 'success'
				AND t.is_simulation = false
				AND t.paid_at >= now() - interval '1 day' * ${protectionWindowDays}
		)
	RETURNING id, email
`);

console.log(`\nRevoked premium for ${result.rows.length} user(s).`);
process.exit(0);
