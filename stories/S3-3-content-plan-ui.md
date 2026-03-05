# Story: S3-3 — Content plan UI
# قصة: S3-3 — واجهة خطة المحتوى

**Sprint:** 3  
**Created:** 2025-03-05  
**Status:** Draft

---

## Summary | الملخص

In the project detail view, the user can generate a monthly content plan (select month/year), see the plan with its items (date, idea, copy, type, objective), edit items inline or in a modal, and regenerate the plan with confirmation. This builds on project detail (S3-1) and market analysis (S3-2); export to Excel is S3-4.

---

## Acceptance criteria | معايير القبول

- [ ] **Generate monthly plan:** In project view (`/[locale]/projects/[id]`), a “Generate monthly plan” (or “New plan”) action lets the user choose **month** and **year**; submit to `POST /api/v1/content-plans/project/:projectId/generate` with body `{ month, year }`; on 201 display the new plan and its items; on 409 (plan already exists for that month) show a clear message and offer “Regenerate” (replace) or view existing plan; on 403 (plans limit) show message per S3-5. All labels and messages use i18n (ar/en).
- [ ] **Show plan with items:** When a plan exists (from list or after generate), display the plan with its **items** in a readable layout: for each item show **date** (publishDate), **idea** (postIdea), **copy** (postCopy), **type** (contentType: educational, promotional, introductory, success_story), and **objective**; empty state when the plan has no items; i18n for column/section titles and content type labels.
- [ ] **List plans for project:** Load plans via `GET /api/v1/content-plans/project/:projectId`; show plans (e.g. by month/year) with a way to select one to view/edit; if no plans, show empty state with CTA to “Generate monthly plan”.
- [ ] **Inline or modal edit for items:** User can edit a plan item: at least one of date, idea, copy, type, objective. Edit can be inline (e.g. editable row) or in a modal; on save call `PATCH /api/v1/content-plans/:planId/items/:itemId` with changed fields; on 200 update local state and show success; on 400 show validation errors; on 404 show not-found. Labels and buttons use i18n.
- [ ] **Regenerate with confirm:** When a plan already exists for the chosen month/year, offer “Regenerate” (overwrite). Before calling generate with `replace: true`, show a confirmation (e.g. “This will replace the existing plan for [month/year]. Continue?”); on confirm send `POST .../generate` with body `{ month, year, replace: true }`; on 201 show the new plan; handle 403 per S3-5.
- [ ] **Loading and error states:** Loading indicator while generating or fetching plans/items; user-friendly messages for 4xx/5xx and network errors with optional retry; 403 plans-limit message consistent with S3-5.
- [ ] **RTL and layout:** Content plan section respects RTL when locale is `ar` (per S2-2); table or card layout for items is consistent with project detail and S3-1/S3-2 styling.

---

## Tasks | المهام

- [ ] Add translation keys for content plans: section title, generatePlan, newPlan, selectMonth, selectYear, month, year, planExists, regenerate, regenerateConfirm, viewPlan, noPlans, noItems, date, idea, copy, contentType, objective, contentTypes (educational, promotional, introductory, success_story), edit, save, cancel, success, error, retry, loading; in both `ar` and `en`.
- [ ] In project detail page, add a “Content plan” section: on mount or when entering, call `GET /api/v1/content-plans/project/:projectId` to load plans; store in state; if plans length > 0, optionally auto-select the first or let user pick by month/year.
- [ ] Implement “Generate monthly plan”: control to choose month and year (dropdowns or date picker); submit to `POST /api/v1/content-plans/project/:projectId/generate` with `{ month, year }`; on 201 add/update plan in state and show it with items; on 409 show “Plan already exists for this month” and offer “View plan” or “Regenerate”; on 403 show plans-limit message (S3-5); handle 404 (project not found) and 500 with message and retry.
- [ ] Display plan and items: when a plan is selected, show plan title (e.g. month/year) and list of items with columns/fields: publishDate, postIdea, postCopy, contentType, objective; use table or cards; empty state when `items.length === 0`; format date for locale; map contentType enum to translated labels.
- [ ] Implement item edit: “Edit” on an item opens inline form or modal with fields (date, idea, copy, type, objective); on save call `PATCH /api/v1/content-plans/:planId/items/:itemId` with changed fields; on 200 update item in local state and show success; handle 400 (validation), 404.
- [ ] Implement regenerate: when user chooses “Regenerate” (after 409 or from plan view), show confirmation dialog with translated text; on confirm call `POST .../generate` with `{ month, year, replace: true }`; on 201 replace plan in state and show new plan; handle 403.
- [ ] Optional: allow deleting a plan via `DELETE /api/v1/content-plans/:planId` with confirmation; on 204 remove from list and show empty or next plan.
- [ ] Apply RTL: use logical properties and existing RTL from S2-2 for plan section and items list/table.
- [ ] Manually test: generate plan (month/year), view items, edit item and save, trigger 409 and regenerate with confirm; test 403 when at limit; verify ar/en and RTL.

---

## Notes / API / References

- **ARCHITECTURE:** [ARCHITECTURE.md](../ARCHITECTURE.md) — Frontend: “content plan”; users generate and edit monthly plans from project detail; export is S3-4.
- **Sprint plan:** S3-3 — “‘Generate monthly plan’ (month/year); show plan with items (date, idea, copy, type, objective); inline or modal edit for items; ‘Regenerate’ with confirm.”
- **Backend APIs:** [backend/src/routes/content-plans.js](../backend/src/routes/content-plans.js)
  - **GET /api/v1/content-plans/project/:projectId** — Auth required; user must own project. Returns `{ plans }`; each plan has `id`, `title`, `month`, `year`, `createdAt`, `updatedAt`, `items` (array, ordered by `orderIndex`). Items: `id`, `publishDate`, `postIdea`, `postCopy`, `contentType`, `objective`, `orderIndex`.
  - **POST /api/v1/content-plans/project/:projectId/generate** — Body: `month` (1–12), `year` (2020–2030), optional `replace` (boolean). Creates plan using AI (uses latest market analysis if present). Returns 201 `{ plan }` (with items) or 409 `{ error: 'Content plan already exists for this month' }`, 403 `{ error, code: 'PLANS_LIMIT_REACHED', limit, current }`, 404 project not found.
  - **GET /api/v1/content-plans/:planId** — Auth required; user must own plan’s project. Returns `{ plan }` with items.
  - **PATCH /api/v1/content-plans/:planId/items/:itemId** — Body: optional `publishDate` (ISO8601), `postIdea`, `postCopy`, `contentType`, `objective`. Returns 200 `{ item }` or 400 (validation), 404.
  - **DELETE /api/v1/content-plans/:planId** — Auth required; user must own plan’s project. Returns 204.
- **ContentType enum (Prisma):** `educational`, `promotional`, `introductory`, `success_story` — [backend/prisma/schema.prisma](../backend/prisma/schema.prisma).
- **Limits:** [backend/src/lib/limits.js](../backend/src/lib/limits.js) — plans per month: Basic 1, Pro 5, Business 20. 403 payload includes `code: 'PLANS_LIMIT_REACHED'`.
- **Depends on:** S2-1 (Next.js, i18n, API base), S2-2 (RTL), S2-3/S2-5 (auth), S3-1 (project detail page), S3-2 (market analysis — backend uses latest analysis when generating plan). S3-4 adds “Export to Excel” for the current plan; S3-5 standardizes 403 messaging.

---

*Story format: Content Pilot | بايلوت المحتوى*
