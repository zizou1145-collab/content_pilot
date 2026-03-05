# Content Pilot — Product Requirements Document (PRD)  
# وثيقة متطلبات المنتج — بايلوت المحتوى

**Version:** 1.0  
**Date:** 2025-03-04  
**Status:** Draft

---

## 1. Overview | نظرة عامة

### 1.1 Purpose
This PRD defines the functional and non-functional requirements for **Content Pilot** MVP: an AI-powered SaaS platform for creating strategic social media content (projects → market analysis → monthly content plans → post designs → export).

### 1.2 References
- **Product Brief:** [PRODUCT_BRIEF.md](./PRODUCT_BRIEF.md)
- **Data Model:** [backend/prisma/schema.prisma](./backend/prisma/schema.prisma)

### 1.3 Definitions
| Term | Definition |
|------|-------------|
| **Project** | A brand or campaign context (name, country, field, description, brand assets). |
| **Content Plan** | A one-month calendar of posts (dates, ideas, copy, type, objective). |
| **Plan Item** | A single post in a content plan. |
| **Market Analysis** | AI-generated recommendations (content types, post ideas, strategies) per project. |
| **Asset** | Stored file: logo or generated post image. |

---

## 2. Goals & Success Criteria | الأهداف ومعايير النجاح

### 2.1 Business Goals
- Enable SMEs, startups, and freelancers to produce consistent, strategy-aligned social content without full-time marketing teams.
- Establish a scalable multi-tenant SaaS with clear subscription tiers (Basic / Pro / Business).
- Support Arabic (primary) and English for UI and generated content.

### 2.2 MVP Success Criteria
- [ ] User can register, log in, and see a dashboard with subscription and projects.
- [ ] User can create a project with required fields (name, country, field, description) and optional strengths.
- [ ] System generates and stores market analysis per project; user can refresh it.
- [ ] System generates a monthly content plan (AR/EN); user can edit items and regenerate.
- [ ] User can export the current plan to Excel with specified columns.
- [ ] User can set brand (logo, colors, theme, optional reference image) and generate post designs; user can download designs.
- [ ] UI is fully usable in Arabic (RTL) and English; code is modular and ready for scheduling, analytics, and teams.

---

## 3. User Personas & Use Cases | الشخصيات وحالات الاستخدام

### 3.1 Personas
| Persona | Description | Primary need |
|---------|-------------|--------------|
| **SME Owner** | Runs a small business, limited marketing time. | Quick monthly plan + ready-to-use designs. |
| **Startup Marketer** | Solo or small team, multiple projects. | Multiple projects, consistent branding, export for coordination. |
| **Freelancer** | Manages several client brands. | Per-project branding, plans per client, export for approval. |

### 3.2 Core Use Cases (MVP)
1. **UC-1:** Register and subscribe (Basic/Pro/Business).
2. **UC-2:** Create project and complete project form.
3. **UC-3:** Run/refresh market analysis for a project.
4. **UC-4:** Generate monthly content plan; edit items (date, idea, copy, type, objective).
5. **UC-5:** Export content plan to Excel.
6. **UC-6:** Upload logo, set colors/theme (and optional reference image).
7. **UC-7:** Generate post designs for plan (or selection); download assets.

---

## 4. Functional Requirements | المتطلبات الوظيفية

### 4.1 User System & Dashboard (FR-1)

| ID | Requirement | Priority | Notes |
|----|-------------|----------|--------|
| FR-1.1 | User can register with email and password. | P0 | bcrypt for password hashing. |
| FR-1.2 | User can log in with email and password; receive session/JWT. | P0 | |
| FR-1.3 | Dashboard shows: current subscription tier, status, projects list, quick actions (e.g. New project). | P0 | |
| FR-1.4 | Subscription tiers: **Basic**, **Pro**, **Business** (monthly). Each tier has limits: max projects, content plans per month, designs per month. | P0 | Limits TBD; enforced in backend. |
| FR-1.5 | User can have multiple projects; count limited by plan. | P0 | |
| FR-1.6 | (Future) OAuth (e.g. Google) — optional post-MVP. | P2 | |

### 4.2 Create New Project (FR-2)

| ID | Requirement | Priority | Notes |
|----|-------------|----------|--------|
| FR-2.1 | User can create a project with: **name** (required), **country** (required), **field/activity** (required), **description** (required), **strengths** (optional list). | P0 | Stored in DB; used by AI flows. |
| FR-2.2 | After creation, user is directed to project detail/management view. | P0 | |
| FR-2.3 | User can edit project details (same fields) at any time. | P0 | |

### 4.3 Market & Competitor Analysis (FR-3)

