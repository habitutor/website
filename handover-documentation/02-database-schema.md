# Database & Schema Structure

**Engine:** PostgreSQL 18 · **ORM:** Drizzle (`casing: "snake_case"`) · **Schema dir:** `packages/db/src/schema/`
**Local dev:** Docker compose in `packages/db/docker-compose.yml` (db `habitutor`, host port **6969** → 5432)
**Migrations:** `bun db:generate` → `bun db:migrate` (drizzle-kit)

The mobile app **never** connects to this database directly — this document exists so the coding
assistant understands the data model behind every API response, and so the new server-side tables
(Part B) can be implemented.

Legend: **NN** = NOT NULL, **N** = nullable. Types are Postgres types.

---

## PART A — Existing schema (36 tables, do not modify shapes)

### A1. Auth & user (`user.ts`, `auth.ts`) — managed by better-auth + custom fields

#### `user`
| Column | Type | Null | Default / notes |
|---|---|---|---|
| id | text | NN | PK |
| name | text | NN | |
| email | text | NN | UNIQUE |
| email_verified | boolean | NN | false |
| image | text | N | avatar id string (squirrel 1–10) or legacy path |
| role | text | N | "user" — admin check is `role === "admin"` |
| is_premium | boolean | N | false |
| premium_tier | text | N | e.g. tier controlling 3x/5x live-class access |
| premium_expires_at | timestamp | N | premium auto-expired by session middleware |
| flashcard_streak | integer | N | 0; reset after ≥2 days inactive |
| total_score | integer | NN | 0; cumulative Brain Gym score (leaderboard) |
| last_completed_flashcard_at | timestamp | N | |
| streak | integer | NN | 0; learning streak (Jakarta-day logic) |
| last_streak_at | timestamp | N | |
| streak_saves | integer | NN | 3 (max) |
| streak_saves_updated_at | timestamp | N | |
| phone_number | text | N | |
| referral_code | text | N | auto-generated on signup |
| referral_usage | integer | N | 0 |
| dream_campus | text | N | onboarding |
| dream_major | text | N | onboarding |
| age | integer | N | onboarding |
| education_level | text | N | onboarding (SMP/SMA/kuliah) |
| difficult_subjects | text[] | N | onboarding multi-select |
| has_seen_welcome_video | boolean | NN | false |
| created_at / updated_at | timestamp | NN | now() |

#### `session`
id text PK · expires_at ts NN · token text NN UNIQUE · ip_address text N · user_agent text N ·
user_id text NN FK→user CASCADE · created_at/updated_at. Index on user_id.
*Mobile sessions are rows here too; bearer token = `session.token`.*

#### `account`
id text PK · account_id NN · provider_id NN (`credential` | `google`) · user_id NN FK→user CASCADE ·
access/refresh/id tokens N · password N (hashed, credential provider) · timestamps.

#### `verification`
id text PK · identifier NN · value NN · expires_at NN · timestamps. (Password-reset tokens etc.)

---

### A2. Question bank (`question.ts`) — shared by flashcards, practice packs, class content

#### `question`
id integer PK identity · content text NN · discussion text NN (pembahasan) ·
content_json jsonb N (TipTap) · discussion_json jsonb N · is_flashcard_question boolean NN default true.

#### `question_answer_option`
id integer PK identity · code char(1) NN (A–E) · question_id NN FK→question CASCADE ·
content text NN · is_correct boolean NN default false. UNIQUE (question_id, code).

---

### A3. Brain Gym / flashcards (`flashcard.ts`)

#### `user_flashcard_attempt`
id integer PK · user_id NN FK→user CASCADE · date date NN default CURRENT_DATE ·
started_at ts NN · deadline ts NN (start + 10 min) · submitted_at ts N · score integer N default 0.

#### `user_flashcard_question_answer`
PK (attempt_id, assigned_date, question_id) · selected_answer_id N FK→question_answer_option SET NULL ·
answered_at ts N · created_at ts NN.

---

### A4. Practice packs (`practice-pack.ts`)

- `practice_pack`: id PK identity · title NN · description N · timestamps.
- `practice_pack_questions`: PK (practice_pack_id, question_id) · order integer default 1.
- `practice_pack_attempt`: id PK · user_id NN · practice_pack_id NN · started_at NN · completed_at N ·
  practice_pack_status enum(`not_started`,`ongoing`,`finished`) NN default `ongoing`.
  UNIQUE (user_id, practice_pack_id) — **one attempt per user per pack**.
- `practice_pack_user_answer`: PK (attempt_id, question_id) · selected_answer_id NN.

---

### A5. Learning content (`subtest.ts`) — hierarchy: subtest → content_item → material

- `subtest`: id PK identity · name NN · short_name NN UNIQUE (PU, PPU, PBM, PK, LBI, LBing, PM, HAB) ·
  description N · order NN default 1 · timestamps.
