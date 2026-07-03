# Phase 1 — Exploration

## System overview

Find.ai Phase 1 is a **client-only** Expo app. All data lives in `constants/mock-data.ts`. User/session state flows through React context providers persisted to memory (MMKV attempted in `lib/storage.ts` but falls back when native module unavailable).

```
┌─────────────────────────────────────────────────────────┐
│  app/_layout.tsx                                        │
│  MockAuthProvider → MockProgressProvider → Expo Router  │
└─────────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
   useMockAuth()                  useMockProgress()
   (auth, onboarding)             (XP, concepts, daily goal)
         │                              │
         ▼                              ▼
   constants/mock-data.ts        lib/storage.ts (MMKV / memory)
   lib/gamification.ts
```

## Repository layout

```
find-ai/
├── app/                          # Expo Router routes
│   ├── index.tsx                 # Redirect → auth or home
│   ├── (auth)/                   # welcome, sign-in, sign-up, onboarding
│   ├── (tabs)/                   # home, learn, practice, news, profile
│   ├── lesson/[slug].tsx         # Fullscreen lesson player
│   ├── quiz/[id].tsx             # Fullscreen quiz (3 hearts)
│   ├── simulation/[id].tsx       # Fullscreen simulation
│   ├── streak.tsx                # Modal streak calendar
│   └── league.tsx                # Leaderboard
├── components/
│   ├── ui/                       # Design primitives (15+)
│   ├── home/ learn/ lesson/ quiz/ profile/
├── constants/                    # colors, typography, spacing, mock-data
├── hooks/                        # useMockAuth, useMockProgress, useHaptics, useMockLoading
├── lib/                          # gamification.ts, storage.ts
├── assets/fonts/                 # Inter-Regular, Inter-Medium
├── app.json / eas.json
└── brain/                        # This documentation (Developer Brain)
```

## Navigation flow

```
index
 ├── (not authed) → (auth)/welcome → sign-up | sign-in → onboarding → (tabs)/home
 └── (authed)     → (tabs)/home

(tabs) — bottom bar: Home | Learn | Practice | News | Profile
  learn/[slug]     → concept detail → lesson | quiz | simulation (fullscreen)
  home cards       → streak (modal), league (stack), lesson (fullscreen)

Fullscreen routes hide tab bar (presentation: fullScreenModal / modal).
```

## Code flow — auth

1. `app/index.tsx` reads `useMockAuth()`.
2. `signUp` → `onboarded: false` → onboarding wizard.
3. `signIn` → `onboarded: true` → home (skips onboarding).
4. State persisted via `lib/storage.ts` key `auth-state`.

## Code flow — learning loop

1. **Learn** → `ConceptCard` → `learn/[slug]` pathway.
2. **Lesson** → card-by-card advance → `completeLesson` → XP reward overlay.
3. **Quiz** unlocked after lesson complete → hearts + per-answer feedback.
4. **Simulation** unlocked after quiz passed.
5. Progress stored per `concept_id` in `useMockProgress().concepts`.

## Mock data inventory

| Entity | Count | Location |
|--------|-------|----------|
| Concepts | 12 | 4 domains × 3 each |
| Lessons | 12 | 1 per concept, multi-card |
| Quizzes | 12 | 3 questions each, 70% pass |
| Simulations | 12 | 3 choices + learner distribution |
| News articles | 6 | Linked to concepts |
| Badges | 6 | Earned / unearned states |
| League users | 30 | Bronze tier, weekly XP |
| Daily challenge | 1 | Inflation Basics |

## Tech stack (as built)

| Package | Version | Role |
|---------|---------|------|
| expo | ~54.0.0 | Runtime (Expo Go compatible) |
| expo-router | ~6.0.24 | File-based routing |
| react-native | 0.81.5 | UI framework |
| react-native-reanimated | ~4.1.1 | Animations |
| react-native-svg | 15.12.1 | Circular progress, charts-ready |
| @expo/vector-icons | ^15.0.3 | Tab + UI icons |
| expo-haptics | ~15.0.8 | Tactile feedback |

**Not used in final build:** NativeWind (StyleSheet + tokens instead), victory-native (no charts in Phase 1), react-native-mmkv (removed from deps; storage falls back to memory).

## SDK version history (debugging note)

| SDK | Why changed |
|-----|-------------|
| 57 | Initial scaffold from `create-expo-app` — **incompatible with Expo Go on device** |
| 52 | First downgrade attempt |
| **54** | **Current** — matches user's Expo Go SDK 54 |

## Open questions / uncertainties

- Expo Go tunnel (`--tunnel`) intermittently fails with ngrok errors in cloud VM; local `npx expo start --tunnel` is more reliable.
- MMKV persistence requires `eas build --profile development`; not yet validated on device.
- Icon/splash assets are Expo template placeholders — branded assets pending.
