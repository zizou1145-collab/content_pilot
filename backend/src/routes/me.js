import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import {
  countUserProjects,
  countUserPlansInMonth,
  countUserDesignsInMonth,
  getPlansPerMonthLimit,
  getDesignsPerMonthLimit,
} from '../lib/limits.js';

export const meRouter = Router();
meRouter.use(requireAuth);

/**
 * GET /api/v1/me/stats
 * Returns dashboard KPIs: projects count, content plans this month, designs this month, and limits.
 */
meRouter.get('/stats', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const plan = req.user.subscriptionPlan ?? 'Basic';
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const [projectsCount, contentPlansThisMonth, designsThisMonth] = await Promise.all([
      countUserProjects(prisma, userId),
      countUserPlansInMonth(prisma, userId, month, year),
      countUserDesignsInMonth(prisma, userId, month, year),
    ]);

    const plansLimit = getPlansPerMonthLimit(plan);
    const designsLimit = getDesignsPerMonthLimit(plan);

    res.json({
      projectsCount,
      contentPlansThisMonth,
      designsThisMonth,
      plansLimit,
      designsLimit,
    });
  } catch (e) {
    next(e);
  }
});
