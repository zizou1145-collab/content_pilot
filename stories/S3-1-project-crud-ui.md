# Story: S3-1 — Project CRUD UI
# قصة: S3-1 — واجهة المشاريع (إنشاء وعرض وتعديل وحذف)

**Sprint:** 3  
**Created:** 2025-03-05  
**Status:** Draft

---

## Summary | الملخص

Implement full project CRUD in the frontend: create a project (name, country, field, description, strengths), list projects, open project detail, edit project, and delete with confirmation. This turns the dashboard “New project” entry point (S2-4) into a complete flow and gives users a project detail view as the base for market analysis (S3-2) and content plans (S3-3).

---

## Acceptance criteria | معايير القبول

- [ ] **Create project:** A “New project” / create flow (e.g. `/[locale]/projects/new`) with form fields: name, country, field, description, strengths (optional; free text or list). Client-side validation for required fields; submit to `POST /api/v1/projects`; on 201 redirect to project detail or dashboard; on 400 show validation errors; on 403 (project limit) show clear message (S3-5 handles upgrade CTA). All labels and messages use i18n (ar/en).
- [ ] **List projects:** Projects are listed (dashboard already shows them per S2-4); each item links to project detail `/[locale]/projects/[id]`; empty state and “New project” CTA when none exist. List respects RTL.
- [ ] **Open project detail:** Route `/[locale]/projects/[id]` loads a single project via `GET /api/v1/projects/:id`; display project name, country, field, description, strengths; show 404 or error state if not found or not owned; layout ready for S3-2 (market analysis) and S3-3 (content plan) sections. RTL-aware.
- [ ] **Edit project:** From project detail, user can edit project (same fields as create); “Edit” entry opens form (inline or modal/page); submit via `PATCH /api/v1/projects/:id`; on 200 update local state and show success; on 400 show validation errors; on 404 show not-found message.
- [ ] **Delete with confirmation:** “Delete project” action with confirmation dialog (e.g. “Are you sure? This will delete the project and all its plans.”); on confirm call `DELETE /api/v1/projects/:id`; on 204 redirect to dashboard and remove from list; on 404 show not-found. Confirmation and buttons use i18n.
- [ ] **Loading and error states:** Loading indicators while fetching project(s); user-friendly messages for network/API errors and optional retry; 403 project-limit message consistent with S3-5.

---

## Tasks | المهام

- [ ] Add translation keys for projects: createProject, editProject, deleteProject, projectName, country, field, description, strengths, save, cancel, delete, deleteConfirm, success, errors (validation, notFound, limitReached), loading, retry; in both `ar` and `en`.
- [ ] Implement create flow: page `/[locale]/projects/new` with form (name, country, field, description, strengths optional); client validation (required: name, country, field, description); submit to `POST /api/v1/projects` with auth token; on 201 redirect to `/[locale]/projects/[id]`; handle 400 (show `errors`), 403 (show limit message); use shared API client and auth from S2-3/S2-5.
- [ ] Ensure dashboard project list links to `/[locale]/projects/[id]` (S2-4 may already have placeholder; update to real link).
- [ ] Implement project detail page: route `/[locale]/projects/[id]`; fetch project with `GET /api/v1/projects/:id`; display name, country, field, description, strengths; show loading and 404/error states; add “Edit” and “Delete project” actions; layout RTL-aware; leave space or placeholders for “Market analysis” and “Content plan” (S3-2, S3-3).
- [ ] Implement edit: “Edit” opens form (same fields as create) pre-filled with current project; submit `PATCH /api/v1/projects/:id` with changed fields only or full set; on 200 refresh project in state and show success; handle 400, 404.
- [ ] Implement delete: “Delete project” button; open confirmation dialog (translated text, e.g. “Are you sure? This will delete the project and all its data.”); on confirm `DELETE /api/v1/projects/:id`; on 204 redirect to `/[locale]/dashboard`; handle 404.
- [ ] Handle 403 project limit on create: when API returns 403 with code `PROJECTS_LIMIT_REACHED`, show clear message (e.g. “Project limit reached for your plan”); optional “Upgrade” CTA can link to placeholder or be styled for S3-5.
- [ ] Apply RTL and i18n: all project UI (forms, labels, buttons, messages) use logical properties and existing RTL from S2-2; all copy from translation files.
- [ ] Manually test: create project (ar/en), list and open detail, edit and save, delete with confirm; test validation errors, 403 when at limit (if possible), 404 for wrong id.

---

## Notes / API / References

- **ARCHITECTURE:** [ARCHITECTURE.md](../ARCHITECTURE.md) — Frontend: “project CRUD”; users manage projects from dashboard and project detail.
- **Sprint plan:** S3-1 — “Create project (name, country, field, description, strengths); list projects; open project detail; edit project; delete with confirmation.”
- **PRD:** FR-2.x — Project form: name, country, field, description, optional strengths ([PRD.md](../PRD.md)).
- **Backend APIs:** [backend/src/routes/projects.js](../backend/src/routes/projects.js)
  - **GET /api/v1/projects** — Auth required. Returns `{ projects }`; each has `id`, `name`, `country`, `field`, `logoUrl`, `createdAt`, `updatedAt`.
  - **POST /api/v1/projects** — Body: `name`, `country`, `field`, `description` (required), `strengths` (optional, string or array; stored as JSON string). Returns 201 `{ project }` or 400 `{ errors }`, 403 `{ error, code: 'PROJECTS_LIMIT_REACHED', limit, current }`.
  - **GET /api/v1/projects/:id** — Auth required; user must own project. Returns `{ project }` (full model) or 404 `{ error: 'Project not found' }`.
  - **PATCH /api/v1/projects/:id** — Body: optional `name`, `country`, `field`, `description`, `strengths`, `brandColors`, `theme`, `referencePostUrl`. Returns 200 `{ project }` or 400, 404.
  - **DELETE /api/v1/projects/:id** — Returns 204 or 404.
- **Project model (Prisma):** [backend/prisma/schema.prisma](../backend/prisma/schema.prisma) — `id`, `name`, `country`, `field`, `description`, `strengths` (text/JSON), `logoUrl`, `brandColors`, `theme`, `referencePostUrl`, `createdAt`, `updatedAt`. For S3-1, focus on name, country, field, description, strengths; brand fields are S4-1.
- **Limits:** [backend/src/lib/limits.js](../backend/src/lib/limits.js) — Basic: 2 projects; Pro: 10; Business: 50. 403 payload: `limitReachedPayload(...)` with `error`, `code`, `limit`, `current`.
- **Depends on:** S2-1 (Next.js, i18n, API base), S2-2 (RTL), S2-3 (auth, token), S2-4 (dashboard, projects list, “New project” entry). S3-5 will standardize limit-reached messaging and upgrade CTA.

---

*Story format: Content Pilot | بايلوت المحتوى*
