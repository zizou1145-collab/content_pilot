# Story: S2-1 — Next.js setup
# قصة: S2-1 — إعداد نكست.جس

**Sprint:** 2  
**Created:** 2025-03-04  
**Status:** Draft

---

## Summary | الملخص

Create the frontend application in `frontend/` using Next.js (App Router), with API base URL configuration and i18n supporting Arabic (default) and English, so the app is ready for auth pages, RTL, and dashboard in subsequent stories.

---

## Acceptance criteria | معايير القبول

- [ ] A `frontend/` (or `app/`) directory exists with a Next.js project using the **App Router** (recommended).
- [ ] API base URL is configurable via environment (e.g. `NEXT_PUBLIC_API_URL` or `API_URL`); the app uses this for all backend calls (no hardcoded API host).
- [ ] i18n is implemented (e.g. **next-intl** or **next-i18next**) with two locales: `ar` (default) and `en`.
- [ ] Locale can be switched or detected (e.g. URL prefix `/ar`, `/en` or subpath/query); default locale `ar` is applied when no locale is specified.
- [ ] Translations are loaded for both locales (at least a minimal set: app name, nav, or placeholder keys) so the pattern is established for S2-2 (RTL) and S2-3 (auth pages).
- [ ] Dev server runs without errors; optional: proxy to backend in development (e.g. `rewrites` in `next.config.js` to `/api/v1` → backend) or CORS-compatible direct API URL.
- [ ] Required env vars are documented (e.g. in `frontend/.env.example`: `NEXT_PUBLIC_API_URL` or equivalent).

---

## Tasks | المهام

- [ ] Create Next.js app in `frontend/` with App Router (e.g. `npx create-next-app@latest frontend --app --no-src-dir` or equivalent); ensure TypeScript/ESLint choices align with project standards.
- [ ] Add and configure i18n library (next-intl or next-i18next): define `ar` and `en`; set `ar` as default; add minimal JSON or JS translation files for both locales.
- [ ] Wire locale into App Router (e.g. `[locale]` dynamic segment or middleware for locale detection); ensure root or default route resolves to `ar`.
- [ ] Add `NEXT_PUBLIC_API_URL` (or `API_URL`) to env; create a small API client or `fetch` helper that uses this base URL for backend requests; document in `frontend/.env.example`.
- [ ] Optionally add `rewrites` in `next.config.js` to proxy `/api/v1/*` to the backend in development, or document that frontend must use full API URL and backend must allow CORS for `FRONTEND_URL`.
- [ ] Verify dev server starts; optionally add a simple page that displays current locale and a test translation key.
- [ ] Update project README or docs to mention `frontend/` setup and required env (e.g. link from root README).

---

## Notes / API / References

- **ARCHITECTURE:** [ARCHITECTURE.md](../ARCHITECTURE.md) — Frontend: “Next.js”, “i18n, RTL for Arabic”; users interact via web app with AR/EN and RTL.
- **Sprint plan:** S2-1 — “Create frontend/ with Next.js (App Router recommended); proxy or env for API base URL; i18n with ar (default) and en.”
- **Backend:** API base is `/api/v1/`; backend expects `Authorization: Bearer <token>` and allows CORS for `FRONTEND_URL`; ensure `NEXT_PUBLIC_API_URL` points to backend origin (e.g. `http://localhost:3001` in dev).
- **i18n choice:** next-intl is a common choice for App Router with minimal config; next-i18next works with both Pages and App with extra setup. Prefer one that supports RTL and `[locale]` routing for S2-2.
- **Env:** Use `NEXT_PUBLIC_*` for any URL the browser must see (e.g. `NEXT_PUBLIC_API_URL`). Non-public vars (e.g. server-only API keys) stay without prefix.
- **Dependencies:** S2-2 (RTL) and S2-3 (auth pages) will build on this setup; no auth or dashboard implementation in this story.

---

*Story format: Content Pilot | بايلوت المحتوى*
