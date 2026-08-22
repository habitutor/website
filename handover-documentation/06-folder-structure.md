# Mobile App Folder Structure & Setup

The app lives **inside the existing Turborepo** as a new workspace: `apps/native`. The root
`package.json` already contains a leftover `"dev:native": "turbo -F native dev"` script anticipating
this. Being in-repo is what enables importing `AppRouter` types from `@habitutor/api`.

---

## 1. Workspace layout

```
habitutor/                          (existing monorepo root)
├── apps/
│   ├── web/                        (existing — untouched)
│   ├── server/                     (existing — receives new routers/schema, see 02/03 docs)
│   └── native/                     (NEW — Expo app, workspace name "native")
│       ├── app/                    expo-router file-based routes (see §2)
│       ├── src/
│       │   ├── components/
│       │   │   ├── ui/             base kit: button, card, input, sheet, badge, skeleton, toast…
│       │   │   ├── rich-text/      TipTap-JSON → RN renderer (single shared renderer)
│       │   │   ├── exam/           timer bar, question navigator, choice row, ragu toggle
│       │   │   ├── streak/         indicator, celebration modal, saves display
│       │   │   ├── community/      post card, comment thread, reaction bar, report sheet
│       │   │   └── premium/        gate bottom-sheet, entitlement banner
│       │   ├── hooks/              use-streak, use-exam-timer, use-notification-badge, use-deep-link…
│       │   ├── lib/
│       │   │   ├── orpc.ts         ORPC client + TanStack Query utils (port of apps/web/src/utils/orpc.ts)
│       │   │   ├── auth-client.ts  better-auth Expo client (secure-store, bearer)
│       │   │   ├── notifications.ts  expo-notifications setup, token registration, handlers
│       │   │   └── analytics.ts    PostHog + Sentry init
│       │   ├── stores/             zustand: exam-session.ts, ui-prefs.ts, onboarding-draft.ts
│       │   ├── constants/          copy.ts, avatars.ts, categories.ts
│       │   └── types/
│       ├── assets/                 fonts, squirrel avatars, illustrations (from graphic designer)
│       ├── app.config.ts           Expo config: scheme "habitutor", plugins, EAS project
│       ├── tailwind.config.ts      NativeWind tokens (from the design system)
│       ├── metro.config.js         monorepo-aware Metro (watchFolders: repo root)
│       ├── google-services.json    (git-ignored; via EAS secrets in CI)
│       ├── eas.json                build profiles: development / preview / production
│       └── package.json            name "native"
├── packages/
│   ├── api/                        (existing — add routers: device, notification, community, app-config)
│   ├── auth/                       (existing — add expo plugin + trustedOrigins)
│   ├── db/                         (existing — add schema: device.ts, notification.ts, community.ts)
│   └── shared/                     (existing — put copy/constants shared web↔mobile here if useful)
└── handover-documentation/         (this folder)
```

## 2. Route map (expo-router) with deep links

Scheme: `habitutor://`. Tabs mirror the product's five pillars.

```
app/
├── _layout.tsx                     root: providers (Query, Auth, Theme), push handlers, min-version gate
├── (auth)/
│   ├── login.tsx                   habitutor://login
│   ├── register.tsx                multi-step onboarding wizard (dream campus/major, age, level, subjects, phone)
│   ├── forgot-password.tsx
│   └── permission-primer.tsx       push pre-prompt (after first login)
├── (tabs)/
│   ├── _layout.tsx                 tab bar: Beranda · Kelas · Latihan · Komunitas · Profil
│   ├── index.tsx                   Beranda/dashboard        habitutor://home
│   ├── kelas/
│   │   ├── index.tsx               subtest list             habitutor://kelas
│   │   ├── [shortName]/index.tsx   content list              habitutor://kelas/PU
│   │   └── [shortName]/[contentId].tsx  video/notes/latihan tabs
│   ├── latihan/
│   │   ├── index.tsx               hub: Brain Gym, practice packs, tryout entries
│   │   ├── brain-gym/              intro → session → result   habitutor://brain-gym
│   │   ├── packs/                  list → [id] → riwayat
│   │   └── tryout/                 list → [tryoutId] → session → result/[sesiId]
│   │                                                        habitutor://tryout/{id}
│   ├── komunitas/
│   │   ├── index.tsx               feed + channel switcher    habitutor://komunitas
│   │   ├── post/[id].tsx           post detail                habitutor://post/{id}
│   │   ├── create.tsx              new post (guidelines gate)
│   │   ├── profil/[userId].tsx     public profile
│   │   └── squad/                  mine → [groupId] → join
│   └── profil/
│       ├── index.tsx               own profile + streak + referral
│       ├── edit.tsx
│       ├── notifikasi.tsx          inbox                      habitutor://notifikasi
│       ├── pengaturan/             settings: notif prefs, blocked users, privacy, delete account
│       └── premium.tsx             entitlement / paywall      habitutor://premium
└── +not-found.tsx
```

