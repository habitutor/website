# Third-Party Integrations

Services already integrated server-side are marked **[EXISTS]**; new ones **[NEW]**. No server secret
ever ships in the mobile binary.

---

## 1. Midtrans — payments & subscriptions **[EXISTS, needs mobile strategy]**

### What exists today

- **Midtrans Snap** integration in `packages/api/src/lib/midtrans.ts` (sandbox in non-prod, production
  otherwise). `transaction.subscribe` creates a pending transaction and returns a Snap token/redirect URL.
- Webhook `POST /webhooks/midtrans` with SHA-512 signature verification updates transaction status and
  grants premium (`isPremium`, `premiumTier`, `premiumExpiresAt`).
- Reconciliation safety nets: `transaction.status` (client-triggered), a 5-minute server job for stale
  pending transactions, and per-login reconciliation in session middleware.
- Env: `MIDTRANS_SERVER_KEY` (server only), `MIDTRANS_CLIENT_KEY` (public, may ship in clients).

### ⚠️ App-store policy — read before building any purchase UI

Paket Perintis 2027 is **digital content consumed inside the app**, which triggers in-app-purchase rules:

- **Apple (App Store):** digital content must use Apple In-App Purchase. Opening Midtrans in a WebView
  to unlock in-app digital content is a rejection-grade violation (Guideline 3.1.1). Apps like Netflix
  handle this with a "reader" approach: the iOS app grants access purchased *elsewhere* but does not
  sell or link out to external checkout inside the app.
- **Google Play:** Play Billing is likewise required for in-app digital goods. Google runs a
  **user-choice billing** program (available in Indonesia) that permits an alternative processor
  alongside Play Billing, with a reduced-but-nonzero service fee — this can keep Midtrans in the loop
  on Android, but it must be enrolled and implemented per Google's docs; a plain Midtrans WebView
  without offering Play Billing risks removal.

### Recommended phased strategy

1. **Phase 1 (launch):** the mobile app does **not** sell anything. Premium screens show entitlement
   status from `profile.me`. Non-premium users see benefits + (Android only, if desired) a purchase
   path; on iOS show only "Akun premium aktif otomatis jika kamu sudah membeli" with no external
   purchase link. Purchases keep happening on the website — the shared account makes entitlement
   instant on mobile. Lowest risk, zero new payment code.
2. **Phase 2 (Android):** integrate Midtrans via user-choice billing or Play Billing with a
   server-verified `transaction` row (extend `transaction.subscribe` with a `channel` field:
   `midtrans_snap` | `play_billing` | `app_store`).
3. **Phase 3 (iOS):** Apple IAP with server-side receipt validation (App Store Server API), mapped into
   the same `transaction` table and the same premium-granting code path as the webhook.

**Design instruction for the coding assistant:** build all premium/paywall screens against entitlement
state only (`isPremium`, `premiumTier`, `premiumExpiresAt` from `profile.me`), with the purchase
call-to-action behind a remote feature flag per platform (`app.config`). This makes the payment channel
swappable without app updates.

---

## 2. Push notifications — Expo Push Service + FCM/APNs **[NEW]**

**Recommendation: Expo Push Service** as the delivery layer (the app is Expo; this avoids maintaining
raw FCM HTTP v1 + APNs JWT code). Expo Push wraps FCM (Android) and APNs (iOS).

### Setup checklist

1. **Firebase project** (Android): add the Android app, download `google-services.json` into
   `apps/native`, upload the FCM V1 service-account key to EAS (`eas credentials`).
2. **Apple**: APNs key (.p8) uploaded to EAS; push capability in the provisioning profile (EAS handles
   with `expo-notifications` config plugin).
3. **Client** (`expo-notifications`): request permission only after the pre-prompt screen; get the Expo
   push token (`getExpoPushTokenAsync({ projectId })`); call `device.register` after login and on token
   rotation; `device.unregister` on logout; handle foreground display, background taps, and cold-start
   taps → route via the deep link in the payload.
