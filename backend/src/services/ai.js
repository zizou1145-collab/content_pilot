/**
 * AI service for Content Pilot — market analysis and monthly content plan generation.
 * Uses OpenAI (or compatible) API; prompts and responses support AR/EN per locale.
 */
import OpenAI from 'openai';
import { config } from '../config.js';

const CONTENT_TYPES = ['educational', 'promotional', 'introductory', 'success_story'];

function getOpenAI() {
  if (!config.openaiApiKey || config.openaiApiKey.trim() === '') {
    const err = new Error(
      'OpenAI API key is not configured. Add OPENAI_API_KEY to backend/.env (see .env.example).'
    );
    err.statusCode = 503;
    throw err;
  }
  return new OpenAI({ apiKey: config.openaiApiKey.trim() });
}

/**
 * Build and run a chat completion with JSON response.
 * @param {OpenAI} openai - OpenAI client
 * @param {string} systemPrompt - System message
 * @param {string} userPrompt - User message
 * @returns {Promise<string>} Raw content (expected to be JSON)
 */
async function chatJson(openai, systemPrompt, userPrompt) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });
  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    const err = new Error('Empty or invalid response from AI service');
    err.statusCode = 503;
    throw err;
  }
  return content;
}

/**
 * Analyze market for a project: content types, post ideas, strategies.
 * @param {object} project - { name, country, field, description, strengths }
 * @param {string} locale - 'ar' | 'en'
 * @returns {Promise<{ contentTypes: string[], postIdeas: string[], strategies: object, rawResponse?: string }>}
 */
export async function analyzeMarket(project, locale) {
  const openai = getOpenAI();
  const isAr = locale === 'ar';

  const systemPrompt = isAr
    ? `أنت خبير تسويق ومحتوى لوسائل التواصل الاجتماعي. أجب دائماً بصيغة JSON فقط بدون نص إضافي.
المطلوب كائن JSON بالضبط بالحقول:
- contentTypes: مصفوفة نصوص (أنواع المحتوى المناسبة للمشروع، مثلاً: تعليمي، ترويجي، قصص نجاح، إلخ)
- postIdeas: مصفوفة نصوص (أفكار منشورات مقترحة، كل عنصر فكرة واحدة)
- strategies: كائن بنقاط استراتيجية (مثلاً: { "platforms": [], "tone": "", "frequency": "" }) أو نص استراتيجي واحد في حقل "summary"`
    : `You are a social media marketing and content expert. Always respond with valid JSON only, no extra text.
Required JSON object with exactly these fields:
- contentTypes: array of strings (suitable content types for the project, e.g. educational, promotional, success stories)
- postIdeas: array of strings (suggested post ideas, one string per idea)
- strategies: object with strategy points (e.g. { "platforms": [], "tone": "", "frequency": "" }) or a single "summary" string`;

  const userPrompt = isAr
    ? `حلل السوق للمشروع التالي وارجع التحليل بصيغة JSON فقط:
الاسم: ${project.name}
الدولة: ${project.country}
المجال: ${project.field}
الوصف: ${project.description}
${project.strengths ? `نقاط القوة: ${project.strengths}` : ''}`
    : `Analyze the market for this project and return the analysis as JSON only:
Name: ${project.name}
Country: ${project.country}
Field: ${project.field}
Description: ${project.description}
${project.strengths ? `Strengths: ${project.strengths}` : ''}`;

  try {
    const raw = await chatJson(openai, systemPrompt, userPrompt);
    const parsed = JSON.parse(raw);

    const contentTypes = Array.isArray(parsed.contentTypes)
      ? parsed.contentTypes.map(String)
      : [];
    const postIdeas = Array.isArray(parsed.postIdeas) ? parsed.postIdeas.map(String) : [];
    const strategies =
      parsed.strategies && typeof parsed.strategies === 'object'
        ? parsed.strategies
        : typeof parsed.strategies === 'string'
          ? { summary: parsed.strategies }
          : {};

    return {
      contentTypes,
      postIdeas,
      strategies,
      rawResponse: raw,
    };
  } catch (e) {
    if (e.statusCode) throw e;
    const err = new Error(e.message || 'Market analysis failed');
    err.statusCode = 503;
    err.cause = e;
    throw err;
  }
}

/**
 * Generate a monthly content plan as an array of plan items.
 * @param {object} project - Project record
 * @param {{ month: number, year: number }} period - month (1-12), year
 * @param {{ contentTypes?: string[], postIdeas?: string[], strategies?: object } | null} marketAnalysis - Latest analysis or null
 * @param {string} locale - 'ar' | 'en'
 * @returns {Promise<Array<{ publishDate: Date, postIdea: string, postCopy: string, contentType: string, objective?: string }>>}
 */
