# API Contract

**Server:** Hono on Bun — production `https://api.habitutor.id`, local `http://localhost:3001`
**Transport the mobile app uses:** ORPC over `POST /rpc` with the typed client (`@orpc/client` +
`RPCLink`), importing `AppRouter` from `@habitutor/api`. Procedure keys below (e.g. `flashcard.start`)
are the client call paths: `orpc.flashcard.start(...)`.
**Auth endpoints:** better-auth at `/api/auth/*` — handled entirely by the `@better-auth/expo` client;
never call these routes by hand.
**OpenAPI mirror:** every procedure also has an OpenAPI route under `/api-reference/...` (admin-gated
except the Midtrans webhook) — listed here as documentation of method/path semantics only.

**Auth tiers:** `pub` (none) · `authed` (session required) · `premium` (`isPremium` or admin) ·
`admin` · `authedRateLimited` (authed + 100 req/15min free, 500 premium, per user+path).

**Errors:** ORPC errors with Indonesian default messages: `UNAUTHORIZED`, `FORBIDDEN` (premium gate),
`NOT_FOUND`, `BAD_REQUEST`, `CONFLICT`, `UNPROCESSABLE_CONTENT`, `TOO_MANY_REQUESTS`,
`INTERNAL_SERVER_ERROR`. The client shows defined-error messages via toast (web convention — mirror it).

**Session side effects:** every `authed` call runs `syncSessionLifecycle`: flashcard-streak reset after
≥2 days idle, premium expiry enforcement, and (for non-premium users) pending-Midtrans reconciliation
with a 30s cooldown. The client doesn't manage any of this.

---

## PART A — Existing endpoints (implemented, consume as-is)

### A1. Root & misc

| Procedure | Tier | HTTP | Input | Behavior |
|---|---|---|---|---|
| `healthCheck` | pub | GET /healthcheck | — | `{ message: "OK" }` |
| `social.get` | authed | GET /socials | — | Premium: WhatsApp + Discord invite links; free: nulls |
| `dashboard.content` | authed | GET /dashboard/content | — | Published announcements + live classes (live classes filtered by premium/tier: `3x` vs `5x` access) |

### A2. Profile

| Procedure | Tier | HTTP | Input | Behavior |
|---|---|---|---|---|
| `profile.me` | authed | GET /profile | — | Full profile: name, email, avatar, phone, dreams, age, education, difficultSubjects, referral code + usage, welcome-video flag |
| `profile.update` | authed | PUT /profile | `{ name?, phoneNumber?, dreamCampus?, dreamMajor?, age?, educationLevel?, difficultSubjects? }` | Partial update |
| `profile.avatar.update` | authed | PUT /profile/avatar | `{ image: string }` | Avatar id (squirrel 1–10) |
| `profile.markWelcomeVideoSeen` | authed | POST /profile/welcome-video-seen | — | Sets flag |

### A3. Streak

| Procedure | Tier | Input | Behavior |
|---|---|---|---|
| `streak.get` | authed | — | `{ streak, saves, maxSaves, completedToday }` — server-authoritative, Jakarta days. Poll/refetch after any streak-earning action. |

### A4. Brain Gym (`flashcard.*`)

| Procedure | Tier | HTTP | Input | Behavior |
|---|---|---|---|---|
| `flashcard.start` | authed | POST /flashcard/start | — | Starts a 10-min session with 5 random flashcard questions. Free: 1/day (error if exhausted → show premium gate) |
| `flashcard.get` (alias `session`) | authed | GET /flashcard | — | Latest session status + unanswered questions (resume support) |
| `flashcard.save` (alias `answer`) | authed | POST /flashcard | `{ questionId: number, answerId: number }` | Saves answer, returns correctness (instant feedback UI) |
| `flashcard.submit` | authed | POST /flashcard/submit | — | Finalizes; updates flashcardStreak/totalScore; records streak activity |
| `flashcard.result` | authed | GET /flashcard/result | `{ id?: number }` | Result + review for attempt (default latest) |
| `flashcard.history` | **premium** | GET /flashcard/history | — | Past sessions |
| `flashcard.totalScore` (alias `score`) | authed | POST /flashcard/total-score | — | Cumulative score |
| `flashcard.leaderboard` | authed | GET /flashcard/leaderboard | — | Top 10 + current user's entry/rank |