4. **Server** (`packages/api/src/lib/push.ts`): POST to `https://exp.host/--/api/v2/push/send` in
   chunks of ≤100; poll receipts; deactivate devices on `DeviceNotRegistered`; respect category
   preferences + quiet hours; write the `notification` inbox row in the same transaction as dispatch.
5. **Android channels**: create notification channels matching the category enum (streak, live class,
   tryout, community, payment) so users get OS-level control too.

Deep-link scheme: `habitutor://` (also configure universal links `https://habitutor.id/…` later).

---

## 3. better-auth + Google OAuth **[EXISTS, small additions]**

- Server: `packages/auth/src/index.ts` — email/password + Google (`GOOGLE_CLIENT_ID/SECRET`), Drizzle
  adapter, referral-code generation hook.
- **Mobile additions (server):** add the `expo()` plugin to the better-auth config, set
  `BETTER_AUTH_ACCEPT_BEARER_TOKEN=true`, add `habitutor://` to `trustedOrigins`.
- **Mobile client:** `@better-auth/expo` + `expo-secure-store`. Google sign-in on native requires
  **iOS and Android OAuth client IDs** in Google Cloud Console (the existing web client ID is not
  enough) — use `expo-auth-session`/better-auth social flow per the better-auth Expo docs.
- Password reset stays an email link → opens web; no mobile work beyond a "Cek email kamu" state.

## 4. Resend — transactional email **[EXISTS]**

Password-reset emails from `noreply@habitutor.id` (`RESEND_API_KEY`). No mobile-side work. Optional
later: purchase receipts, weekly progress digests.

## 5. Cloudinary — image storage **[EXISTS, extend]**

Used today for tryout question/choice images (admin uploads; server-side signed via
`CLOUDINARY_*` env). The app only *renders* these URLs (`expo-image` with caching).
**New for community image attachments:** do NOT put the API secret in the app — either
(a) add a small authed ORPC procedure that returns a short-lived signed upload signature, or
(b) create an unsigned upload preset restricted to a `community/` folder with eager moderation
transforms + size limits. Recommendation: (a), consistent with keeping logic server-side.

## 6. Analytics & crash reporting **[NEW, recommended]**

- **Sentry** (`sentry-expo`): crash + error reporting, release health, source maps via EAS.
- **PostHog** (or Amplitude): product analytics. Minimum event set: signup, onboarding completed,
  brain_gym_started/completed, content_viewed/completed, tryout_started/subtes_submitted/completed,
  paywall_viewed, purchase_initiated/succeeded, streak_earned/lost/save_used, post_created,
  comment_created, notification_opened (with category), app_opened_from_push.
- Respect a consent toggle in settings; anonymize IP; this feeds the app-store privacy questionnaires.

## 7. Video — YouTube **[EXISTS]**

Class videos are YouTube URLs (`video_material.video_url`) rendered with `react-native-youtube-iframe`.
No API key needed for playback. Live classes are external links (Zoom/Meet/YouTube) — open with
`expo-web-browser` / `Linking`.

## 8. EAS (Expo Application Services) **[NEW]**

Build + submit + OTA pipeline: `eas build` (CI via GitHub Actions like the existing Docker workflows),
`eas submit`, and **EAS Update** for OTA JS fixes (JS-only changes; never for native module changes).
Channels: `production`, `preview`. Store `EXPO_TOKEN` in GitHub secrets.

## 9. Environment variables summary

| Where | Variable | Notes |
|---|---|---|
| App (public, `EXPO_PUBLIC_*`) | `EXPO_PUBLIC_API_URL` | `https://api.habitutor.id` |
| App (public) | `EXPO_PUBLIC_MIDTRANS_CLIENT_KEY` | Only if/when in-app payment ships |
| App (public) | `EXPO_PUBLIC_POSTHOG_KEY`, `SENTRY_DSN` | |
| Server (new) | `BETTER_AUTH_ACCEPT_BEARER_TOKEN=true` | Enables mobile sessions |
| Server (new) | `EXPO_ACCESS_TOKEN` | Optional, for Expo push security |
| EAS secrets | FCM service account, APNs key, `google-services.json` | Via `eas credentials` |
