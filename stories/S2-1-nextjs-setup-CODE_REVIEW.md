# Code review: S2-1 — Next.js setup

**Story:** [S2-1-nextjs-setup.md](S2-1-nextjs-setup.md)  
**Reviewed:** 2025-03-04

---

## Acceptance criteria checklist

| Criterion | Status |
|-----------|--------|
| `frontend/` exists with Next.js **App Router** | ✅ |
| API base URL configurable via env (`NEXT_PUBLIC_API_URL`); no hardcoded host | ✅ |
| i18n with **ar** (default) and **en** (next-intl) | ✅ |
| Locale switch/detection; default **ar** when none specified | ✅ (after fix) |
| Translations loaded for both locales (app, nav, home) | ✅ |
| Dev server runs; proxy to backend via rewrites | ✅ |
| Required env documented in `frontend/.env.example` | ✅ |

---

## Summary

The implementation meets the story. One **critical** issue (middleware not running) was fixed during review, and a couple of small cleanups were applied.

---

## Issues found and fixes applied

### 1. Critical: Middleware not executed (fixed)

- **Issue:** Next.js only runs middleware from a file named `middleware.ts` or `middleware.js` at the project root. The locale logic lived in `proxy.ts`, so it was never executed. Root `/` would not redirect to `/ar`, and locale detection would not run.
- **Fix:** Added `frontend/middleware.ts` with the same content and removed `frontend/proxy.ts`. Locale redirect and detection now work as intended.

### 2. Minor: Redundant ternary in `lib/api.ts` (fixed)

- **Issue:** `getApiBaseUrl()` used `typeof window !== "undefined" ? process.env.NEXT_PUBLIC_API_URL : process.env.NEXT_PUBLIC_API_URL` — both branches were identical.
- **Fix:** Replaced with `process.env.NEXT_PUBLIC_API_URL`.

---

## Recommendations (optional)

1. **Lint script**  
   `package.json` has `"lint": "eslint"` with no path. Consider `"lint": "next lint"` (or `eslint .`) so `npm run lint` runs against the whole app.

2. **API base URL in `next.config.ts`**  
   The fallback `http://localhost:4000` is only used at build time for rewrites. For consistency with the story (“no hardcoded API host”), you could require `NEXT_PUBLIC_API_URL` in dev and only allow a fallback in development, or document that the fallback is intentional for local dev.

3. **Root README**  
   Root [README.md](../README.md) already documents `frontend/`, env, and quick start — no change needed.

---

## Files touched in review

- **Added:** `frontend/middleware.ts` (from former `proxy.ts`)
- **Removed:** `frontend/proxy.ts`
- **Updated:** `frontend/lib/api.ts` (simplified `getApiBaseUrl`)

---

## What’s working well

- Clear **next-intl** setup: `routing.ts`, `request.ts`, `navigation.ts`, and `[locale]` segment.
- **RTL** already applied in root layout via `dir={locale === "ar" ? "rtl" : "ltr"}` (ready for S2-2).
- **API client** (`lib/api.ts`): `getApiUrl()`, `apiPath()`, `apiFetch()` with optional Bearer token; no hardcoded host in app code.
- **Rewrites** in `next.config.ts` proxy `/api/v1/*` to the backend, avoiding CORS in dev.
- **Translations**: `messages/ar.json` and `messages/en.json` with `app`, `nav`, and `home` keys.
- **Docs**: `frontend/README.md` and `frontend/.env.example` clearly describe env and setup.

---

*Review format: Content Pilot | بايلوت المحتوى*