### A5. Kelas (`subtest.*`)

| Procedure | Tier | HTTP | Input | Behavior |
|---|---|---|---|---|
| `subtest.list` | authed | GET /subtests | `{ limit=50, offset=0 }` | Subtest catalogue |
| `subtest.byShortName` | rate-limited | GET /subtests/by-short-name/{shortName} | `{ shortName, category?, search?, limit?, offset? }` | Subtest + its content items |
| `subtest.content.list` | rate-limited | GET /subtests/{subtestId}/content | `{ subtestId, category?, search?, limit?, offset? }` | Content list |
| `subtest.content.find` | rate-limited | GET /content/{contentId} | `{ contentId }` | Content detail incl. video/note/practice — throws FORBIDDEN when premium-gated |
| `subtest.content.trackView` | authed | POST /content/{id}/view | `{ id }` | Record view (call on open) |
| `subtest.content.recent` | rate-limited | GET /content/recent | — | Recently viewed |
| `subtest.content.progress` | authed | PATCH /content/{id}/progress | `{ id, videoCompleted?, noteCompleted?, practiceQuestionsCompleted? }` | Upsert progress; may record streak |
| `subtest.content.stats` | authed | GET /content/progress/stats | — | Materials-completed count (dashboard card) |

### A6. Latihan Soal (`practicePack.*`)

| Procedure | Tier | HTTP | Input | Behavior |
|---|---|---|---|---|
| `practicePack.list` | authed | GET /practice-packs | — | Packs + user attempt state |
| `practicePack.get` (alias `find`) | authed | GET /practice-packs/{id} | `{ id: number }` | Pack + questions |
| `practicePack.start` | authed | POST /practice-packs/{id}/start | `{ id }` | Create attempt (one per user per pack) |
| `practicePack.save` (alias `answer`) | authed | POST /practice-packs/{id}/{questionId}/save | `{ id, questionId, selectedAnswerId }` | Save answer on ongoing attempt (resumable) |
| `practicePack.submit` | authed | POST /practice-packs/{id}/submit | `{ id }` | Finish attempt |
| `practicePack.history` | authed | GET /practice-packs/history | `{ limit?, offset? }` | Paginated attempt history |
| `practicePack.historyByPack` (alias `historyDetail`) | authed | GET /practice-packs/{id}/history | `{ id }` | One pack's attempt with correctness review |

### A7. Tryout (`tryout.*`)

| Procedure | Tier | HTTP | Input | Behavior |
|---|---|---|---|---|
| `tryout.list` | authed | GET /tryout | — | Published tryouts |
| `tryout.listSubtes` | authed | GET /tryout/{tryoutId}/subtes | `{ tryoutId }` | Subtes list (order, duration, counts) |
| `tryout.start` | authed | POST /tryout/{tryoutId}/start | `{ tryoutId }` | Start or resume session; returns session + subtes states |
| `tryout.questions` | authed | GET /tryout/subtes/{sesiSubtesId}/questions | `{ sesiSubtesId }` | Questions for the running subtes (order, images, choices, ragu/answered flags) |
| `tryout.answer.submit` | authed | POST /tryout/questions/submit-answer | `{ sesiId, sesiSoalId, pilihanId?, isRagu? }` | Save one answer / toggle ragu. Call on every selection — answers persist server-side |
| `tryout.subtes.submit` | authed | POST /tryout/subtes/submit | `{ sesiSubtesId }` | Finish subtes; streak recorded if last |
| `tryout.subtes.autoSubmit` | authed | POST /tryout/subtes/auto-submit | `{ sesiSubtesId }` | Timeout path — call when timer hits 0 |
| `tryout.sesiSubtesInfo` | authed | GET /tryout/sesi-subtes/{sesiSubtesId}/info | `{ sesiSubtesId }` | Server timer/status — **source of truth for the countdown**; resync on foreground |
| `tryout.results` | authed | GET /tryout/{sesiId}/results | `{ sesiId }` | Total + per-subtes scores, pass/fail, rank |
| `tryout.pembahasan` | authed* | GET /tryout/soal/{soalId}/pembahasan | `{ soalId }` | Discussion (*premium enforced in repo layer) |
| `tryout.history` | authed | GET /tryout/history | — | User's sessions |
| `tryout.passingGrade` | authed | GET /tryout/passing-grade | — | Universities + program studi passing grades |

