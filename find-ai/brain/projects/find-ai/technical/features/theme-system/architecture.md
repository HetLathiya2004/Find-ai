# Theme system — Architecture

## Decision: dedicated `theme/` module (separation of concerns)

Appearance is not a single `constants/colors.ts` blob. Responsibilities are
split so tokens, persistence, navigation mapping, and React state do not mix.

```
theme/
  types.ts           ColorScheme, ColorPalette, ThemePreference
  brand.ts           Stable Buck / domain accents (scheme-invariant)
  palettes.ts        DarkColors, LightColors, paletteFor()
  gradients.ts       Dark/Light gradients, gradientsFor()
  navigation.ts      buildNavigationTheme() for React Navigation
  preference.ts      load / save / resolve / cycle preference
  labels.ts          System / Light / Dark copy
  ThemeProvider.tsx  AppThemeProvider + useTheme + useColors
  index.ts           Public API (`@/theme`)
```

**Compatibility shims** (thin re-exports only):

- `constants/colors.ts` → `@/theme`
- `hooks/useTheme.tsx` → `@/theme`

Prefer importing from `@/theme` in app and component code.

---

## Decision: preference model

| Preference | Resolved scheme |
|------------|-----------------|
| `system` | OS light → light, otherwise dark |
| `light` | light |
| `dark` | dark |

- Default: `system`
- Storage key: `theme-preference` via `lib/storage.ts`
- Cycle order: System → Light → Dark → System
- Toggle helper: flips light ↔ dark (exits system)

---

## Decision: reactive StyleSheets

Module-level `StyleSheet.create({ backgroundColor: Colors.bg })` freezes the
hex at import time. Themed screens must:

1. Call `useColors()`
2. Build styles with `useMemo(() => createStyles(colors), [colors])`

Primitives (`AppText`, `Card`, `FormInput`, buttons, loaders, etc.) follow the
same rule so Profile theme changes propagate app-wide.

---

## Decision: shell integration

| Surface | Behavior |
|---------|----------|
| `app/_layout.tsx` | `AppThemeProvider` wraps auth/progress; StatusBar + Navigation theme follow `isDark` / `colors` |
| `app.json` | `userInterfaceStyle: "automatic"` |
| `app/+html.tsx` | CSS `prefers-color-scheme` avoids web flash |
| Profile | `components/profile/ThemeSettingRow.tsx` |

---

## Non-goals / invariants

- Domain helpers in `lib/gamification.ts` may use static `Colors` for brand
  domain hex (scheme-invariant). Unknown-domain text fallback is dark-primary
  and rarely hit.
- Do not put React hooks inside `preference.ts` / `palettes.ts` — keep them pure.
