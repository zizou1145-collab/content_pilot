# Content Pilot — Product Brief  
# موجز المنتج — بايلوت المحتوى

**AI-Powered SaaS for Social Media Content Creation**  
**منصة SaaS مدعومة بالذكاء الاصطناعي لإنشاء محتوى السوشيال ميديا**

---

## 1. Vision & Scope | الرؤية والنطاق

### 1.1 Problem | المشكلة
- Businesses and projects need consistent, strategic social media content but lack time and expertise.
- الشركات والمشاريع تحتاج محتوى سوشيال ميديا مستمر واستراتيجي مع نقص الوقت والخبرة.

### 1.2 Solution | الحل
- A single platform that: creates projects → analyzes market → generates monthly content plans → designs posts → exports plans and assets.
- منصة واحدة: إنشاء مشاريع → تحليل السوق → توليد خطط محتوى شهرية → تصميم المنشورات → تصدير الخطط والأصول.

### 1.3 Target Users | الجمهور المستهدف
- SMEs, startups, marketing teams, freelancers managing multiple brands.
- الشركات الصغيرة والمتوسطة، startups، فرق التسويق، المستقلون بإدارة عدة علامات.

### 1.4 Languages & Scalability | اللغات والقابلية للتوسع
- **Languages:** Arabic (primary), English. UI and generated content in both.
- **Scalability:** Multi-tenant SaaS, modular backend/frontend, prepared for scheduling, analytics, and team management.
- **اللغات:** العربية (أساسية) والإنجليزية للواجهة والمحتوى المُولَّد.
- **التوسع:** منصة SaaS متعددة المستأجرين، بنية خلفية/أمامية modular، جاهزة لجدولة النشر والتحليلات وإدارة الفرق.

---

## 2. Core Features (MVP) | الميزات الأساسية

### 2.1 User System & Dashboard | نظام المستخدمين ولوحة التحكم
| Requirement | Implementation |
|-------------|----------------|
| Register / Login | Email + password; optional OAuth later. |
| User dashboard | Overview: subscription, projects list, quick actions. |
| Subscription tiers | **Basic** / **Pro** / **Business** (monthly). Limits: projects count, content plans/month, designs/month. |
| Multiple projects | Each user can create and manage several projects (limits by plan). |

### 2.2 Create New Project | إنشاء مشروع جديد
User inputs:
- **Project name** (required)
- **Country** (required) — for market analysis
- **Field / activity type** (required)
- **Project description** (required)
- **Strengths / advantages** (optional list)

Stored in DB and used for all AI steps (market analysis, content plan, design).

### 2.3 Market & Competitor Analysis | تحليل السوق والمنافسين
- **Input:** Project (country, field, description, strengths).
- **Output (AI):**
  - Recommended content types for the market.
  - Post ideas suited to the field.
  - Content strategies to attract customers.
- Stored per project; can be refreshed on demand.

### 2.4 Monthly Content Plan Generation | توليد خطة محتوى شهرية
- **Input:** Project + (optional) market analysis.
- **Output:** One-month plan with for each post:
  - **Publish date**
  - **Post idea**
  - **Post copy (text)**
  - **Content type:** تعليمي | ترويجي | تعريفي | قصة نجاح (Educational | Promotional | Introductory | Success story)
  - **Objective**
- Plan stored in DB; user can edit and regenerate.

### 2.5 Export Plan | تصدير الخطة
- Export current (possibly edited) plan to **Excel**.
- Columns: التاريخ | فكرة المنشور | نص المحتوى | نوع المحتوى | الهدف  
  (Date | Post idea | Content text | Content type | Objective).

### 2.6 Post Design System | نظام تصميم المنشورات
- **Brand inputs:**
  - Upload **logo**
  - Set **brand colors** (primary, secondary, etc.)
  - Choose **theme / style** (e.g. minimal, bold, professional)
  - Optional: upload **reference post image** for style
- **Output:** System generates post designs (images) aligned with brand for plan items (or selected items).
- **Storage:** Logos and generated assets in file storage (local or S3-compatible).

### 2.7 Project Management UI | واجهة إدارة المشاريع
- List projects → open project.
- Per project:
  - Edit project details.
  - Run/refresh market analysis.
  - Generate new monthly content plan (or regenerate).
  - Edit plan items (date, idea, copy, type, objective).
  - Trigger post design generation and download designs.
  - Export content plan to Excel.

---

## 3. Technical Requirements | المتطلبات التقنية

### 3.1 Architecture
- **Backend:** REST API (Node.js + Express or similar). Structured, versioned routes (`/api/v1/...`).
- **Frontend:** Modern SPA/SSR (e.g. Next.js) with i18n (ar/en), RTL support for Arabic.
- **Database:** Relational DB for users, subscriptions, projects, content plans, plan items.
- **File storage:** Dedicated service (local disk or S3-compatible) for logos and generated images.
- **AI:** External provider (e.g. OpenAI) for analysis and content generation; prompts and responses in AR/EN as needed.

### 3.2 Data Model (High Level)
- **Users:** id, email, password_hash, name, locale, subscription_plan, subscription_status, created_at, etc.
- **Projects:** id, user_id, name, country, field, description, strengths (JSON/text), brand_colors (JSON), logo_url, theme, created_at, updated_at.
- **MarketAnalyses:** id, project_id, content_types, post_ideas, strategies (JSON/text), created_at.
- **ContentPlans:** id, project_id, month/year or start_date, status, created_at.
- **ContentPlanItems:** id, content_plan_id, publish_date, post_idea, post_copy, content_type, objective, order_index.
- **Designs/Assets:** id, project_id, content_plan_item_id (optional), file_path, type (logo/generated_post), created_at.

### 3.3 Security & Performance
- Auth: JWT or session-based; password hashing (bcrypt).
- Authorization: user can only access own projects and assets.
- Rate limiting and input validation on API.
- File upload: validate type/size; virus scan if required later.

### 3.4 Code Quality
- Clean, modular structure (services, repositories, controllers).
- Environment-based config (no secrets in code).
- Prepared for future features: **scheduling**, **analytics**, **team management** (roles, invitations).

---

## 4. Future Extensions (Post-MVP) | التوسعات المستقبلية

- **Publishing scheduling:** Connect to Facebook/Instagram, Twitter/X, LinkedIn; schedule posts from content plan.
- **Analytics:** Link to social APIs to pull performance (reach, engagement) and show in dashboard.
- **Team management:** Invite members, roles (admin/editor/viewer), shared projects.

---

## 5. Success Criteria (MVP) | معايير النجاح

- User can register, subscribe (Basic/Pro/Business), and use dashboard.
- User can create a project with all required fields.
- System produces market analysis and monthly content plan (AR/EN as set).
- User can edit plan and export to Excel.
- User can set brand (logo, colors, theme) and get generated post designs and download them.
- UI works in Arabic (RTL) and English; code is organized and ready for new features.

---

*Document version: 1.0 | تاريخ: 2025-03-04*