### A8. Payments (`transaction.*`) — read `04-integrations.md` §1 before building UI

| Procedure | Tier | HTTP | Input | Behavior |
|---|---|---|---|---|
| `transaction.perintisAvailability` | pub | GET /transactions/perintis-2027 | — | Current price / early-bird availability |
| `transaction.subscribe` | authed | POST /subscribe | `{ name: "perintis2027", referralCode?, promoCode? }` | Creates pending tx + Midtrans Snap token/redirect URL. Referral (25% off) and promo are mutually exclusive |
| `transaction.validatePromo` | authed | POST /transactions/promo/validate | `{ code, productSlug: "perintis2027" }` | Validates + returns discounted price |
| `transaction.status` | authed | GET /transactions/status | `{ orderId }` | Syncs status from Midtrans (call on return from payment + on app resume while pending) |
| `transaction.webhook` | pub | POST /webhooks/midtrans | Midtrans payload | Server-to-server only — never called by the app |

### A9. Referral (`referral.*`)

| Procedure | Tier | HTTP | Input | Behavior |
|---|---|---|---|---|
| `referral.code` | authed | GET /referral/my-code | — | Own code + usage count (generates if missing) |
| `referral.validate` | authed | POST /referral/validate | `{ code }` | Check without applying |
| `referral.apply` (alias `use`) | authed | POST /referral/use | `{ code }` | Apply a referral code |

### A10. Admin (`admin.*`) — **do not implement in mobile**

Full CRUD trees exist for statistics, universitas/programStudi, practicePack, question, tryout, subtest
content, users, transactions (incl. non-prod payment simulation), promos, referrals, dashboardContent.
Web-only. Listed for completeness; the mobile app must not surface any of it.

---

## PART B — NEW endpoints to build (server work before mobile screens)

Implement as new routers in `packages/api/src/routers/` following existing conventions: `authed` base,
Arktype inputs, explicit `.route({ path, method, tags })`, repos for queries, `db.transaction` for
multi-step writes. Register in `packages/api/src/routers/index.ts`.

### B0. App config

| Procedure | Tier | Input | Output |
|---|---|---|---|
| `app.config` | pub | — | `{ minAppVersion: string, latestAppVersion: string, storeUrls: { ios, android }, featureFlags: { community: boolean, squads: boolean } }` |

Client checks on launch; below `minAppVersion` → blocking upgrade screen.

### B1. Devices & notifications (`device.*`, `notification.*`)

| Procedure | Tier | Input | Behavior |
|---|---|---|---|
| `device.register` | authed | `{ pushToken, platform: "ios"\|"android", deviceName?, appVersion, locale? }` | Upsert by pushToken; reassign to current user if token moved accounts; set active |
| `device.unregister` | authed | `{ pushToken }` | Set inactive — call on logout |
| `notification.list` | authed | `{ cursor?, limit=20 }` | Inbox, newest first, cursor-paginated |
| `notification.unreadCount` | authed | — | `{ count }` — badge |
| `notification.markRead` | authed | `{ id }` | Set read_at |
| `notification.markAllRead` | authed | — | Bulk |
| `notification.preferences.get` | authed | — | All category toggles + reminderTime + quiet hours |
| `notification.preferences.update` | authed | `{ categories?: { [category]: boolean }, reminderTime?, quietHoursStart?, quietHoursEnd? }` | Upsert |

**Server dispatch (not endpoints — background modules):**
- `packages/api/src/lib/push.ts` — send via Expo Push Service; chunk 100/request; handle
  `DeviceNotRegistered` receipts by deactivating `user_device`; respect per-user category prefs and
  quiet hours; always also insert a `notification` inbox row.
- Triggers: cron each minute matching `reminder_time` for users without today's streak; evening
  streak-danger job; live-class T-24h/T-1h scheduler; hook in Midtrans webhook success path; community
  events (reply/mention/accepted answer); admin broadcast on announcement publish.

