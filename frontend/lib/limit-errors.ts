/**
 * Subscription limit 403 handling for Content Pilot.
 * Backend returns 403 with body: { error?, code?, limit?, current? }.
 * Limit codes: PROJECTS_LIMIT_REACHED, PLANS_LIMIT_REACHED, DESIGNS_LIMIT_REACHED.
 */

export const LIMIT_CODES = {
  PROJECTS_LIMIT_REACHED: "PROJECTS_LIMIT_REACHED",
  PLANS_LIMIT_REACHED: "PLANS_LIMIT_REACHED",
  DESIGNS_LIMIT_REACHED: "DESIGNS_LIMIT_REACHED",
} as const;

export type LimitCode = (typeof LIMIT_CODES)[keyof typeof LIMIT_CODES];

const KNOWN_LIMIT_CODES = new Set<string>(Object.values(LIMIT_CODES));

export interface Limit403Body {
  error?: string;
  code?: string;
  limit?: number;
  current?: number;
}

export interface Parsed403 {
  /** True if this 403 is a subscription limit (known code). */
  isLimitReached: boolean;
  /** Limit code when isLimitReached. */
  code?: LimitCode | string;
  /** User-facing message: prefer backend `error`, otherwise caller uses i18n by code. */
  message?: string;
  limit?: number;
  current?: number;
}

/**
 * Parse a 403 response body. Use when response.status === 403.
 * - If body.code is a known limit code → isLimitReached true; message = body.error when present.
 * - Otherwise → isLimitReached false (generic forbidden; show accessDenied, no upgrade CTA).
 */
export function parse403Response(body: unknown): Parsed403 {
  const b = (body && typeof body === "object" ? body : {}) as Limit403Body;
  const code = b.code;
  const isLimitReached =
    typeof code === "string" && KNOWN_LIMIT_CODES.has(code);

  return {
    isLimitReached,
    code: code,
    message: typeof b.error === "string" ? b.error : undefined,
    limit: typeof b.limit === "number" ? b.limit : undefined,
    current: typeof b.current === "number" ? b.current : undefined,
  };
}
