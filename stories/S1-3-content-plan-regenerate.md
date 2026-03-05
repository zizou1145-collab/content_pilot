# Story: S1-3 — Content plan regenerate
# قصة: S1-3 — إعادة توليد خطة المحتوى

**Sprint:** 1  
**Created:** 2025-03-04  
**Status:** Draft

---

## Summary | الملخص

Allow overwrite/replace of an existing content plan for the same project and month. When the client explicitly requests replace (e.g. `?replace=true` or body `replace: true` on generate), the backend deletes the existing plan and creates a new one instead of returning 409. Idempotency and conflict rules remain clear: without replace, existing plan → 409.

---

## Acceptance criteria | معايير القبول

- [ ] **POST /api/v1/content-plans/project/:projectId/generate** accepts an optional **replace** flag:
  - **Query:** `?replace=true` (or `replace=1`).
  - **Body:** `{ month, year, replace: true }` (optional boolean).
- [ ] When **replace** is not set or false and a plan already exists for that project + month + year, the API returns **409** with a clear message (e.g. `Content plan already exists for this month`); behavior unchanged from current.
- [ ] When **replace** is true and a plan exists for that project + month + year:
  - The existing plan (and its items, via cascade or explicit delete) is removed.
  - A new plan is generated and persisted as today (same flow as first-time generate).
  - Response is **201** with the new plan (same shape as current create response).
- [ ] When **replace** is true and no plan exists, the behavior is the same as normal generate (201, new plan).
- [ ] API spec or route documentation is updated to describe the replace option and 409 vs 201 behavior so idempotency/conflict rules are clear.

---

## Tasks | المهام

- [ ] In `backend/src/routes/content-plans.js`, add support for **replace**:
  - Parse `replace` from query (`req.query.replace`) or body (`req.body.replace`); treat `"true"`, `"1"`, and boolean `true` as true; otherwise false.
- [ ] When replace is false and `existing` plan found: keep current `res.status(409).json({ error: '...' })`.
- [ ] When replace is true and `existing` plan found: delete the existing plan (Prisma `contentPlan.delete`; items are deleted by cascade if schema defines it, or delete items then plan), then continue with current generate flow (call `generateMonthlyPlan`, create new plan, return 201).
- [ ] When replace is true and no existing plan: same as now (generate and 201).
- [ ] Add validation if desired: e.g. optional `body('replace').optional().isBoolean()` or custom sanitizer so body accepts boolean.
- [ ] Update API spec (OpenAPI/Swagger or README) or inline JSDoc: document `replace` (query and body), 409 when plan exists and replace is false, 201 when replace is true (overwrite) or when no plan exists.
- [ ] Manual test: (1) generate plan for project X, month M, year Y → 201; (2) generate again without replace → 409; (3) generate with replace=true → 201 and new plan; (4) get plan by id and list by project to confirm only one plan for that month.

---

## Notes / API / References

- **SPRINT_PLAN:** S1-3 — “Allow overwrite/replace of existing plan for same project+month (e.g. optional `?replace=true` or body `replace: true` on generate); confirm in API spec; keep idempotency/conflict rules clear.”
- **PRD gap:** “Regenerate plan: Currently 409 if plan exists; need ‘regenerate’ (overwrite) or explicit replace.”
- **Current route:** `POST /api/v1/content-plans/project/:projectId/generate` with body `{ month, year }`; line 54 returns 409 if `existing` plan found.
- **Schema:** `ContentPlan` has one-to-many `ContentPlanItem`; schema already has `onDelete: Cascade` on the relation, so deleting the plan removes items automatically.
- **Idempotency:** Without replace, same (project, month, year) is idempotent (always 409 after first create). With replace, same (project, month, year) overwrites; client is responsible for explicit “regenerate” intent.

---

*Story format: Content Pilot | بايلوت المحتوى*