| ID | Requirement | Priority | Notes |
|----|-------------|----------|--------|
| FR-3.1 | User can trigger “Run/Refresh market analysis” for a project. | P0 | Input: project (country, field, description, strengths). |
| FR-3.2 | System calls AI provider; returns and stores: recommended content types, post ideas, content strategies. | P0 | Stored in `MarketAnalysis`; optional `rawResponse` for debugging. |
| FR-3.3 | Analysis is displayed in project view; user can refresh to get a new analysis (overwrites or new record by product decision). | P0 | |
| FR-3.4 | Content is generated in project/user locale (AR/EN) as configured. | P0 | |

### 4.4 Monthly Content Plan (FR-4)

| ID | Requirement | Priority | Notes |
|----|-------------|----------|--------|
| FR-4.1 | User can generate a “Monthly content plan” for a project. Optionally use latest market analysis. | P0 | Plan has month/year (or start_date); stored as `ContentPlan` + `ContentPlanItem`s. |
| FR-4.2 | Each plan item includes: **publish date**, **post idea**, **post copy (text)**, **content type** (educational \| promotional \| introductory \| success_story), **objective**. | P0 | Align with schema enums and fields. |
| FR-4.3 | User can edit any plan item (date, idea, copy, type, objective) and reorder. | P0 | |
| FR-4.4 | User can regenerate plan (new AI run); confirm before overwriting current plan. | P0 | |
| FR-4.5 | Only one “active” plan per project per month (or product rule: allow multiple plans per month with labels). | P0 | Clarify in implementation. |

### 4.5 Export Plan (FR-5)

| ID | Requirement | Priority | Notes |
|----|-------------|----------|--------|
| FR-5.1 | User can export the current (possibly edited) content plan to **Excel**. | P0 | |
| FR-5.2 | Columns: **التاريخ / Date**, **فكرة المنشور / Post idea**, **نص المحتوى / Content text**, **نوع المحتوى / Content type**, **الهدف / Objective**. | P0 | Bilingual headers per user locale or fixed. |

### 4.6 Post Design System (FR-6)

| ID | Requirement | Priority | Notes |
|----|-------------|----------|--------|
| FR-6.1 | User can set **brand**: upload logo, set brand colors (e.g. primary, secondary), choose theme/style (e.g. minimal, bold, professional), optionally upload reference post image. | P0 | Stored in `Project` (logoUrl, brandColors, theme, referencePostUrl). |
| FR-6.2 | User can request “Generate post designs” for the current plan (all items or selected items). | P0 | |
| FR-6.3 | System generates post images aligned with brand; stores as `Asset` (kind: `generated_post`), linked to project and optionally to `ContentPlanItem`. | P0 | File storage: local or S3-compatible. |
| FR-6.4 | User can download generated assets (per image or bulk). | P0 | |
| FR-6.5 | Design generation count is subject to subscription limits (e.g. designs per month). | P0 | |

### 4.7 Project Management UI (FR-7)

| ID | Requirement | Priority | Notes |
|----|-------------|----------|--------|
| FR-7.1 | Projects list: show all user projects; open project to detail view. | P0 | |
| FR-7.2 | Project detail: edit project, run/refresh market analysis, generate/edit content plan, trigger design generation, download designs, export plan to Excel. | P0 | |
| FR-7.3 | All actions respect subscription limits; show clear messaging when limit reached. | P0 | |

---

## 5. Non-Functional Requirements | المتطلبات غير الوظيفية

### 5.1 Architecture (aligned with Product Brief & codebase)
- **Backend:** REST API (Node.js + Express), versioned routes (`/api/v1/...`).
- **Frontend:** Modern SPA/SSR (e.g. Next.js), i18n (ar/en), RTL for Arabic.
- **Database:** PostgreSQL (Prisma); models: User, Project, MarketAnalysis, ContentPlan, ContentPlanItem, Asset.
- **File storage:** Dedicated service (local or S3-compatible) for logos and generated images.
- **AI:** External provider (e.g. OpenAI); prompts and responses in AR/EN as needed.

### 5.2 Security
- Authentication: JWT or session-based; password hashing (bcrypt).
- Authorization: user can access only their own projects, plans, and assets.
- API: rate limiting, input validation; no secrets in code; env-based config.
- File upload: validate type and size; virus scan optional post-MVP.

### 5.3 Performance & Reliability
- API response times: target &lt; 2s for non-AI endpoints; AI endpoints may be longer with clear loading states.
- File uploads: max size and allowed types defined and enforced.
- Graceful handling of AI provider failures (retry/fallback/message to user).