### B2. Community (`community.*`)

All feeds must exclude content from users blocked in either direction and non-`visible` content
(except the author sees their own `pending_review` items). Post/comment creation requires
`accepted_guidelines_at` set — otherwise error `FORBIDDEN` with a distinct message so the client shows
the guidelines screen. Apply tightened rate limits (e.g. 5 posts / 30 comments per 15 min).

#### Channels & feeds
| Procedure | Tier | Input | Behavior |
|---|---|---|---|
| `community.channels.list` | authed | — | Active channels with post counts |
| `community.feed` | authed | `{ scope: "all"\|"following"\|"channel"\|"group", channelSlug?, groupId?, sort: "newest"\|"trending", cursor?, limit=20 }` | Unified cursor feed; trending = reactions+comments decayed over 48h |
| `community.search` | authed | `{ query, cursor? }` | Post title/body search |

#### Posts & comments
| Procedure | Tier | Input | Behavior |
|---|---|---|---|
| `community.post.create` | authed (rate-limited) | `{ channelSlug? , groupId?, type, title, body (TipTap JSON), imageUrl?, linkedQuestionId?, linkedContentItemId? }` | Exactly one scope; profanity pre-filter → `pending_review` on hit |
| `community.post.get` | authed | `{ id }` | Post + author mini-profile + own reaction state |
| `community.post.update` / `delete` | authed | `{ id, … }` | Author only; delete = status `removed` |
| `community.post.acceptAnswer` | authed | `{ postId, commentId }` | Author of a `question` post only |
| `community.comment.list` | authed | `{ postId, cursor? }` | Top-level + nested replies (1 level) |
| `community.comment.create` | authed (rate-limited) | `{ postId, parentCommentId?, body }` | Notifies post author / parent commenter |
| `community.comment.update` / `delete` | authed | `{ id, … }` | Author only |
| `community.reaction.toggle` | authed | `{ postId? \| commentId?, emoji }` | Add/remove; maintain denormalized counts in a transaction |

#### Social graph & profiles
| Procedure | Tier | Input | Behavior |
|---|---|---|---|
| `community.profile.get` | authed | `{ userId }` | Public mini-profile respecting privacy toggles + follow state; NOT_FOUND if blocked |
| `community.profile.settings.get` / `update` | authed | toggles | Own privacy settings + `acceptGuidelines: true` action |
| `community.follow.toggle` | authed | `{ userId }` | Follow/unfollow |
| `community.follow.lists` | authed | `{ userId, kind: "followers"\|"following", cursor? }` | Lists |
| `community.leaderboard.friends` | authed | — | Weekly streak leaderboard among followed users |

#### Squads
| Procedure | Tier | Input | Behavior |
|---|---|---|---|
| `community.group.create` | authed | `{ name, description? }` | Creator = owner; generates invite code |
| `community.group.join` | authed | `{ inviteCode }` | Errors: full (CONFLICT), already member |
| `community.group.leave` | authed | `{ groupId }` | Owner must transfer or disband |
| `community.group.get` | authed | `{ groupId }` | Members, group streak %, weekly group score |
| `community.group.mine` | authed | — | User's groups |
| `community.group.regenerateInvite` | authed | `{ groupId }` | Owner only |

#### Safety
| Procedure | Tier | Input | Behavior |
|---|---|---|---|
| `community.report.create` | authed | `{ targetType, postId? \| commentId? \| reportedUserId?, reason, detail? }` | Insert; N reports on one target auto-flips it to `pending_review` |
| `community.block.toggle` | authed | `{ userId }` | Block/unblock |
| `community.block.list` | authed | — | Own block list (settings screen) |
| `admin.community.*` | admin | — | Moderation queue (list open reports, resolve, remove/restore content, ban) — web admin, spec'd for the backend, not mobile |

### B3. Account deletion (Apple requirement)

| Procedure | Tier | Input | Behavior |
|---|---|---|---|
| `profile.deleteAccount` | authed | `{ confirmation: "HAPUS" }` | Soft-delete user (anonymize PII, cascade sessions/devices), sign out everywhere. Must be reachable from the app's settings. |