- `content_item`: id PK · subtest_id NN FK CASCADE · type enum(`material`,`tips_and_trick`) NN ·
  title NN · order NN · timestamps. UNIQUE (subtest_id, type, order).
- `video_material`: id PK · content_item_id NN UNIQUE FK CASCADE (1:1) · video_url NN (YouTube) ·
  content jsonb NN (TipTap) · timestamps.
- `note_material`: id PK · content_item_id NN UNIQUE FK CASCADE (1:1) · content jsonb NN (TipTap) · timestamps.
- `content_practice_questions`: content_item_id FK + question_id FK + order (⚠ missing composite PK in
  generated migrations — known issue).
- `user_progress`: id PK · user_id NN · content_item_id NN · video_completed / note_completed /
  practice_questions_completed booleans NN default false · last_viewed_at NN · timestamps.
  UNIQUE (user_id, content_item_id).
- `recent_content_view`: id PK · user_id NN · content_item_id NN · viewed_at NN. Index (user_id, viewed_at).

---

### A6. Tryout (`tryout.ts`) — separate question system, all UUID PKs, Indonesian column names

Definition graph: `tryout` → `tryout_subtes` → `tryout_soal` → `tryout_pilihan_jawaban`
Session graph: `tryout_sesi` → `tryout_sesi_subtes` → `tryout_sesi_soal` → `tryout_jawaban`

- `tryout`: id uuid PK · dibuat_oleh NN FK→user RESTRICT · judul NN · deskripsi N ·
  status enum(`draft`,`published`,`archived`) NN default draft · mulai_at N · selesai_at N · timestamps.
- `tryout_subtes`: id uuid PK · tryout_id NN FK CASCADE · nama_subtes NN · jumlah_soal integer NN ·
  durasi_menit integer NN · urutan integer NN · nilai_minimum integer N. UNIQUE (tryout_id, urutan).
- `tryout_soal`: id uuid PK · subtes_id NN FK CASCADE · pertanyaan text NN · gambar_url N (Cloudinary) ·
  tipe enum(`pilgan`,`multiple`) NN default pilgan · poin integer NN default 0 · pembahasan N ·
  pembahasan_gambar N.
- `tryout_pilihan_jawaban`: id uuid PK · soal_id NN FK CASCADE · label char(1) NN · isi text NN ·
  gambar_url N · is_benar boolean NN default false. UNIQUE (soal_id, label).
- `tryout_sesi`: id uuid PK · user_id NN · tryout_id NN · mulai_at NN · selesai_at N · total_skor N ·
  peringkat N · status enum(`berjalan`,`selesai`,`expired`) NN default berjalan.
- `tryout_sesi_subtes`: id uuid PK · sesi_id NN · subtes_id NN · urutan_pengerjaan NN · mulai_at NN ·
  deadline_at NN · selesai_at N · skor_subtes N · is_lulus N ·
  status enum(`menunggu`,`berjalan`,`selesai`,`expired`) NN. UNIQUE (sesi_id, subtes_id).
- `tryout_sesi_soal`: id uuid PK · sesi_subtes_id NN · soal_id NN · urutan_tampil NN ·
  is_ragu boolean NN default false · is_dijawab boolean NN default false. UNIQUE (sesi_subtes_id, soal_id).
- `tryout_jawaban`: id uuid PK · sesi_id NN · sesi_soal_id NN UNIQUE · pilihan_id N SET NULL ·
  dijawab_at N · is_benar N · poin_dapat N.

---

### A7. Dashboard CMS (`dashboard.ts`) — no FKs, admin-managed

- `dashboard_live_class`: id PK identity · title NN · date date NN · time time NN · teacher NN · link NN ·
  access enum(`3x`,`5x`) NN default 3x · is_published NN default true · order NN default 1 · timestamps.
- `dashboard_announcement`: id PK identity · title NN · description NN ·
  variant enum(`primary`,`cashback`) NN default primary · cta_link N · cta_label N ·
  is_published NN default true · order NN · timestamps.

---

### A8. Payments (`transaction.ts`) — Midtrans state lives in columns, not separate tables

- `product`: id uuid PK · name NN · slug NN UNIQUE (`perintis2027`) · price decimal NN ·
  type enum(`subscription`,`product`) NN.
- `promo_code`: id uuid PK · code NN UNIQUE · product_id NN FK CASCADE ·
  discount_type enum(`fixed_price`,`percentage`) NN · discount_value decimal NN · expires_at N ·
  total_usage_limit N · per_user_limit NN default 1 · is_active NN default true · timestamps.
