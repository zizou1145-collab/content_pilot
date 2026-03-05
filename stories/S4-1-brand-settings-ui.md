# Story: S4-1 — Brand settings UI
# قصة: S4-1 — واجهة إعدادات الهوية البصرية

**Sprint:** 4  
**Created:** 2025-03-05  
**Status:** Draft

---

## Summary | الملخص

Add a brand settings section in the project view: upload logo, set brand colors (e.g. primary/secondary), choose theme (minimal/bold/professional), and optionally set a reference image URL. Persist via existing PATCH project and logo upload APIs; display current logo and colors so the project is ready for design generation (S4-2/S4-3).

---

## Acceptance criteria | معايير القبول

- [ ] **Upload logo:** In project detail, a “Brand” or “الهوية” section with logo upload: file input (images only: JPEG, PNG, GIF, WebP, max 5MB); submit via `POST /api/v1/designs/:projectId/logo` with multipart field `logo`; on 201 update project state with new `logoUrl` and show the uploaded image; on 400 show validation error (e.g. “Only images allowed”); loading state during upload. i18n labels and messages.
- [ ] **Display current logo:** If project has `logoUrl`, show it (thumbnail or medium size); if no logo, show placeholder (e.g. “Upload logo” / “رفع الشعار”). Logo display respects RTL layout.
- [ ] **Brand colors:** Form fields for at least primary and secondary brand colors (e.g. color pickers or hex inputs); values sent as `brandColors` in `PATCH /api/v1/projects/:id` (JSON object e.g. `{ primary: "#...", secondary: "#..." }`); on save (200) update local state; display current colors (swatches or preview). Client-side validation for valid hex if applicable. i18n for labels.
- [ ] **Theme selection:** Dropdown or radio group for theme: **minimal** / **bold** / **professional** (and optionally **custom** per schema); value sent in `PATCH` as `theme`; current theme shown when loading project. i18n for theme labels.
- [ ] **Optional reference image:** Optional field for reference post URL (`referencePostUrl`): text input; saved via `PATCH`; displayed or linked in brand section when set. i18n label and hint.
- [ ] **Save brand settings:** “Save” or “Save brand” persists colors, theme, and reference URL in one `PATCH`; success feedback and error handling (400, 404); no full page reload; brand section stays usable in ar/en and RTL.

---

## Tasks | المهام

- [ ] Add i18n keys for brand: brandSettings, uploadLogo, logoPlaceholder, primaryColor, secondaryColor, theme, themeMinimal, themeBold, themeProfessional, themeCustom, referenceImageUrl, saveBrand, uploadSuccess, uploadError, onlyImagesAllowed, fileTooLarge; in `ar` and `en`.
- [ ] In project detail page, add a “Brand” / “الهوية” section (below or beside project info). Section visible only on project detail `/[locale]/projects/[id]`; RTL-aware layout.
- [ ] Implement logo upload: file input (accept image types); on select, send `FormData` with key `logo` to `POST /api/v1/designs/:projectId/logo` with auth; on 201 set project `logoUrl` in state and show image (use API base URL + path or backend proxy for image src if needed); on 400 show error; loading state during request. Display current logo from `project.logoUrl` or placeholder when empty.
- [ ] Add brand colors form: primary and secondary color inputs (color picker and/or hex); store as object `{ primary, secondary }`; “Save brand” sends `PATCH /api/v1/projects/:id` with `brandColors: JSON.stringify(...)` or object (per backend expectation); on 200 refresh project in state; show current color swatches when project loads.
- [ ] Add theme dropdown/radios: options minimal, bold, professional (and custom if in schema); value from `project.theme`; include in same PATCH on “Save brand”.
- [ ] Add optional reference URL input: `referencePostUrl`; include in PATCH; show when set (e.g. link or thumbnail if applicable).
- [ ] Single “Save brand” (or “Save”) for colors + theme + reference URL; do not require logo upload to save; success toast/message and error display; ensure GET project returns logoUrl, brandColors, theme, referencePostUrl so display stays in sync.
- [ ] Ensure brand section works in both locales and RTL; all copy from translation files. Manually test: upload logo, change colors and theme, save, reload project and confirm persistence; test validation and API errors.

---

## Notes / API / References

- **Sprint plan:** S4-1 — “In project: upload logo, set brand colors (e.g. primary/secondary), choose theme (minimal/bold/professional), optional reference image; PATCH project; display current logo/colors.”
- **PRD:** FR-6.1 — “User can set brand: upload logo, set brand colors (e.g. primary, secondary), choose theme (e.g. minimal, bold, professional), optionally upload reference post image.” ([PRD.md](../PRD.md))
- **Backend — Logo upload:** [backend/src/routes/designs.js](../backend/src/routes/designs.js)
  - **POST /api/v1/designs/:projectId/logo** — Auth required; multipart form with field `logo` (image); max 5MB; JPEG/PNG/GIF/WebP. Creates Asset `kind: 'logo'`, updates `project.logoUrl`. Returns 201 `{ logoUrl: filePath }` or 400 (no file / invalid type), 404 (project not found).
- **Backend — Project PATCH:** [backend/src/routes/projects.js](../backend/src/routes/projects.js)
  - **PATCH /api/v1/projects/:id** — Body: optional `brandColors` (string or JSON object; stored as JSON string), `theme`, `referencePostUrl`. Returns 200 `{ project }` or 400, 404.
- **GET /api/v1/projects/:id** — Returns full project including `logoUrl`, `brandColors`, `theme`, `referencePostUrl`.
- **Schema:** [backend/prisma/schema.prisma](../backend/prisma/schema.prisma) — Project: `logoUrl`, `brandColors` (Text/JSON), `theme` (e.g. minimal | bold | professional | custom), `referencePostUrl`.
- **Displaying logo:** `logoUrl` from API is a relative path (e.g. `projects/:id/logo_uuid.png`). Frontend must request the file via backend (e.g. `GET /api/v1/designs/asset/:assetId/download` with inline disposition, or a dedicated “serve project logo” URL if added). Alternatively, if backend exposes a static route for uploads, image src can be base URL + logoUrl; Backend serves uploads at GET /uploads/:path (backend/src/index.js). Use image src = API_BASE_URL + "/uploads/" + project.logoUrl.
- **Depends on:** S2-1 (Next.js, i18n, API client), S2-2 (RTL), S2-4/S3-1 (project detail page, auth). S4-2/S4-3 will consume brand settings for design generation.

---

*Story format: Content Pilot | بايلوت المحتوى*
