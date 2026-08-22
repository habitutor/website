# Habitutor Mobile App — Main Handover Document

> Primary context document. Companion files: `02-database-schema.md`, `03-api-contract.md`,
> `04-integrations.md`, `05-development-guidelines.md`, `06-folder-structure.md`.

---

## 1. Project Overview

### 1.1 What Habitutor is

**Habitutor** (https://habitutor.id) is an Indonesian exam-preparation platform for the **SNBT/UTBK** — the
national standardized test for admission to Indonesian public universities (PTN: UI, ITB, UGM, etc.). Its
differentiator is right in the name: *Habit* + *Tutor*. It is positioned not as a conventional bimbel
(cram school) but as a **habit-building learning companion**: daily Brain Gym sessions, learning streaks
with limited "streak saves", structured video/notes/practice content per SNBT subtest, full timed tryout
simulations, and a passing-grade explorer tied to each student's dream campus and major.

- **Target audience:** Indonesian SMP/SMA students (primarily kelas 11–12) preparing for SNBT 2027.
- **Language:** the entire product is in **Bahasa Indonesia** (`lang="id"`, locale `id_ID`).
- **Brand:** squirrel ("tupai") mascot; 10 selectable squirrel avatars; warm, motivational tone.
- **Traction claim (marketing copy):** 20,000+ students over 2 years; testimonials from alumni admitted
  to ITB, UI, UGM, and others.
- **Business model:** freemium. Free users get limited access (e.g. 1 Brain Gym session/day, gated class
  content, no pembahasan). One paid product exists today: **Paket Perintis 2027** (slug `perintis2027`,
  type `subscription`) — one-time purchase granting premium access until SNBT 2027 exam day, paid via
  **Midtrans Snap**, with promo codes and a referral program (25% discount + cashback for referrer).

### 1.2 Core value proposition

> Turn SNBT preparation from stressful cramming into a sustainable daily habit — short daily practice,
> visible streaks and progress, structured subtest content, realistic tryouts, and a clear line from
> today's effort to the student's dream campus.

### 1.3 The mobile app mandate

Build a native mobile app (iOS + Android) with:

1. **Full feature parity** with the existing web platform (section 3.1).
2. **Push notifications** — new capability, requires new backend work (section 3.2).
3. **Extensive community features** — new capability, requires new backend work (section 3.3).
4. **Same accounts, same data** — a user logs in on mobile with the exact same account as on web;
   streaks, premium status, tryout history, and progress are identical on both platforms.

UI/UX for all screens is already designed by professional designers (design track ran Aug 2026; see the
experience principles baked into `05-development-guidelines.md`). The coding assistant implements those
designs; it does not invent new ones.

---

## 2. Backend Strategy: Shared Database — Decision & Rationale

### 2.1 Decision

**Share the database, but only behind the existing API layer.** The mobile app is a new *client* of the
existing Hono + ORPC backend (`api.habitutor.id`), exactly like the web app is. The app never opens a
direct PostgreSQL connection and never embeds `DATABASE_URL`.

This is the correct architecture, and — importantly — **the hard work is already done**. The backend was
built API-first: a standalone Hono server (`apps/server`) exposing a fully typed ORPC router
(`packages/api`) with clean auth tiers (`pub` / `authed` / `premium` / `admin`), better-auth sessions, and
an OpenAPI surface. Nothing about the web app is coupled to the database in a way mobile would break.

### 2.2 Why this is right (pros)

- **Single source of truth.** One `user` row, one streak, one premium flag, one transaction history.
  Cross-platform continuity (start a tryout on mobile, review results on web) falls out for free.
- **All business logic stays server-side.** Streak day-boundary logic (Jakarta timezone), flashcard
  scoring, premium gating, Midtrans signature verification, referral cashback — none of it is duplicated
  in the mobile codebase, so it can never drift between platforms.
- **End-to-end type safety.** Because the app lives in the same Turborepo, it imports the `AppRouter`
  type from `@habitutor/api` and gets compile-time checking of every API call — the same DX the web
  app enjoys.
- **Zero migration cost.** No data sync, no dual-write, no ETL between two databases.

### 2.3 Risks and how they're mitigated (cons / considerations)

| Risk | Mitigation |
|------|------------|
| **Schema changes can break a shipped app version.** Web redeploys instantly; a mobile binary users installed 6 months ago cannot. | Treat the API as versioned-by-compatibility: additive schema/API changes only; never repurpose or remove a field the mobile app reads; gate breaking changes behind new procedures. Add a `GET /app/min-version` config endpoint so old clients can be force-upgraded gracefully. |
| **Cookie-based sessions don't fit native apps well.** | better-auth already supports bearer tokens (`BETTER_AUTH_ACCEPT_BEARER_TOKEN=true` path exists in `createContext`). Mobile uses the better-auth Expo plugin, which stores the session token in `expo-secure-store` and sends it as `Authorization: Bearer <token>`. No custom auth code. |
| **A leaked mobile binary exposes anything embedded in it.** | Only the public API base URL and the Midtrans *client* key ever ship in the binary. Server keys, DB credentials, and webhook secrets stay server-side (they already do). |
| **Mobile traffic patterns can hammer shared infra.** | Rate limiting already exists (`authedRateLimited`: 100 req/15min free, 500 premium, per user+path). Extend it to the new community endpoints, which are the highest-write-volume surface. |
| **In-memory rate limits & the in-process reconciliation job assume a single server instance.** | Acceptable today; if mobile pushes load to multiple instances, move rate limiting to Redis. Flagged, not blocking. |
| **App-store payment policy.** The single biggest strategic risk — Apple (and generally Google Play) require in-app purchases for digital content and prohibit external payment webviews. Midtrans-in-a-webview can get the iOS app rejected. | Full analysis and recommended handling in `04-integrations.md` §1. Short version: keep Midtrans for web + Android (with care), plan IAP or a "purchase on the website" flow for iOS, and make entitlement checks purely server-driven so payment channel doesn't matter to the app. |

### 2.4 REST vs GraphQL vs keep-ORPC

Keep ORPC. Introducing GraphQL or a parallel REST layer would duplicate the contract, lose the existing
type inference, and add server work with no user-facing benefit. ORPC works over plain HTTP
(`POST /rpc`), works fine from React Native's `fetch`, and the OpenAPI handler (`/api-reference`) already
exists if a non-TypeScript client ever appears.

---

## 3. Feature Breakdown

### 3.1 Existing web features (must reach parity)

Every feature below exists in production today. The API endpoints backing each one are catalogued in
`03-api-contract.md`; the data model in `02-database-schema.md`.

#### 3.1.1 Authentication & onboarding

- **Register** via email/password or Google OAuth, preceded by a multi-step onboarding wizard collecting:
  dream campus, dream major, age, education level (SMP/SMA/kuliah), difficult SNBT subjects (multi-select),
  phone number. Draft answers persist locally until account creation.
- **Login**, **forgot password** (email via Resend from `noreply@habitutor.id`), **reset password** with token.
- **Onboarding guard:** a logged-in user with an incomplete profile is forced to a profile-completion
  screen before using the app.
- A referral code is auto-generated server-side for every new user.

#### 3.1.2 Dashboard (home)

- Greeting + dream campus/major display.
- Progress cards: materials completed, tryouts done, Brain Gym streak.
- CMS-driven **announcements** (primary + cashback variants) and **live class schedule** (premium only;
  filtered by tier `3x` vs `5x` access; links out to the class).
- Community deep links (WhatsApp group, Discord — premium only).
- Streak indicator with celebration dialog when the day's streak is earned.

#### 3.1.3 Brain Gym (flashcards) — product name "Brain Gym", API name `flashcard`

- Daily quiz session: **5 random questions, 10-minute deadline**. Free users: 1 session/day; premium:
  unlimited.
- Flow: intro/how-to → active session (answer one by one, instant correctness feedback) → submit →
  result screen with score, answer review with pembahasan (discussion), and a **global top-10
  leaderboard** by cumulative `totalScore` (current user's rank always shown).
- Completing a session updates `flashcardStreak`, `totalScore`, and records a learning-streak activity.
- Flashcard streak resets server-side after ≥2 days of inactivity.

#### 3.1.4 Kelas (structured learning per SNBT subtest)

- 8 subtests seeded: HAB (Habit Anti Burnout), PU, PPU, PBM, PK, LBI, LBing, PM.
- Each subtest holds ordered **content items** of two categories: `material` and `tips_and_trick`.
- Each content item can have up to three tabs: **Video** (YouTube embed + rich-text companion),
  **Notes** (rich text, TipTap/JSON), **Latihan Soal** (linked practice questions).
- Per-user progress per content item (`videoCompleted`, `noteCompleted`, `practiceQuestionsCompleted`),
  recent-views tracking, and a "materials completed" stat.
- Premium gating: most content requires premium; the API returns `FORBIDDEN` and the client shows a
  premium gate modal.
- Viewing/completing content records streak activity.

#### 3.1.5 Latihan Soal (standalone practice packs)

- Catalogue of practice packs → start attempt → answer questions (saved per-question, resumable) →
  submit → history list → per-attempt review with correctness and pembahasan.
- One attempt per user per pack (unique constraint); status `not_started` / `ongoing` / `finished`.

#### 3.1.6 Tryout (full SNBT simulation)

- List of published tryouts with optional open/close windows.
- A tryout contains ordered **subtes** (e.g. 7 SNBT subtests), each with question count and duration in
  minutes. Questions are `pilgan` (single choice) or `multiple`, with optional images (Cloudinary).
- Exam session flow: start/resume session → per-subtes timed screen with question navigator, answer
  selection, **"ragu-ragu"** (doubtful) flagging → submit subtes (or auto-submit on timeout) → next
  subtes → final results.
- Results: total score, per-subtes score and pass/fail vs `nilaiMinimum`, rank (`peringkat`), and
  pembahasan per question (premium-gated).
- **Passing-grade explorer:** browse universities (ranked) and their program studi with passing grades,
  to compare against tryout scores.
- Completing a tryout records streak activity. Tryout history is listed per user.

#### 3.1.7 Streak system

- Daily **learning streak** with Jakarta-timezone day boundaries. Qualifying activities: Brain Gym
  completion, class content progress, tryout completion.
- **Streak saves:** up to 3; consumed automatically to bridge missed days; replenished over time.
- Exposed data: current streak, saves remaining, max saves, whether today is completed.

#### 3.1.8 Premium & payments (Perintis 2027)

- Purchase screen: pricing (early-bird tiers exist), benefit list, promo-code input, referral-code input
  (mutually exclusive with promo; referral gives 25% off).
- Checkout via **Midtrans Snap**; return states: finish / unfinish / error.
- Server webhook (`/webhooks/midtrans`, SHA-512 signature-verified) flips the transaction to `success`
  and sets `isPremium`, `premiumTier`, `premiumExpiresAt` on the user.
- Client-side "sync status" endpoint reconciles pending transactions; a 5-minute server job reconciles
  stale ones; session middleware also reconciles on login for non-premium users.
- **Mobile note:** see `04-integrations.md` §1 before implementing any purchase UI.

#### 3.1.9 Profile & referral

- View/edit: name, phone, dream campus, dream major, age, education level, difficult subjects.
- Squirrel avatar picker (avatars 1–10, stored as an image id string).
- Referral: view own code, copy/share, usage count; apply someone's code; validate before applying.

#### 3.1.10 Out of scope for the mobile app

- The **admin CMS** (tryout/question/content/user/promo/transaction management) stays web-only.
  Do not build admin screens in the mobile app.
- Marketing landing pages (`/`, `/home-premium`) are web-only; the app opens straight into auth/home.

### 3.2 NEW: Push notifications

No push infrastructure exists today (no device-token tables, no FCM code). Full stack to build — schema
in `02-database-schema.md` §B1, endpoints in `03-api-contract.md` §B1, provider setup in
`04-integrations.md` §2.

**Notification categories** (each individually toggleable by the user):

| Category key | Trigger | Example (Indonesian) |
|---|---|---|
| `streak_reminder` | Daily, user-chosen time, only if today's streak not yet earned | "Streak kamu menunggu! Selesaikan Brain Gym hari ini 🔥" |
| `streak_danger` | Evening (e.g. 20:00 WIB) if streak about to break and no saves left | "Streak 12 hari kamu dalam bahaya!" |
| `live_class` | 24h and 1h before a scheduled live class (premium users with access) | "Live class Penalaran Matematika mulai 1 jam lagi" |
| `tryout` | New tryout published; tryout window closing soon; results/rank ready | "Tryout Nasional #3 sudah dibuka!" |
| `community` | Replies to your post/comment, mentions, mod actions on your content | "@rina membalas pertanyaanmu di forum PU" |
| `payment` | Transaction success/failure/expiry | "Pembayaran Paket Perintis 2027 berhasil 🎉" |
| `announcement` | Admin broadcast (mirrors dashboard announcements) | — |

**Required client behavior (matches the design brief):**

- Permission **pre-prompt screen** explaining value *before* triggering the OS permission dialog; never
  ask on first launch.
- Register the device token after login and after every token rotation; unregister on logout.
- Notification **preferences screen**: per-category toggles + quiet hours; persisted server-side so they
  apply across devices.
- Every push carries a **deep link** (`habitutor://…`) that routes to the relevant screen (see
  `06-folder-structure.md` for the route map). Tapping a notification must land the user on the right
  screen even from a cold start.
- In-app **notification inbox** (bell icon) listing the same notifications, with unread badge count.

### 3.3 NEW: Community features

Nothing community-related exists in the database today (WhatsApp/Discord are external links). This is a
green-field feature set. Schema in `02-database-schema.md` §B2, endpoints in `03-api-contract.md` §B2.

**Scope — "extensive community" broken into three pillars:**

1. **Forums (topic-based Q&A + discussion).**
   - Channels seeded per SNBT subtest (PU, PPU, PBM, PK, LBI, LBing, PM) plus general channels
     (`#curhat-snbt`, `#info-kampus`, `#tips-belajar`).
   - Posts: title + rich body, optional image attachment (Cloudinary), optional tag of a question or
     content item ("ask about this soal").
   - Threaded comments (one level of nesting: comment → replies).
   - Reactions on posts and comments (emoji set: 👍 ❤️ 🔥 🤯 😂).
   - Post types: `question` (can be marked *terjawab*/answered with an accepted comment) and `discussion`.
   - Sort: newest / trending; per-channel and global feed; full-text search.
2. **Social graph & profiles.**
   - Public mini-profile: name, avatar, streak, badges, dream campus (each with a privacy toggle).
   - Follow users; followers/following lists; feed filter "Mengikuti" (following).
   - Leaderboards extended socially: weekly streak leaderboard among people you follow.
3. **Study groups ("Squad").**
   - Small private groups (max ~20) with invite codes.
   - Group chat-lite: a group-scoped post feed (reuses forum post/comment model with `groupId` scope).
   - Shared goals: group streak (% of members who kept streak today), weekly group Brain Gym score.

**Safety & moderation (non-negotiable, required for app-store approval of UGC features):**

- Report (post/comment/user, with reason enum) and **block user** (blocks are bidirectional-hiding).
- Soft-delete + moderation states: `visible` / `pending_review` / `removed`.
- Admin moderation queue (server + admin web UI later; the mobile app only needs report/block UX).
- Community guidelines screen + agreement checkpoint before first post.
- Rate limits on post/comment creation (reuse `authedRateLimited`, tighter caps).
- Profanity/spam pre-filter server-side (simple word-list to start).

**Phasing recommendation:** ship pillar 1 (forums) + safety first; pillar 2 next; squads last. The schema
in `02-database-schema.md` supports all three from day one so no migration churn later.

---

## 4. Architecture & Recommended Tech Stack

### 4.1 System architecture

```
┌─────────────────┐        ┌─────────────────┐
│  Web (TanStack   │        │  Mobile (Expo /  │
│  Start, exists)  │        │  React Native,   │
│  cookies         │        │  NEW) bearer     │
└────────┬────────┘        └────────┬────────┘
         │  HTTPS                    │  HTTPS
         ▼                           ▼
   ┌────────────────────────────────────────┐
   │  apps/server — Hono on Bun (exists)     │
   │  • /api/auth/*  → better-auth           │
   │  • /rpc         → ORPC (typed API)      │
   │  • /webhooks/midtrans                   │
   │  • NEW: push dispatch worker (FCM)      │
   └───────────────────┬────────────────────┘
                       ▼
   ┌────────────────────────────────────────┐
   │  PostgreSQL 18 — Drizzle ORM (exists)   │
   │  36 existing tables + NEW: device,      │
   │  notification, community tables         │
   └────────────────────────────────────────┘
   External: Midtrans • FCM/APNs • Google OAuth
             Resend • Cloudinary • YouTube
```

The **only** components being built are the mobile client (`apps/native`) and the incremental server
additions (new Drizzle schema files + new ORPC routers + a push-dispatch module).

### 4.2 Mobile framework: React Native + Expo (recommended)

**Choose React Native with Expo (SDK 53+, expo-router), not Flutter.** Decisive reasons for this team:

1. **Type-sharing with the monorepo.** The entire backend contract is TypeScript (ORPC + Arktype +
   Drizzle). An Expo app in `apps/native` imports `AppRouter` from `@habitutor/api` and gets fully typed,
   autocompleted API calls. Flutter would forfeit this and require hand-maintaining a Dart mirror of ~90
   procedures.
2. **Skill and convention reuse.** Existing conventions (TanStack Query, better-auth client, Tailwind
   styling) all have first-class RN equivalents; the coding assistant can port web feature logic nearly
   1:1.
3. **Ecosystem fit:** better-auth ships an official **Expo plugin**; ORPC works over fetch; TanStack
   Query is platform-agnostic; `expo-notifications` handles FCM/APNs.

### 4.3 Stack summary

| Concern | Choice | Notes |
|---|---|---|
| Framework | **Expo (React Native)**, TypeScript strict | Managed workflow + `expo-dev-client`; EAS Build for CI |
| Navigation | **expo-router** (file-based) | Mirrors the web's file-based routing mental model; typed routes; deep linking built in |
| API client | **ORPC client** (`@orpc/client`) → `POST https://api.habitutor.id/rpc` | Import `AppRouter` type from `@habitutor/api`; same `RPCLink` pattern as `apps/web/src/utils/orpc.ts` |
| Server state | **TanStack Query** (`@orpc/tanstack-query` utils) | Same queryClient conventions as web: toast on defined errors, sensible retry |
| Client state | **zustand** | Small stores only: session snapshot, notification badge, in-exam local state (answers before save), UI prefs |
| Auth | **better-auth** `@better-auth/expo` client plugin | Token in `expo-secure-store`; sent as `Authorization: Bearer`; server flag `BETTER_AUTH_ACCEPT_BEARER_TOKEN=true`; add the `expo` plugin server-side |
| Styling | **NativeWind v4** (Tailwind for RN) | Reuse the web design tokens; `cva` for variants, same as web conventions |
| Forms | **TanStack Form + Arktype** | Identical to web; share validators where possible |
| Push | **expo-notifications** + FCM (Android) / APNs (iOS) | Server dispatch via Expo Push Service (simplest) — details in `04-integrations.md` §2 |
| Images/upload | `expo-image` (render), Cloudinary unsigned preset or server-signed upload for community images | `04-integrations.md` §5 |
| Video | `react-native-youtube-iframe` | Class videos are YouTube URLs |
| Rich text render | Custom TipTap-JSON → RN renderer | Notes/questions are stored as TipTap JSON; build one renderer component, reuse everywhere |
| Storage | `expo-secure-store` (token), `@react-native-async-storage/async-storage` (drafts, prefs, query persistence) | Onboarding draft parity with web's localStorage behavior |
| Offline | TanStack Query persistence + optimistic UI on community actions | Full offline mode is NOT in scope; graceful degraded states are (design brief requires offline states) |
| Crash/analytics | **Sentry** (`sentry-expo`) + **PostHog** | `04-integrations.md` §6 |
| Payments | Midtrans (Android/web) with iOS policy handling | **Read `04-integrations.md` §1 first** |

### 4.4 Server-side additions (backend work in the existing repo)

1. New Drizzle schema files: `packages/db/src/schema/device.ts`, `notification.ts`, `community.ts`
   (definitions in `02-database-schema.md` §B) — remember to also spread them into the runtime schema in
   `packages/db/src/index.ts` (note: `subtest.ts` is currently missing from that spread; fix while there).
2. New ORPC routers: `device`, `notification`, `community` (contracts in `03-api-contract.md` §B),
   registered in `packages/api/src/routers/index.ts`.
3. better-auth: enable the `expo` plugin and set `BETTER_AUTH_ACCEPT_BEARER_TOKEN=true`; add the app's
   scheme (`habitutor://`) to `trustedOrigins`.
4. Push dispatch module (`packages/api/src/lib/push.ts`) + triggers (streak cron, live-class scheduler,
   webhook success hook, community events).
5. A `GET /app/config` public endpoint: min supported app version, feature flags, store URLs.

### 4.5 Non-functional requirements

- **Performance:** cold start < 3s on mid-range Android; exam screens must never drop input while the
  timer runs (keep timers in refs, memoize question renders).
- **Timezone:** all streak/day logic is server-authoritative (Asia/Jakarta). The client never computes
  "is today done" locally — it asks `streak.get`.
- **Security:** tokens only in secure storage; no secrets in the bundle; certificate pinning optional
  but nice-to-have; obfuscation via Hermes bytecode is sufficient.
- **Accessibility:** design brief mandates scalable text, ≥4.5:1 contrast, large touch targets (≥44pt),
  non-color status indicators.
- **Store compliance:** UGC features require report/block/moderation (§3.3); payments require §1 of
  `04-integrations.md`; privacy policy + account-deletion flow are mandatory (add a `DELETE account`
  procedure server-side — Apple requires in-app account deletion).
