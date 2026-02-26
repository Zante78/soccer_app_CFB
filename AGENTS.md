# AGENTS.md

## Cursor Cloud specific instructions

### Project overview
This is a **Fußball Manager** (Football/Soccer Club Manager) — a React + TypeScript + Vite SPA with Supabase (cloud-hosted) as the backend. The UI is primarily in German. There is no monorepo, no Docker, no local database.

### Running the dev server
```
npm run dev
```
Starts on `http://localhost:5173`.

### Linting
The `package.json` lint script (`npm run lint`) uses `--ext` flags incompatible with the flat config (`eslint.config.js`). Run ESLint directly instead:
```
npx eslint .
```
The codebase has ~190 pre-existing lint errors (mostly `@typescript-eslint/no-explicit-any` and `@typescript-eslint/no-unused-vars`).

### Building
```
npm run build
```
Runs `tsc && vite build`. TypeScript compiles clean.

### Authentication / Supabase
The app connects to a remote Supabase instance configured in `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). The login page shows test credentials (`test@example.com / test123456`). Full end-to-end testing past the login screen requires a reachable Supabase backend. Without it, the login form works but network requests fail with `ERR_NAME_NOT_RESOLVED`.

### No automated tests
The project has no test framework configured (no Vitest, Jest, etc.) and no test files.