export async function generateMonthlyPlan(project, { month, year }, marketAnalysis, locale) {
  const openai = getOpenAI();
  const isAr = locale === 'ar';

  const monthName = new Date(year, month - 1).toLocaleString(isAr ? 'ar' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });
  const daysInMonth = new Date(year, month, 0).getDate();

  const systemPrompt = isAr
    ? `أنت خبير محتوى لوسائل التواصل. أجب بصيغة JSON فقط. المطلوب كائن واحد باسم "items" قيمته مصفوفة من عناصر الخطة.
كل عنصر يجب أن يحتوي بالضبط على:
- publishDate: تاريخ بصيغة YYYY-MM-DD ضمن الشهر المحدد
- postIdea: فكرة المنشور (نص قصير)
- postCopy: نص المنشور الجاهز للنشر (نسخة كاملة)
- contentType: واحد من: educational, promotional, introductory, success_story
- objective: (اختياري) الهدف من المنشور
وزع التواريخ على أيام الشهر (حوالي 2-4 منشورات أسبوعياً حسب طول الشهر).`
    : `You are a social media content expert. Respond with valid JSON only. Required: a single object with key "items" whose value is an array of plan items.
Each item must have exactly:
- publishDate: date string YYYY-MM-DD within the given month
- postIdea: short post idea
- postCopy: full post copy ready to publish
- contentType: one of: educational, promotional, introductory, success_story
- objective: (optional) objective of the post
Spread dates across the month (about 2-4 posts per week depending on month length).`;

  let context = isAr
    ? `المشروع: ${project.name}\nالمجال: ${project.field}\nالوصف: ${project.description}`
    : `Project: ${project.name}\nField: ${project.field}\nDescription: ${project.description}`;
  if (marketAnalysis?.postIdeas?.length) {
    context += isAr ? '\nأفكار مقترحة من التحليل: ' : '\nSuggested ideas from analysis: ';
    context += marketAnalysis.postIdeas.slice(0, 15).join(' | ');
  }
  if (marketAnalysis?.contentTypes?.length) {
    context += isAr ? '\nأنواع المحتوى: ' : '\nContent types: ';
    context += marketAnalysis.contentTypes.join(', ');
  }

  const userPrompt = isAr
    ? `أنشئ خطة محتوى شهرية لشهر ${monthName}. الشهر فيه ${daysInMonth} يوماً.\n\n${context}\n\nارجع JSON فقط بكائن "items" يحتوي على عناصر الخطة.`
    : `Generate a monthly content plan for ${monthName}. The month has ${daysInMonth} days.\n\n${context}\n\nReturn JSON only with an "items" array.`;

  try {
    const raw = await chatJson(openai, systemPrompt, userPrompt);
    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed.items) ? parsed.items : [];

    const result = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      let publishDate = it.publishDate;
      if (typeof publishDate !== 'string') publishDate = null;
      const date = publishDate ? new Date(publishDate) : null;
      if (!date || isNaN(date.getTime())) continue;

      const contentType = CONTENT_TYPES.includes(it.contentType) ? it.contentType : 'educational';
      result.push({
        publishDate: date,
        postIdea: String(it.postIdea ?? '').slice(0, 2000),
        postCopy: String(it.postCopy ?? '').slice(0, 8000),
        contentType,
        objective: it.objective != null ? String(it.objective).slice(0, 500) : null,
      });
    }

    if (result.length === 0) {
      const err = new Error('AI returned no valid plan items');
      err.statusCode = 503;
      throw err;
    }

    return result;
  } catch (e) {
    if (e.statusCode) throw e;
    const err = new Error(e.message || 'Content plan generation failed');
    err.statusCode = 503;
    err.cause = e;
    throw err;
  }
}

/**
 * Generate a single post image via DALL·E 3 using project brand context and plan item content.
 * @param {object} project - { name, field, brandColors?, theme?, description? }
 * @param {object} contentPlanItem - { postIdea, postCopy, contentType? }
 * @param {string} locale - 'ar' | 'en'
 * @returns {Promise<{ buffer: Buffer, mimeType: string }>}
 */
export async function generatePostImage(project, contentPlanItem, locale) {
  const openai = getOpenAI();
  const isAr = locale === 'ar';

  let colorHint = '';
  if (project.brandColors) {
    try {
      const colors = typeof project.brandColors === 'string' ? JSON.parse(project.brandColors) : project.brandColors;
      if (colors.primary || colors.secondary) {
        colorHint = isAr
          ? ` ألوان العلامة: ${[colors.primary, colors.secondary].filter(Boolean).join('، ')}.`
          : ` Brand colors: ${[colors.primary, colors.secondary].filter(Boolean).join(', ')}.`;
      }
    } catch (_) {}
  }

  const themeHint = project.theme
    ? (isAr ? ` أسلوب التصميم: ${project.theme}.` : ` Design style: ${project.theme}.`)
    : '';

  const promptEn = `Create a single social media post image (square, 1024x1024) for this brand and post.
Brand: ${project.name}. Field: ${project.field}.${colorHint}${themeHint}
Post idea: ${(contentPlanItem.postIdea || '').slice(0, 300)}
Post copy (use as context for visual): ${(contentPlanItem.postCopy || '').slice(0, 400)}
Image must be suitable for social media, professional, no text overlay (image only).`;

  const promptAr = `أنشئ صورة منشور واحد لوسائل التواصل (مربعة، مناسبة لإنستغرام) لهذه العلامة والمحتوى.
العلامة: ${project.name}. المجال: ${project.field}.${colorHint}${themeHint}
فكرة المنشور: ${(contentPlanItem.postIdea || '').slice(0, 300)}
نص المنشور (استخدم كسياق للصورة): ${(contentPlanItem.postCopy || '').slice(0, 400)}
الصورة يجب أن تكون مناسبة لوسائل التواصل، احترافية، بدون نص فوق الصورة (صورة فقط).`;

  const prompt = isAr ? promptAr : promptEn;

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      response_format: 'b64_json',
    });

    const b64 = response?.data?.[0]?.b64_json;
    if (!b64) {
      const err = new Error('No image data in DALL·E response');
      err.statusCode = 503;
      throw err;
    }

    const buffer = Buffer.from(b64, 'base64');
    return { buffer, mimeType: 'image/png' };
  } catch (e) {
    if (e.statusCode) throw e;
    const err = new Error(e.message || 'Post image generation failed');
    err.statusCode = 503;
    err.cause = e;
    throw err;
  }
}
