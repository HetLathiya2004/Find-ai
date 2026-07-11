# Phase 1 — Architecture & Design Decisions

This document is the **source of truth for how Find.ai should look, feel, and behave** in Phase 1. All new screens and components must follow these rules.

---

## Decision 1: Dark-first theming with Buck green

**What:** Dark remains the default finance shell — soft black-green
(`#10140F`) with layered surfaces (`#171C15`, `#20271D`). Buck green
(`#58CC02`) is the primary accent in both schemes. Users can also choose
**Light** or **System** from Profile → Settings → Theme.

**Why:** Finance apps signal trust with dark themes (Robinhood, Bloomberg).
Green signals growth/profit. Optional light mode and system follow-OS keep
the Buck brand while matching device preference.

**Rules:**
- UI reads live tokens via `useColors()` / `useTheme()` from `@/theme` — never bake scheme-specific hex into module-level StyleSheets
- Root views use `colors.bg` — never the raw system background
- Cards: `surface1`; nested elements: `surface2`
- Primary CTAs: emerald fill, **white** (`inkOnAccent`) label text
- Success/correct: `accent`; errors/hearts: `danger`; in-progress/streak: `warning`
- Brand / domain accents are shared across schemes (`theme/brand.ts`)
- Preference persists in MMKV/memory under `theme-preference` (`lib/storage.ts`)

**Tokens:** `theme/` module (public API `@/theme`). Compatibility shims:
`constants/colors.ts`, `hooks/useTheme.tsx`.

**See also:** `../theme-system/`

---

## Decision 2: Nunito font, four weights

**What:** Nunito Regular (400), Bold (700), ExtraBold (800), and Black (900).

**Why:** The rounded forms support the coach-led learning experience while
remaining highly legible for finance content.

**Rules:**
- Load via `expo-font` in `app/_layout.tsx`; hold splash until ready
- Headings: Nunito ExtraBold/Black, 20–48px
- Body: Nunito Regular, 14–16px
- Labels: Nunito Regular, 10px, uppercase, `tracking.wider` (1.1px), `textMuted`

**Implementation:** `components/ui/AppText.tsx` with `weight`, `size`, `label` props.

**Tokens:** `constants/typography.ts`, `assets/fonts/`

---

## Decision 3: File-based routing (Expo Router)

**What:** Route groups `(auth)` and `(tabs)` plus standalone fullscreen routes.

**Why:** Clean auth vs app separation. Immersive players hide tab bar (Duolingo pattern).

| Group / route | Tab bar | Presentation |
|---------------|---------|--------------|
| `(auth)/*` | Hidden | Stack, slide |
| `(tabs)/*` | Visible | Tabs |
| `lesson/[slug]` | Hidden | `fullScreenModal` |
| `quiz/[id]` | Hidden | `fullScreenModal` |
| `simulation/[id]` | Hidden | `fullScreenModal` |
| `streak` | Hidden | `modal` |
| `league` | Hidden | Stack |

**Chrome rules:**
- Fullscreen: X close top-left; exit modal before abandoning progress
- Drill-down: `BackRow` (chevron + "Back")

---

## Decision 4: Custom bottom tab bar

**Specs:**
- Height: 80px + safe area
- Background: `surface1`, top border `2px borderDefault`
- Icons: `@expo/vector-icons` (Ionicons), 24px
- Active: emerald icon + Nunito Bold 10px label
- Inactive: muted icon + Nunito SemiBold 10px label
- No elevation, shadow, or blur
- Haptic: light impact on tab press

**Tabs:** Home | Learn | Practice | News | Profile

**File:** `app/(tabs)/_layout.tsx`

---

## Decision 5: Card-based layout system

**Component:** `components/ui/Card.tsx`

| Variant | Border | Use |
|---------|--------|-----|
| `default` | `borderDefault` | Normal content |
| `strong` | `borderStrong` | Stats, interactive emphasis |
| `highlighted` | `accent` | Selected / highlighted |

