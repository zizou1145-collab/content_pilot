import { Router } from 'express';
import { param, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { analyzeMarket } from '../services/ai.js';

export const marketRouter = Router();
marketRouter.use(requireAuth);

marketRouter.post('/:projectId', param('projectId').isUUID(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const project = await prisma.project.findFirst({
      where: { id: req.params.projectId, userId: req.user.id },
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const analysis = await analyzeMarket(project, req.user.locale || 'ar');
    const created = await prisma.marketAnalysis.create({
      data: {
        projectId: project.id,
        contentTypes: analysis.contentTypes ? JSON.stringify(analysis.contentTypes) : null,
        postIdeas: analysis.postIdeas ? JSON.stringify(analysis.postIdeas) : null,
        strategies: analysis.strategies ? JSON.stringify(analysis.strategies) : null,
        rawResponse: analysis.rawResponse || null,
      },
    });
    res.status(201).json({
      analysis: {
        id: created.id,
        contentTypes: analysis.contentTypes,
        postIdeas: analysis.postIdeas,
        strategies: analysis.strategies,
        createdAt: created.createdAt,
      },
    });
  } catch (e) {
    next(e);
  }
});

marketRouter.get('/:projectId', param('projectId').isUUID(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const project = await prisma.project.findFirst({
      where: { id: req.params.projectId, userId: req.user.id },
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const latest = await prisma.marketAnalysis.findFirst({
      where: { projectId: project.id },
      orderBy: { createdAt: 'desc' },
    });
    if (!latest) return res.json({ analysis: null });

    function safeJsonParse(str, fallback = null) {
      if (!str || typeof str !== 'string') return fallback;
      try {
        return JSON.parse(str);
      } catch {
        return fallback;
      }
    }

    res.json({
      analysis: {
        id: latest.id,
        contentTypes: safeJsonParse(latest.contentTypes, null),
        postIdeas: safeJsonParse(latest.postIdeas, null),
        strategies: safeJsonParse(latest.strategies, null),
        createdAt: latest.createdAt,
      },
    });
  } catch (e) {
    next(e);
  }
});
