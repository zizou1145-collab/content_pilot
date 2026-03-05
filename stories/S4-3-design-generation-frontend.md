# Story: S4-3 — Design generation (frontend)
# قصة: S4-3 — توليد التصاميم (الواجهة)

**Sprint:** 4  
**Created:** 2025-03-05  
**Status:** Draft

---

## Summary | الملخص

Add a “Generate designs” flow in the project/content-plan UI: let the user choose plan items (all or selection), call the backend design generation endpoint, show loading or progress, then list generated assets with thumbnails and support single-asset and bulk download so users can get their post images from the app.

---

## Acceptance criteria | معايير القبول

- [ ] **Generate designs action:** In the content plan view (or a dedicated “Designs” tab/section for the plan), a “Generate designs” (or “توليد التصاميم”) action is available when the project has a content plan with items; user can choose “All items” or select specific plan items (e.g. checkboxes); selection is sent as `contentPlanItemIds` to `POST /api/v1/designs/:projectId/generate`. i18n for button and selection labels.
- [ ] **Loading / progress:** While the generate request is in progress, show a loading state (spinner, progress text, or “Generating…”); disable the generate button during the request; on success, refresh the list of assets and show success feedback; on error (403, 5xx, network), show a clear message (e.g. designs limit reached with upgrade CTA for 403). No silent failures.
- [ ] **List generated assets:** After generation (or on entering the designs view), list assets for the project/plan: call `GET /api/v1/designs/:projectId/assets` and display items with `kind: 'generated_post'` (optionally filter by current plan if backend supports or filter client-side by plan items). Show thumbnails using the asset `url` (or a dedicated thumbnail endpoint if added); fallback (e.g. icon or placeholder) when image fails to load. Display in a grid or list; RTL-friendly layout. i18n for empty state (“No designs yet”, “لم تُنشأ تصاميم بعد”).
- [ ] **Download per asset:** Each listed asset has a “Download” (or “تحميل”) control; clicking it triggers download of that asset (e.g. open or fetch `GET /api/v1/designs/asset/:assetId/download` and trigger file save with `Content-Disposition` filename, or use link with download attribute if backend supports inline URL). File is saved with a sensible name (e.g. from header or asset id). i18n for button.
- [ ] **Bulk download:** A “Download all” (or “تحميل الكل”) action is available when there is at least one generated-post asset; it downloads all such assets (e.g. multiple requests or a future bulk endpoint); optionally show a brief progress or “Preparing download…” then trigger multiple downloads or a zip if backend adds bulk download later. i18n for button.
- [ ] **Limit handling:** When `POST .../generate` returns 403 with `code: 'DESIGNS_LIMIT_REACHED'`, show the message from the API and an optional upgrade CTA consistent with S3-5 (subscription limits in UI); do not create partial UI state that implies success.

---

## Tasks | المهام

- [ ] Add i18n keys for design generation: generateDesigns, generatingDesigns, selectPlanItems, allItems, noDesignsYet, download, downloadAll, preparingDownload, designsLimitReached, upgradeCta; in `ar` and `en`.
- [ ] In content plan view (or project detail “Designs” section), add “Generate designs” entry point: ensure current plan and its items are available (from S3-3); show list of plan items with checkboxes (or “Select all”) so user can choose which items to generate; “Generate” button calls `POST /api/v1/designs/:projectId/generate` with body `{ contentPlanItemIds: selectedIds }` (and optional `replaceExisting: true` if product specifies). Use existing API client and auth.
- [ ] Implement loading state: disable generate button and show spinner/“Generating…” during request; on 201, refetch assets (GET `.../designs/:projectId/assets`) and show success toast/message; on 403 with DESIGNS_LIMIT_REACHED, show limit message and upgrade CTA; on 4xx/5xx show error message. No partial success state that leaves user confused.
- [ ] Implement assets list: after opening designs section or after generate success, call `GET /api/v1/designs/:projectId/assets`; filter or display assets with `kind === 'generated_post'` (optionally scoped to current plan’s items for clarity); render grid/list with thumbnail per asset (img src = asset.url or backend upload URL); handle image load error with placeholder/icon. Empty state when no generated designs. RTL and i18n.
- [ ] Per-asset download: for each asset, add “Download” button/link; on click, request `GET /api/v1/designs/asset/:assetId/download` (with auth); use response blob and Content-Disposition (or fallback filename from asset id) to trigger browser download. Ensure same-origin or CORS and credentials if frontend is on different origin.
- [ ] Bulk download: add “Download all” when there are generated_post assets; on click, either (a) loop through assets and trigger download one-by-one with short delay to avoid blocking, or (b) show “Preparing…” and then do the same; if backend later adds e.g. GET …/assets/zip, switch to that. i18n and accessibility (e.g. aria-label).
- [ ] Reuse or align 403 limit messaging with S3-5 (subscription limits): same style and upgrade CTA for DESIGNS_LIMIT_REACHED. Manually test: generate with selection, generate all, hit limit, download single and download all; verify RTL and ar/en.

---

## Notes / API / References

- **Sprint plan:** S4-3 — “Generate designs for plan (all or selection); loading/progress; list generated assets with thumbnails; download per asset and bulk.” ([SPRINT_PLAN.md](../SPRINT_PLAN.md))
- **Backend — Generate:** [backend/src/routes/designs.js](../backend/src/routes/designs.js)
  - **POST /api/v1/designs/:projectId/generate** — Body: `{ contentPlanItemIds: string[], replaceExisting?: boolean }`. 201: `{ assets: Array<{ id, filePath, contentPlanItemId, mimeType, createdAt }>, errors?: [...] }`. 403: `{ error, code: 'DESIGNS_LIMIT_REACHED', limit, current }`. See S4-2 story.
- **Backend — List assets:** **GET /api/v1/designs/:projectId/assets** — Returns `{ assets }`; each asset has `id`, `filePath`, `contentPlanItemId`, `kind`, `mimeType`, `createdAt`, and `url` (e.g. `baseUrl + '/uploads/' + filePath`) for display/thumbnails.
- **Backend — Download:** **GET /api/v1/designs/asset/:assetId/download** — Streams file; sets `Content-Disposition` for filename; auth required; user must own project. Used for single and (via multiple calls) bulk download in UI.
- **S4-2:** Backend design generation (implemented). S4-3 consumes it from the frontend.
- **S4-4:** Asset download in UI — this story covers “download per asset and bulk” in the design-generation context; S4-4 may generalize to “Download all” for plan/project elsewhere; avoid duplicate logic (e.g. shared download helper).
- **Content plan context:** Plan and items come from S3-3 (content plan UI); ensure project and current plan id are available when building `contentPlanItemIds` for generate.
- **Depends on:** S2-1 (Next.js, i18n, API client), S2-2 (RTL), S3-3 (content plan UI, plan items), S4-2 (backend generate endpoint).

---

*Story format: Content Pilot | بايلوت المحتوى*
