# Story: S2-5 — Auth guard
# قصة: S2-5 — حماية المسارات بالمصادقة

**Sprint:** 2  
**Created:** 2025-03-05  
**Status:** Done

---

## Summary | الملخص

Protected routes (e.g. dashboard and any app routes that require a logged-in user) redirect unauthenticated users to the login page; all API calls from the app send the JWT as `Authorization: Bearer <token>` (or via cookie) so the backend can authenticate requests. This completes the auth flow started in S2-3 and ensures the dashboard (S2-4) is only accessible when the user is signed in.

---

## Acceptance criteria | معايير القبول

- [x] **Protected routes** are defined (e.g. dashboard `/[locale]/dashboard`, and any future app routes like `/[locale]/projects/*`); when an unauthenticated user visits a protected route, they are redirected to the login page (e.g. `/[locale]/login`) with the same locale preserved; after login they can be redirected back to the originally requested URL if desired (optional for this story).
- [x] **Auth check** runs before rendering protected pages: either via a layout that wraps protected routes, a higher-order component, middleware, or a guard component that checks for a valid token/user (from auth context or storage); “valid” means token is present and optionally validated (e.g. quick decode or `GET /api/v1/auth/me`); if not valid, redirect to login.
- [x] **Token on API calls:** every authenticated API request (e.g. `GET /api/v1/projects`, `GET /api/v1/auth/me`) sends the JWT in the `Authorization: Bearer <token>` header (or equivalent, e.g. cookie) using a single API client/helper used across the app (as established in S2-3); unauthenticated requests (e.g. login/register) do not send the header.
- [x] **Public routes** (e.g. login `/[locale]/login`, register `/[locale]/register`, and optionally home `/[locale]`) remain accessible without authentication; if a user is already logged in and visits login/register, redirecting them to dashboard (or home) is acceptable but optional for this story.
- [x] **401 handling:** when any authenticated API call returns 401 (e.g. expired or invalid token), the app clears the stored token/user and redirects to login (consistent with “unauthenticated” behavior); optional: show a short message (e.g. “Session expired”) using i18n.
- [x] **RTL and locale:** redirects preserve the current locale (e.g. redirect to `/ar/login` when locale is `ar`); no new RTL requirements beyond existing S2-2.

---

## Tasks | المهام

- [x] Define which routes are protected: document or implement a list (e.g. `/dashboard`, `/projects`, `/projects/*`) and which are public (`/login`, `/register`, `/`); use Next.js middleware, layout-based guard, or a wrapper component that reads auth context and redirects.
- [x] Implement the guard: (a) Next.js middleware that checks for token (e.g. in cookie or header) and redirects to `/[locale]/login` for protected pathnames, or (b) a layout for protected routes that uses `useAuth()` (or equivalent), checks token/user, and redirects to login if missing; ensure locale is preserved in redirect URL.
- [x] Ensure API client sends token: verify that all calls that require auth (e.g. from dashboard, future project pages) use the same `apiFetch` or fetch wrapper that adds `Authorization: Bearer <token>` (from auth context or storage); document in README or this story if the client is already centralized from S2-3.
- [x] Handle 401 globally or per call: when the backend returns 401 on an authenticated request, clear token and user from auth context and storage, then redirect to login; optionally set a query param (e.g. `?session=expired`) or show a one-time message for “Session expired” (i18n).
- [x] Optional: redirect authenticated users from login/register to dashboard so they don’t see login form when already logged in.
- [ ] Manually test: open dashboard (or a protected route) while logged out → expect redirect to login; log in → reach dashboard; log out or clear token → access dashboard again → redirect to login; trigger 401 (e.g. invalid token) and confirm redirect and optional message; verify API calls in network tab send `Authorization: Bearer` when authenticated.

---

## Notes / API / References

- **ARCHITECTURE:** [ARCHITECTURE.md](../ARCHITECTURE.md) — Frontend: “auth”; protected routes and token on API calls.
- **Sprint plan:** S2-5 — “Protected routes redirect unauthenticated users to login; token sent as Authorization: Bearer (or cookie) on API calls.”
- **Backend:** Expects `Authorization: Bearer <token>` for protected endpoints (e.g. `GET /api/v1/auth/me`, `GET /api/v1/projects`); returns 401 when token is missing or invalid.
- **Depends on:** S2-1 (Next.js, i18n, locale in URL), S2-2 (RTL), S2-3 (auth pages, token storage, auth context, API client that can send token), S2-4 (dashboard as main protected route).
- **Auth context (S2-3):** Token and user stored in `localStorage` and exposed via `AuthProvider` / `useAuth()`; `apiFetch(path, { token })` sends `Authorization: Bearer <token>`. S2-5 should use the same context and client; ensure no API call bypasses the token when it should be authenticated.
- **Implementation options:** Next.js middleware (edge) can read cookie or header and redirect; app-level option is a layout that wraps `app/[locale]/dashboard` (and other protected segments) and runs auth check + redirect on client. Choose one approach and apply consistently.

---

*Story format: Content Pilot | بايلوت المحتوى*
