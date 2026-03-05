# Content Pilot | بايلوت المحتوى

AI-powered SaaS for social media content creation: projects → market analysis → monthly content plans → post designs → export.

## Deploy to the cloud (public demo)

### Frontend — Vercel (recommended for Next.js)

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) → import the repo → set **Root Directory** to `frontend`.
3. Add environment variable: `NEXT_PUBLIC_API_URL` = your Render backend URL (e.g. `https://content-pilot-api.onrender.com`).
4. Deploy. Your frontend URL will be something like `https://content-pilot.vercel.app`.

### Backend — Render (free tier, includes PostgreSQL)

1. Go to [render.com](https://render.com) → **New** → **Blueprint** → connect your repo.
   Render will read `render.yaml` and create the API service + PostgreSQL database automatically.
2. In the Render dashboard, set these environment variables manually (they contain secrets):
   - `OPENAI_API_KEY` — your OpenAI key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - `FRONTEND_URL` — your Vercel frontend URL (for CORS)
3. After first deploy, run the demo seed:
   ```
   # In Render shell (or locally with DATABASE_URL pointing to Render):
   node prisma/seed.js
   ```
   This creates a demo account: **demo@contentpilot.app** / **Demo1234!**

### Environment variable summary

| Variable | Where | Description |
|---|---|---|
| `DATABASE_URL` | Backend (Render sets automatically) | PostgreSQL connection string |
| `JWT_SECRET` | Backend (Render generates automatically) | Auth token signing key |
| `OPENAI_API_KEY` | Backend (set manually) | AI features: market analysis, content plans |
| `FRONTEND_URL` | Backend (set manually) | CORS allowed origin |
| `NEXT_PUBLIC_API_URL` | Frontend (Vercel env var) | Backend API base URL |

---

## Local development

### Backend

```bash
cd backend
cp .env.example .env   # set DATABASE_URL, JWT_SECRET, OPENAI_API_KEY, etc.
npm install
npx prisma migrate dev
npm run dev
# (optional) seed demo data:
npm run db:seed
```

API runs at `http://localhost:4000`.

### Frontend

```bash
cd frontend
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev
```

App runs at `http://localhost:3000`. Open `/ar` (default) or `/en`.

## Repository structure

- **backend/** — Node.js + Express REST API (Prisma, PostgreSQL)
- **frontend/** — Next.js (App Router) with i18n (Arabic default, English) and RTL support
- **render.yaml** — One-click Render deployment blueprint
- **frontend/vercel.json** — Vercel deployment config

## Docs

- [ARCHITECTURE.md](ARCHITECTURE.md) — System and tech stack
- [PRD.md](PRD.md) — Product requirements
- [SPRINT_PLAN.md](SPRINT_PLAN.md) — Sprints and stories
- [stories/](stories/) — User stories (S1-*, S2-*, …)
