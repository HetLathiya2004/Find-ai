# Theme system — Tests

## Automated

| Check | Command | Status |
|-------|---------|--------|
| TypeScript | `npx tsc --noEmit` | Pass |

## Manual matrix

| # | Case | Expected |
|---|------|----------|
| 1 | Fresh install / cleared storage | Preference defaults to **System** |
| 2 | Profile → Theme tap | Cycles System → Light → Dark → System |
| 3 | Light selected | Surfaces/text/tab bar use light palette; StatusBar dark content |
| 4 | Dark selected | Soft black-green shell; StatusBar light content |
| 5 | System + OS light | Resolves to light |
| 6 | System + OS dark | Resolves to dark |
| 7 | Reload app after Light | Preference restored from storage |
| 8 | Auth screens (welcome/sign-in) | Recolor with preference (provider wraps auth) |
| 9 | Brand accents | Buck green / domain colors unchanged across schemes |

## Out of scope for this pass

- Screenshot visual regression suite
- Server-persisted preference
