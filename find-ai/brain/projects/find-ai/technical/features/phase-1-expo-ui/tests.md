# Phase 1 — Tests & Validation

## Test strategy

Phase 1 is **UI shell + mock state** — no automated E2E suite yet. Validation is:

1. **Static:** TypeScript compile (`tsc --noEmit`)
2. **Build:** Metro bundle export (`expo export`)
3. **Manual:** Expo Go SDK 54 on physical device
4. **Visual:** Screen-by-screen walkthrough against `architecture.md`

Automated unit/integration tests deferred to Phase 2 when business logic moves server-side.

---

## Test cases executed

| # | Test | Method | Result | Notes |
|---|------|--------|--------|-------|
| 1 | TypeScript strict compile | `npx tsc --noEmit` | **PASS** | After SDK 54 + Ionicons migration |
| 2 | Metro iOS bundle | `npx expo export --platform ios` | **PASS** | ~6MB HBC output |
| 3 | EAS project link | `eas init --id de0490e8-...` | **PASS** | Slug aligned to `chaitanya` |
| 4 | Auth redirect (cold start) | Code review `app/index.tsx` | **PASS** | Unauthed → welcome |
| 5 | Onboarding 3-step flow | Code review | **PASS** | Disabled continue until selection |
| 6 | Tab navigation (5 tabs) | Code review `_layout.tsx` | **PASS** | Custom bar + haptics listener |
| 7 | Lesson card progression | Code review `lesson/[slug]` | **PASS** | SegmentBar, exit modal, XP reward |
| 8 | Quiz heart loss animation | Code review `HeartDisplay` | **PASS** | Reanimated sequence |
| 9 | Concept lock states | Code review `learn/[slug]` | **PASS** | Quiz locked until lesson done |
| 10 | Mock data completeness | Grep mock-data | **PASS** | 12 concepts, all domains |
| 11 | Expo Go SDK compatibility | Device report | **PASS** | After SDK 54 downgrade |
| 12 | Expo Go SDK 57 | Device | **FAIL** | Expected — "incompatible version" |
| 13 | Tunnel in cloud VM | `expo start --tunnel` | **FLAKY** | ngrok `body` undefined intermittent |
| 14 | Persistence across reload | Expo Go | **N/A** | MMKV not bundled; memory fallback |

---

## Edge cases covered (by design)

| Area | Edge case | Handling |
|------|-----------|----------|
| Quiz | 0 hearts mid-quiz | "Out of hearts" screen, back to concept |
| Quiz | Fail threshold (<70%) | Score screen, retry without XP |
| Quiz | Wrong answer | Reveal correct option + explanation |
| Lesson | Exit mid-lesson | ExitModal confirmation |
| Onboarding | Empty name | Continue disabled |
| Auth | Invalid email | Inline validation error |
| Progress | Resume lesson | `lessonCardIndex` persisted in context |
| Learn | Quiz/sim locked | 40% opacity, lock icon, no press |
| Profile | Sign out | Clears auth storage, redirect welcome |
| Storage | MMKV unavailable | Silent fallback to in-memory Map |
| Daily goal | Exceeds target | `Math.min` caps display |

---

## Edge cases NOT yet validated on device

- [ ] Haptics feel correct on iOS vs Android
- [ ] Safe area insets on notched devices / tablets
- [ ] Long concept titles truncation in cards
- [ ] Keyboard overlap on auth forms (KeyboardAvoidingView added, not device-tested)
- [ ] Confetti performance on low-end Android
- [ ] Streak calendar "today" ring on timezone boundaries

---

## Failures encountered & fixes

| Failure | Fix applied |
|---------|-------------|
| Expo Go incompatible (SDK 57) | Downgraded to SDK 54 |
| Expo Go incompatible (SDK 52) | User confirmed SDK 54; aligned to 54 |
| `eas init` slug mismatch | Changed `app.json` slug `find-ai` → `chaitanya` |
| `lucide-react-native` peer conflict | Replaced with `@expo/vector-icons` |
| `DarkTheme` not in expo-router v4/6 | Import from `@react-navigation/native` |
| Tunnel ngrok error in CI VM | Documented: run `--tunnel` locally |
| MMKV in Expo Go | Removed from deps; memory fallback in `storage.ts` |

---

## Final validation status

| Layer | Status |
|-------|--------|
| TypeScript | ✅ Pass |
| Metro bundle | ✅ Pass |
| Expo Go SDK 54 | ✅ Compatible (post-downgrade) |
| Device walkthrough | ⚠️ Partial — user testing in progress |
| Automated tests | ❌ Not implemented (Phase 2) |
| EAS dev build | ❌ Not run |

**Overall Phase 1 UI:** ✅ **Shippable as design shell** — pending branded assets and full device QA pass.

---

## QE recommendations (next session)

1. Run structured device test matrix (iOS + Android) against screen inventory in `architecture.md`.
2. Record results in this file under "Device walkthrough" section.
3. Add Detox or Maestro smoke tests for auth → home → lesson → quiz happy path.
4. Validate MMKV persistence after first `eas build --profile development`.
