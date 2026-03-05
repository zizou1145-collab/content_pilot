# Content Pilot API (Backend)

## تشغيل الـ Backend / Running the backend

1. **نسخ ملف البيئة:** انسخ `.env.example` إلى `.env` واملأ القيم.
   ```bash
   cp .env.example .env
   ```

2. **قاعدة البيانات:** تأكد أن `DATABASE_URL` في `.env` صحيح، ثم نفّذ:
   ```bash
   npx prisma migrate deploy
   # أو للتطوير: npx prisma migrate dev
   ```

3. **مفتاح OpenAI (مهم لتحليل السوق):**  
   تحليل السوق وخطط المحتوى يعتمدان على **OpenAI**. أضف في `.env`:
   ```env
   OPENAI_API_KEY=sk-...
   ```
   احصل على المفتاح من: https://platform.openai.com/api-keys  
   إذا لم يكن المفتاح موجوداً، طلبات تحليل السوق سترجع خطأ 503.

4. **تشغيل السيرفر:**
   ```bash
   npm run dev
   ```
   السيرفر يعمل على المنفذ `4000` افتراضياً (أو القيمة في `PORT` داخل `.env`).

5. **إذا كان المنفذ 4000 مستخدماً:**
   - غيّر المنفذ في `.env`: مثلاً `PORT=4001`
   - أو أوقف العملية التي تستخدم 4000:
     - Windows: `netstat -ano | findstr ":4000"` ثم `taskkill /F /PID <PID>`
     - Linux/macOS: `lsof -i :4000` ثم `kill <PID>`

## الربط مع الواجهة الأمامية

الواجهة الأمامية تتصل بالـ API عبر `NEXT_PUBLIC_API_URL` (مثال: `http://localhost:4000`). تأكد أن الـ backend يعمل على نفس العنوان والمنفذ الموجود في `.env.local` بالفرونتند.

## نقاط نهاية تحليل السوق / Market analysis endpoints

- `GET /api/v1/market/:projectId` — جلب آخر تحليل سوق للمشروع (يتطلب تسجيل دخول).
- `POST /api/v1/market/:projectId` — تشغيل تحليل سوق جديد (يتطلب تسجيل دخول + مفتاح OpenAI في `.env`).

إذا ظهر خطأ مثل "OpenAI API key is not configured"، أضف `OPENAI_API_KEY` في `backend/.env`.
