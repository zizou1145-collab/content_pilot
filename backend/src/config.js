import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

// In production, JWT_SECRET must be set explicitly (no default).
const jwtSecret = process.env.JWT_SECRET;
if (isProduction && (!jwtSecret || jwtSecret.trim() === '')) {
  throw new Error(
    'JWT_SECRET is required in production. Set it in your environment (e.g. .env).'
  );
}

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv,
  jwtSecret: jwtSecret || (isProduction ? '' : 'dev-secret-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
};