**Specs:**
- Background: `surface1`
- Border radius: 16px
- Padding: 20px (`normal`) or 24px (`large`)
- Press: `scale(0.98)` spring, 100ms, if `onPress` provided

---

## Decision 6: Gamification visual language

| Element | Treatment |
|---------|-----------|
| **XP pill** | ⚡ + number, `surface1` bg, `borderStrong`, accent number |
| **Streak pill** | 🔥 + number, same shell, `warning` number |
| **XP celebration** | Full-screen `XPReward`: "+N XP" 48px accent, confetti, spring scale-in |
| **Circular progress** | SVG 88px, 6px stroke, accent on `borderDefault` track |
| **Progress bar** | 6px height, rounded, accent fill, animated 600ms |
| **Mastery dots** | 5 × 8px circles, staggered fill animation |
| **Hearts** | 3 × Lucide-style icons via Ionicons; loss = scale up then fade |
| **Confetti** | 36 Buck-green/gold/blue/red rectangles, staggered 40ms, 1600ms fall |
| **Badge** | 48px emoji, earned = full opacity + `borderStrong`; unearned = 30% + `borderDefault` |
| **League rank** | Large rank number + "of N" muted suffix; promotion/demotion zone dots |

**Logic:** `lib/gamification.ts` — levels, mastery labels, domain colors, greetings.

---

## Decision 7: Animation strategy (3 tiers)

**Library:** `react-native-reanimated` only.

| Tier | Examples | Pattern |
|------|----------|---------|
| **1 Micro** | Button/tab press | `scale(0.98)`, spring damping 15 |
| **2 Progress** | Bar fill, mastery dots, heart loss | `withTiming` / `withSequence` / staggered `withDelay` |
| **3 Celebration** | Confetti, XP overlay | Spring scale-in, 36 particles, opacity fade |

**No custom page transitions** beyond Expo Router defaults.

---

## Decision 8: Mock data architecture

**What:** All content in `constants/mock-data.ts`; session state in context + `lib/storage.ts`.

**Why:** Phase 1 is design-only. MMKV gives real persistence in dev builds; memory fallback in Expo Go.

**Providers:**
- `MockAuthProvider` — auth, onboarding, settings
- `MockProgressProvider` — XP, per-concept lesson/quiz/sim status, daily goal

---

## Decision 9: Skeleton loading states

**Component:** `components/ui/SkeletonLoader.tsx`

- Background: `surface2`
- Pulse: opacity 0.5 → 1.0, 1200ms infinite
- Variants: `text`, `card`, `circle`
- Hook: `useMockLoading(600ms)` simulates network delay on tab screens

---

## Decision 10: Haptic feedback

**Hook:** `hooks/useHaptics.ts`

| Level | When |
|-------|------|
| `light` | Tab, card, filter, option select |
| `medium` | Correct answer, lesson advance |
| `success` | Lesson/quiz complete, badge |
| `warning` | Wrong answer, heart lost, sign out |

---

## Decision 11: Domain color coding

| Domain | Hex | Usage |
|--------|-----|-------|
| Markets | `#1CB0F6` | Filter pill, concept left border, label |
| Investing | `#58CC02` | Same |
| Macro | `#F97316` | Same |
| Corporate Finance | `#8B5CF6` | Same |
| All (filter) | White border + text when active | |

**Helpers:** `domainColor()`, `domainLabel()` in `lib/gamification.ts`

---

## Decision 12: Lesson player (immersive)

**Layout:**
- Top: `[X]` | `SegmentBar` | `+XP pill`
- Center: `LessonCard` (title, body, optional monospace visual hint in `surface2` box)
- Bottom: `PrimaryButton` "Tap to continue"
- Exit: `ExitModal` — "Lose your progress?"

**File:** `app/lesson/[slug].tsx`, `components/lesson/LessonCard.tsx`

---

## Decision 13: Quiz hearts & feedback

