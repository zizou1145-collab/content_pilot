# Content Pilot — Architecture  
# بايلوت المحتوى — الهندسة المعمارية

**Version:** 1.0  
**Date:** 2025-03-04

This document describes the high-level and technical architecture of **Content Pilot**: an AI-powered SaaS for social media content creation (projects → market analysis → monthly content plans → post designs → export).

---

## 1. System Context | سياق النظام

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL ACTORS                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  • Users (SMEs, startups, freelancers) — browser (AR/EN, RTL)                 │
│  • AI Provider (e.g. OpenAI) — analysis & content generation                  │
│  • (Future) Social APIs — scheduling, analytics                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CONTENT PILOT SYSTEM                                  │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────────┐  │
│  │   Frontend  │   │   Backend   │   │  PostgreSQL │   │  File Storage    │  │
│  │  (Next.js   │◄──┤  REST API   │◄──┤  (Prisma)   │   │  (local / S3)    │  │
│  │   i18n RTL) │   │  Node/Express│   │             │   │  logos, designs  │  │
│  └─────────────┘   └──────┬──────┘   └─────────────┘   └─────────────────┘  │
│                           │                                                    │
│                           ▼                                                    │
│                    ┌─────────────┐                                            │
│                    │  AI Service │  (OpenAI etc.)                              │
│                    └─────────────┘                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

- **Users** interact with the system via a web app (future: Next.js SPA/SSR with i18n and RTL).
- **Backend** is the single API layer: REST, versioned at `/api/v1/`, responsible for auth, business logic, and orchestration.
- **Database** holds users, subscriptions, projects, market analyses, content plans, plan items, and asset metadata.
- **File storage** holds uploaded logos and generated post images (local disk or S3-compatible).
- **AI** is an external provider used for market analysis and monthly content plan generation; prompts and content support AR/EN.

---

## 2. High-Level Architecture | الهندسة عالية المستوى

### 2.1 Layered View

| Layer | Responsibility | Main artifacts |
|-------|----------------|----------------|
| **Presentation** | UI, i18n (ar/en), RTL, dashboard, project/plan/design flows | Frontend app (planned: Next.js) |
| **API** | REST endpoints, validation, auth, rate limiting | Express routes under `/api/v1/*` |
| **Application** | Use cases: register, create project, run analysis, generate plan, export, upload logo, generate designs | Route handlers + services |
| **Domain** | Entities: User, Project, MarketAnalysis, ContentPlan, ContentPlanItem, Asset | Prisma models |
| **Infrastructure** | DB access, file storage, AI client, email (future) | Prisma, storage service, AI service |

### 2.2 Data Flow (MVP)

1. **Auth:** Register/Login → JWT → `Authorization: Bearer <token>` on subsequent requests.
2. **Project:** Create/update project (name, country, field, description, strengths, brand) → stored in DB.
3. **Market analysis:** POST with `projectId` → backend loads project → calls AI service → stores result in `MarketAnalysis`.
4. **Content plan:** POST generate with `projectId`, `month`, `year` → optional use of latest market analysis → AI generates plan → stored as `ContentPlan` + `ContentPlanItem`s.
5. **Export:** GET export for a content plan → backend builds Excel → returns file.
6. **Brand/designs:** Upload logo (multipart) → storage service saves file → project `logoUrl` and `Asset` updated; generate post designs (future: image generation) → assets stored and listed.

---

## 3. Technology Stack | المجموعة التقنية

| Concern | Choice | Notes |
|---------|--------|--------|
| **Backend** | Node.js + Express | ES modules, structured routes |
| **API style** | REST | Versioned `/api/v1/...` |
| **Database** | PostgreSQL | Via Prisma ORM |
| **ORM** | Prisma | Schema in `backend/prisma/schema.prisma` |
| **Auth** | JWT + bcrypt | `express-validator` for input validation |
| **File upload** | Multer | In-memory then storage service |
| **AI** | OpenAI (or compatible) | API key in env; used in `services/ai.js` |
| **Export** | ExcelJS | Excel export for content plans |
| **Frontend** | (Planned) Next.js | i18n, RTL for Arabic |

