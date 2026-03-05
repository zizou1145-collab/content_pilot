# Story: S2-3 — Auth pages
# قصة: S2-3 — صفحات التسجيل والدخول

**Sprint:** 2  
**Created:** 2025-03-04  
**Status:** Draft

---

## Summary | الملخص

Implement register and login pages in the frontend with form validation; call the backend auth endpoints, store the JWT (e.g. httpOnly cookie or secure storage), and redirect to the dashboard on success so users can sign up and sign in before accessing protected areas (S2-4, S2-5).

---

## Acceptance criteria | معايير القبول

- [ ] **Register page** exists (e.g. `/[locale]/register` or `/ar/register`, `/en/register`): form with email, password (with confirmation if desired), optional name, optional locale; labels and messages use i18n (ar/en).
- [ ] **Login page** exists (e.g. `/[locale]/login`): form with email and password; labels and messages use i18n.
- [ ] **Form validation** runs on the client: required fields, valid email format, password minimum length (8 characters to match backend); validation errors are shown inline or as a summary without submitting until valid (or submit and show API validation errors).
- [ ] Register form calls `POST /api/v1/auth/register` with body `{ email, password, name?, locale? }`; on 201, store the returned token and user, then redirect to dashboard (or home); on 400, display validation errors from `errors` array; on 409, show “Email already registered” (or translated equivalent).
- [ ] Login form calls `POST /api/v1/auth/login` with body `{ email, password }`; on 200, store the returned token and user, then redirect to dashboard; on 400, show validation errors; on 401, show “Invalid email or password” (or translated equivalent).
- [ ] **Token storage:** the JWT is stored securely (e.g. httpOnly cookie set by a Next.js API route that proxies login/register, or a secure client-side storage pattern); the chosen method is consistent with how S2-5 (auth guard) will send the token (e.g. `Authorization: Bearer <token>` or cookie sent automatically).
- [ ] **Redirect on success:** after successful register or login, the user is redirected to the dashboard (e.g. `/[locale]/dashboard`); if dashboard does not exist yet (S2-4), redirect to a placeholder or `/[locale]` and document the target for S2-4.
- [ ] Pages respect RTL when locale is `ar` (per S2-2): layout, form alignment, and buttons use logical/rtl-aware styling.
- [ ] Links between login and register (e.g. “Don’t have an account? Register”) and optional “Forgot password?” placeholder are present where appropriate; forgot-password flow is out of scope for this story.

---

## Tasks | المهام

- [ ] Add translation keys for auth: register, login, email, password, name, submit, errors (e.g. “Email already registered”, “Invalid email or password”, “Password must be at least 8 characters”), and link text (e.g. “Already have an account? Log in” / “Don’t have an account? Register”) in both `ar` and `en`.
- [ ] Create register page: route under `[locale]` (e.g. `app/[locale]/register/page.tsx`); form with email, password (min 8), optional name, optional locale; client-side validation; submit to `POST /api/v1/auth/register` using `NEXT_PUBLIC_API_URL`; handle 201, 400, 409; store token and user; redirect to dashboard (or placeholder).
- [ ] Create login page: route under `[locale]`; form with email and password; client-side validation; submit to `POST /api/v1/auth/login`; handle 200, 400, 401; store token and user; redirect to dashboard (or placeholder).
- [ ] Implement token storage: either (a) httpOnly cookie via Next.js API route that proxies register/login and sets cookie, or (b) secure client storage (e.g. memory + optional persistence) and ensure the same token is sent as `Authorization: Bearer <token>` in API client used by S2-4/S2-5; document the choice in story or frontend README.
- [ ] Ensure forms use RTL-aware layout and logical properties (or existing RTL from S2-2); align with design system if any (e.g. shared Input, Button from S2-1/S2-2).
- [ ] Add navigation links: from login to register and from register to login; optional “Forgot password?” link (no implementation in this story).
- [ ] Manually test: register new user (ar and en), login with correct/incorrect credentials, confirm redirect and token persistence; verify 409 on duplicate email and 401 on wrong password.

---

## Notes / API / References

- **ARCHITECTURE:** [ARCHITECTURE.md](../ARCHITECTURE.md) — Frontend: “auth (register/login)”; users interact via web app with AR/EN.
- **Sprint plan:** S2-3 — “Register and login pages; form validation; call POST register/login; store token; redirect to dashboard on success.”
- **Backend auth:** [backend/src/routes/auth.js](../backend/src/routes/auth.js).
  - **POST /api/v1/auth/register** — Body: `email` (required), `password` (min 8), `name` (optional), `locale` (optional, `ar` | `en`). Returns 201 `{ user, token }` or 400 `{ errors }` (express-validator array), 409 `{ error: 'Email already registered' }`.
  - **POST /api/v1/auth/login** — Body: `email`, `password`. Returns 200 `{ user, token }` or 400 `{ errors }`, 401 `{ error: 'Invalid email or password' }`.
  - **GET /api/v1/auth/me** — Requires `Authorization: Bearer <token>`. Returns current user (used in S2-4/S2-5).
- **Token:** JWT; backend expects header `Authorization: Bearer <token>`. Use httpOnly cookie (set by API route) or secure client storage; ensure CORS and credentials if using cookies (`credentials: 'include'` and backend `credentials: true`).
- **Depends on:** S2-1 (Next.js, i18n, API base URL), S2-2 (RTL so auth forms look correct in ar/en). S2-4 (dashboard) may not exist yet; redirect target can be `/[locale]/dashboard` or `/[locale]` until S2-4 is done.
- **Out of scope:** Forgot password, email verification, OAuth, refresh token.

---

## Implementation notes (S2-3)

- **Token storage:** JWT and user are stored in `localStorage` (key `content_pilot_auth`) and exposed via `AuthProvider` / `useAuth()` in [frontend/lib/auth-context.tsx](../frontend/lib/auth-context.tsx). Authenticated requests use `apiFetch(path, { token: useAuth().token })` so `Authorization: Bearer <token>` is sent. Documented in [frontend/README.md](../frontend/README.md). For production, httpOnly cookie via Next.js API route proxy is an alternative.
- **Routes:** Register at `/[locale]/register`, login at `/[locale]/login`, dashboard placeholder at `/[locale]/dashboard`. Redirect after success goes to `/dashboard` (next-intl keeps locale).
- **i18n:** All auth copy is in `messages/ar.json` and `messages/en.json` under the `auth` key.
- **RTL:** Forms use `text-start`, logical spacing, and no hardcoded left/right so they follow `dir` from the root layout (S2-2).
- **Validation:** Client-side: required email, email format, password min 8, password confirmation match (register). API 400/409/401 errors are mapped to translated messages.

---

*Story format: Content Pilot | بايلوت المحتوى*
