# Content Pilot — Sprint Plan  
# خطة السبرنت — بايلوت المحتوى

**Version:** 1.0  
**Date:** 2025-03-04  
**Goal:** Deliver MVP per [PRD.md](./PRD.md) and [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Current State | الحالة الحالية

### Backend (partial)

| Area | Status | Notes |
|------|--------|--------|
| **Prisma schema** | ✅ Done | User, Project, MarketAnalysis, ContentPlan, ContentPlanItem, Asset |
| **Auth** | ✅ Done | Register, login, JWT, `GET /me`, bcrypt |
| **Projects** | ✅ Done | CRUD, project limits by plan (Basic: 2, Pro: 10, Business: 50) |
| **Market analysis** | ⚠️ Routes only | Depends on missing `services/ai.js` |
| **Content plans** | ⚠️ Routes only | Generate, list, get, PATCH items, delete plan; depends on `services/ai.js` |
| **Designs** | ⚠️ Partial | Logo upload + list assets; depends on missing `services/storage.js` |
| **Export** | ✅ Done | Excel export with AR headers |
| **AI service** | ❌ Missing | `backend/src/services/ai.js` — `analyzeMarket()`, `generateMonthlyPlan()` |
| **Storage service** | ❌ Missing | `backend/src/services/storage.js` — `saveUpload()` |
| **Subscription limits** | ⚠️ Partial | Only project count enforced; plans/month & designs/month not yet |

### Frontend

| Area | Status |
|------|--------|
| **App** | ❌ Not started (Next.js planned) |
| **i18n (ar/en)** | ❌ Not started |
| **RTL** | ❌ Not started |

### PRD gaps (backend)

- **Regenerate plan:** Currently 409 if plan exists; need “regenerate” (overwrite) or explicit replace.
- **Design generation:** No `POST /designs/:projectId/generate` for post images; only logo upload.
- **Asset download:** No `GET /assets/:id/download` (or equivalent) for single-file download.
- **Plans/month & designs/month:** Limits not enforced (only project limit is).

---

## Sprint 1 — Backend completion & stability  
## السبرنت 1 — إكمال الخلفية والاستقرار

**Duration:** 1 sprint (e.g. 1–2 weeks)  
**Goal:** Backend fully usable by a client (e.g. Postman/curl); all P0 API flows work.

### Stories

| ID | Story | Acceptance criteria |
|----|--------|---------------------|
| S1-1 | **Implement AI service** | `services/ai.js` with `analyzeMarket(project, locale)` and `generateMonthlyPlan(project, { month, year }, marketAnalysis, locale)`; use OpenAI (or compatible) API; structured prompts for AR/EN; errors handled and passed to route. |
| S1-2 | **Implement storage service** | `services/storage.js` with `saveUpload(buffer, relativePath, mimeType)`; write to `UPLOAD_DIR` (e.g. `./uploads`); return path for DB; directory creation if needed. |
| S1-3 | **Content plan regenerate** | Allow overwrite/replace of existing plan for same project+month (e.g. optional `?replace=true` or body `replace: true` on generate); confirm in API spec; keep idempotency/conflict rules clear. |
| S1-4 | **Asset download endpoint** | `GET /api/v1/designs/asset/:assetId/download` (or under export) — verify user owns project → stream file or redirect; set `Content-Disposition`. |
| S1-5 | **Subscription limits (plans & designs)** | Define limits per plan (e.g. plans/month, designs/month); enforce in content-plans generate and (when added) design generate; return 403 with clear message when limit reached. |
| S1-6 | **Health & env** | Ensure `GET /api/v1/health` works; document required env vars in `.env.example` (e.g. `DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`, `FRONTEND_URL`, `UPLOAD_DIR`). |

### Out of scope this sprint

- Post image generation (DALL·E or similar) — can be stub or next sprint.
- Frontend.

### Definition of done (Sprint 1)

- [ ] `analyzeMarket` and `generateMonthlyPlan` implemented and called from routes.
- [ ] Logo upload saves file via storage service; project `logoUrl` and Asset record created.
- [ ] Export Excel and asset download work end-to-end.
- [ ] Regenerate plan (replace) supported; plan/design limits enforced with clear errors.
- [ ] All existing routes run without 500 from missing services.

---

## Sprint 2 — Frontend shell & auth  
## السبرنت 2 — واجهة المستخدم والتسجيل والدخول

**Duration:** 1 sprint  
**Goal:** Next.js app with i18n (ar/en), RTL, auth (register/login), and dashboard shell.

### Stories

| ID | Story | Acceptance criteria |
|----|--------|---------------------|
| S2-1 | **Next.js setup** | Create `frontend/` (or `app/`) with Next.js (App Router recommended); proxy or env for API base URL; i18n (e.g. next-intl or next-i18next) with `ar` (default) and `en`. |
| S2-2 | **RTL for Arabic** | When locale is `ar`, document dir and layout are RTL; layout and key components respect RTL (flex/grid, margins, text align). |
| S2-3 | **Auth pages** | Register and login pages; form validation; call `POST /api/v1/auth/register` and `POST /api/v1/auth/login`; store token (e.g. httpOnly cookie or secure storage); redirect to dashboard on success. |
| S2-4 | **Dashboard shell** | After login, user sees dashboard: current subscription tier/status, list of projects (from `GET /api/v1/projects`), “New project” action; logout. |
| S2-5 | **Auth guard** | Protected routes redirect unauthenticated users to login; token sent as `Authorization: Bearer` (or cookie) on API calls. |

### Definition of done (Sprint 2)

- [ ] User can register and log in; dashboard shows subscription and projects list.
- [ ] UI switches between Arabic (RTL) and English.
- [ ] Unauthenticated access to dashboard is redirected to login.

---

## Sprint 3 — Core flows: Projects, analysis, plans, export  
## السبرنت 3 — المشاريع والتحليل والخطط والتصدير

**Duration:** 1 sprint  
**Goal:** Full project and content-plan flows in the UI; export to Excel.

### Stories

| ID | Story | Acceptance criteria |
|----|--------|---------------------|
| S3-1 | **Project CRUD UI** | Create project (name, country, field, description, strengths); list projects; open project detail; edit project; delete with confirmation. |
| S3-2 | **Market analysis UI** | In project view: “Run/Refresh market analysis”; loading state; display content types, post ideas, strategies; handle errors. |
| S3-3 | **Content plan UI** | “Generate monthly plan” (month/year); show plan with items (date, idea, copy, type, objective); inline or modal edit for items; “Regenerate” with confirm. |
| S3-4 | **Export Excel** | Button “Export to Excel” for current plan; call `GET /api/v1/export/plan/:planId/excel`; trigger file download with correct filename. |
| S3-5 | **Subscription limits in UI** | When API returns 403 (project/plan/design limit), show clear message and optional upgrade CTA. |

### Definition of done (Sprint 3)

- [ ] User can create/edit project, run analysis, generate and edit plan, export to Excel.
- [ ] Limit-reached messaging is clear and consistent with backend.

---

## Sprint 4 — Brand & post designs (MVP closure)  
## السبرنت 4 — الهوية وتصاميم المنشورات

**Duration:** 1 sprint  
**Goal:** Brand settings and post design flow per PRD; MVP acceptance criteria met.

### Stories

| ID | Story | Acceptance criteria |
|----|--------|---------------------|
| S4-1 | **Brand settings UI** | In project: upload logo, set brand colors (e.g. primary/secondary), choose theme (minimal/bold/professional), optional reference image; PATCH project; display current logo/colors. |
| S4-2 | **Design generation (backend)** | Implement or integrate post image generation (e.g. DALL·E or design API) for selected plan items; store as Asset `kind: generated_post`; enforce designs/month limit. |
| S4-3 | **Design generation (frontend)** | “Generate designs” for plan (all or selection); loading/progress; list generated assets with thumbnails; download per asset and bulk. |
| S4-4 | **Asset download in UI** | Download single asset and “Download all” for plan/project; use `GET /api/v1/designs/asset/:id/download` (or equivalent). |
| S4-5 | **MVP polish** | Fix outstanding bugs; ensure AR/EN and RTL work across all new screens; run through PRD acceptance checklist. |

### Definition of done (Sprint 4)

- [ ] User can set brand (logo, colors, theme) and generate post designs; download assets.
- [ ] All PRD MVP acceptance criteria pass.
- [ ] UI fully usable in Arabic (RTL) and English.

**Release checklist:** Run [MVP_RELEASE_CHECKLIST.md](./MVP_RELEASE_CHECKLIST.md) before release (aligns with PRD §11 and S4-5).

---

## Summary

| Sprint | Focus | Main deliverables |
|--------|--------|--------------------|
| **1** | Backend completion | AI + storage services, plan replace, asset download, subscription limits |
| **2** | Frontend shell | Next.js, i18n, RTL, auth, dashboard |
| **3** | Core flows | Projects, market analysis, content plans, export Excel |
| **4** | Brand & designs | Brand UI, post design generation, downloads, MVP closure |

---

## Dependencies

- **Sprint 2** can start in parallel with Sprint 1 if API contract is fixed (OpenAPI or shared types).
- **Sprint 3** depends on Sprint 2 (frontend) and Sprint 1 (backend stable).
- **Sprint 4** depends on S1 (design generation endpoint + limits) and S2/S3 (UI).

---

## Optional / Post-MVP

- **GET /api/v1/auth/refresh** (refresh token).
- **OAuth** (e.g. Google).
- **Rate limiting** on API.
- **Virus scan** on file uploads.

---

*Sprint plan version: 1.0 | تاريخ: 2025-03-04*
