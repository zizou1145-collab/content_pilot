# Content Pilot — Frontend

Next.js (App Router) app with i18n (Arabic default, English) and RTL support for [Content Pilot](https://github.com/...) backend.

## Setup

```bash
npm install
cp .env.example .env.local
```

## Required environment variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (no trailing slash). Example: `http://localhost:4000`. The app uses this for all backend requests; no hardcoded API host. |

See [.env.example](.env.example).

## Development

```bash
npm run dev
```

- App: [http://localhost:3000](http://localhost:3000)
- Default locale: **Arabic** (`/ar`). Root `/` redirects to `/ar`.
- English: [http://localhost:3000/en](http://localhost:3000/en)

Requests to `/api/v1/*` are proxied to the backend (see `next.config.ts` rewrites), so you can run backend on port 4000 and avoid CORS in dev.

## Build

```bash
npm run build
npm start
```

## i18n

- **next-intl** with locales `ar` (default) and `en`.
- URL prefix: `/ar`, `/en` (always present).
- Translations: [messages/ar.json](messages/ar.json), [messages/en.json](messages/en.json).

## RTL (Arabic)

When the locale is **Arabic** (`ar`), the document and layout are right-to-left:

- **Root layout** ([app/layout.tsx](app/layout.tsx)) sets `<html lang={locale} dir={dir}>`: `ar` → `dir="rtl"` and `lang="ar"`, `en` → `dir="ltr"` and `lang="en"`. The locale comes from the next-intl middleware (header) so it stays in sync with the URL.
- **Layout and components** use RTL-aware styling so the UI flips correctly:
  - Prefer **logical properties** so one set of styles works for both directions: Tailwind `ms-*` / `me-*` (margin-inline-start/end), `ps-*` / `pe-*` (padding-inline-*), `text-start` / `text-end`, and positioning `start-*` / `end-*`. Avoid hardcoded `ml-*`, `mr-*`, or `text-left` where start/end semantics apply.
  - Flex/grid inherit `dir` from the document, so `flex-row` and `justify-start` already follow reading direction; use logical margins/padding for spacing.
- **Switching locale** (e.g. the home page link to switch to EN/AR) navigates via next-intl; the new page gets the new `dir` and `lang` without a full reload.
- **Global styles**: [app/globals.css](app/globals.css) documents the RTL approach and adds a small utility layer (e.g. `.flip-icon-inline` for icons that must flip in RTL). Use logical properties in components; add `[dir="rtl"]` overrides only when necessary (e.g. third-party icons).

## API client

Use [lib/api.ts](lib/api.ts):

- `getApiUrl()` — backend base URL
- `apiPath(path)` — full URL for a path (e.g. `apiPath("/api/v1/health")`)
- `apiFetch(path, { token, ... })` — fetch with optional `Authorization: Bearer`

All use `NEXT_PUBLIC_API_URL`; never hardcode the backend host.

## Auth and token storage (S2-3)

After login or register, the JWT and user are stored in **client-side storage** so that authenticated API calls can send `Authorization: Bearer <token>`:

- **Storage:** Token and user object are persisted in `localStorage` under the key `content_pilot_auth`. On load, [AuthProvider](lib/auth-context.tsx) reads from localStorage and exposes `user`, `token`, `setAuth`, and `clearAuth` via `useAuth()`.
- **Usage:** For any authenticated request, use `apiFetch(path, { token: useAuth().token, ... })`. The auth guard (S2-5) uses the same token to protect routes.
- **Protected routes (S2-5):** Routes under `/[locale]/dashboard` and `/[locale]/projects` are protected. Unauthenticated users are redirected to `/[locale]/login` (locale preserved). The guard is implemented via [AuthGuard](components/AuthGuard.tsx) in the dashboard and projects layouts. When any `apiFetch` returns 401, a global handler clears auth and redirects to login with `?session=expired` (optional “Session expired” message on the login page). Public routes: `/[locale]`, `/[locale]/login`, `/[locale]/register`.
- **Alternative (production):** For stronger security, the app could use httpOnly cookies: add Next.js API routes that proxy `POST /api/v1/auth/register` and `POST /api/v1/auth/login`, call the backend, and set an httpOnly cookie with the token; then use `credentials: 'include'` for fetch and configure the backend to accept the cookie. The current approach (Bearer in Authorization header + localStorage) is consistent and sufficient for MVP; switch to cookies if required by security policy.
