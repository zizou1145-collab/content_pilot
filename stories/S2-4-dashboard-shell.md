# Story: S2-4 — Dashboard shell
# قصة: S2-4 — واجهة لوحة التحكم

**Sprint:** 2  
**Created:** 2025-03-05  
**Status:** Draft

---

## Summary | الملخص

After login, the user sees a dashboard that shows their current subscription tier/status, a list of their projects (from `GET /api/v1/projects`), a “New project” action, and logout so they have a clear home base for accessing projects and account (S2-5 protects this route; S3 will add full project CRUD from here).

---

## Acceptance criteria | معايير القبول

- [ ] **Dashboard route** exists (e.g. `/[locale]/dashboard`) and is the post-login landing page; only authenticated users see it (S2-5 handles redirect when unauthenticated).
- [ ] **Subscription tier/status** is visible on the dashboard: display the user’s current plan (e.g. Basic, Pro, Business) and status (e.g. active) from the user object (from auth context or `GET /api/v1/auth/me`); labels use i18n (ar/en).
- [ ] **Projects list** is loaded from `GET /api/v1/projects` with the user’s token; show project name and at least one other identifier (e.g. country, field, or “Updated at”); empty state when the user has no projects (e.g. “No projects yet” with CTA to create one).
- [ ] **“New project” action** is present (button or link); for this story it may navigate to a placeholder route (e.g. `/[locale]/projects/new`) or show a “Coming in Sprint 3” message; the intent is that the dashboard offers a clear entry point for creating a project (full create flow is S3-1).
- [ ] **Logout** control is available (e.g. in header or sidebar): clears the stored token/user and redirects to login (or home); uses i18n for label (e.g. “Log out” / “تسجيل الخروج”).
- [ ] Dashboard layout respects RTL when locale is `ar` (per S2-2): direction, alignment, and any nav/sidebar use logical or RTL-aware styling.
- [ ] **Loading and error states:** show a loading state while projects are fetched; if `GET /api/v1/projects` fails (e.g. 401), redirect to login or show an error consistent with S2-5; if 500 or network error, show a user-friendly message and optional retry.

---

## Tasks | المهام

- [ ] Add translation keys for dashboard: title, subscription, plan, status, projects, newProject, noProjects, logout, loading, error (and retry if desired) in both `ar` and `en`.
- [ ] Create dashboard page: route `app/[locale]/dashboard/page.tsx` (or equivalent); fetch user from auth context (or `GET /api/v1/auth/me` on mount) to show subscription tier/status; fetch projects with `GET /api/v1/projects` using the same API client and token as S2-3/S2-5.
- [ ] Render subscription block: display `user.subscriptionPlan` and `user.subscriptionStatus` (or “Active” when status is not set); use cards or a simple summary section.
- [ ] Render projects list: map `projects` from API response; each item shows at least name and one of country/field/updatedAt; link to project detail if route exists (e.g. `/[locale]/projects/[id]`), otherwise plain list for now; empty state when `projects.length === 0` with “New project” CTA.
- [ ] Add “New project” action: button or link; navigate to `/[locale]/projects/new` (placeholder page acceptable) or show a short “Coming soon” message; ensure it’s visible and RTL-friendly.
- [ ] Add logout: button or link that clears token/user from auth context (and storage), then redirect to `/[locale]/login` (or home); reuse auth context from S2-3.
- [ ] Apply RTL: use logical properties and existing RTL from S2-2 for dashboard layout (header, subscription block, project list, sidebar if any).
- [ ] Handle loading: show spinner or skeleton while projects (and optionally user) are loading; handle 401 by redirecting to login; handle other errors with a message and optional retry.
- [ ] Manually test: log in, confirm dashboard shows subscription and projects (create one via API if needed); test empty state; test logout and confirm redirect; verify RTL in `ar` locale.

---

## Notes / API / References

- **ARCHITECTURE:** [ARCHITECTURE.md](../ARCHITECTURE.md) — Frontend: “dashboard”; users interact via web app with AR/EN and RTL.
- **Sprint plan:** S2-4 — “After login, user sees dashboard: current subscription tier/status, list of projects (from GET /api/v1/projects), ‘New project’ action; logout.”
- **Backend APIs:**
  - **GET /api/v1/auth/me** — Requires `Authorization: Bearer <token>`. Returns `{ user }` with `id`, `email`, `name`, `locale`, `subscriptionPlan`, `subscriptionStatus`.
  - **GET /api/v1/projects** — Requires auth. Returns `{ projects }` array; each project has `id`, `name`, `country`, `field`, `logoUrl`, `createdAt`, `updatedAt`.
- **Subscription plans:** Basic, Pro, Business (see [backend/src/lib/limits.js](../backend/src/lib/limits.js)); display only for this story; upgrade flow is out of scope.
- **Depends on:** S2-1 (Next.js, i18n, API base URL), S2-2 (RTL), S2-3 (auth pages, token storage, redirect to dashboard). S2-5 (auth guard) will redirect unauthenticated users to login when they hit `/dashboard`.
- **New project:** Full create flow is S3-1; this story only needs a visible “New project” entry point (placeholder route or “Coming soon” is acceptable).

---

*Story format: Content Pilot | بايلوت المحتوى*
