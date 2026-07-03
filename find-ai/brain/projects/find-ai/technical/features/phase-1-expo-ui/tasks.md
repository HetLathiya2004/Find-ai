# Phase 1 — Tasks

Status legend: `[x]` done · `[ ]` pending · `[-]` deferred

## 1. Scaffold & tooling

- [x] Create Expo app in `find-ai/` with Expo Router tabs template
- [x] Install core deps (reanimated, gesture-handler, svg, haptics, fonts)
- [x] Configure `app.json` (dark UI, splash, bundle IDs, EAS project ID)
- [x] Configure `eas.json` + `.eas/workflows/` (deploy, preview)
- [x] Add `babel.config.js` with reanimated plugin
- [x] Downgrade to **Expo SDK 54** for Expo Go compatibility
- [x] Replace `lucide-react-native` → `@expo/vector-icons`
- [ ] First TestFlight / dev-client build on device

## 2. Design tokens

- [x] `constants/colors.ts` — backgrounds, accents, domains, gradients
- [x] `constants/typography.ts` — Inter sizes, line heights, tracking
- [x] `constants/spacing.ts` — radii, padding, gaps, tab bar height
- [x] Load Inter fonts in root `_layout.tsx` with splash gate

## 3. UI primitives (`components/ui/`)

- [x] AppText, Card, PrimaryButton, GhostButton
- [x] ProgressBar, SegmentBar, CircularProgress
- [x] Tag, Chip, StatPill
- [x] MasteryDots, HeartDisplay, Confetti, XPReward
- [x] SkeletonLoader, ScreenSkeleton
- [x] BackRow, FormInput

## 4. Feature components

- [x] Home: DailyGoal, Resume, News, League, DailyChallenge cards
- [x] Learn: DomainFilter, ConceptCard
- [x] Lesson: LessonCard, ExitModal
- [x] Quiz: QuestionCard, OptionButton
- [x] Profile: StatsGrid, BadgeGrid, MasteryList

## 5. Mock data & state

- [x] `constants/mock-data.ts` — 12 concepts, lessons, quizzes, sims, news, league, badges
- [x] `lib/gamification.ts` — XP levels, mastery, domain helpers
- [x] `lib/storage.ts` — MMKV with memory fallback
- [x] `hooks/useMockAuth.tsx` — sign in/up, onboarding, settings
- [x] `hooks/useMockProgress.tsx` — XP, concept progress, daily goal
- [x] `hooks/useHaptics.ts`, `hooks/useMockLoading.ts`

## 6. Auth flow (`app/(auth)/`)

- [x] welcome.tsx
- [x] sign-up.tsx (email validation)
- [x] sign-in.tsx
- [x] onboarding.tsx (3-step wizard)
- [x] index.tsx redirect logic

## 7. Tab screens (`app/(tabs)/`)

- [x] Custom tab bar `_layout.tsx`
- [x] home.tsx — dashboard with all card variants
- [x] learn/index.tsx + learn/[slug].tsx + learn/_layout.tsx
- [x] practice.tsx — review, weak concepts, simulations
- [x] news.tsx — article cards with "Learn this" CTA
- [x] profile.tsx — stats, badges, mastery, settings, sign out

## 8. Fullscreen players

- [x] lesson/[slug].tsx — segment bar, exit modal, XP celebration
- [x] quiz/[id].tsx — hearts, feedback, score, out-of-hearts
- [x] simulation/[id].tsx — choices, feedback, learner distribution
- [x] streak.tsx — 28-day calendar, stats
- [x] league.tsx — promotion/demotion zones, 30 users

## 9. Polish

- [x] Skeleton loaders on tab screens
- [x] Haptics on all interactive elements
- [x] Reanimated press animations on cards/buttons
- [x] Dark-only `+html.tsx` web background
- [ ] Branded icon + splash assets (still template placeholders)

## 10. Documentation

- [x] `README.md` in repo
- [x] Developer Brain feature docs (this folder)
- [ ] Playbook: `expo start --tunnel` local dev flow
- [ ] Playbook: EAS dev build + TestFlight

## Phase 2 handoff (not started)

- [ ] Supabase auth replacing `useMockAuth`
- [ ] Real progress API replacing `useMockProgress`
- [ ] MMKV persistence in dev-client build
- [ ] Live news feed integration
- [ ] Push notifications for streaks
