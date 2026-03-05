# Story: S1-4 — Asset download endpoint
# قصة: S1-4 — نقطة نهاية تحميل الملفات

**Sprint:** 1  
**Created:** 2025-03-04  
**Status:** Draft

---

## Summary | الملخص

Add `GET /api/v1/designs/asset/:assetId/download` so authenticated users can download a single asset (logo or generated post) by ID. The backend verifies that the user owns the project that owns the asset, then streams the file (or redirects to the file) with correct `Content-Disposition` so the browser offers a download with a sensible filename.

---

## Acceptance criteria | معايير القبول

- [ ] Endpoint `GET /api/v1/designs/asset/:assetId/download` exists under the designs router (same auth as other design routes).
- [ ] Route validates `assetId` as UUID; returns 400 for invalid format.
- [ ] Backend loads the Asset by `assetId`; if not found, returns 404.
- [ ] Backend verifies that the asset’s project belongs to the authenticated user (`project.userId === req.user.id`); if not, returns 403 (or 404 to avoid leaking existence).
- [ ] If the file does not exist on disk at the resolved path (e.g. `UPLOAD_DIR` + `asset.filePath`), return 404 (or 500 with clear error).
- [ ] Response streams the file (e.g. `res.sendFile` or `fs.createReadStream` + `pipe`) or redirects to a URL that serves the file; preference is streaming so ownership is enforced on every request.
- [ ] Response sets `Content-Disposition` (e.g. `attachment; filename="logo.png"` or derived from asset `filePath`/mime) so the browser triggers download with a sensible name.
- [ ] Response sets appropriate `Content-Type` from `asset.mimeType` when known.

---

## Tasks | المهام

- [ ] In `backend/src/routes/designs.js`, add `GET /asset/:assetId/download` with `param('assetId').isUUID()`.
- [ ] Handler: find Asset by id (include `project` or `projectId`); if no asset, 404.
- [ ] Check project ownership: load project by `asset.projectId` and `userId: req.user.id` (or ensure asset.project.userId === req.user.id); if not owner, return 403 or 404.
- [ ] Resolve full file path: `path.join(config.uploadDir, asset.filePath)` (or use same resolution as storage service); guard against path traversal (e.g. ensure resolved path is inside `UPLOAD_DIR`).
- [ ] Check file exists (e.g. `fs.promises.access(resolvedPath)`); if not, 404.
- [ ] Set `Content-Disposition`: e.g. `attachment; filename="<name>"` — derive filename from `asset.filePath` (basename) or from asset kind + extension.
- [ ] Set `Content-Type` from `asset.mimeType` or fallback (e.g. `application/octet-stream`).
- [ ] Stream file: `res.sendFile(resolvedPath, { headers: { ... } })` or createReadStream + pipe; do not expose internal paths in response.
- [ ] Document the endpoint (e.g. in API spec or README) and optionally add to `.env.example` notes if any (none required if reusing `UPLOAD_DIR`).
- [ ] Manually test: create asset via logo upload, call `GET /api/v1/designs/asset/:assetId/download` with valid token; verify file downloads with correct name and type; verify 403/404 for wrong user or missing asset.

---

## Notes / API / References

- **Sprint plan:** S1-4 — “GET /api/v1/designs/asset/:assetId/download (or under export) — verify user owns project → stream file or redirect; set Content-Disposition.”
- **ARCHITECTURE:** File storage under `UPLOAD_DIR`; Asset has `filePath`, `mimeType`, `projectId`; ownership via Project.userId.
- **Consumer:** Frontend (S4-4) will use this for “Download” single asset and “Download all”; export Excel is separate (`GET /api/v1/export/plan/:planId/excel`).
- **Security:** Always verify project ownership; do not serve by path only. Sanitize or resolve `asset.filePath` so that resolved path cannot escape `UPLOAD_DIR` (e.g. `path.resolve(config.uploadDir, asset.filePath)` and assert it starts with `path.resolve(config.uploadDir)`).
- **Optional:** Support `?inline=1` to serve with `Content-Disposition: inline` for preview in browser; default remains `attachment` for download.

---

*Story format: Content Pilot | بايلوت المحتوى*
