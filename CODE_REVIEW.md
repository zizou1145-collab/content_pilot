# مراجعة كود التطبيق — Content Pilot  
# Full Application Code Review

**التاريخ:** 2025-03-05  
**النطاق:** Backend (Node/Express)، Frontend (Next.js)، Prisma، الخدمات (AI، Storage)

---

## 1. نظرة عامة | Overview

التطبيق منظم جيداً ويتبع PRD و ARCHITECTURE: مسارات واضحة، تحقق من المدخلات، حدود الاشتراك، واجهة عربية/إنجليزية مع RTL. فيما يلي نقاط القوة والتوصيات والتحذيرات.

---

## 2. الخلفية (Backend)

### 2.1 نقاط القوة

- **فصل المسؤوليات:** Routes → middleware (auth, errorHandler) → services (ai, storage) → lib (prisma, limits).
- **التحقق من المدخلات:** استخدام `express-validator` في التسجيل، الدخول، المشاريع، التحليل السوقي، الخطط، التصاميم، والتصدير.
- **الأمان:** JWT مع `requireAuth`، التحقق من ملكية المشروع في كل مسار محمي، bcrypt لتجزئة كلمات المرور، منع path traversal في التخزين والتحميل.
- **حدود الاشتراك:** `limits.js` يوفّر دوال موحّدة لـ projects / plans/month / designs/month مع رموز 403 واضحة للواجهة.
- **معالجة الأخطاء:** معالج مركزي، رموز حالة مناسبة، رسائل مفهومة؛ في التطوير يُعاد الـ stack.
- **خدمة التخزين:** إنشاء المجلدات، رفض المسارات خارج `UPLOAD_DIR`، إرجاع مسار نسبي للـ DB.
- **خدمة الذكاء الاصطناعي:** تحليل السوق وتوليد الخطة الشهرية مع دعم ar/en، تحليل آمن لـ JSON، حدود طول للنصوص.

### 2.2 مشاكل وتوصيات

| الأولوية | الملف / المنطقة | الملاحظة | التوصية |
|----------|-----------------|----------|----------|
| **عالية** | `config.js` | `JWT_SECRET` له قيمة افتراضية `'dev-secret-change-me'` في production قد تؤدي لاختراق الجلسات. | في `NODE_ENV=production` عدم استخدام قيمة افتراضية؛ إما رفع خطأ أو استخدام متغير بيئة إلزامي. |
| **عالية** | `errorHandler.js` | أي خطأ يُمرَّر إلى `next(e)` بدون `statusCode` يُعاد كـ 500؛ بعض الأخطاء (مثل Prisma P2003) قد تحتاج 400/404. | تعيين `err.statusCode` في الخدمات للخطوط المتوقعة (مثلاً 400 للتحقق، 404 للمورد غير الموجود)، أو خريطة من رموز Prisma إلى statusCode. |
| **متوسطة** | `projects.js` GET `/:id` | `param('id').isUUID()` موجود لكن كـ middleware منفصل؛ ترتيب التنفيذ قد لا يتحقق قبل الـ handler. | التأكد من أن التحقق يعمل (أو دمجه داخل الـ handler مع التحقق من `validationResult(req)` في بداية كل route). |
| **متوسطة** | `designs.js` | رفع الشعار لا يتحقق من حد التصاميم؛ التعليق يذكر أن `checkDesignsLimit` مطلوب عند إضافة `POST /designs/:projectId/generate`. | عند تنفيذ توليد التصاميم استدعاء `checkDesignsLimit` قبل إنشاء أي `generated_post` وإرجاع 403 مع `limitReachedPayload` عند تجاوز الحد. |
| **منخفضة** | `market.js` GET | في حال فشل `JSON.parse` لـ contentTypes/postIdeas/strategies قد يرمي استثناء. | لف الـ parse في try/catch أو استخدام دالة آمنة (مثلاً إرجاع null أو مصفوفة فارغة عند الفشل). |
| **منخفضة** | `prisma.js` | عميل واحد عام؛ في بيئة serverless أو عدة عمليات قد تحتاج إلى إدارة اتصالات. | للمرحلة الحالية كافٍ؛ لاحقاً يمكن النظر في connection pooling أو تهيئة Prisma حسب البيئة. |

