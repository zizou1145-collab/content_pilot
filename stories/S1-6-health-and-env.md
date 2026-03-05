# Story: S1-6 — Health & env
# قصة: S1-6 — الصحة والمتغيرات البيئية

**Sprint:** 1  
**Created:** 2025-03-04  
**Status:** Done

---

## Summary | الملخص

Ensure `GET /api/v1/health` is implemented and working for readiness checks (e.g. load balancers, monitoring), and document all required environment variables in `backend/.env.example` so new developers and deployments know what to configure.

---

## Acceptance criteria | معايير القبول

- [x] `GET /api/v1/health` exists and returns a successful JSON response (e.g. `{ ok: true }` or `{ status: "ok" }`) with status 200; no authentication required.
- [x] Health endpoint is mounted before auth so it can be hit without a JWT (e.g. by load balancers or uptime checks).
- [x] File `backend/.env.example` exists and documents all required env vars used by the app, with short comments where helpful.
- [x] Documented variables include at least: `DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`, `FRONTEND_URL`, `UPLOAD_DIR`; optional but recommended: `PORT`, `NODE_ENV`, `JWT_EXPIRES_IN`.
- [x] No secrets or real values in `.env.example` (placeholders only, e.g. `sk-...` for API key).

---

## Tasks | المهام

- [x] Verify `GET /api/v1/health` is registered in `backend/src/index.js` (or a dedicated health route) and returns `200` with a JSON body (e.g. `{ ok: true }`); ensure it is not behind `requireAuth`.
- [x] Add or update `backend/.env.example`: list `DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`, `FRONTEND_URL`, `UPLOAD_DIR` with brief comments; include `PORT`, `NODE_ENV` (and optionally `JWT_EXPIRES_IN`) if the app uses them.
- [x] Optionally: add a one-line note in backend README or main docs pointing to `.env.example` for required env (if such a README exists).
- [x] Manually test: start server with minimal env, call `GET /api/v1/health` and confirm 200 + JSON; run with full env and confirm app and DB work.

---

## Notes / API / References

- **ARCHITECTURE:** [ARCHITECTURE.md](../ARCHITECTURE.md) — Route summary lists `GET /api/v1/health` (health check); config section: “use PORT, JWT_SECRET, DATABASE_URL, OPENAI_API_KEY, FRONTEND_URL, UPLOAD_DIR from environment.”
- **Sprint plan:** S1-6 — “Ensure GET /api/v1/health works; document required env vars in .env.example (e.g. DATABASE_URL, JWT_SECRET, OPENAI_API_KEY, FRONTEND_URL, UPLOAD_DIR).”
- **Config consumer:** `backend/src/config.js` reads `PORT`, `NODE_ENV`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_URL`, `UPLOAD_DIR`, `OPENAI_API_KEY`. Prisma uses `DATABASE_URL` from env (schema).
- **Edge cases:** Health should not depend on DB or external services for a basic “process is up” check; optional future: deep health (e.g. DB ping) on a separate path like `/api/v1/health/ready` if needed.

---

*Story format: Content Pilot | بايلوت المحتوى*
