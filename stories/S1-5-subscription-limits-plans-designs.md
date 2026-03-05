# Story: S1-5 — Subscription limits (plans & designs)
# قصة: S1-5 — حدود الاشتراك (الخطط والتصاميم)

**Sprint:** 1  
**Created:** 2025-03-04  
**Status:** Done

---

## Summary | الملخص

Define and enforce per-plan limits for **content plans per month** and **designs per month** (in addition to the existing project limit). When a user hits a limit, the API returns 403 with a clear, actionable message so the frontend can show an upgrade CTA.

---

## Acceptance criteria | معايير القبول

- [x] Limits per subscription plan are defined in one place (e.g. shared config or `lib/limits.js`): **projects** (existing), **plans per month**, **designs per month**. Example values: Basic (2, 1, 5), Pro (10, 5, 30), Business (50, 20, 200) — adjust as product dictates.
- [x] **Plans/month:** Count is “content plans created by the user in the given calendar month” (any project). When user calls `POST /api/v1/content-plans/project/:projectId/generate` and their plans count for that month already equals the limit, return **403** with a JSON body that includes a clear message (e.g. `error` and optional `code: 'PLANS_LIMIT_REACHED'` or `limit`, `current` for UI).
- [x] **Designs/month:** Count is “assets with `kind: 'generated_post'` created for the user’s projects in the current calendar month”. When design generation is invoked (e.g. future `POST /designs/:projectId/generate` or per-asset generation), if the user’s designs count for the month equals the limit, return **403** with a clear message (e.g. `error`, optional `code: 'DESIGNS_LIMIT_REACHED'`). For S1, if no design-generate endpoint exists yet, implement the limit-check helper and call it from the only place that creates `generated_post` assets (or document that it will be used when S4-2 adds the endpoint).
- [x] 403 responses for limits use a consistent shape (e.g. `{ error: string, code?: string }`) so the frontend (S3-5) can show a single “limit reached” pattern and optional upgrade CTA.
- [x] Replacing an existing plan (replace=true) does **not** increase the plans/month count (we are not creating an extra plan; we delete one and create one in the same month). New plan create (including replace flow) still counts as one plan for that month when checking the limit (so we check before create: “would this month’s plans after this request exceed the limit?” — e.g. count existing plans in month + 1 &lt;= limit, or count after create &lt;= limit).

---

## Tasks | المهام

- [x] Add a shared limits module (e.g. `backend/src/lib/limits.js`): export `SUBSCRIPTION_LIMITS` (e.g. `{ Basic: { projects: 2, plansPerMonth: 1, designsPerMonth: 5 }, Pro: { ... }, Business: { ... } }`) and helper functions such as `getPlansPerMonthLimit(plan)`, `getDesignsPerMonthLimit(plan)`.
- [x] Add helpers: `async function countUserPlansInMonth(prisma, userId, month, year)` (count `ContentPlan` where project belongs to user and plan.month/month, plan.year/year) and `async function countUserDesignsInMonth(prisma, userId, month, year)` (count `Asset` with `kind: 'generated_post'` where project.userId === userId and asset createdAt in that month/year). Use Prisma date filters (e.g. `gte`/`lt` on `createdAt` or `ContentPlan.month/year` for plans).
- [x] In `POST /api/v1/content-plans/project/:projectId/generate`: after resolving the project and before creating (or replacing) the plan, load the user’s subscription plan and plans-per-month limit; compute current count for the requested month/year; if count already equals limit (and we are not replacing an existing plan that would free a “slot”) or if count + 1 > limit, return 403 with `{ error: '...', code: 'PLANS_LIMIT_REACHED' }`. When replace=true, the net change in plan count for that month is 0, so allow it without counting as extra; when replace=false, count + 1 must be &lt;= limit.
- [x] In designs flow: (a) If there is an endpoint that creates `generated_post` assets (e.g. logo upload does not count; only generated posts do), add a check before creating each asset (or batch): get user’s designs-per-month limit, count `Asset` with kind `generated_post` for user’s projects in current month, and if at limit return 403 with `{ error: '...', code: 'DESIGNS_LIMIT_REACHED' }`. (b) If no design-generate endpoint exists in S1, implement `checkDesignsLimit(prisma, userId)` (and optionally expose it) and document that S4-2 will call it when adding `POST /designs/:projectId/generate`.
- [x] Optionally refactor `projects.js` to use the shared limits module for project limit (e.g. `getProjectLimit(plan)`, `countUserProjects(prisma, userId)`) so all limits live in one place; keep 403 message consistent.
- [x] Document the limit values and 403 response shape (e.g. in API spec or README). Manually test: set user to Basic, create one plan for a month, attempt to create another plan for the same month → 403 with clear message; with replace=true, regenerate → 200/201. Test designs limit when the generate endpoint exists.

---

## Notes / API / References

- **Sprint plan:** S1-5 — “Define limits per plan (e.g. plans/month, designs/month); enforce in content-plans generate and (when added) design generate; return 403 with clear message when limit reached.”
- **PRD:** FR-1.4 — “Subscription tiers: Basic, Pro, Business (monthly). Each tier has limits: max projects, content plans per month, designs per month.” Limits TBD; enforce in backend.
- **Existing:** `backend/src/routes/projects.js` already has `planLimits = { Basic: 2, Pro: 10, Business: 50 }` and `checkProjectLimit(userId)`; 403 message: “Project limit reached for your plan”.
- **Content plan count:** “Plans per month” = number of distinct content plans (ContentPlan records) for that user in that calendar month. Use `ContentPlan.month` and `ContentPlan.year` for the requested month when generating; for “current month” usage you can use the plan’s month/year. When replace=true, we delete then create, so the count for that month stays same or goes to 1 — allow if after operation count ≤ limit.
- **Design count:** “Designs per month” = number of Asset records with `kind: 'generated_post'` whose project belongs to the user, created in the given calendar month (use `createdAt` with start/end of month).
- **Frontend:** S3-5 will consume 403 and show “limit reached” + upgrade CTA; consistent `code` or `error` message improves UX.

---

*Story format: Content Pilot | بايلوت المحتوى*
