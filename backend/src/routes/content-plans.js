import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma.js';
import { checkPlansLimit, limitReachedPayload } from '../lib/limits.js';
import { requireAuth } from '../middleware/auth.js';
import { generateMonthlyPlan } from '../services/ai.js';

export const contentPlansRouter = Router();
contentPlansRouter.use(requireAuth);

const contentTypeEnum = ['educational', 'promotional', 'introductory', 'success_story'];

/**
 * Parses the replace flag from query or body. Treats "true", "1", and boolean true as true; otherwise false.
 * @param {object} req - Express request (req.query, req.body)
 * @returns {boolean}
 */
function parseReplace(req) {
  const fromQuery = req.query?.replace;
  const fromBody = req.body?.replace;
  const value = fromBody !== undefined ? fromBody : fromQuery;
  if (value === true || value === 'true' || value === '1' || value === 1) return true;
  return false;
}

contentPlansRouter.get('/project/:projectId', param('projectId').isUUID(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const project = await prisma.project.findFirst({
      where: { id: req.params.projectId, userId: req.user.id },
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const plans = await prisma.contentPlan.findMany({
      where: { projectId: project.id },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: { items: { orderBy: { orderIndex: 'asc' } } },
    });
    res.json({ plans });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /project/:projectId/generate — Generate a monthly content plan.
 * Body: { month, year, replace? }. Query: ?replace=true
 * - replace (optional): if true, overwrite existing plan for same project+month+year; otherwise 409 when plan exists.
 * - 409 when a plan already exists for that project+month+year and replace is not true.
 * - 201 with the new plan when no plan exists, or when replace is true (existing plan is deleted then recreated).
 */
contentPlansRouter.post(
  '/project/:projectId/generate',
  [
    param('projectId').isUUID(),
    body('month').isInt({ min: 1, max: 12 }),
    body('year').isInt({ min: 2020, max: 2030 }),
    body('replace').optional(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const project = await prisma.project.findFirst({
        where: { id: req.params.projectId, userId: req.user.id },
        include: {
          marketAnalyses: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      });
      if (!project) return res.status(404).json({ error: 'Project not found' });

      const { month, year } = req.body;
      const replace = parseReplace(req);

      const plansCheck = await checkPlansLimit(prisma, req.user.id, month, year, replace);
      if (!plansCheck.allowed) {
        return res.status(403).json(
          limitReachedPayload(
            'PLANS_LIMIT_REACHED',
            'Content plans limit reached for this month. Upgrade your plan for more.',
            plansCheck.limit,
            plansCheck.current
          )
        );
      }

      const existing = await prisma.contentPlan.findFirst({
        where: { projectId: project.id, month, year },
      });
      if (existing && !replace) {
        return res.status(409).json({ error: 'Content plan already exists for this month' });
      }
      if (existing && replace) {
        await prisma.contentPlan.delete({ where: { id: existing.id } });
      }

      const ma = project.marketAnalyses[0];
      let marketAnalysis = null;
      if (ma) {
        try {
          marketAnalysis = {
            contentTypes: ma.contentTypes ? JSON.parse(ma.contentTypes) : null,
            postIdeas: ma.postIdeas ? JSON.parse(ma.postIdeas) : null,
            strategies: ma.strategies ? JSON.parse(ma.strategies) : null,
          };
        } catch {
          marketAnalysis = null;
        }
      }

      const items = await generateMonthlyPlan(project, { month, year }, marketAnalysis, req.user.locale || 'ar');

      const plan = await prisma.contentPlan.create({
        data: {
          projectId: project.id,
          title: `${year}-${String(month).padStart(2, '0')}`,
          month,
          year,
          items: {
            create: items.map((item, i) => ({
              publishDate: item.publishDate,
              postIdea: item.postIdea,
              postCopy: item.postCopy,
              contentType: item.contentType,
              objective: item.objective || null,
              orderIndex: i,
            })),
          },
        },
        include: { items: { orderBy: { orderIndex: 'asc' } } },
      });
      res.status(201).json({ plan });
    } catch (e) {
      next(e);
    }
  }
);

contentPlansRouter.get('/:planId', param('planId').isUUID(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const plan = await prisma.contentPlan.findFirst({
      where: { id: req.params.planId },
      include: { project: true, items: { orderBy: { orderIndex: 'asc' } } },
    });
    if (!plan || plan.project.userId !== req.user.id) return res.status(404).json({ error: 'Plan not found' });
    const { project, ...rest } = plan;
    res.json({ plan: rest });
  } catch (e) {
    next(e);
  }
});

contentPlansRouter.patch(
  '/:planId/items/:itemId',
  [
    param('planId').isUUID(),
    param('itemId').isUUID(),
    body('publishDate').optional().isISO8601(),
    body('postIdea').optional().trim(),
    body('postCopy').optional().trim(),
    body('contentType').optional().isIn(contentTypeEnum),
    body('objective').optional().trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const plan = await prisma.contentPlan.findFirst({
        where: { id: req.params.planId },
        include: { project: true },
      });
      if (!plan || plan.project.userId !== req.user.id) return res.status(404).json({ error: 'Plan not found' });

      const item = await prisma.contentPlanItem.findFirst({
        where: { id: req.params.itemId, contentPlanId: plan.id },
      });
      if (!item) return res.status(404).json({ error: 'Item not found' });

      const data = {};
      if (req.body.publishDate != null) data.publishDate = new Date(req.body.publishDate);
      if (req.body.postIdea != null) data.postIdea = req.body.postIdea;
      if (req.body.postCopy != null) data.postCopy = req.body.postCopy;
      if (req.body.contentType != null) data.contentType = req.body.contentType;
      if (req.body.objective != null) data.objective = req.body.objective;

      const updated = await prisma.contentPlanItem.update({ where: { id: item.id }, data });
      res.json({ item: updated });
    } catch (e) {
      next(e);
    }
  }
);

contentPlansRouter.delete('/:planId', param('planId').isUUID(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const plan = await prisma.contentPlan.findFirst({
      where: { id: req.params.planId },
      include: { project: true },
    });
    if (!plan || plan.project.userId !== req.user.id) return res.status(404).json({ error: 'Plan not found' });
    await prisma.contentPlan.delete({ where: { id: plan.id } });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});
