"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { parse403Response } from "@/lib/limit-errors";
import { ProjectForm, type ProjectFormValues } from "@/components/ProjectForm";
import { LimitReachedAlert } from "@/components/LimitReachedAlert";

function validate(
  values: ProjectFormValues,
  requiredMessage: string
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.name.trim()) errors.name = requiredMessage;
  if (!values.country.trim()) errors.country = requiredMessage;
  if (!values.field.trim()) errors.field = requiredMessage;
  if (!values.description.trim()) errors.description = requiredMessage;
  return errors;
}

export function NewProjectPage() {
  const t = useTranslations("projects");
  const tLimits = useTranslations("limits");
  const router = useRouter();
  const { token } = useAuth();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [limitMessage, setLimitMessage] = useState<string | null>(null);

  async function handleSubmit(values: ProjectFormValues) {
    const validationErrors = validate(values, t("errors.required"));
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setApiError(t("errors.validation"));
      return;
    }
    setErrors({});
    setApiError(null);
    setLimitReached(false);
    setLimitMessage(null);
    setSubmitting(true);
    try {
      const res = await apiFetch("/api/v1/projects", {
        token: token ?? undefined,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          country: values.country.trim(),
          field: values.field.trim(),
          description: values.description.trim(),
          strengths: values.strengths.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 201 && data.project?.id) {
        router.replace(`/projects/${data.project.id}`);
        return;
      }
      if (res.status === 400 && Array.isArray(data.errors)) {
        const next: Record<string, string> = {};
        for (const err of data.errors) {
          const field = err.path ?? err.param ?? "form";
          next[field] = err.msg ?? err.message ?? String(err);
        }
        setErrors(next);
        setApiError(t("errors.validation"));
        return;
      }
      if (res.status === 403) {
        const parsed = parse403Response(data);
        if (parsed.isLimitReached) {
          setLimitMessage(parsed.message ?? tLimits("limitProjectsReached"));
          setLimitReached(true);
          return;
        }
        setApiError(tLimits("accessDenied"));
        return;
      }
      setApiError(t("errors.validation"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-saas-bg">
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-start text-2xl font-semibold text-saas-fg">
          {t("createProject")}
        </h1>
        <div className="mt-6">
          <ProjectForm
            onSubmit={handleSubmit}
            submitting={submitting}
            errors={errors}
            apiError={apiError}
            onCancel={() => router.back()}
          />
        </div>
        {limitReached && limitMessage && (
          <div className="mt-3">
            <LimitReachedAlert message={limitMessage} showUpgradeCta />
          </div>
        )}
        <p className="mt-4 text-center text-sm text-saas-muted">
          <Link
            href="/dashboard"
            className="font-medium text-saas-primary hover:underline"
          >
            {t("backToDashboard")}
          </Link>
        </p>
      </main>
    </div>
  );
}