---

## 4. Backend Structure | هيكل الخلفية

```
backend/
├── prisma/
│   └── schema.prisma          # Data model (User, Project, MarketAnalysis, ContentPlan, ContentPlanItem, Asset)
├── src/
│   ├── index.js               # Express app, CORS, static uploads, route mounting, error handler
│   ├── config.js              # Env-based config (port, JWT, frontend URL, upload dir, OpenAI key)
│   ├── lib/
│   │   ├── prisma.js          # Prisma client singleton
│   │   └── limits.js          # Subscription limits (projects, plans/month, designs/month) and check helpers
│   ├── middleware/
│   │   ├── auth.js            # requireAuth: JWT verification, attach req.user
│   │   └── errorHandler.js    # Central error handling
│   ├── routes/
│   │   ├── auth.js            # POST /register, POST /login
│   │   ├── projects.js        # CRUD projects (scoped to user, plan limits)
│   │   ├── market.js          # POST /:projectId (analyze), GET /:projectId (latest analysis)
│   │   ├── content-plans.js   # List plans, generate plan, CRUD plan items
│   │   ├── designs.js         # Logo upload, assets list (and future design generation)
│   │   └── export.js          # GET export/plan/:planId/excel → Excel download
│   └── services/
│       ├── ai.js              # analyzeMarket(), generateMonthlyPlan() — calls OpenAI
│       └── storage.js         # saveUpload() — write files to disk or S3
├── uploads/                   # Local file storage (or use S3)
├── .env.example
└── package.json
```

### 4.1 Route Summary

| Base path | Purpose |
|-----------|---------|
| `POST /api/v1/auth/register` | Register (email, password, optional name, locale) |
| `POST /api/v1/auth/login` | Login → `{ user, token }` |
| `GET /api/v1/projects` | List user's projects |
| `POST /api/v1/projects` | Create project |
| `GET /api/v1/projects/:id` | Get project (own only) |
| `PATCH /api/v1/projects/:id` | Update project |
| `DELETE /api/v1/projects/:id` | Delete project |
| `POST /api/v1/market/:projectId` | Run market analysis (AI) |
| `GET /api/v1/market/:projectId` | Get latest market analysis |
| `GET /api/v1/content-plans/project/:projectId` | List content plans for project |
| `POST /api/v1/content-plans/project/:projectId/generate` | Generate monthly plan (body: month, year; optional replace). With replace=false or omitted, returns 409 if plan exists for that month. With replace=true (query or body), overwrites existing plan and returns 201. |
| `GET/PATCH/DELETE` content plan items | Edit plan items |
| `POST /api/v1/designs/:projectId/logo` | Upload logo (multipart) |
| `GET /api/v1/designs/:projectId/assets` | List assets (with URLs) |
| `GET /api/v1/designs/asset/:assetId/download` | Download single asset (stream; ownership enforced; optional `?inline=1` for preview) |
| `GET /api/v1/export/plan/:planId/excel` | Export content plan to Excel (AR headers) |
| `GET /api/v1/health` | Health check |

All routes under `projects`, `market`, `content-plans`, `designs`, `export` are protected by `requireAuth` (JWT). Authorization: user can only access their own projects and related data.

### 4.2 Subscription limits | حدود الاشتراك

Limits are defined in `backend/src/lib/limits.js` and enforced per user subscription plan:

| Plan    | Projects | Plans per month | Designs per month |
|---------|----------|-----------------|-------------------|
| Basic   | 2        | 1               | 5                 |
| Pro     | 10       | 5               | 30                |
| Business| 50       | 20              | 200               |

When a limit is reached, the API returns **403** with a JSON body in a consistent shape for the frontend (S3-5) to show a “limit reached” message and optional upgrade CTA:

