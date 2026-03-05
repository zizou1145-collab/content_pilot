import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { checkDesignsLimit, limitReachedPayload } from '../lib/limits.js';
import { saveUpload, getUploadRoot } from '../services/storage.js';
import { generatePostImage } from '../services/ai.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /image\/(jpeg|png|gif|webp)/.test(file.mimetype);
    if (allowed) return cb(null, true);
    const err = new Error('Only images (JPEG, PNG, GIF, WebP) allowed');
    err.statusCode = 400;
    cb(err);
  },
});

export const designsRouter = Router();
designsRouter.use(requireAuth);

// Asset download — must be before /:projectId so "asset" is not matched as projectId
designsRouter.get(
  '/asset/:assetId/download',
  param('assetId').isUUID(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ error: 'Invalid asset ID', errors: errors.array() });

      const { assetId } = req.params;
      const asset = await prisma.asset.findUnique({
        where: { id: assetId },
        include: { project: true },
      });
      if (!asset) return res.status(404).json({ error: 'Asset not found' });
      if (asset.project.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

      const uploadRoot = path.resolve(getUploadRoot());
      const normalizedRelative = path.normalize(asset.filePath).replace(/\\/g, path.sep);
      const resolvedPath = path.resolve(uploadRoot, normalizedRelative);
      const relativeToRoot = path.relative(uploadRoot, resolvedPath);
      if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
        return res.status(404).json({ error: 'Asset not found' });
      }

      try {
        await fs.access(resolvedPath);
      } catch {
        return res.status(404).json({ error: 'Asset file not found' });
      }

      const filename = path.basename(asset.filePath) || (asset.kind === 'logo' ? 'logo.png' : 'asset');
      const inline = req.query.inline === '1';
      const disposition = inline ? `inline; filename="${filename}"` : `attachment; filename="${filename}"`;
      const contentType = asset.mimeType || 'application/octet-stream';

      res.setHeader('Content-Disposition', disposition);
      res.setHeader('Content-Type', contentType);
      res.sendFile(resolvedPath);
    } catch (e) {
      next(e);
    }
  }
);

designsRouter.post(
  '/:projectId/logo',
  param('projectId').isUUID(),
  upload.single('logo'),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

      const project = await prisma.project.findFirst({
        where: { id: req.params.projectId, userId: req.user.id },
      });
      if (!project) return res.status(404).json({ error: 'Project not found' });

      const ext = path.extname(req.file.originalname) || '.png';
      const filePath = await saveUpload(req.file.buffer, `projects/${project.id}/logo_${uuidv4()}${ext}`, req.file.mimetype);

      await prisma.asset.create({
        data: {
          projectId: project.id,
          kind: 'logo',
          filePath,
          mimeType: req.file.mimetype,
        },
      });

      await prisma.project.update({
        where: { id: project.id },
        data: { logoUrl: filePath },
      });

      res.status(201).json({ logoUrl: filePath });
    } catch (e) {
      next(e);
    }
  }
);

/**
 * POST /api/v1/designs/:projectId/generate
 * Body: { contentPlanItemIds: string[], replaceExisting?: boolean }
 * Generates post images for selected plan items via DALL·E; stores as Asset kind 'generated_post'.
 * Enforces designs-per-month limit. replaceExisting: if true, replace existing generated_post for each item.
 * Response 201: { assets: Array<{ id, filePath, contentPlanItemId, mimeType, createdAt }>, errors?: Array<{ contentPlanItemId, error }> }
 */
