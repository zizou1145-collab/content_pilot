# Story: S3-5 — Subscription limits in UI
# قصة: S3-5 — حدود الاشتراك في الواجهة

**Sprint:** 3  
**Created:** 2025-03-05  
**Status:** Done

---

## Summary | الملخص

When the API returns 403 because the user has hit a subscription limit (projects, plans per month, or later designs per month), the frontend shows a clear, user-friendly message and an optional upgrade CTA. This keeps messaging consistent across project create (S3-1), content plan generate (S3-3), and future design generation (S4), and aligns with the backend payload shape from S1-5.

---

## Acceptance criteria | معايير القبول

- [x] **Detect limit 403:** When any API call returns HTTP 403 and the response body includes a `code` equal to `PROJECTS_LIMIT_REACHED`, `PLANS_LIMIT_REACHED`, or `DESIGNS_LIMIT_REACHED`, the frontend treats it as a subscription-limit response (not a generic “forbidden”).
- [x] **Clear message:** For each limit code, show a user-visible message that explains which limit was reached (e.g. “Project limit reached for your plan”, “Content plans limit for this month reached”, “Designs limit for this month reached”). Prefer displaying the backend `error` string when present; otherwise use i18n messages keyed by `code`. All text is localized (ar/en).
- [x] **Optional upgrade CTA:** Where the limit message is shown (e.g. toast, modal, or inline alert), offer an optional “Upgrade plan” (or equivalent) CTA. The CTA may link to a future pricing/upgrade page or open a modal; for MVP it is sufficient to show the CTA with a clear label (e.g. “Upgrade plan” / “ترقية الخطة”); the destination can be a placeholder or settings/billing if no dedicated upgrade flow exists yet.
- [x] **Consistent placement:** Limit messaging is shown in context: e.g. after “Create project” fails with 403 → message near the form or in a toast; after “Generate monthly plan” fails with 403 → message in the content plan section or toast. Same pattern for design generation in S4. Do not only rely on a generic “Request failed” for these 403s.
- [x] **RTL and i18n:** Limit messages and upgrade CTA use i18n keys in both Arabic and English; layout respects RTL when locale is `ar` (per S2-2).
- [x] **No confusion with other 403s:** If the API returns 403 without a known limit `code` (e.g. resource forbidden for other reasons), show a generic “Access denied” or “Forbidden” message; do not show the upgrade CTA for non-limit 403s.

---

## Tasks | المهام

- [x] Add translation keys for limit messaging: `limitProjectsReached`, `limitPlansReached`, `limitDesignsReached` (or use backend `error` when present); `upgradePlan` (CTA); optional `limitReachedTitle`; generic `accessDenied` for 403 without limit code. Add keys in both `ar` and `en`.
- [x] Centralize 403 handling: in the API client or a shared error handler, detect 403 responses and parse body for `code` and optional `error`, `limit`, `current`. If `code` is one of `PROJECTS_LIMIT_REACHED`, `PLANS_LIMIT_REACHED`, `DESIGNS_LIMIT_REACHED`, treat as limit reached; otherwise treat as generic forbidden.
- [x] In project create flow (S3-1): when create project returns 403 with `PROJECTS_LIMIT_REACHED`, show the limit message (toast or inline alert) and “Upgrade plan” CTA; do not leave user with only a generic error.
- [x] In content plan flow (S3-3): when generate (or regenerate) returns 403 with `PLANS_LIMIT_REACHED`, show the limit message and upgrade CTA in the content plan section or via toast.
- [x] (Optional for S3) Prepare a small reusable component or hook for “limit reached” UI (message + CTA) so S4 design generation can reuse it for `DESIGNS_LIMIT_REACHED` without duplicating logic.
- [x] Apply RTL: ensure limit alerts/toasts and CTA placement respect RTL in `ar` locale.
- [ ] Manually test: trigger project limit (create projects until 403), trigger plans limit (generate plans until 403); verify correct message and CTA in ar/en; verify generic 403 without limit code does not show upgrade CTA.

---

## Notes / API / References

- **ARCHITECTURE:** [ARCHITECTURE.md](../ARCHITECTURE.md) — Frontend shows clear errors and optional upgrade path when subscription limits are reached.
- **Sprint plan:** S3-5 — “When API returns 403 (project/plan/design limit), show clear message and optional upgrade CTA.”
- **Backend 403 payload (limit reached):** [backend/src/lib/limits.js](../backend/src/lib/limits.js) — `limitReachedPayload(code, message, limit, current)` returns `{ error, code?, limit?, current? }`.
  - **PROJECTS_LIMIT_REACHED** — From `POST /api/v1/projects` when user is at project limit; `limit` and `current` (as `count` in code) included.
  - **PLANS_LIMIT_REACHED** — From `POST /api/v1/content-plans/project/:projectId/generate` when plans-per-month limit reached; `limit` and `current` included.
  - **DESIGNS_LIMIT_REACHED** — From design generation (S4); same payload shape.
- **Limits per plan:** [backend/src/lib/limits.js](../backend/src/lib/limits.js) — Basic: 2 projects, 1 plan/month, 5 designs/month; Pro: 10, 5, 30; Business: 50, 20, 200.
- **Depends on:** S2-1 (Next.js, i18n), S2-2 (RTL), S2-3/S2-5 (auth), S3-1 (project create), S3-3 (content plan generate). S4 will reuse the same pattern for design limit.

---

*Story format: Content Pilot | بايلوت المحتوى*
