/**
 * Subscription limits per plan (projects, plans per month, designs per month).
 * Used by projects, content-plans, and designs routes.
 * 403 responses use shape: { error: string, code?: string, limit?: number, current?: number }.
 */
export const SUBSCRIPTION_LIMITS = {
  Basic: { projects: 2, plansPerMonth: 1, designsPerMonth: 5 },
  Pro: { projects: 10, plansPerMonth: 5, designsPerMonth: 30 },
  Business: { projects: 50, plansPerMonth: 20, designsPerMonth: 200 },
};

const DEFAULT_PLAN = 'Basic';

export function getProjectLimit(plan) {
  return SUBSCRIPTION_LIMITS[plan]?.projects ?? SUBSCRIPTION_LIMITS[DEFAULT_PLAN].projects;
}

export function getPlansPerMonthLimit(plan) {
  return SUBSCRIPTION_LIMITS[plan]?.plansPerMonth ?? SUBSCRIPTION_LIMITS[DEFAULT_PLAN].plansPerMonth;
}

export function getDesignsPerMonthLimit(plan) {
  return SUBSCRIPTION_LIMITS[plan]?.designsPerMonth ?? SUBSCRIPTION_LIMITS[DEFAULT_PLAN].designsPerMonth;
}

/**
 * Count content plans for the user in the given calendar month (any project).
 */
export async function countUserPlansInMonth(prisma, userId, month, year) {
  return prisma.contentPlan.count({
    where: {
      project: { userId },
      month,
      year,
    },
  });
}

/**
 * Count assets with kind 'generated_post' for the user's projects in the given calendar month.
 * Uses asset createdAt for the month range.
 */
export async function countUserDesignsInMonth(prisma, userId, month, year) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return prisma.asset.count({
    where: {
      kind: 'generated_post',
      project: { userId },
      createdAt: { gte: start, lte: end },
    },
  });
}

/**
 * Count user's projects (for project-limit check).
 */
export async function countUserProjects(prisma, userId) {
  return prisma.project.count({ where: { userId } });
}

/**
 * Check if user can create one more content plan in the given month.
 * When replace is true, net change is 0 so always allowed.
 * Returns { allowed, limit, current }; when !allowed, caller should return 403 with code PLANS_LIMIT_REACHED.
 */
export async function checkPlansLimit(prisma, userId, month, year, replace = false) {
  if (replace) return { allowed: true, limit: null, current: null };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionPlan: true },
  });
  const plan = user?.subscriptionPlan ?? DEFAULT_PLAN;
  const limit = getPlansPerMonthLimit(plan);
  const current = await countUserPlansInMonth(prisma, userId, month, year);
  return { allowed: current < limit, limit, current };
}

/**
 * Check if user can create more generated_post assets in the given month.
 * Defaults to current calendar month if month/year omitted.
 * Returns { allowed, limit, current }; when !allowed, caller should return 403 with code DESIGNS_LIMIT_REACHED.
 * S4-2 (design generation endpoint) should call this before creating each batch of generated_post assets.
 */
export async function checkDesignsLimit(prisma, userId, month = null, year = null) {
  const now = new Date();
  const m = month ?? now.getMonth() + 1;
  const y = year ?? now.getFullYear();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionPlan: true },
  });
  const plan = user?.subscriptionPlan ?? DEFAULT_PLAN;
  const limit = getDesignsPerMonthLimit(plan);
  const current = await countUserDesignsInMonth(prisma, userId, m, y);
  return { allowed: current < limit, limit, current };
}

/** 403 payload for limit reached (frontend can show message + upgrade CTA). */
export function limitReachedPayload(code, message, limit, current) {
  const body = { error: message, code };
  if (limit != null) body.limit = limit;
  if (current != null) body.current = current;
  return body;
}
