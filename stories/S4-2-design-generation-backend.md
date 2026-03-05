# Story: S4-2 — Design generation (backend)
# قصة: S4-2 — توليد التصاميم (الخلفية)

**Sprint:** 4  
**Created:** 2025-03-05  
**Status:** Done

---

## Summary | الملخص

Implement backend post image generation: add `POST /api/v1/designs/:projectId/generate` that accepts selected content plan item IDs, calls an image generation service (e.g. DALL·E or compatible API), saves images via the storage service, creates Asset records with `kind: generated_post` linked to plan items, and enforces the designs-per-month subscription limit before creating any assets.

---

## Acceptance criteria | معايير القبول

- [x] **Generate endpoint:** `POST /api/v1/designs/:projectId/generate` exists; auth required; body includes at least `contentPlanItemIds` (array of UUIDs) and optionally `planId` for context; project must belong to the authenticated user; all item IDs must belong to a content plan of that project.
- [x] **Designs limit:** Before creating any `generated_post` assets, call `checkDesignsLimit(prisma, req.user.id)` from `lib/limits.js`; if `!allowed`, return **403** with body from `limitReachedPayload('DESIGNS_LIMIT_REACHED', message, limit, current)` so frontend can show upgrade CTA; do not create assets when over limit.
- [x] **Image generation:** For each requested plan item, produce one post image (e.g. via DALL·E or a design API) using project context (name, field, brand colors, theme, post idea/copy from the item); prompt or template supports AR/EN per project or user locale; errors for a single item are handled (log and optionally return partial results or fail the batch per product decision).
- [x] **Storage and Asset records:** Each generated image is saved with `saveUpload(buffer, relativePath, mimeType)` under a path like `projects/:projectId/generated/:assetId.png`; create one Asset per image with `kind: 'generated_post'`, `projectId`, `contentPlanItemId`, `filePath`, `mimeType`; link Asset to the correct ContentPlanItem.
- [x] **Response:** Return 201 with created assets (e.g. `{ assets: [{ id, filePath, contentPlanItemId, ... }] }`); on validation error (invalid project, invalid item IDs, items not in project’s plan) return 400 with clear message; on designs limit return 403 as above; on upstream/image generation failure return 5xx or 424 with error message.
- [x] **Idempotency / overwrite:** Define behavior for items that already have a `generated_post` asset: either skip, replace (delete old asset file and record, create new), or return 409 for conflicting items; document in API/notes.

---

## Tasks | المهام

- [x] Add image generation in backend: either extend `services/ai.js` with a function `generatePostImage(project, contentPlanItem, locale)` that calls DALL·E (or compatible) and returns image buffer + mime type, or add `services/design.js` that wraps the chosen provider; use project `name`, `field`, `brandColors`, `theme`, and item `postIdea`/`postCopy` in the prompt; handle provider errors and missing API key (e.g. 503 with message to set `OPENAI_API_KEY` or `DESIGN_API_KEY`).
- [x] Implement `POST /api/v1/designs/:projectId/generate` in `routes/designs.js`: validate `projectId` (UUID), load project and ensure `project.userId === req.user.id`; validate body (e.g. `contentPlanItemIds` array of UUIDs); load content plan items and ensure each belongs to a ContentPlan of this project; if any item invalid or not in project, return 400.
- [x] Before creating assets: call `checkDesignsLimit(prisma, req.user.id)`; if `!allowed`, return 403 with `limitReachedPayload('DESIGNS_LIMIT_REACHED', message, limit, current)` (use existing helper from `lib/limits.js`).
- [x] For each requested item (respecting limit): call image generation; save file with `saveUpload` to e.g. `projects/:projectId/generated/:uuid.png`; create Asset with `kind: 'generated_post'`, `projectId`, `contentPlanItemId`, `filePath`, `mimeType`; if “replace” behavior: delete existing Asset (and file) for that item before creating new one.
- [x] Return 201 with list of created assets (id, filePath, contentPlanItemId, mimeType, etc.); on partial failure (e.g. one image fails), either return partial success with errors in body or fail entire request — document and implement consistently.
- [x] Document required env (e.g. `OPENAI_API_KEY` for DALL·E) in `.env.example`; add brief comment or doc for the generate endpoint (request/response shape) in code or API spec.
- [x] Remove or update the inline TODO/comment in `designs.js` that references S4-2 once the endpoint is implemented.

---

## Notes / API / References

- **Sprint plan:** S4-2 — “Implement or integrate post image generation (e.g. DALL·E or design API) for selected plan items; store as Asset `kind: generated_post`; enforce designs/month limit.” ([SPRINT_PLAN.md](../SPRINT_PLAN.md))
- **PRD:** Design generation for posts; backend must support generating images for plan items and enforce limits. ([PRD.md](../PRD.md) if specified)
- **Limits:** [backend/src/lib/limits.js](../backend/src/lib/limits.js) — `checkDesignsLimit(prisma, userId, month?, year?)` returns `{ allowed, limit, current }`; `limitReachedPayload('DESIGNS_LIMIT_REACHED', message, limit, current)` for 403 body. Counts `Asset` with `kind: 'generated_post'` in current month by `createdAt`.
- **Schema:** [backend/prisma/schema.prisma](../backend/prisma/schema.prisma) — `Asset`: `projectId`, `contentPlanItemId` (optional), `kind` (logo | generated_post), `filePath`, `mimeType`. `ContentPlanItem` has `assets Asset[]`.
- **Storage:** [backend/src/services/storage.js](../backend/src/services/storage.js) — `saveUpload(buffer, relativePath, mimeType)` returns saved path for DB.
- **Designs route:** [backend/src/routes/designs.js](../backend/src/routes/designs.js) — Add new POST route; keep `GET /asset/:assetId/download` and `GET /:projectId/assets` unchanged; design generation comment at top to be fulfilled.
- **Request shape (suggestion):** `POST /api/v1/designs/:projectId/generate` — Body: `{ contentPlanItemIds: string[], replaceExisting?: boolean }`. Response 201: `{ assets: Array<{ id, filePath, contentPlanItemId, mimeType, createdAt }> }`. 403: `{ error, code: 'DESIGNS_LIMIT_REACHED', limit, current }`.
- **Frontend:** S4-3 will add “Generate designs” UI that calls this endpoint; S4-4 uses existing `GET /api/v1/designs/asset/:assetId/download` for downloads.

---

*Story format: Content Pilot | بايلوت المحتوى*
