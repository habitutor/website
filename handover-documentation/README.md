# Habitutor Mobile App — Handover Documentation

This folder is the **complete, self-contained context** for an LLM coding assistant building the Habitutor
mobile application. The assistant should read every file in this folder before writing any code. All facts
about the existing backend were extracted directly from the production monorepo (`habitutor`) — they are not
guesses.

## Reading order

| # | File | What it contains |
|---|------|------------------|
| 1 | `01-handover-main.md` | **Primary document.** Project overview, backend strategy decision, feature breakdown (existing + push notifications + community), architecture, and recommended tech stack. |
| 2 | `02-database-schema.md` | The complete existing PostgreSQL schema (36 tables, 13 enums) plus the **new tables** required for push tokens, notifications, and community features. |
| 3 | `03-api-contract.md` | Every existing ORPC endpoint (auth tier, path, input, behavior) plus the **new endpoint contracts** the backend team will add for mobile (devices, notifications, community). |
| 4 | `04-integrations.md` | Third-party services: Midtrans (payments — read the app-store policy warning), FCM/APNs push, Google OAuth, Resend, Cloudinary, YouTube, analytics/crash reporting. |
| 5 | `05-development-guidelines.md` | How to translate the finished UI/UX designs into React Native components: design tokens, component conventions, state management rules, error/loading/offline states, localization. |
| 6 | `06-folder-structure.md` | The exact folder structure for the new `apps/native` Expo workspace inside the existing Turborepo, plus setup commands and environment variables. |

## Ground rules for the coding assistant

1. **The mobile app never talks to PostgreSQL directly.** All data access goes through the existing
   Hono + ORPC API at `api.habitutor.id` (`/rpc` for typed RPC). The database is shared between web and
   mobile only *behind* this API layer.
2. **Authentication is better-auth** with email/password and Google OAuth. Mobile uses the better-auth
   Expo plugin with bearer-token sessions (`BETTER_AUTH_ACCEPT_BEARER_TOKEN=true` is already supported
   server-side). Never invent a custom auth scheme.
3. **The app is in Bahasa Indonesia.** All user-facing strings are Indonesian. Follow the copy style of
   the existing web app (see `05-development-guidelines.md` §7).
4. **Reuse the monorepo's type contracts.** The app lives at `apps/native` inside the same Turborepo and
   imports `AppRouter` types from `@habitutor/api` for end-to-end type-safe API calls via the ORPC client.
5. **UI designs are final.** Screens and flows were produced by professional designers. The assistant's
   job is faithful translation into code, not redesign. When a design is ambiguous, prefer the pattern
   already used by the web app for the same feature.
6. **New backend features (push, community) require server work too.** The contracts in
   `02-database-schema.md` and `03-api-contract.md` define what to build on the server (Drizzle schema +
   ORPC routers) before the mobile screens that depend on them.