### 2.3 أمان إضافي

- **CORS:** مقيد بـ `config.frontendUrl` مع `credentials: true` — جيد.
- **رفع الملفات:** Multer بحد 5MB وفلتر MIME للصور فقط — جيد؛ يمكن لاحقاً إضافة فحص فيروسات (كما في SPRINT_PLAN).
- **Path traversal (designs):** التحقق من `relativeToRoot.startsWith('..')` وعدم استخدام مسارات مطلقة خارج الجذر — جيد.

---

## 3. الواجهة الأمامية (Frontend)

### 3.1 نقاط القوة

- **i18n و RTL:** next-intl مع `ar` كافتراضي، و`dir={rtl/ltr}` في الـ layout حسب اللغة.
- **المصادقة:** AuthProvider + AuthGuard للصفحات المحمية (dashboard، projects)، Auth401Handler لتنظيف الجلسة عند 401 وإعادة التوجيه.
- **استدعاء API:** `apiFetch` مع دعم Token و 401 عالمي؛ `apiPath` يعتمد على `NEXT_PUBLIC_API_URL` بدون عناوين ثابتة.
- **حدود الاشتراك:** `parse403Response` و `LimitReachedAlert` لعرض رسالة واضحة وزر ترقية.
- **إمكانية الوصول:** تسميات، `aria-invalid`، `aria-describedby`، `role="alert"` و `role="dialog"` حيث يلزم.
- **تجربة المستخدم:** حالات تحميل، أخطاء، إعادة محاولة، تأكيد الحذف وإعادة توليد الخطة.

### 3.2 مشاكل وتوصيات

| الأولوية | الملف / المنطقة | الملاحظة | التوصية |
|----------|-----------------|----------|----------|
| **عالية** | `LoginForm.tsx` | طلبات تسجيل الدخول تستخدم `fetch(apiPath(...))` مباشرة وليس `apiFetch`؛ لذلك لا يُرسل الـ token (غير مطلوب للدخول) ولا يُستدعى الـ 401 handler تلقائياً — مقبول للـ login. لكن عند انتهاء الجلسة وإعادة التوجيه لـ login، أي طلب لاحق يستخدم `apiFetch` سيشغل الـ 401. | لا تغيير ضروري؛ التأكد فقط أن جميع الطلبات المحمية تستخدم `apiFetch` مع `token`. |
| **متوسطة** | `ProjectDetailContent.tsx` | الملف كبير جداً (~840 سطر) ويجمع مشروع، تحليل سوق، خطط، توليد، تصدير، حذف، تعديل عناصر، وحوارات. | تقسيم إلى مكونات أصغر: مثلاً `MarketAnalysisSection`، `ContentPlanSection`، `EditItemModal`، `DeletePlanModal`، أو استخدام custom hooks للدولة والاستدعاءات. |
| **متوسطة** | `DashboardContent.tsx` | `handleRetry` يكرر منطق جلب المشاريع. | استخراج دالة واحدة (مثلاً `fetchProjects`) واستخدامها في useEffect و handleRetry. |
| **منخفضة** | `RegisterForm` / `LoginForm` | التحقق من البريد بنج regex بسيط؛ قد يقبل بعض التنسيقات غير القياسية. | للمرحلة الحالية كافٍ؛ الخادم يتحقق بـ isEmail(); لاحقاً يمكن توحيد التحقق أو استخدام مكتبة. |
| **منخفضة** | تخزين التوكن | التوكن في `localStorage`؛ عرضة لـ XSS إذا تم حقن سكربت. | للمرحلة الحالية مقبول؛ لاحقاً يمكن نقل التوكن إلى httpOnly cookie يديرها الخادم. |

### 3.3 تحسينات مقترحة

- **صفحة المشروع [id]:** `ProjectDetailContent` يعتمد على `useParams()` للحصول على `id`؛ في App Router مع `[id]` يعمل. التأكد من أن الصفحة لا تُعرض بدون id (مثلاً إذا دخل المستخدم `/projects/` بدون معرف).
- **نسخ السنة في توليد الخطة:** نطاق السنوات ثابت (2020–2030)؛ يمكن جعله ديناميكياً (مثلاً السنة الحالية ± 2).
- **تصدير Excel:** استخدام `Content-Disposition` من الاستجابة لاسم الملف جيد؛ التأكد من أن الـ backend يضع اسم ملف آمن (بدون أحرف خاصة).