- `transaction`: id text PK (order id) · user_id N FK SET NULL · product_id N FK SET NULL ·
  gross_amount decimal N · status enum(`pending`,`success`,`failed`) NN default pending ·
  referral_code_id N · promo_code_id N · gateway_transaction_id N · gateway_status N · payment_type N ·
  fraud_status N · status_code N · is_simulation boolean NN default false · paid_at N ·
  ordered_at N default now() · updated_at NN.

### A9. Referral (`referral.ts`)

- `referral_code`: id uuid PK · code NN UNIQUE · user_id NN UNIQUE FK CASCADE · referral_count NN default 0.
- `referral_usage`: id uuid PK · user_id NN UNIQUE FK CASCADE (each user can use one referral ever) ·
  referral_code_id NN FK CASCADE · transaction_id N (soft link, no FK) · cashback_amount decimal N.

### A10. Universities (`universitas.ts`)

- `universitas`: id PK identity · nama_univ NN UNIQUE · rank_univ NN UNIQUE · timestamps.
- `program_studi`: id PK identity · nama NN · passed_grade integer NN · univ_id NN FK CASCADE · timestamps.

### Known issues to fix while touching the DB package

1. `packages/db/src/index.ts` does not spread `subtest.ts` into the runtime Drizzle schema — relational
   queries (`db.query.subtest…`) won't work until added. Add it alongside the new schema files.
2. `content_practice_questions` has no primary key in generated migrations (invalid `{ pk: … }` callback
   instead of `primaryKey()`).

---

## PART B — NEW tables to create (mobile release)

Follow existing conventions: Drizzle, snake_case columns, `text` ids for user FKs, identity integer or
uuid PKs matching the domain, timestamps with `now()` defaults, explicit relations, indexes on all FKs
used in list queries. Create as `packages/db/src/schema/device.ts`, `notification.ts`, `community.ts` and
spread all three into `packages/db/src/index.ts`.

### B1. Push notifications

#### `user_device`
One row per installed app instance. Upserted on login/token-rotation, deactivated on logout.

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid | NN | PK defaultRandom |
| user_id | text | NN | FK→user CASCADE |
| push_token | text | NN | UNIQUE — Expo push token (or raw FCM/APNs token) |
| platform | enum `device_platform` (`ios`,`android`) | NN | |
| device_name | text | N | e.g. "Redmi Note 12" |
| app_version | text | NN | for min-version targeting |
| locale | text | N | |
| is_active | boolean | NN | default true; set false on logout/invalid-token response |
| last_seen_at | timestamp | NN | default now(); bump on app open |
| created_at / updated_at | timestamp | NN | now() |

Indexes: user_id; (user_id, is_active).

#### `notification_preference`
One row per user per category (upsert). Defaults created lazily — absence of a row = category enabled.

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid | NN | PK |
| user_id | text | NN | FK→user CASCADE |
| category | enum `notification_category` (`streak_reminder`,`streak_danger`,`live_class`,`tryout`,`community`,`payment`,`announcement`) | NN | |
| enabled | boolean | NN | default true |
| updated_at | timestamp | NN | |

UNIQUE (user_id, category). Per-user (non-category) settings live in a separate one-row-per-user table:

#### `notification_setting` (one row per user)
| Column | Type | Null | Notes |
|---|---|---|---|
| user_id | text | NN | PK, FK→user CASCADE |
| reminder_time | time | NN | default '18:00' — daily streak-reminder local time (WIB) |
| quiet_hours_start | time | N | e.g. 22:00 |
| quiet_hours_end | time | N | e.g. 06:00 |
| updated_at | timestamp | NN | |

#### `notification`
The in-app inbox. One row per user per notification (fan-out on write for broadcasts is fine at current
scale; broadcast rows can also be generated lazily if volume grows).

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid | NN | PK |
| user_id | text | NN | FK→user CASCADE |
| category | enum `notification_category` | NN | |
| title | text | NN | Indonesian |
| body | text | NN | |
| deep_link | text | N | e.g. `habitutor://tryout/{id}` |
| data | jsonb | N | arbitrary payload (ids for client routing) |
| read_at | timestamp | N | null = unread |
| pushed_at | timestamp | N | when actually dispatched to devices |
| created_at | timestamp | NN | now() |

Indexes: (user_id, created_at DESC); partial index (user_id) WHERE read_at IS NULL (badge count).

### B2. Community

Design goals: forums + reactions + follows + squads with one shared post/comment model; moderation
states everywhere; nothing hard-deleted.

Enums:
- `community_post_type`: `question`, `discussion`
- `moderation_status`: `visible`, `pending_review`, `removed`
- `report_reason`: `spam`, `harassment`, `inappropriate`, `cheating`, `other`
- `report_target`: `post`, `comment`, `user`
- `group_role`: `owner`, `member`