- **Shape:** `{ error: string, code?: string, limit?: number, current?: number }`
- **Codes:** `PROJECTS_LIMIT_REACHED`, `PLANS_LIMIT_REACHED`, `DESIGNS_LIMIT_REACHED`

Regenerating a content plan (replace=true) does not increase the plans-per-month count (net change 0). Design generation (S4-2) must call `checkDesignsLimit()` before creating `generated_post` assets.

---

## 5. Data Model (Reference) | نموذج البيانات

- **User:** id, email, passwordHash, name, locale (ar|en), subscriptionPlan (Basic|Pro|Business), subscriptionStatus, subscriptionEndsAt, timestamps.
- **Project:** id, userId, name, country, field, description, strengths, logoUrl, brandColors (JSON), theme, referencePostUrl, timestamps.
- **MarketAnalysis:** id, projectId, contentTypes, postIdeas, strategies (JSON/text), rawResponse, createdAt.
- **ContentPlan:** id, projectId, title, month, year, timestamps.
- **ContentPlanItem:** id, contentPlanId, publishDate, postIdea, postCopy, contentType (enum), objective, orderIndex, createdAt.
- **Asset:** id, projectId, contentPlanItemId (optional), kind (logo|generated_post), filePath, mimeType, createdAt.

Full schema: `backend/prisma/schema.prisma`. Relationships: User → Projects; Project → MarketAnalyses, ContentPlans, Assets; ContentPlan → ContentPlanItems; ContentPlanItem → Assets.

---

## 6. Security & Resilience | الأمان والمرونة

- **Authentication:** JWT in `Authorization: Bearer <token>`; bcrypt for password hashing.
- **Authorization:** Every project-scoped request verifies `project.userId === req.user.id`.
- **Validation:** express-validator on body/params; reject invalid UUIDs and out-of-range values.
- **File upload:** Multer limits (e.g. 5MB); allowed MIME types for images (JPEG, PNG, GIF, WebP).
- **Config:** No secrets in code; use `PORT`, `JWT_SECRET`, `DATABASE_URL`, `OPENAI_API_KEY`, `FRONTEND_URL`, `UPLOAD_DIR` from environment.
- **CORS:** Restricted to `FRONTEND_URL` with credentials.
- **Future:** Rate limiting, optional virus scan on uploads, stricter CSP on frontend.

---

## 7. Deployment & Scalability | النشر والقابلية للتوسع

- **Backend:** Single Node process; scale horizontally behind a reverse proxy (e.g. Nginx) or PaaS (e.g. Railway, Render).
- **Database:** Managed PostgreSQL; connection pooling (e.g. PgBouncer) when needed.
- **Files:** Local `uploads/` for MVP; replace or complement with S3-compatible storage for multi-instance and durability.
- **AI:** Stateless; rate and cost controlled via provider and optional queue for heavy usage.
- **Frontend:** Static/SSR deployment (e.g. Vercel) pointing to backend `API_URL`.

Multi-tenant: tenant = user; all data scoped by `userId` and `projectId`. Prepared for future: scheduling, analytics, team/workspace (roles, invitations).

---

## 8. Future Extensions (Post-MVP) | التوسعات المستقبلية

| Area | Direction |
|------|------------|
| **Scheduling** | Integrate Facebook/Instagram, Twitter/X, LinkedIn; schedule posts from content plan. |
| **Analytics** | Pull reach/engagement from social APIs; show in dashboard. |
| **Team management** | Invite members, roles (admin/editor/viewer), shared projects. |
| **OAuth** | Optional login with Google (or others). |
| **Design generation** | Full pipeline: plan item + brand → generated post image (e.g. DALL·E or design API). |

---

## 9. Document References | مراجع الوثائق

- **Product Brief:** [PRODUCT_BRIEF.md](./PRODUCT_BRIEF.md)
- **PRD:** [PRD.md](./PRD.md)
- **Schema:** [backend/prisma/schema.prisma](./backend/prisma/schema.prisma)

---

*Document version: 1.0 | تاريخ: 2025-03-04*
