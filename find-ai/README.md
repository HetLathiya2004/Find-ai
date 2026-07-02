# Find.ai — Phase 1 (Design & UI Only)

> Learn finance. In 5 minutes a day.

A Duolingo-style gamified financial literacy app covering markets, investing, macro economics,
and corporate finance. Built with React Native + Expo (Expo Router).

**Phase 1 scope:** every screen implemented pixel-accurate with full navigation, animations,
haptics, skeleton loading states, and mock data — no live backend. Phase 2 will connect
Supabase auth, real XP transactions, news feeds, and push notifications.

## Getting started

```bash
npm install
npx expo start
```

Open in the iOS simulator, Android emulator, or a dev-client build on device.

> **Note on Expo Go:** `react-native-mmkv` is a native module, so persistence requires a
> development build (`eas build --profile development`). In Expo Go the app automatically
> falls back to in-memory storage — everything still works, state just resets on reload.

## Project structure

```
app/                    Expo Router file-based routes
  (auth)/               Welcome, sign-in, sign-up, onboarding wizard
  (tabs)/               Home, Learn (+ concept detail), Practice, News, Profile
  lesson/[slug]         Fullscreen lesson player
  quiz/[id]             Fullscreen quiz player (3-heart system)
  simulation/[id]       Fullscreen simulation player
  streak.tsx            Streak calendar (modal)
  league.tsx            Weekly leaderboard
components/
  ui/                   Design-system primitives (Card, buttons, progress, confetti…)
  home/ learn/ lesson/ quiz/ profile/
constants/              Design tokens (colors, typography, spacing) + mock data
hooks/                  useMockAuth, useMockProgress, useHaptics, useMockLoading
lib/                    Gamification logic (XP/levels/mastery) + MMKV storage wrapper
```

## Design system

- **Dark-first:** pure black base (`#000000`) with layered surfaces; emerald `#10B981` accent.
- **Inter only:** Regular (400) + Medium (500), loaded via `expo-font`.
- **Domain colors:** Markets blue, Investing green, Macro orange, Corporate Finance purple.
- **Animations:** `react-native-reanimated` throughout — button scale on press, animated
  progress bars, staggered mastery dots, heart-loss sequence, 36-particle confetti.
- **Haptics:** light impact on taps, medium on correct answers, success notification on
  completions, warning on wrong answers.

## Builds & deployment

EAS profiles are configured in `eas.json` (development / preview / production) and CI
workflows live in `.eas/workflows/`.

```bash
npm install -g eas-cli
eas login
eas init

# Development build for device testing
eas build -p ios --profile development
eas build -p android --profile development

# Internal preview
eas build --profile preview

# Production + store submission (TestFlight first, always)
eas build -p ios --profile production --submit
eas build -p android --profile production --submit
```
