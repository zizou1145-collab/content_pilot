"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/**
 * Placeholder for "New project" until S3-1 implements full create flow.
 */
export function NewProjectPlaceholder() {
  const t = useTranslations("dashboard");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-saas-bg px-4 py-12">
      <main className="w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold text-saas-fg">
          {t("newProject")}
        </h1>
        <p className="mt-4 text-start text-saas-muted">
          {t("comingSoon")}
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block font-medium text-saas-primary hover:underline"
        >
          ← {t("backToDashboard")}
        </Link>
      </main>
    </div>
  );
}
