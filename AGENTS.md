<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Cursor Cloud specific instructions

This repo contains two projects:

- **`find-ai/`** — the actively developed app. An Expo / React Native (Expo Router)
  gamified finance-learning app. This is the only project with source checked into git
  and the only runnable app. Uses `npm` (`find-ai/package-lock.json`).
- **Root `tanstack_start_ts` ("Zenith Finance")** — a Lovable TanStack Start scaffold.
  Its actual source is NOT checked out; it lives only inside `__Zenith Finance__.zip`,
  so there is no `src/` and `bun run dev` at the repo root will not run without first
  extracting that zip. It uses `bun` (`bun.lock`), and `bun` is not installed in this
  environment. Treat the root as inert unless you intentionally restore the zip.

### Running find-ai (from `find-ai/`)

- No iOS/Android simulator exists in the cloud VM — run the web target:
  `npx expo start --web --port 8081` (Metro bundler serves at http://localhost:8081).
  First bundle takes ~10-15s; the page is blank until Metro finishes bundling.
- Typecheck: `npx tsc --noEmit`. There is no ESLint config and no `lint` script for
  find-ai, so typecheck is the primary static check.
- Persistence uses `react-native-mmkv`, a native module. On web (and Expo Go) it falls
  back to in-memory storage, so all mock auth/progress state resets on page reload —
  this is expected, not a bug.
- Mock auth: "Get started" signs up (then onboarding); "I already have an account"
  signs in and skips onboarding. No real backend is wired up (Phase 1 is UI + mock data).
