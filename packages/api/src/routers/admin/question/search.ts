import { question } from "@habitutor/db/schema/question";
import { sql } from "drizzle-orm";

/**
 * Cocokkan kata cari dengan teks yang terbaca di soal, bukan dengan JSON mentahnya. Tanpa ini, kata seperti "text",
 * "image", atau "paragraph" cocok dengan semua soal, dan kata yang sebagian ditebalkan tidak ketemu.
 * Soal lama yang tidak punya contentJson dicari di teks biasanya.
 */
export function matchesQuestionText(search: string) {
  const pattern = `%${search.replace(/[\\%_]/g, "\\$&")}%`;
  return sql`CASE
    WHEN jsonb_typeof(${question.contentJson}) = 'object' THEN (
      SELECT coalesce(string_agg(block.body, ' '), '')
      FROM (
        SELECT (SELECT string_agg(leaf #>> '{}', '') FROM jsonb_path_query(node, 'strict $.**.text') AS leaf) AS body
        FROM jsonb_array_elements(coalesce(${question.contentJson} -> 'content', '[]'::jsonb)) AS node
      ) AS block
    )
    ELSE ${question.content}
  END ILIKE ${pattern}`;
}
