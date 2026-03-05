# Story: S4-4 — Asset download in UI
# قصة: S4-4 — تحميل الملفات في الواجهة

**Sprint:** 4  
**Created:** 2025-03-05  
**Status:** Draft

---

## Summary | الملخص

Complete asset download in the frontend: provide a single-asset download action and “Download all” for the current plan or project. Use `GET /api/v1/designs/asset/:assetId/download` so users can download logos and generated post assets from the app with correct filenames and behavior in both Arabic and English (RTL).

---

## Acceptance criteria | معايير القبول

- [ ] **Single asset download:** Wherever an asset is listed (e.g. project designs list, brand logo, generated posts), a “Download” (or “تحميل”) control is available; clicking it calls `GET /api/v1/designs/asset/:assetId/download` with auth and triggers a browser download with a sensible filename (from `Content-Disposition` or fallback from asset id/type). Works for both logo and `generated_post` assets. i18n for the button.
- [ ] **Download all — plan scope:** In the content plan / designs view, when the current plan has generated assets, a “Download all” (or “تحميل الكل”) action is available; it downloads all assets tied to that plan (e.g. assets whose `contentPlanItemId` belongs to the current plan). User gets all files (e.g. sequential downloads or zip if backend adds bulk). i18n and loading state (“Preparing download…”) if needed.
- [ ] **Download all — project scope:** In the project’s designs/brand area, a “Download all” (or “تحميل كل التصاميم”) is available when the project has at least one generated-post (or all) asset; it downloads all such assets for the project. Same UX as plan-scoped “Download all”. i18n.
- [ ] **Shared download helper:** Single-asset download uses a shared helper or service (e.g. `downloadAsset(assetId)`) so the same logic is used from designs list, brand section, and any future asset list; auth token and API base URL are applied correctly; CORS/credentials handled if frontend is on a different origin.
- [ ] **Errors and limits:** If the download request fails (404, 403, 5xx), show a clear message (e.g. “Download failed” / “فشل التحميل”); do not leave the user with no feedback. No change to subscription-limit messaging (handled in S3-5 / S4-3).
- [ ] **RTL and i18n:** All new labels and messages have `ar` and `en` entries; layout respects RTL where download actions appear.

---

## Tasks | المهام

- [ ] Add or reuse i18n keys: `download`, `downloadAll`, `downloadAllForPlan`, `downloadAllForProject`, `preparingDownload`, `downloadFailed`; ensure `ar` and `en` in design/asset context.
- [ ] Implement shared download helper: e.g. `downloadAsset(assetId, filename?)` that calls `GET /api/v1/designs/asset/:assetId/download` with auth (Bearer or cookie), reads response as blob, and triggers browser download using a temporary link with filename from `Content-Disposition` or fallback. Handle non-2xx by rejecting or showing error; used by single-download buttons everywhere.
- [ ] Single-asset download in designs list: in the view that lists generated assets (S4-3), ensure each asset has a “Download” control that calls the shared helper with that asset’s id (and optional filename from asset). Accessible (e.g. aria-label) and RTL-friendly.
- [ ] “Download all” for current plan: in content plan / designs section, when there are assets for the current plan, add “Download all” button; on click, show “Preparing download…” (or spinner), then iterate over plan-scoped assets and call the download helper for each (e.g. with short delay between to avoid browser blocking). Optionally, if backend adds a zip endpoint later, switch to that. i18n and disable button during download.
- [ ] “Download all” for project: in project designs/brand area, when project has assets (generated posts and/or logo), add “Download all” that downloads all project assets using the same pattern (loop with helper). Reuse same i18n and loading behavior.
- [ ] Error handling in UI: when the shared helper gets 403/404/5xx, surface a toast or inline message (“Download failed” / “فشل التحميل”); do not assume success. If backend returns a message body, show it when appropriate.
- [ ] Manual test: download single logo, single generated post, “Download all” for a plan with multiple assets, “Download all” for project; verify filenames and RTL/ar/en; verify error when asset is missing or user lacks access.

---

## Notes / API / References

- **Sprint plan:** S4-4 — “Download single asset and ‘Download all’ for plan/project; use GET /api/v1/designs/asset/:id/download (or equivalent).” ([SPRINT_PLAN.md](../SPRINT_PLAN.md))
- **Backend — Download:** **GET /api/v1/designs/asset/:assetId/download** — Implemented in S1-4. Streams file; sets `Content-Disposition` for filename; auth required; user must own project. See [S1-4-asset-download.md](./S1-4-asset-download.md).
- **S4-3:** Design generation (frontend) lists generated assets and already specifies “Download” per asset and “Download all”; S4-4 is the dedicated story for the download UX and ensures it is implemented once (shared helper) and available for both plan and project scope.
- **S1-4:** Backend asset download endpoint; no frontend change to API contract.
- **Depends on:** S2-1 (Next.js, i18n, API client), S2-2 (RTL), S4-3 (designs list and asset list for plan), S1-4 (download endpoint).

---

*Story format: Content Pilot | بايلوت المحتوى*
