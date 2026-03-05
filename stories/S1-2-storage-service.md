# Story: S1-2 — Implement storage service
# قصة: S1-2 — تنفيذ خدمة التخزين

**Sprint:** 1  
**Created:** 2025-03-04  
**Status:** Done

---

## Summary | الملخص

Implement `backend/src/services/storage.js` so that logo upload (and future asset uploads) persist files to disk under `UPLOAD_DIR`, with directory creation when needed, and return a path suitable for storing in the database (Project.logoUrl, Asset.filePath).

---

## Acceptance criteria | معايير القبول

- [x] Module `backend/src/services/storage.js` exports `saveUpload(buffer, relativePath, mimeType)`.
- [x] `saveUpload` writes the file to `UPLOAD_DIR` (e.g. `./uploads`) using `relativePath` (e.g. `projects/:projectId/logo_:uuid.png`); path separator is OS-agnostic.
- [x] Parent directories for the target path are created if they do not exist (e.g. `fs.promises.mkdir(..., { recursive: true })`).
- [x] `saveUpload` returns the path to store in the DB (relative to app root or consistent with how routes serve files; e.g. same string as `relativePath` so `GET /uploads/:path` or existing static mount works).
- [x] Errors (e.g. disk full, permission denied) are thrown or rejected so route handlers can pass them to the error middleware.
- [x] Logo upload flow in `routes/designs.js` works end-to-end: file is saved, Asset and Project.logoUrl are updated, and the file is present under `UPLOAD_DIR`.

---

## Tasks | المهام

- [x] Add `backend/src/services/storage.js`: import `fs.promises`, `path`, and `config`; implement `saveUpload(buffer, relativePath, mimeType)` resolving full path from `config.uploadDir` + `relativePath`, creating dirs with `recursive: true`, writing buffer, returning path for DB.
- [x] Ensure `UPLOAD_DIR` is used from `config.js` (already `process.env.UPLOAD_DIR || './uploads'`); no hardcoded paths in the service.
- [x] Verify designs route: `POST /api/v1/designs/:projectId/logo` still calls `saveUpload` and receives the path; confirm static serving of `uploads/` in `index.js` (or equivalent) so `GET /uploads/<filePath>` serves the file.
- [ ] Manually test: upload a logo via API, check file on disk and DB `logoUrl` / Asset `filePath`; request the URL and get the image.

---

## Notes / API / References

- **ARCHITECTURE:** [ARCHITECTURE.md](../ARCHITECTURE.md) — File storage: “Dedicated service (local or S3-compatible) for logos and generated images”; `services/storage.js` with `saveUpload()`.
- **Sprint plan:** S1-2 — “write to UPLOAD_DIR (e.g. ./uploads); return path for DB; directory creation if needed.”
- **Consumer:** `routes/designs.js` calls `saveUpload(req.file.buffer, \`projects/${project.id}/logo_${uuidv4()}${ext}\`, req.file.mimetype)` and expects a string path back (used in Asset.filePath and Project.logoUrl).
- **Env:** `UPLOAD_DIR` in `.env.example` (e.g. `./uploads`). Optional: validate or normalize `UPLOAD_DIR` (e.g. resolve to absolute path) so behavior is consistent across process cwd.
- **Edge cases:** If `relativePath` contains `..`, consider sanitizing to prevent writing outside `UPLOAD_DIR` (e.g. resolve and check path starts with resolved upload dir).

---

*Story format: Content Pilot | بايلوت المحتوى*