**Flow:**
1. Question + 4 `OptionButton`s
2. Tap → immediate reveal (correct: accent border + check; wrong: `#555` + X, lose heart)
3. Explanation fades in below
4. "Continue" → next question or score screen
5. 0 hearts → "Out of hearts" screen

**Option states:** `default` | `selected-correct` | `selected-wrong` | `revealed-correct` | `disabled`

**File:** `app/quiz/[id].tsx`, `components/quiz/QuestionCard.tsx`

---

## Decision 14: Styling approach (no NativeWind)

**What:** StyleSheet + design tokens, not Tailwind/NativeWind.

**Why:** Original spec listed NativeWind; implementation uses explicit tokens for Expo SDK 54 stability and type safety. Spacing/type stay in `constants/`; colors come from the live theme palette.

**Pattern:**
```typescript
import { Spacing } from '@/constants/spacing';
import { type ColorPalette, useColors } from '@/theme';

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    screen: { backgroundColor: colors.bg },
  });
}

export function Screen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  // ...
}
```

---

## Decision 15: Icons (@expo/vector-icons)

**What:** Ionicons from `@expo/vector-icons` for tabs and UI chrome.

**Why:** `lucide-react-native` caused React 19 peer dependency conflicts on SDK 54. Replaced in commit `0cc217e`.

---

## Screen inventory (16 routes)

| # | Route | Purpose |
|---|-------|---------|
| 1 | `(auth)/welcome` | Hero + Get started |
| 2 | `(auth)/sign-up` | Email/password mock validation |
| 3 | `(auth)/sign-in` | Returning user |
| 4 | `(auth)/onboarding` | Goal → daily minutes → name |
| 5 | `(tabs)/home` | Dashboard cards |
| 6 | `(tabs)/learn` | Concept browser + domain filter |
| 7 | `(tabs)/learn/[slug]` | Activity pathway + mastery |
| 8 | `lesson/[slug]` | Card-by-card player |
| 9 | `quiz/[id]` | Hearts + feedback |
| 10 | `simulation/[id]` | Choices + distribution bars |
| 11 | `(tabs)/practice` | Review, weak concepts, sims |
| 12 | `(tabs)/news` | Article feed |
| 13 | `league` | 30-user leaderboard |
| 14 | `streak` | 28-day calendar |
| 15 | `(tabs)/profile` | Stats, badges, settings |
| 16 | `index` | Auth redirect |

---

## How to extend (Phase 2+)

1. **New screen:** Add route under `app/`, use existing primitives, follow token imports.
2. **New data:** Extend `mock-data.ts` first; later swap provider internals for Supabase.
3. **New gamification UI:** Add primitive in `components/ui/`, document visual treatment in this file.
4. **Breaking design change:** Update tokens in `theme/` (colors) or `constants/` (type/spacing), then primitives, then screens — never invert order.
5. **Theme change:** Extend `theme/palettes.ts` / `theme/gradients.ts`; keep brand accents in `theme/brand.ts`; UI must keep using `useColors()`.

---

## Mascot redesign (2026-07)

The visual layer now uses Nunito (400/700/800/900), Buck green accents,
3D learning controls, and **Buck the Bull**, using the five PNG poses exported
from the corrected `patelchaitany/find-ai-v2` Lovable repository: idle, wave,
cheer, think, and sad. Buck appears at high-value moments only:
welcome/onboarding, the home coach prompt, loading, quiz feedback, XP rewards,
API/empty states, and streaks. Reanimated wave, pop, and bounce motion reuse
the existing three-tier motion strategy.

The redesign is presentation-only. Expo Router structure and all
`useAuth`/`useProgress`/course/news/leaderboard/daily-goal/streak hooks remain
unchanged; app data still flows through the authenticated FastAPI gateway.
The original reference was incorrect. The corrected repository contains the
full UI source and Lovable asset metadata; its Buck PNGs are now bundled in
`assets/mascot/`.

**Appearance (follow-up):** The product is no longer dark-only. Dark remains
the default shell; light and system preferences are first-class via the
`theme/` module and Profile → Theme. See `../theme-system/`.
