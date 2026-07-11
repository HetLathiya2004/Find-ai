# Theme system — Implementation

## What shipped

Light / dark / system appearance for the Expo Find.ai client, with Buck brand
accents shared across schemes and a Profile settings control.

## Key files

| File | Responsibility |
|------|----------------|
| `theme/types.ts` | Shared type contracts |
| `theme/brand.ts` | Scheme-invariant accents |
| `theme/palettes.ts` | Light + dark surface/text tokens |
| `theme/gradients.ts` | Light + dark gradients |
| `theme/navigation.ts` | React Navigation color mapping |
| `theme/preference.ts` | Persist + resolve + cycle preference |
| `theme/labels.ts` | UI labels for preferences |
| `theme/ThemeProvider.tsx` | Context provider + hooks |
| `theme/index.ts` | Barrel export |
| `components/profile/ThemeSettingRow.tsx` | Settings row UI |
| `app/_layout.tsx` | Provider + StatusBar + stack background |
| `lib/storage.ts` | `StorageKeys.theme` |

## Provider order

```
AppThemeProvider
  └─ AuthProvider
       └─ ProgressProvider
            └─ RootNavigator (uses useTheme)
```

Theme sits outside auth so welcome/sign-in also recolor correctly.

## Validation

- `npx tsc --noEmit` — pass
- Manual: Profile → Theme cycles System / Light / Dark; surfaces, text, tab bar,
  cards, and StatusBar update; preference survives reload (MMKV or memory)

## Follow-ups

- Optional: sync theme preference to user profile API later
- Optional: migrate remaining shim imports fully off `constants/colors` /
  `hooks/useTheme` (already re-export only)