designsRouter.post(
  '/:projectId/generate',
  param('projectId').isUUID(),
  body('contentPlanItemIds')
    .isArray({ min: 1 })
    .withMessage('contentPlanItemIds must be a non-empty array'),
  body('contentPlanItemIds.*').isUUID().withMessage('Each contentPlanItemId must be a valid UUID'),
  body('replaceExisting').optional().isBoolean(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ error: 'Validation failed', errors: errors.array() });

      const { projectId } = req.params;
      const { contentPlanItemIds, replaceExisting } = req.body;
      const itemIds = [...new Set(contentPlanItemIds)];

      const project = await prisma.project.findFirst({
        where: { id: projectId, userId: req.user.id },
      });
      if (!project) return res.status(404).json({ error: 'Project not found' });

      const items = await prisma.contentPlanItem.findMany({
        where: {
          id: { in: itemIds },
          contentPlan: { projectId },
        },
        include: { contentPlan: true },
      });

      if (items.length !== itemIds.length) {
        const foundIds = new Set(items.map((i) => i.id));
        const invalid = itemIds.filter((id) => !foundIds.has(id));
        return res.status(400).json({
          error: 'Some content plan items not found or do not belong to this project',
          invalidItemIds: invalid,
        });
      }

      const existingAssets = await prisma.asset.findMany({
        where: {
          contentPlanItemId: { in: itemIds },
          kind: 'generated_post',
          projectId,
        },
      });
      const existingByItem = new Map(existingAssets.map((a) => [a.contentPlanItemId, a]));

      const itemsToProcess = replaceExisting ? items : items.filter((i) => !existingByItem.has(i.id));
      const toCreate = itemsToProcess.length;

      if (toCreate > 0) {
        const limitResult = await checkDesignsLimit(prisma, req.user.id);
        const canAdd = limitResult.limit - limitResult.current;
        if (!limitResult.allowed || toCreate > canAdd) {
          const message =
            limitResult.limit === 0
              ? 'Design generation is not available on your plan.'
              : `Designs limit reached (${limitResult.current}/${limitResult.limit} this month). Upgrade to create more.`;
          return res.status(403).json(
            limitReachedPayload('DESIGNS_LIMIT_REACHED', message, limitResult.limit, limitResult.current)
          );
        }
      }

      if (itemsToProcess.length === 0) {
        return res.status(201).json({
          assets: [],
          message: replaceExisting ? 'No items to process' : 'All selected items already have generated designs',
        });
      }

      const locale = req.user.locale === 'en' ? 'en' : 'ar';
      const uploadRoot = path.resolve(getUploadRoot());
      const created = [];
      const responseErrors = [];

      for (const item of itemsToProcess) {
        if (replaceExisting && existingByItem.has(item.id)) {
          const oldAsset = existingByItem.get(item.id);
          try {
            const resolvedPath = path.resolve(uploadRoot, path.normalize(oldAsset.filePath).replace(/\\/g, path.sep));
            const rel = path.relative(uploadRoot, resolvedPath);
            if (!rel.startsWith('..') && !path.isAbsolute(rel)) await fs.unlink(resolvedPath).catch(() => {});
          } catch (_) {}
          await prisma.asset.delete({ where: { id: oldAsset.id } });
        }

        try {
          const { buffer, mimeType } = await generatePostImage(project, item, locale);
          const assetId = uuidv4();
          const ext = mimeType === 'image/png' ? '.png' : '.jpg';
          const relativePath = `projects/${projectId}/generated/${assetId}${ext}`;
          const filePath = await saveUpload(buffer, relativePath, mimeType);

          const asset = await prisma.asset.create({
            data: {
              id: assetId,
              projectId,
              contentPlanItemId: item.id,
              kind: 'generated_post',
              filePath,
              mimeType,
            },
          });
          created.push({
            id: asset.id,
            filePath: asset.filePath,
            contentPlanItemId: asset.contentPlanItemId,
            mimeType: asset.mimeType,
            createdAt: asset.createdAt,
          });
        } catch (err) {
          const message = err.message || 'Image generation failed';
          responseErrors.push({ contentPlanItemId: item.id, error: message });
        }
      }

      return res.status(201).json({
        assets: created,
        ...(responseErrors.length > 0 && { errors: responseErrors }),
      });
    } catch (e) {
      next(e);
    }
  }
);

designsRouter.get('/:projectId/assets', param('projectId').isUUID(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const project = await prisma.project.findFirst({
      where: { id: req.params.projectId, userId: req.user.id },
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const assets = await prisma.asset.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: 'desc' },
    });
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const withUrls = assets.map((a) => ({
      ...a,
      url: `${baseUrl}/uploads/${a.filePath}`,
    }));
    res.json({ assets: withUrls });
  } catch (e) {
    next(e);
  }
});
