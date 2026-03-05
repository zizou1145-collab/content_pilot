import { Router } from 'express';
import ExcelJS from 'exceljs';
import { param, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

export const exportRouter = Router();
exportRouter.use(requireAuth);

// Export content plan to Excel — columns: Date | Post idea | Content text | Content type | Objective
exportRouter.get(
  '/plan/:planId/excel',
  param('planId').isUUID(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const plan = await prisma.contentPlan.findFirst({
        where: { id: req.params.planId },
        include: { project: true, items: { orderBy: { orderIndex: 'asc' } } },
      });
      if (!plan || plan.project.userId !== req.user.id) {
        return res.status(404).json({ error: 'Plan not found' });
      }

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet(plan.title || 'Content Plan', { views: [{ state: 'frozen', ySplit: 1 }] });

      // Headers (Arabic as per PRD)
      sheet.columns = [
        { header: 'التاريخ', key: 'publishDate', width: 12 },
        { header: 'فكرة المنشور', key: 'postIdea', width: 30 },
        { header: 'نص المحتوى', key: 'postCopy', width: 50 },
        { header: 'نوع المحتوى', key: 'contentType', width: 16 },
        { header: 'الهدف', key: 'objective', width: 24 },
      ];
      sheet.getRow(1).font = { bold: true };

      for (const item of plan.items) {
        sheet.addRow({
          publishDate: item.publishDate.toISOString().slice(0, 10),
          postIdea: item.postIdea,
          postCopy: item.postCopy,
          contentType: item.contentType,
          objective: item.objective || '',
        });
      }

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="content-plan-${plan.id.slice(0, 8)}.xlsx"`
      );
      await workbook.xlsx.write(res);
      res.end();
    } catch (e) {
      next(e);
    }
  }
);
