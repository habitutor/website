# Development Guidelines — Translating the UI Designs into Code

The UI/UX for every screen was produced by professional designers with a complete design system
(tokens, component inventory, state annotations, clickable prototypes). The coding assistant's job is
**faithful translation**, not reinterpretation. These rules govern how.

---

## 1. Design-to-code workflow (per screen)

1. **Identify the screen** in the design file and its route in the navigation map (`06-folder-structure.md`).
2. **Inventory before building:** list every component instance on the screen; check whether each
   already exists in `components/ui/` (base) or `components/` (feature). Build missing base components
   first, in isolation, matching the design system — never inline one-off styles for something that is
   clearly a system component (buttons, cards, badges, inputs, sheets).
3. **Map data requirements** to API procedures from `03-api-contract.md`. Every dynamic element on the
   screen must trace to a specific procedure field. If a design shows data no endpoint provides, do not
   fake it client-side — flag it as a backend gap.
4. **Implement all required states.** The design brief mandates, for each applicable screen:
   first-use, loading (skeletons, not spinners, for content lists), empty, populated, success,
   validation error, request error, offline/poor connection, permission denied, and locked/premium.
   Community screens additionally: deleted, reported, blocked, moderated. Commerce screens additionally:
   pending, failed, cancelled, expired. A screen is not done with only the happy path.
5. **Wire interactions**: optimistic updates for reactions/follows; disabled+spinner submit buttons;
   pull-to-refresh on feeds; haptics (`expo-haptics`) on streak/celebration moments.
6. **Verify against the design**: spacing, typography scale, and token usage — not eyeballed hex codes.

## 2. Component conventions (carry over from the web codebase)

- Functional components only; TypeScript prop interfaces; destructured props.
- **NativeWind (Tailwind)** classes with the `cn()` utility (clsx + tailwind-merge); variants with
  **cva**. One component per file; kebab-case folders; PascalCase component names;
  camelCase functions/variables; UPPER_SNAKE_CASE constants.
- Separate presentational component from container/data logic when a screen gets complex; custom hooks
  in `hooks/` for reusable logic (e.g. `useStreak()`, `useExamTimer()`, `useNotificationBadge()`).
- Keep functions under ~50 lines; minimize comments — code should be self-documenting.
- Indentation: tabs; double quotes; 120-char lines (Biome config is shared from the monorepo root —
  run `bun lint:fix` before committing).

## 3. Design tokens

Extract tokens from the design file into `tailwind.config.ts` (NativeWind theme): color palette,
typography scale, spacing scale, radii, and icon sizes — **named exactly as the designers named them**
so future design updates map 1:1. Never hardcode hex values or px sizes in components; always reference
tokens. Support the platform font scaling (allowFontScaling stays on; test at 130% text size).

## 4. State management rules

| Kind of state | Where it lives |
|---|---|
| Server data (everything from the API) | TanStack Query via ORPC utils — never copied into zustand |
| Session/user snapshot | better-auth Expo client hook (`useSession`) |
| In-exam transient state (current question index, local timer tick) | zustand store, reset on exam exit; answers are still saved to the server on every selection |
| UI preferences, onboarding draft | AsyncStorage-persisted zustand store |
| Notification badge | TanStack Query (`notification.unreadCount`) with refetch on focus + on push receipt |

Query conventions (mirror `apps/web/src/utils/orpc.ts`): toast user-visible messages for defined ORPC
errors; invalidate related queries after mutations (e.g. `streak.get` after `flashcard.submit`);
`staleTime` generous for static content (subtests, passing grades), zero for session/exam data.

## 5. Feature-specific implementation notes

- **Exam screens (tryout, Brain Gym):** the server owns the clock. Fetch `deadline`/`sesiSubtesInfo`,
  compute remaining time from server timestamps, resync on app foreground (`AppState`), and call
  `autoSubmit` when it hits zero. Never trust an interval that ran in the background. Save every answer
  immediately (`answer.submit` / `flashcard.save`) so process death loses nothing.
- **Premium gating:** catch `FORBIDDEN` from content/pembahasan endpoints → show the premium gate
  (bottom sheet), never a raw error. Entitlement source of truth: `profile.me`.
- **Rich text (TipTap JSON):** build ONE renderer component (`components/rich-text/`) handling the node
  types used by the platform (paragraph, bold/italic/underline, lists, images, math if present in
  content) and reuse it for notes, questions, pembahasan, and community posts. Snapshot-test it against
  real payloads.
- **Streak celebration:** after any mutation that can earn the day's streak, refetch `streak.get`;
  if `completedToday` flipped to true, fire the celebration modal + haptics exactly once.
- **Deep links:** every push notification, and the Midtrans return flow, route through expo-router
  deep links. Test cold-start, backgrounded, and foreground paths for each link target.
- **Lists:** FlashList (Shopify) for feeds and long question navigators; stable keys; memoized rows.

## 6. Error, loading, offline

- Global fetch error → non-blocking toast (sonner-equivalent: `sonner-native` or `react-native-toast`).
- Screen-level load failure → inline error state with "Coba Lagi" retry button (designs include this state).
- Offline banner via `@react-native-community/netinfo`; queries pause and resume automatically; exam
  screens show a persistent "Koneksi terputus — jawaban akan tersimpan saat kembali online" treatment
  and retry queued answer saves.

## 7. Language & copy

- **All user-facing text is Bahasa Indonesia**, casual-supportive register matching existing product
  copy: "kamu" (never "Anda"), motivational but not childish, sparing emoji (🔥 for streak, 🎉 for
  success). Examples from production: "Streak kamu menunggu!", "ragu-ragu", "pembahasan",
  "Kelas", "Latihan Soal", "Tryout".
- Keep the established product nouns exactly: **Brain Gym** (not "flashcards" in UI), **Kelas**,
  **Latihan Soal**, **Tryout**, **Paket Perintis 2027**, subtest short names (PU, PPU, PBM, PK, LBI,
  LBing, PM).
- Centralize strings in a `constants/copy.ts` (or i18n file) rather than scattering literals, so copy
  review is possible in one place.

## 8. Accessibility (mandated by the design brief)

Contrast ≥ 4.5:1; touch targets ≥ 44pt; `accessibilityLabel`/`Role` on all interactive elements;
status never conveyed by color alone (streak/pass-fail/correctness all pair color with icon or text);
captions noted for videos; screens usable at large text sizes.

## 9. Testing & quality gates

- Unit tests for pure logic (timer math, TipTap renderer, deep-link parsing) co-located
  (`*.test.ts`) — run with the repo's test runner (`bun test`).
- Component tests for the base UI kit with React Native Testing Library.
- Manual device matrix before release: small Android (5.5", Android 10), mid Android, iPhone SE, recent
  iPhone; both OS-level dark mode settings (app may be light-only if designs say so — follow designs).
- CI: `bun lint`, `bun check-types`, `bun test`, then EAS build on the `preview` channel per PR merge.

## 10. Definition of done (per the design handoff contract)

A screen is done when: it covers the agreed flow **and all applicable states**, uses shared
tokens/components, matches the design at token level, handles offline/error, has Indonesian copy
reviewed against §7, passes lint/type/test gates, and deep links into it work from a cold start.
