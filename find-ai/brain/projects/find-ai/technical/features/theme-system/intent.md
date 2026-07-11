# Theme system — Intent

## Goal

Give Find.ai users a first-class **System / Light / Dark** appearance preference
while keeping Buck green as the brand accent and dark as the default finance
shell.

## Motivation

- Phase 1 originally locked a dark-only UI. The Buck redesign reference includes
  a light palette that users expect to opt into.
- Device-level appearance (iOS/Android) should be honor-able via **System**.
- Color tokens must live behind a single module so screens do not hard-code
  scheme-specific hex values.

## Scope (IN)

| Area | Included |
|------|----------|
| Preferences | `system` \| `light` \| `dark`, persisted locally |
| Tokens | Shared brand accents + per-scheme surfaces/text/borders/gradients |
| React API | `AppThemeProvider`, `useTheme`, `useColors` via `@/theme` |
| UI control | Profile → Settings → Theme (`ThemeSettingRow`) |
| Shell wiring | StatusBar, React Navigation theme, `userInterfaceStyle: automatic` |

## Out of scope

- Server-synced theme preference
- Per-screen theme overrides
- Custom accent color pickers

## Constraints

- Presentation-only — no auth/progress/API contract changes
- UI must call `useColors()` so StyleSheets recompute when preference changes
- Brand/domain accents stay stable across schemes (`theme/brand.ts`)

## Success criteria

- [x] Preference cycles System → Light → Dark and persists across reload
- [x] Screens and primitives recolor without remounting the whole app tree
- [x] `npx tsc --noEmit` passes
- [x] Brain docs updated (`phase-1-expo-ui` + this feature)

## Related

- **Design source of truth:** `../phase-1-expo-ui/architecture.md` (Decision 1, 14)
- **Code:** `find-ai/theme/`
- **Previous:** Buck mascot redesign (phase-1 architecture note, 2026-07)