### 5.4 Localization
- UI and generated content support **Arabic (primary)** and **English**.
- RTL layout for Arabic; date/number formatting per locale.

### 5.5 Code Quality & Maintainability
- Modular structure: services, repositories, controllers; clear separation of concerns.
- Prepared for future features: scheduling, analytics, team management (roles, invitations).

---

## 6. Data Model Summary | ملخص نموذج البيانات

Aligned with `backend/prisma/schema.prisma`:

- **User:** id, email, passwordHash, name, locale, subscriptionPlan, subscriptionStatus, subscriptionEndsAt, timestamps.
- **Project:** id, userId, name, country, field, description, strengths, logoUrl, brandColors, theme, referencePostUrl, timestamps.
- **MarketAnalysis:** id, projectId, contentTypes, postIdeas, strategies, rawResponse, createdAt.
- **ContentPlan:** id, projectId, title, month, year, timestamps.
- **ContentPlanItem:** id, contentPlanId, publishDate, postIdea, postCopy, contentType (enum), objective, orderIndex, createdAt.
- **Asset:** id, projectId, contentPlanItemId (optional), kind (logo \| generated_post), filePath, mimeType, createdAt.

---

## 7. API Scope (MVP) | نطاق الـ API

High-level endpoints (details in API spec):

- **Auth:** `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, (optional) `POST /api/v1/auth/refresh`, `GET /api/v1/auth/me`.
- **Users:** `GET /api/v1/users/me` (profile + subscription).
- **Projects:** `GET /api/v1/projects`, `POST /api/v1/projects`, `GET /api/v1/projects/:id`, `PATCH /api/v1/projects/:id`, `DELETE /api/v1/projects/:id`.
- **Market:** `POST /api/v1/projects/:id/market-analysis`, `GET /api/v1/projects/:id/market-analysis` (latest).
- **Content plans:** `POST /api/v1/projects/:id/content-plans`, `GET /api/v1/projects/:id/content-plans`, `GET /api/v1/content-plans/:id`, `PATCH /api/v1/content-plans/:id`, `GET /api/v1/content-plans/:id/items`, `PATCH /api/v1/content-plans/items/:itemId`, `GET /api/v1/content-plans/:id/export` (Excel).
- **Designs/Assets:** `POST /api/v1/projects/:id/assets/logo`, `POST /api/v1/projects/:id/designs/generate`, `GET /api/v1/projects/:id/assets`, `GET /api/v1/assets/:id/download`.

---

## 8. User Stories (Summary) | قصص المستخدم

- **US-1:** As a user, I can register and log in so that I can access my dashboard and projects.
- **US-2:** As a user, I can create and edit a project with name, country, field, description, and strengths so that the system can use it for analysis and content.
- **US-3:** As a user, I can run market analysis for a project so that I get content types, post ideas, and strategies.
- **US-4:** As a user, I can generate a monthly content plan and edit items so that I have a ready calendar to export or use for designs.
- **US-5:** As a user, I can export my content plan to Excel so that I can share or use it outside the platform.
- **US-6:** As a user, I can set my brand (logo, colors, theme) and generate post designs so that I can download ready-made visuals for my plan.

---

## 9. Out of Scope (MVP) | خارج النطاق

- OAuth login (planned post-MVP).
- Publishing/scheduling to Facebook, Instagram, Twitter/X, LinkedIn.
- Analytics (reach, engagement from social APIs).
- Team management (invitations, roles).
- Mobile native apps (web-only for MVP).

---

## 10. Future Extensions | التوسعات المستقبلية

- **Scheduling:** Connect to social platforms; schedule posts from content plan.
- **Analytics:** Pull performance metrics; show in dashboard.
- **Team management:** Invite members, roles (admin/editor/viewer), shared projects.

---

## 11. Acceptance Criteria Checklist (MVP) | قائمة معايير القبول

- [ ] Registration and login work; dashboard shows subscription and projects.
- [ ] Create project with all required fields; edit project works.
- [ ] Market analysis runs and is stored and displayed; refresh works.
- [ ] Monthly content plan is generated; user can edit items (date, idea, copy, type, objective) and regenerate.
- [ ] Export to Excel produces file with required columns (Date, Post idea, Content text, Content type, Objective).
- [ ] Brand settings (logo, colors, theme, optional reference) are saved; design generation produces images; user can download.
- [ ] Subscription limits (projects, plans, designs) are enforced with clear messaging.
- [ ] UI is fully functional in Arabic (RTL) and English.
- [ ] API is versioned, authenticated, and authorized; errors and validation are handled.

---

*PRD version: 1.0 | تاريخ: 2025-03-04*
