# Story: S3-4 — Export Excel
# قصة: S3-4 — تصدير إلى إكسل

**Sprint:** 3  
**Created:** 2025-03-05  
**Status:** Draft

---

## Summary | الملخص

When viewing a content plan in the project detail, the user can export that plan to Excel with one click. A button “Export to Excel” calls the backend export endpoint and triggers a file download with the correct filename, so they can use the plan offline or share it (S3-3 provides the plan view; this story adds the export action).

---

## Acceptance criteria | معايير القبول

- [ ] **Export button:** In the content plan view (project detail, when a plan is selected), a visible “Export to Excel” button (or equivalent label) is available; label uses i18n (ar/en), e.g. “Export to Excel” / “تصدير إلى إكسل”.
- [ ] **API call:** On click, the frontend calls `GET /api/v1/export/plan/:planId/excel` with the user’s auth token (Bearer or cookie); the request is made in a way that allows receiving a binary response (e.g. `response.blob()` or equivalent).
- [ ] **File download:** The response is treated as a file download: browser triggers download (e.g. via blob URL + temporary link click, or `Content-Disposition` handling); the downloaded file has a correct filename. Backend sends `Content-Disposition: attachment; filename="content-plan-{planIdPrefix}.xlsx"` — frontend may use that header for the filename or derive a sensible name (e.g. `content-plan-{planId.slice(0,8)}.xlsx` or plan title + `.xlsx`).
- [ ] **Loading and errors:** While the export request is in progress, show a loading state (e.g. disabled button + spinner or “Exporting…”); on 404 (plan not found or no access) show a user-friendly message; on 500 or network error show message and optional retry; do not leave the button stuck in loading if the request fails.
- [ ] **RTL and placement:** Export control is placed in the content plan section (e.g. near plan title or above/below the items list); layout respects RTL when locale is `ar` (per S2-2).

---

## Tasks | المهام

- [ ] Add translation keys for export: exportToExcel, exporting, exportError, exportNotFound, retry (if not already present) in both `ar` and `en`.
- [ ] In the content plan section (project detail page, where the selected plan and its items are shown), add an “Export to Excel” button; ensure it is only shown when a plan is selected (plan id available).
- [ ] Implement export handler: on button click, set loading state; call `GET /api/v1/export/plan/:planId/excel` with auth; expect binary response (e.g. `response.blob()`); extract filename from `Content-Disposition` header if present, otherwise use fallback e.g. `content-plan-{planId.slice(0,8)}.xlsx`.
- [ ] Trigger download: create an object URL from the blob, create a temporary `<a>` with `download` attribute and the filename, programmatically click it, revoke the object URL; clear loading state after success or failure.
- [ ] Handle errors: on 404 show “Plan not found” or “Unable to export”; on 5xx or network error show generic error and optional retry; clear loading state in all cases.
- [ ] Apply RTL: ensure button placement and any loading/error message respect RTL in `ar` locale.
- [ ] Manually test: select a plan with items, click “Export to Excel”, confirm file downloads with correct name and opens in Excel/LibreOffice with expected columns (Date, Post idea, Content text, Content type, Objective in Arabic); test 404 (e.g. invalid plan id) and error handling; verify ar/en labels.

---

## Notes / API / References

- **ARCHITECTURE:** [ARCHITECTURE.md](../ARCHITECTURE.md) — Frontend: “export”; users export the current content plan to Excel from project detail.
- **Sprint plan:** S3-4 — “Button ‘Export to Excel’ for current plan; call GET /api/v1/export/plan/:planId/excel; trigger file download with correct filename.”
- **Backend API:** [backend/src/routes/export.js](../backend/src/routes/export.js)
  - **GET /api/v1/export/plan/:planId/excel** — Auth required; user must own the plan’s project. Params: `planId` (UUID). Returns Excel stream with:
    - **Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
    - **Content-Disposition:** `attachment; filename="content-plan-{planId.slice(0,8)}.xlsx"`
    - Sheet columns (Arabic headers): التاريخ، فكرة المنشور، نص المحتوى، نوع المحتوى، الهدف  
  - 404 if plan not found or project not owned by user.
- **Depends on:** S2-1 (Next.js, i18n, API client), S2-2 (RTL), S2-3/S2-5 (auth), S3-1 (project detail), S3-3 (content plan UI — plan selection and display). S3-5 covers 403 limit messaging (export endpoint does not return 403 for limits).

---

*Story format: Content Pilot | بايلوت المحتوى*
