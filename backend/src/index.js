import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { prisma } from './lib/prisma.js';
import { authRouter } from './routes/auth.js';
import { meRouter } from './routes/me.js';
import { projectsRouter } from './routes/projects.js';
import { marketRouter } from './routes/market.js';
import { contentPlansRouter } from './routes/content-plans.js';
import { designsRouter } from './routes/designs.js';
import { exportRouter } from './routes/export.js';
import { errorHandler } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Warn if OpenAI is missing (market analysis and content plans will fail with 503)
if (!config.openaiApiKey || config.openaiApiKey.trim() === '') {
  console.warn(
    '[Content Pilot] OPENAI_API_KEY is not set. Market analysis and content plan generation will return 503. Add it to backend/.env (see .env.example).'
  );
}

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', config.uploadDir)));

// Rate limit: auth routes (login/register) — reduce brute-force risk
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { error: 'Too many attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/v1/auth', authLimiter);

// Rate limit: general API (per IP); skip health check for load balancers
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health',
});
app.use('/api/v1', apiLimiter);

// Health check (no auth) — for load balancers / uptime checks
app.get('/api/v1/health', (req, res) => res.status(200).json({ ok: true }));

// Root: redirect to frontend so opening backend URL shows the app
app.get('/', (req, res) => res.redirect(302, config.frontendUrl));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/me', meRouter);
app.use('/api/v1/projects', projectsRouter);
app.use('/api/v1/market', marketRouter);
app.use('/api/v1/content-plans', contentPlansRouter);
app.use('/api/v1/designs', designsRouter);
app.use('/api/v1/export', exportRouter);

// 404 for unknown routes (JSON for API paths, HTML for browser)
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found', path: req.path });
  }
  res.status(404).type('html').send(`
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"><title>404</title></head>
      <body style="font-family:sans-serif;text-align:center;margin:3rem;">
        <h1>404</h1>
        <p>الصفحة غير موجودة. <a href="/">العودة للرئيسية</a></p>
      </body>
    </html>
  `);
});

app.use(errorHandler);

function startServer() {
  return new Promise((resolve, reject) => {
    const server = app.listen(config.port, () => {
      console.log(`Content Pilot API running on port ${config.port}`);
      resolve(server);
    });
    server.on('error', reject);
  });
}

const delays = [0, 3000, 6000, 10000]; // first try, then retry after 3s, 6s, 10s

(async () => {
  // Verify database connection before accepting traffic
  try {
    await prisma.$connect();
    console.log('Database connection established.');
  } catch (err) {
    console.error('Failed to connect to database:', err.message || err);
    process.exit(1);
  }

  for (let attempt = 0; attempt < delays.length; attempt++) {
    if (delays[attempt] > 0) {
      console.warn(`Port ${config.port} in use, retrying in ${delays[attempt] / 1000}s... (attempt ${attempt + 1}/${delays.length})`);
      await new Promise((r) => setTimeout(r, delays[attempt]));
    }
    try {
      await startServer();
      break;
    } catch (err) {
      if (err.code === 'EADDRINUSE' && attempt < delays.length - 1) continue;
      console.error(err.message || err);
      if (err.code === 'EADDRINUSE') {
        console.error(`\nTo free port ${config.port} on Windows, run:\n  netstat -ano | findstr ":4000"\n  taskkill /F /PID <PID>\n`);
      }
      process.exit(1);
    }
  }
})();