---

## 4. قاعدة البيانات والـ Schema (Prisma)

### 4.1 نقاط القوة

- العلاقات واضحة: User → Projects؛ Project → MarketAnalyses, ContentPlans, Assets؛ ContentPlan → ContentPlanItems؛ مع onDelete مناسب (Cascade / SetNull).
- الحقول النصية الطويلة تستخدم `@db.Text`؛ التواريخ مع `@map` و snake_case في DB.

### 4.2 ملاحظات

- **MarketAnalysis.strategies:** مخزّن كـ String (JSON)؛ مرن لكن بدون تحقق على مستوى DB. التحقق يتم في التطبيق والـ AI — كافٍ.
- **Project.strengths:** نفس الأسلوب (نص أو JSON) — متوافق مع الاستخدام الحالي في الـ API والواجهة.

---

## 5. التوثيق والبيئة

- **`.env.example`** في الخلفية يذكر المتغيرات المطلوبة (DATABASE_URL, JWT_SECRET, OPENAI_API_KEY, FRONTEND_URL, UPLOAD_DIR) — جيد.
- **الواجهة:** الاعتماد على `NEXT_PUBLIC_API_URL`؛ إذا لم يُضبط يرمي الخطأ من `getApiBaseUrl()` — يمنع تشغيلاً صامتاً بتهيئة خاطئة.

---

## 6. ملخص الأولويات

| الأولوية | الإجراء |
|----------|---------|
| **يُنفّذ أولاً** | إزالة أو تشديد JWT_SECRET الافتراضي في production؛ توثيق متطلبات البيئة في README إن وُجد. |
| **قريباً** | تحسين errorHandler لربط أخطاء Prisma/الخدمات برموز HTTP مناسبة؛ استدعاء checkDesignsLimit عند تنفيذ توليد التصاميم. |
| **تحسين الصيانة** | تقسيم ProjectDetailContent إلى مكونات/ hooks؛ توحيد جلب المشاريع في Dashboard. |
| **اختياري لاحقاً** | توكن في httpOnly cookie؛ فحص فيروسات للملفات؛ rate limiting. |

---

## 7. الخلاصة

التطبيق جاهز للاستخدام في مرحلة MVP من ناحية البنية والمسارات والأمان الأساسي والحدود والترجمة. أهم التحسينات: تشديد إعدادات الأمان (JWT في production)، تحسين معالجة الأخطاء في الخلفية، وتقسيم واجهة تفاصيل المشروع لتحسين القراءة والصيانة. بعد تنفيذ نقطة توليد التصاميم في الخلفية، ربطها بحد التصاميم شهرياً وإظهار النتيجة في الواجهة سيكمل متطلبات PRD الخاصة بالحدود والتصاميم.

---

## 8. التحسينات المُنفذة (2025-03-05)

تم تنفيذ التوصيات التالية:

- **Backend – config.js:** في بيئة production أصبح `JWT_SECRET` إلزامياً؛ عند عدم تعيينه يتم رمي خطأ واضح عند بدء التشغيل.
- **Backend – errorHandler.js:** ربط أخطاء Prisma (P2025 → 404، P2003 → 400، P2002 → 409) برموز HTTP المناسبة؛ دعم `err.statusCode` من الخدمات.
- **Backend – market.js GET:** استخدام دالة `safeJsonParse` لتحليل حقول التحليل السوقي دون رمي استثناء عند JSON غير صالح.
- **Frontend – DashboardContent:** استخراج دالة `fetchProjects(token)` وإعادة استخدامها في `useEffect` و `handleRetry` لتجنب تكرار المنطق.
- **Frontend – ProjectDetailContent:** استخراج قسم تحليل السوق إلى مكون مستقل `MarketAnalysisSection` في `app/[locale]/projects/[id]/components/MarketAnalysisSection.tsx` لتبسيط الصيانة.

---

*مراجعة الكود — الإصدار 1.0 | Content Pilot*
