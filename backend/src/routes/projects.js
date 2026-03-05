import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma.js';
import { getProjectLimit, countUserProjects, limitReachedPayload } from '../lib/limits.js';
import { requireAuth } from '../middleware/auth.js';

export const projectsRouter = Router();
projectsRouter.use(requireAuth);

async function checkProjectLimit(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionPlan: true },
  });
  const plan = user?.subscriptionPlan ?? 'Basic';
  const limit = getProjectLimit(plan);
  const count = await countUserProjects(prisma, userId);
  return { limit, count, allowed: count < limit };
}

projectsRouter.get('/', async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        country: true,
        field: true,
        logoUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json({ projects });
  } catch (e) {
    next(e);
  }
});

projectsRouter.post(
  '/',
  [
    body('name').trim().notEmpty(),
    body('country').trim().notEmpty(),
    body('field').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('strengths').optional(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { allowed, limit, count } = await checkProjectLimit(req.user.id);
      if (!allowed) {
        return res.status(403).json(
          limitReachedPayload(
            'PROJECTS_LIMIT_REACHED',
            'Project limit reached for your plan. Upgrade for more projects.',
            limit,
            count
          )
        );
      }

      const { name, country, field, description, strengths } = req.body;
      const project = await prisma.project.create({
        data: {
          userId: req.user.id,
          name,
          country,
          field,
          description,
          strengths: typeof strengths === 'string' ? strengths : (strengths ? JSON.stringify(strengths) : null),
        },
      });
      res.status(201).json({ project });
    } catch (e) {
      next(e);
    }
  }
);

projectsRouter.get('/:id', param('id').isUUID(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ project });
  } catch (e) {
    next(e);
  }
});

projectsRouter.patch(
  '/:id',
  [
    param('id').isUUID(),
    body('name').optional().trim().notEmpty(),
    body('country').optional().trim().notEmpty(),
    body('field').optional().trim().notEmpty(),
    body('description').optional().trim().notEmpty(),
    body('strengths').optional(),
    body('brandColors').optional(),
    body('theme').optional().trim(),
    body('referencePostUrl').optional().trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const project = await prisma.project.findFirst({
        where: { id: req.params.id, userId: req.user.id },
      });
      if (!project) return res.status(404).json({ error: 'Project not found' });

      const data = {};
      if (req.body.name != null) data.name = req.body.name;
      if (req.body.country != null) data.country = req.body.country;
      if (req.body.field != null) data.field = req.body.field;
      if (req.body.description != null) data.description = req.body.description;
      if (req.body.strengths != null) data.strengths = typeof req.body.strengths === 'string' ? req.body.strengths : JSON.stringify(req.body.strengths);
      if (req.body.brandColors != null) data.brandColors = typeof req.body.brandColors === 'string' ? req.body.brandColors : JSON.stringify(req.body.brandColors);
      if (req.body.theme != null) data.theme = req.body.theme;
      if (req.body.referencePostUrl != null) data.referencePostUrl = req.body.referencePostUrl;

      const updated = await prisma.project.update({ where: { id: project.id }, data });
      res.json({ project: updated });
    } catch (e) {
      next(e);
    }
  }
);

projectsRouter.delete('/:id', param('id').isUUID(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const project = await prisma.project.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    await prisma.project.delete({ where: { id: project.id } });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});
