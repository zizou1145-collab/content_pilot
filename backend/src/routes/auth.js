import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma.js';
import { config } from '../config.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

function signToken(userId) {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

authRouter.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('name').optional().trim(),
    body('locale').optional().isIn(['ar', 'en']),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email, password, name, locale } = req.body;
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return res.status(409).json({ error: 'Email already registered' });

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: { email, passwordHash, name: name || null, locale: locale || 'ar' },
        select: { id: true, email: true, name: true, locale: true, subscriptionPlan: true },
      });
      const token = signToken(user.id);
      res.status(201).json({ user, token });
    } catch (e) {
      next(e);
    }
  }
);

authRouter.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email, password } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = signToken(user.id);
      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          locale: user.locale,
          subscriptionPlan: user.subscriptionPlan,
          subscriptionStatus: user.subscriptionStatus,
        },
        token,
      });
    } catch (e) {
      next(e);
    }
  }
);

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});
