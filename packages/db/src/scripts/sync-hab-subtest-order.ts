import { config } from "dotenv";
import { resolve } from "node:path";
import { sql } from "drizzle-orm";

config({ path: resolve("../../apps/server/.env"), quiet: true });

const { db } = await import("../index");

await db.execute(sql`
	UPDATE "subtest"
	SET
		"order" = CASE "short_name"
			WHEN 'HAB' THEN 1
			WHEN 'PU' THEN 2
			WHEN 'PPU' THEN 3
			WHEN 'PBM' THEN 4
			WHEN 'PK' THEN 5
			WHEN 'LBI' THEN 6
			WHEN 'LBing' THEN 7
			WHEN 'PM' THEN 8
			ELSE "order"
		END,
		"name" = CASE
			WHEN "short_name" = 'HAB' THEN 'Habit Anti Burnout - Buka ini sebelum Belajar!'
			ELSE "name"
		END
	WHERE "short_name" IN ('HAB', 'PU', 'PPU', 'PBM', 'PK', 'LBI', 'LBing', 'PM')
`);

const rows = await db.execute(sql`SELECT name, short_name, "order" FROM subtest ORDER BY "order"`);
console.log("Subtest order after sync:");
console.log(JSON.stringify(rows.rows, null, 2));
process.exit(0);
