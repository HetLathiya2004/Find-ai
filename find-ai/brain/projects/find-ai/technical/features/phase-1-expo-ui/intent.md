# Phase 1 — Expo UI Shells (Intent)

## Goal

Build **Find.ai** — a Duolingo-style gamified financial literacy mobile app — as a complete **design & UI implementation** on React Native + Expo. Every screen is navigable, animated, and populated with mock data. No live backend.

**Tagline:** "Learn finance. In 5 minutes a day."

## Motivation

- Ship a pixel-accurate mobile experience before backend integration (Phase 2).
- Validate information architecture, gamification UX, and design system on device.
- Give engineers and designers a stable shell to wire Supabase, real XP, and news APIs later.

## Scope (Phase 1 — IN)

| Area | Included |
|------|----------|
| Screens | Welcome, auth, onboarding, home, learn, concept detail, lesson/quiz/simulation players, practice, news, league, streak, profile |
| Navigation | Expo Router: `(auth)`, `(tabs)`, fullscreen immersive routes |
| Design system | Colors (theme module), typography, spacing tokens; UI primitives; card-based layout |
| Appearance | Dark / Light / System preference; Buck green accents; Nunito type |
| Gamification UI | XP, streaks, hearts, mastery dots, confetti, league, badges |
| State | Mock auth + progress via React context; in-memory persistence in Expo Go |
| Animations | Reanimated micro-interactions, progress fills, celebrations |
| Haptics | Mapped to interaction importance |
| Skeleton loaders | Per-screen loading placeholders |
| EAS | `app.json`, `eas.json`, workflow stubs |

## Out of scope (Phase 2 — NOT IN)

- Supabase auth / database
- Real XP transactions, streak server logic, league matchmaking
- Live news API, push notifications, spaced repetition
- App Store / Play Store submission
- Native persistence via MMKV in Expo Go (requires dev build)

## Constraints

- **Platform:** iOS + Android via Expo SDK **54** (matches public Expo Go on App Store / Play Store).
- **Repo path:** `/workspace/find-ai` (package at repo root; Lovable web app lives in parent `/workspace`).
- **EAS project:** `de0490e8-07f0-46e3-a108-c76eeee1b62c`, slug `chaitanya`.
- **Branch:** `cursor/find-ai-phase-1-dc09`.
- **Appearance:** Dark-first with Buck green; Light and System preferences via Profile → Theme (`theme/` module).
- **Fonts:** Nunito Regular / Bold / ExtraBold / Black (400/700/800/900).
- **Icons:** `@expo/vector-icons` (Ionicons / Feather / MaterialCommunityIcons) — not `lucide-react-native` (React 19 peer conflict on SDK 54).

## Success criteria

- [x] All 16 routes implemented and reachable
- [x] Design tokens drive all styling (no magic numbers scattered in screens)
- [x] Mock data covers all four financial domains (12 concepts)
- [x] TypeScript passes; Metro bundle exports successfully
- [x] Runnable in Expo Go SDK 54 via `npx expo start --tunnel`
- [ ] Dev-client build with MMKV persistence (deferred)
- [ ] TestFlight build (deferred)

## Related

- **Repository:** `/workspace/find-ai`
- **PR:** `cursor/find-ai-phase-1-dc09` on `HetLathiya2004/Find-ai`
- **Appearance follow-up:** `../theme-system/`
- **Next feature:** Phase 2 — Supabase backend integration
