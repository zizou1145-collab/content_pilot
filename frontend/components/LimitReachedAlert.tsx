"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type LimitReachedAlertProps = {
  /** User-visible message (from backend error or i18n). */
  message: string;
  /** Show "Upgrade plan" CTA. Use true for limit 403, false for generic 403. */
  showUpgradeCta?: boolean;
  /** Optional dismiss control label (e.g. "Retry"); when set, render a button that calls onDismiss. */
  onDismiss?: () => void;
  dismissLabel?: string;
  /** Optional class name for the wrapper. */
  className?: string;
};

/**
 * Reusable alert for subscription limit reached (or generic 403).
 * Uses i18n for upgrade CTA; respects RTL via text-start and logical layout.
 */
export function LimitReachedAlert({
  message,
  showUpgradeCta = false,
  onDismiss,
  dismissLabel,
  className = "",
}: LimitReachedAlertProps) {
  const t = useTranslations("limits");

  return (
    <div
      className={`rounded-lg border border-saas-warning/40 bg-saas-warning/10 p-4 text-start ${className}`}
      role="alert"
    >
      <p className="text-sm text-saas-warning">{message}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {showUpgradeCta && (
          <Link
            href="/dashboard"
            className="inline-flex font-medium text-saas-primary hover:underline"
          >
            {t("upgradePlan")}
          </Link>
        )}
        {onDismiss && dismissLabel && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-sm font-medium text-saas-warning underline hover:no-underline"
          >
            {dismissLabel}
          </button>
        )}
      </div>
    </div>
  );
}
