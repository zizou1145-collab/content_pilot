/**
 * Storage service for Content Pilot — persists uploaded files (logos, assets) to disk.
 * Uses UPLOAD_DIR from config; creates parent directories as needed; returns path for DB.
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, '..', '..');

/**
 * Resolve upload root: same base as express.static in index.js (path.join(__dirname, '..', config.uploadDir)).
 * Exported for use in routes (e.g. asset download) to resolve and validate file paths.
 */
export function getUploadRoot() {
  const base = path.isAbsolute(config.uploadDir) ? config.uploadDir : path.join(backendRoot, config.uploadDir);
  return path.normalize(base);
}

/**
 * Saves an uploaded file to disk under UPLOAD_DIR and returns the path to store in the DB.
 * Parent directories are created if they do not exist. Path traversal (..) in relativePath is rejected.
 *
 * @param {Buffer} buffer - File contents
 * @param {string} relativePath - Path relative to UPLOAD_DIR (e.g. projects/:projectId/logo_:uuid.png). OS-agnostic; use forward slashes.
 * @param {string} [mimeType] - Optional MIME type (for future use; not written to disk here)
 * @returns {Promise<string>} Path to store in DB (normalized relative path; use with GET /uploads/:path)
 * @throws Rejects on disk/permission errors or if relativePath escapes UPLOAD_DIR
 */
export async function saveUpload(buffer, relativePath, mimeType) {
  const uploadRoot = getUploadRoot();
  const normalizedRelative = path.normalize(relativePath).replace(/\\/g, path.sep);
  const fullPath = path.join(uploadRoot, normalizedRelative);

  const resolvedFull = path.resolve(fullPath);
  const resolvedRoot = path.resolve(uploadRoot);
  const relativeToRoot = path.relative(resolvedRoot, resolvedFull);
  if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
    const err = new Error('Invalid path: cannot write outside upload directory');
    err.statusCode = 400;
    throw err;
  }

  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, buffer);

  return normalizedRelative.split(path.sep).join('/');
}
