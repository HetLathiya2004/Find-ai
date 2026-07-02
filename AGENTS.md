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

Zenith Finance / Find.ai is a single web app: a Duolingo-style gamified financial-literacy SPA built with TanStack Start (SSR) + React 19 + Tailwind v4, backed by a remote hosted Supabase project (auth, profiles, content, XP/streaks/leagues).

- Package manager is `bun` (see `bun.lock`, `bunfig.toml`), not npm. It installs to `~/.bun/bin`. Standard scripts live in `package.json`: `bun run dev` (Vite dev server on port `8080`), `bun run build`, `bun run lint`, `bun run format`.
- Non-obvious: the application source (`src/`, `supabase/`, `public/`) is NOT committed to git — it ships inside `__Zenith Finance__.zip` at the repo root. The startup update script extracts this archive if `src/` is missing, so the working tree is only fully populated after that runs. The extracted `src/` etc. are untracked; do not commit them unless intentionally restructuring the repo.
- Auth/backend is a remote hosted Supabase (`VITE_SUPABASE_URL` in `.env`), reachable from the VM. Email/password signups succeed immediately (no email confirmation), but passwords are checked against HaveIBeenPwned — use a strong, non-pwned password when testing signup. Content tables (concepts/news) are readable with the anon key.
- `bun run lint` currently reports many pre-existing `prettier/prettier` and `no-explicit-any` errors in the Lovable-generated source; these are code-style issues in the shipped code, not environment problems.