#### `community_channel`
| Column | Type | Null | Notes |
|---|---|---|---|
| id | integer | NN | PK identity |
| slug | text | NN | UNIQUE (`pu`, `ppu`, `pbm`, `pk`, `lbi`, `lbing`, `pm`, `curhat-snbt`, `info-kampus`, `tips-belajar`) |
| name | text | NN | display name |
| description | text | N | |
| subtest_id | integer | N | FK→subtest SET NULL — links subject channels to curriculum |
| order | integer | NN | default 1 |
| is_active | boolean | NN | default true |
| created_at / updated_at | timestamp | NN | |

#### `community_group` (squads)
| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid | NN | PK |
| name | text | NN | |
| description | text | N | |
| invite_code | text | NN | UNIQUE, regenerable |
| owner_id | text | NN | FK→user RESTRICT |
| max_members | integer | NN | default 20 |
| created_at / updated_at | timestamp | NN | |

#### `community_group_member`
PK (group_id uuid FK CASCADE, user_id text FK CASCADE) · role enum `group_role` NN default `member` ·
joined_at ts NN.

#### `community_post`
Scoped to a channel **xor** a group (CHECK: exactly one of channel_id / group_id set).

| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid | NN | PK |
| author_id | text | NN | FK→user CASCADE |
| channel_id | integer | N | FK→community_channel CASCADE |
| group_id | uuid | N | FK→community_group CASCADE |
| type | enum `community_post_type` | NN | default `discussion` |
| title | text | NN | |
| body | jsonb | NN | TipTap JSON (same rich-text format as the rest of the platform) |
| image_url | text | N | Cloudinary |
| linked_question_id | integer | N | FK→question SET NULL ("ask about this soal") |
| linked_content_item_id | integer | N | FK→content_item SET NULL |
| accepted_comment_id | uuid | N | FK→community_comment (add FK after both tables exist) — marks question answered |
| status | enum `moderation_status` | NN | default `visible` |
| comment_count | integer | NN | default 0 (denormalized) |
| reaction_count | integer | NN | default 0 (denormalized) |
| created_at / updated_at | timestamp | NN | |

Indexes: (channel_id, created_at DESC); (group_id, created_at DESC); author_id;
GIN on to_tsvector(title) for search (or ILIKE at current scale).

#### `community_comment`
| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid | NN | PK |
| post_id | uuid | NN | FK→community_post CASCADE |
| author_id | text | NN | FK→user CASCADE |
| parent_comment_id | uuid | N | FK→community_comment CASCADE — max one nesting level (enforce in API) |
| body | jsonb | NN | TipTap JSON |
| status | enum `moderation_status` | NN | default `visible` |
| reaction_count | integer | NN | default 0 |
| created_at / updated_at | timestamp | NN | |

Indexes: (post_id, created_at); author_id.

#### `community_reaction`
| Column | Type | Null | Notes |
|---|---|---|---|
| user_id | text | NN | FK→user CASCADE |
| post_id | uuid | N | FK→community_post CASCADE |
| comment_id | uuid | N | FK→community_comment CASCADE |
| emoji | text | NN | one of 👍 ❤️ 🔥 🤯 😂 (validated in API) |
| created_at | timestamp | NN | |

UNIQUE (user_id, post_id, emoji) and UNIQUE (user_id, comment_id, emoji); CHECK exactly one target set.

#### `user_follow`
PK (follower_id text FK→user CASCADE, following_id text FK→user CASCADE) · created_at NN ·
CHECK follower_id != following_id. Index on following_id (followers list).

#### `user_block`
PK (blocker_id text FK CASCADE, blocked_id text FK CASCADE) · created_at NN.
API must exclude blocked-either-direction users from all feeds, comments, and profiles.

#### `community_report`
| Column | Type | Null | Notes |
|---|---|---|---|
| id | uuid | NN | PK |
| reporter_id | text | NN | FK→user CASCADE |
| target_type | enum `report_target` | NN | |
| post_id / comment_id | uuid | N | one set per target_type |
| reported_user_id | text | N | for target_type `user` |
| reason | enum `report_reason` | NN | |
| detail | text | N | free text |
| resolved_at | timestamp | N | null = open (moderation queue) |
| resolved_by | text | N | FK→user SET NULL |
| created_at | timestamp | NN | |

#### `community_profile_setting` (privacy toggles, one row per user, lazy-created)
| Column | Type | Null | Notes |
|---|---|---|---|
| user_id | text | NN | PK, FK→user CASCADE |
| show_streak | boolean | NN | default true |
| show_dream_campus | boolean | NN | default true |
| show_badges | boolean | NN | default true |
| accepted_guidelines_at | timestamp | N | must be set before first post |
| updated_at | timestamp | NN | |

### B3. Seed data for new tables

- Seed `community_channel` with the 10 slugs above (7 subtest channels linked by `subtest_id` via
  short_name lookup + 3 general).
- No other seeds required; preferences/settings are lazy-created.