Exam-session screens (`tryout/session`, `brain-gym/session`) set `gestureEnabled: false` and confirm
before exit.

## 3. Setup commands

```bash
# from monorepo root
bun create expo apps/native --template default   # then rename package to "native"
cd apps/native
bunx expo install expo-router expo-secure-store expo-notifications expo-image expo-haptics \
  expo-web-browser expo-dev-client @react-native-async-storage/async-storage \
  react-native-safe-area-context react-native-screens @react-native-community/netinfo
bun add @orpc/client @orpc/tanstack-query @tanstack/react-query @tanstack/react-form arktype \
  better-auth @better-auth/expo zustand nativewind class-variance-authority clsx tailwind-merge \
  @shopify/flash-list react-native-youtube-iframe sonner-native
bun add -d tailwindcss

# workspace deps (types only at runtime boundaries)
#   "@habitutor/api": "workspace:*"      → AppRouter type for ORPC client
#   "@habitutor/shared": "workspace:*"   → shared constants/domain helpers

# EAS
bunx eas init && bunx eas credentials   # FCM service account + APNs key
```

Metro must be monorepo-aware (`watchFolders: [repoRoot]`, `nodeModulesPaths` for hoisted deps) and
`app.config.ts` needs `scheme: "habitutor"`, the notifications plugin, and `extra.eas.projectId`.

## 4. Environment

`.env` (public values only — Expo inlines `EXPO_PUBLIC_*` into the bundle):

```
EXPO_PUBLIC_API_URL=https://api.habitutor.id     # dev: http://<LAN-IP>:3001 (not localhost — device ≠ machine)
EXPO_PUBLIC_POSTHOG_KEY=...
SENTRY_DSN=...            # via sentry-expo config
```

Server `.env` additions (see `04-integrations.md` §9): `BETTER_AUTH_ACCEPT_BEARER_TOKEN=true`,
`EXPO_ACCESS_TOKEN`. Add `habitutor://` (and dev `exp://` origins) to better-auth `trustedOrigins`
and the app's origin handling to server CORS if needed (bearer requests aren't cookie/CORS-credentialed).

## 5. Suggested build order (dependency-driven)

1. **Foundations:** workspace setup, Metro/monorepo config, NativeWind tokens, base UI kit, ORPC +
   auth clients, root layout/providers, `app.config` min-version gate.
2. **Auth + onboarding** (screens exist server-side already — fastest end-to-end slice).
3. **Server work in parallel:** bearer flag + expo plugin; device/notification schema + routers.
4. **Dashboard + streak + profile** (read-heavy, low risk).
5. **Kelas** (rich-text renderer is the critical shared component — build it here).
6. **Brain Gym**, then **Latihan Soal**, then **Tryout** (increasing exam-flow complexity, shared
   exam components).
7. **Push notifications** end-to-end (primer → token → prefs → inbox → deep links).
8. **Premium/entitlement screens** (per the phased payment strategy in `04-integrations.md` §1).
9. **Community** (forums + safety first, then follows/profiles, then squads).
10. **Hardening:** offline states, accessibility pass, analytics events, store assets, EAS production
    pipeline, store-review compliance checklist (UGC moderation, account deletion, privacy labels).
