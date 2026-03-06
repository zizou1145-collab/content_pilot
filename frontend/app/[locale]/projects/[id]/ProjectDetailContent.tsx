"use client";

import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { parse403Response } from "@/lib/limit-errors";
import { ProjectForm, type ProjectFormValues } from "@/components/ProjectForm";
import { LimitReachedAlert } from "@/components/LimitReachedAlert";
import { MarketAnalysisSection } from "./components/MarketAnalysisSection";
import { BrandSettingsSection } from "./components/BrandSettingsSection";
import { DesignGenerationSection } from "./components/DesignGenerationSection";
import { DeleteProjectModal } from "./components/DeleteProjectModal";
import { useEffect, useState } from "react";

export type ProjectDetail = {
  id: string;
  name: string;
  country: string;
  field: string;
  description: string;
  strengths: string | null;
  logoUrl: string | null;
  brandColors: string | null;
  theme: string | null;
  referencePostUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MarketAnalysisResult = {
  id: string;
  contentTypes: string[] | null;
  postIdeas: string[] | null;
  strategies: Record<string, unknown> | null;
  createdAt: string;
};

export type ContentPlanItemType = "educational" | "promotional" | "introductory" | "success_story";

export type ContentPlanItem = {
  id: string;
  publishDate: string;
  postIdea: string;
  postCopy: string;
  contentType: ContentPlanItemType;
  objective: string | null;
  orderIndex: number;
};

export type ContentPlan = {
  id: string;
  title: string;
  month: number;
  year: number;
  createdAt: string;
  updatedAt: string;
  items: ContentPlanItem[];
};

function parseStrengthsDisplay(s: string | null): string {
  if (!s || !s.trim()) return "—";
  try {
    const parsed = JSON.parse(s);
    if (Array.isArray(parsed)) return parsed.join(", ");
    if (typeof parsed === "string") return parsed;
    return s;
  } catch {
    return s;
  }
}

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

export function ProjectDetailContent() {
  const params = useParams();
  const locale = useLocale();
  const id = typeof params?.id === "string" ? params.id : "";
  const t = useTranslations("projects");
  const tLimits = useTranslations("limits");
  const router = useRouter();
  const { token } = useAuth();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [editApiError, setEditApiError] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const [analysis, setAnalysis] = useState<MarketAnalysisResult | null>(null);
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketRunLoading, setMarketRunLoading] = useState(false);
  const [marketError, setMarketError] = useState<string | null>(null);

  const [plans, setPlans] = useState<ContentPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [generateMonth, setGenerateMonth] = useState<number>(new Date().getMonth() + 1);
  const [generateYear, setGenerateYear] = useState<number>(new Date().getFullYear());
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [showLimitUpgradeCta, setShowLimitUpgradeCta] = useState(false);
  const [planExistsConflict, setPlanExistsConflict] = useState<{ month: number; year: number } | null>(null);
  const [regenerateConfirm, setRegenerateConfirm] = useState<{ month: number; year: number } | null>(null);
  const [regenerateLoading, setRegenerateLoading] = useState(false);
  const [editItem, setEditItem] = useState<ContentPlanItem | null>(null);
  const [editItemPlanId, setEditItemPlanId] = useState<string | null>(null);
  const [editItemSaving, setEditItemSaving] = useState(false);
  const [editItemError, setEditItemError] = useState<string | null>(null);
  const [editItemForm, setEditItemForm] = useState<{ publishDate: string; postIdea: string; postCopy: string; contentType: ContentPlanItemType; objective: string } | null>(null);
  const [deletePlanId, setDeletePlanId] = useState<string | null>(null);
  const [deletePlanSubmitting, setDeletePlanSubmitting] = useState(false);
  const [deletePlanError, setDeletePlanError] = useState<string | null>(null);
  const [contentPlanSuccess, setContentPlanSuccess] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setError(null);
    setLoading(true);
    apiFetch(`/api/v1/projects/${id}`, { token })
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 404) {
          setError(t("errors.notFound"));
          setProject(null);
          return;
        }
        if (!res.ok) {
          setError(t("errors.notFound"));
          setProject(null);
          return;
        }
        const data = await res.json();
        setProject(data.project ?? null);
        setError(null);
      })
      .catch(() => {
        if (!cancelled) {
          setError(t("errors.notFound"));
          setProject(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, token, t]);

  useEffect(() => {
    if (!id || !token || !project) return;
    let cancelled = false;
    setMarketError(null);
    setMarketLoading(true);
    apiFetch(`/api/v1/market/${id}`, { token })
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 404) {
          setMarketError(t("errors.notFound"));
          setAnalysis(null);
          return;
        }
        if (!res.ok) {
          setMarketError(t("marketAnalysis.errorMessage"));
          setAnalysis(null);
          return;
        }
        const data = await res.json();
        setAnalysis(data.analysis ?? null);
        setMarketError(null);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : String(err);
          const isNetwork = /fetch|network|failed to fetch/i.test(msg);
          setMarketError(isNetwork ? t("marketAnalysis.serverUnreachable") : t("marketAnalysis.errorMessage"));
          setAnalysis(null);
        }
      })
      .finally(() => {
        if (!cancelled) setMarketLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, token, project?.id, t]);

  useEffect(() => {
    if (!id || !token || !project) return;
    let cancelled = false;
    setPlansError(null);
    setPlansLoading(true);
    apiFetch(`/api/v1/content-plans/project/${id}`, { token })
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 404) {
          setPlansError(t("contentPlan.planNotFound"));
          setPlans([]);
          return;
        }
        if (!res.ok) {
          setPlansError(t("contentPlan.error"));
          setPlans([]);
          return;
        }
        const data = await res.json();
        const list = (data.plans ?? []) as ContentPlan[];
        setPlans(list);
        setPlansError(null);
        if (list.length > 0) {
          setSelectedPlanId((prev) => (prev && list.some((p) => p.id === prev) ? prev : list[0].id));
        } else {
          setSelectedPlanId(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPlansError(t("contentPlan.error"));
          setPlans([]);
        }
      })
      .finally(() => {
        if (!cancelled) setPlansLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, token, project?.id, t]);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) ?? null;

  async function runMarketAnalysis() {
    if (!id || !token) return;
    setMarketRunLoading(true);
    setMarketError(null);
    try {
      const res = await apiFetch(`/api/v1/market/${id}`, {
        token: token ?? undefined,
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 201 && data.analysis) {
        setAnalysis(data.analysis);
        setMarketError(null);
        return;
      }
      if (res.status === 404) {
        setMarketError(t("errors.notFound"));
        return;
      }
      // Show backend error message (e.g. "OpenAI API key is not configured") when present
      const backendError = typeof data?.error === "string" ? data.error : null;
      setMarketError(backendError || t("marketAnalysis.errorMessage"));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isNetwork = /fetch|network|failed to fetch/i.test(msg);
      setMarketError(isNetwork ? t("marketAnalysis.serverUnreachable") : t("marketAnalysis.errorMessage"));
    } finally {
      setMarketRunLoading(false);
    }
  }

  async function fetchPlans() {
    if (!id || !token) return;
    setPlansError(null);
    setPlansLoading(true);
    try {
      const res = await apiFetch(`/api/v1/content-plans/project/${id}`, { token });
      if (res.status === 404) {
        setPlansError(t("contentPlan.planNotFound"));
        setPlans([]);
        return;
      }
      if (!res.ok) {
        setPlansError(t("contentPlan.error"));
        setPlans([]);
        return;
      }
      const data = await res.json();
      const list = (data.plans ?? []) as ContentPlan[];
      setPlans(list);
      if (list.length > 0) setSelectedPlanId(list[0].id);
      else setSelectedPlanId(null);
    } catch {
      setPlansError(t("contentPlan.error"));
      setPlans([]);
    } finally {
      setPlansLoading(false);
    }
  }

  async function handleGeneratePlan(replace: boolean) {
    if (!id || !token) return;
    setGenerateError(null);
    setShowLimitUpgradeCta(false);
    setPlanExistsConflict(null);
    const month = replace && regenerateConfirm ? regenerateConfirm.month : generateMonth;
    const year = replace && regenerateConfirm ? regenerateConfirm.year : generateYear;
    if (replace) setRegenerateLoading(true);
    else setGenerateLoading(true);
    try {
      const res = await apiFetch(`/api/v1/content-plans/project/${id}/generate`, {
        token,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year, replace: replace || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 201 && data.plan) {
        setPlans((prev) => {
          const without = prev.filter((p) => !(p.month === month && p.year === year));
          return [data.plan as ContentPlan, ...without];
        });
        setSelectedPlanId(data.plan.id);
        setRegenerateConfirm(null);
        setPlanExistsConflict(null);
        setContentPlanSuccess(t("contentPlan.success"));
        setTimeout(() => setContentPlanSuccess(null), 3000);
        return;
      }
      if (res.status === 409) {
        setPlanExistsConflict({ month, year });
        setGenerateError(t("contentPlan.planExists"));
        return;
      }
      if (res.status === 403) {
        const parsed = parse403Response(data);
        if (parsed.isLimitReached) {
          setGenerateError(parsed.message ?? t("contentPlan.plansLimitReached"));
          setShowLimitUpgradeCta(true);
          return;
        }
        setGenerateError(tLimits("accessDenied"));
        setShowLimitUpgradeCta(false);
        return;
      }
      if (res.status === 404) {
        setGenerateError(t("errors.notFound"));
        return;
      }
      setGenerateError(t("contentPlan.error"));
    } catch {
      setGenerateError(t("contentPlan.error"));
    } finally {
      setRegenerateLoading(false);
      setGenerateLoading(false);
    }
  }

  async function handleRegenerateConfirm() {
    if (!regenerateConfirm) return;
    await handleGeneratePlan(true);
  }

  function openEditItemModal(item: ContentPlanItem, planId: string) {
    setEditItem(item);
    setEditItemPlanId(planId);
    setEditItemForm({
      publishDate: item.publishDate.slice(0, 10),
      postIdea: item.postIdea,
      postCopy: item.postCopy,
      contentType: item.contentType,
      objective: item.objective ?? "",
    });
    setEditItemError(null);
  }

  async function handleSaveEditItem() {
    if (!editItem || !editItemPlanId || !editItemForm || !token) return;
    setEditItemSaving(true);
    setEditItemError(null);
    try {
      const res = await apiFetch(
        `/api/v1/content-plans/${editItemPlanId}/items/${editItem.id}`,
        {
          token,
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            publishDate: editItemForm.publishDate ? `${editItemForm.publishDate}T12:00:00.000Z` : undefined,
            postIdea: editItemForm.postIdea,
            postCopy: editItemForm.postCopy,
            contentType: editItemForm.contentType,
            objective: editItemForm.objective || null,
          }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (res.status === 200 && data.item) {
        setPlans((prev) =>
          prev.map((p) =>
            p.id === editItemPlanId
              ? {
                  ...p,
                  items: p.items.map((it) =>
                    it.id === editItem.id ? { ...data.item, publishDate: data.item.publishDate } : it
                  ),
                }
              : p
          )
        );
        setEditItem(null);
        setEditItemPlanId(null);
        setEditItemForm(null);
        setContentPlanSuccess(t("contentPlan.success"));
        setTimeout(() => setContentPlanSuccess(null), 3000);
        return;
      }
      if (res.status === 400) {
        setEditItemError(t("errors.validation"));
        return;
      }
      if (res.status === 404) {
        setEditItemError(t("contentPlan.itemNotFound"));
        return;
      }
      setEditItemError(t("contentPlan.error"));
    } catch {
      setEditItemError(t("contentPlan.error"));
    } finally {
      setEditItemSaving(false);
    }
  }

  async function handleDeletePlan(planId: string) {
    if (!token) return;
    setDeletePlanSubmitting(true);
    setDeletePlanError(null);
    try {
      const res = await apiFetch(`/api/v1/content-plans/${planId}`, {
        token,
        method: "DELETE",
      });
      if (res.status === 204) {
        setPlans((prev) => prev.filter((p) => p.id !== planId));
        if (selectedPlanId === planId) {
          const rest = plans.filter((p) => p.id !== planId);
          setSelectedPlanId(rest.length > 0 ? rest[0].id : null);
        }
        setDeletePlanId(null);
        setDeletePlanError(null);
        setContentPlanSuccess(t("contentPlan.planDeleted"));
        setTimeout(() => setContentPlanSuccess(null), 3000);
      } else {
        setDeletePlanError(t("contentPlan.error"));
      }
    } catch {
      setDeletePlanError(t("contentPlan.error"));
    } finally {
      setDeletePlanSubmitting(false);
    }
  }

  async function handleExportExcel(planId: string) {
    if (!token) return;
    setExportError(null);
    setExportLoading(true);
    try {
      const res = await apiFetch(`/api/v1/export/plan/${planId}/excel`, { token });
      if (!res.ok) {
        setExportError(res.status === 404 ? t("contentPlan.exportNotFound") : t("contentPlan.exportError"));
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      let filename = `content-plan-${planId.slice(0, 8)}.xlsx`;
      if (disposition) {
        const match = /filename[*]?=(?:UTF-8'')?"?([^";\n]+)"?/i.exec(disposition);
        if (match) filename = match[1].trim();
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setExportError(t("contentPlan.exportError"));
    } finally {
      setExportLoading(false);
    }
  }

  async function handleEditSubmit(values: ProjectFormValues) {
    const validationErrors = validate(values, t("errors.required"));
    if (Object.keys(validationErrors).length > 0) {
      setEditErrors(validationErrors);
      setEditApiError(t("errors.validation"));
      return;
    }
    setEditErrors({});
    setEditApiError(null);
    setEditSubmitting(true);
    try {
      const res = await apiFetch(`/api/v1/projects/${id}`, {
        token: token ?? undefined,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          country: values.country.trim(),
          field: values.field.trim(),
          description: values.description.trim(),
          strengths: values.strengths.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 200 && data.project) {
        setProject(data.project);
        setEditing(false);
        setSuccessMessage(t("success"));
        setEditApiError(null);
        setTimeout(() => setSuccessMessage(null), 3000);
        return;
      }
      if (res.status === 400 && Array.isArray(data.errors)) {
        const next: Record<string, string> = {};
        for (const err of data.errors) {
          const field = err.path ?? err.param ?? "form";
          next[field] = err.msg ?? err.message ?? String(err);
        }
        setEditErrors(next);
        setEditApiError(t("errors.validation"));
        return;
      }
      if (res.status === 404) {
        setEditApiError(t("errors.notFound"));
        return;
      }
      setEditApiError(t("errors.validation"));
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!id || !token) return;
    setDeleteSubmitting(true);
    try {
      const res = await apiFetch(`/api/v1/projects/${id}`, {
        token: token ?? undefined,
        method: "DELETE",
      });
      if (res.status === 204) {
        router.replace("/dashboard");
        return;
      }
      if (res.status === 404) {
        setEditApiError(t("errors.notFound"));
        setDeleteConfirmOpen(false);
        return;
      }
      setEditApiError(t("errors.notFound"));
    } finally {
      setDeleteSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-saas-bg">
        <main className="mx-auto max-w-4xl px-4 py-8">
          <div className="flex items-center gap-2 text-saas-muted">
            <span className="size-5 animate-spin rounded-full border-2 border-saas-border border-t-saas-primary" />
            <span className="text-sm">{t("loading")}</span>
          </div>
        </main>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-saas-bg">
        <main className="mx-auto max-w-4xl px-4 py-8">
          <div className="rounded-lg border border-saas-danger/30 bg-saas-danger/10 p-4 text-start">
            <p className="text-sm text-saas-danger">{error ?? t("errors.notFound")}</p>
            <div className="mt-2 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="text-sm font-medium text-saas-danger underline hover:no-underline"
              >
                {t("retry")}
              </button>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-saas-primary hover:underline"
              >
                {t("backToDashboard")}
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-saas-bg">
      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Back link */}
        <p className="mb-4 text-start text-sm text-saas-muted">
          <Link
            href="/dashboard"
            className="font-medium text-saas-primary hover:underline"
          >
            {t("backToDashboard")}
          </Link>
        </p>

        {successMessage && (
          <div
            className="mb-4 rounded-lg border border-saas-success/40 bg-saas-success/10 p-3 text-start text-sm text-saas-success"
            role="status"
          >
            {successMessage}
          </div>
        )}

        {!editing ? (
          <>
            {/* Project info */}
            <section
              className="rounded-xl border border-saas-border bg-saas-card p-6 text-start shadow-sm"
              aria-labelledby="project-heading"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <h1
                  id="project-heading"
                  className="text-2xl font-semibold text-saas-fg"
                >
                  {project.name}
                </h1>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="rounded-lg border border-saas-border bg-saas-card px-4 py-2 text-sm font-medium text-saas-fg hover:bg-saas-sidebar-hover"
                  >
                    {t("editProject")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmOpen(true)}
                    className="rounded-lg border border-saas-danger/40 bg-saas-card px-4 py-2 text-sm font-medium text-saas-danger hover:bg-saas-danger/10"
                  >
                    {t("deleteProject")}
                  </button>
                </div>
              </div>
              <dl className="mt-6 grid gap-3 text-start sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-saas-muted">
                    {t("country")}
                  </dt>
                  <dd className="mt-0.5 text-saas-fg">{project.country}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-saas-muted">
                    {t("field")}
                  </dt>
                  <dd className="mt-0.5 text-saas-fg">{project.field}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-saas-muted">
                    {t("description")}
                  </dt>
                  <dd className="mt-0.5 whitespace-pre-wrap text-saas-fg">
                    {project.description}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-saas-muted">
                    {t("strengths")}
                  </dt>
                  <dd className="mt-0.5 text-saas-fg">
                    {parseStrengthsDisplay(project.strengths)}
                  </dd>
                </div>
              </dl>
            </section>

            <BrandSettingsSection
              key={project.id}
              project={{
                id: project.id,
                logoUrl: project.logoUrl,
                brandColors: project.brandColors ?? null,
                theme: project.theme ?? null,
                referencePostUrl: project.referencePostUrl ?? null,
              }}
              onProjectUpdate={(updates) => setProject((prev) => (prev ? { ...prev, ...updates } : null))}
              token={token}
              saveSuccessMessage={(msg) => {
                setSuccessMessage(msg);
                setTimeout(() => setSuccessMessage(null), 3000);
              }}
              saveErrorMessage={() => {}}
            />

            <MarketAnalysisSection
              analysis={analysis}
              loading={marketLoading}
              runLoading={marketRunLoading}
              error={marketError}
              onRunAnalysis={runMarketAnalysis}
              onRetry={() => {
                setMarketError(null);
                runMarketAnalysis();
              }}
            />
            {/* Content plan (S3-3) */}
            <section
              className="mt-8 rounded-xl border border-saas-border bg-saas-card p-6 text-start shadow-sm"
              aria-labelledby="content-plan-heading"
            >
              <h2
                id="content-plan-heading"
                className="text-lg font-semibold text-saas-fg"
              >
                {t("contentPlan.sectionTitle")}
              </h2>

              {contentPlanSuccess && (
                <div
                  className="mt-4 rounded-lg border border-saas-success/40 bg-saas-success/10 p-3 text-start text-sm text-saas-success"
                  role="status"
                >
                  {contentPlanSuccess}
                </div>
              )}

              {plansError && (
                <div className="mt-4 rounded-lg border border-saas-danger/30 bg-saas-danger/10 p-4 text-start">
                  <p className="text-sm text-saas-danger">{plansError}</p>
                  <button
                    type="button"
                    onClick={fetchPlans}
                    className="mt-2 text-sm font-medium text-saas-danger underline hover:no-underline"
                  >
                    {t("contentPlan.retry")}
                  </button>
                </div>
              )}

              {!plansError && plansLoading && (
                <div className="mt-4 flex items-center gap-2 text-saas-muted">
                  <span className="size-5 animate-spin rounded-full border-2 border-saas-border border-t-saas-primary" />
                  <span className="text-sm">{t("contentPlan.loading")}</span>
                </div>
              )}

              {!plansError && !plansLoading && (
                <>
                  <div className="mt-4 flex flex-wrap items-end gap-4">
                    <div>
                      <label htmlFor="content-plan-month" className="block text-sm font-medium text-saas-fg">
                        {t("contentPlan.month")}
                      </label>
                      <select
                        id="content-plan-month"
                        value={generateMonth}
                        onChange={(e) => setGenerateMonth(Number(e.target.value))}
                        className="ms-0 mt-1 block rounded-lg border border-saas-border bg-saas-bg px-3 py-2 text-sm text-saas-fg focus:border-saas-primary focus:outline-none focus:ring-1 focus:ring-saas-primary"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                          <option key={m} value={m}>
                            {new Date(2000, m - 1).toLocaleDateString(locale === "ar" ? "ar" : "en", { month: "long" })}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="content-plan-year" className="block text-sm font-medium text-saas-fg">
                        {t("contentPlan.year")}
                      </label>
                      <select
                        id="content-plan-year"
                        value={generateYear}
                        onChange={(e) => setGenerateYear(Number(e.target.value))}
                        className="ms-0 mt-1 block rounded-lg border border-saas-border bg-saas-bg px-3 py-2 text-sm text-saas-fg focus:border-saas-primary focus:outline-none focus:ring-1 focus:ring-saas-primary"
                      >
                        {Array.from({ length: 11 }, (_, i) => 2020 + i).map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleGeneratePlan(false)}
                      disabled={generateLoading || regenerateLoading}
                      className="rounded-lg bg-saas-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-saas-primary-hover disabled:opacity-50"
                    >
                      {generateLoading ? t("contentPlan.generating") : t("contentPlan.generatePlan")}
                    </button>
                  </div>

                  {generateError && showLimitUpgradeCta && (
                    <div className="mt-4">
                      <LimitReachedAlert
                        message={generateError}
                        showUpgradeCta
                        onDismiss={() => {
                          setGenerateError(null);
                          setShowLimitUpgradeCta(false);
                        }}
                        dismissLabel={t("contentPlan.retry")}
                      />
                    </div>
                  )}
                  {generateError && !showLimitUpgradeCta && (
                    <div className="mt-4 rounded-lg border border-saas-warning/40 bg-saas-warning/10 p-4 text-start">
                      <p className="text-sm text-saas-warning">{generateError}</p>
                      {planExistsConflict && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setPlanExistsConflict(null);
                              setGenerateError(null);
                              const plan = plans.find(
                                (p) => p.month === planExistsConflict.month && p.year === planExistsConflict.year
                              );
                              if (plan) setSelectedPlanId(plan.id);
                            }}
                            className="rounded-lg border border-saas-border bg-saas-card px-3 py-1.5 text-sm font-medium text-saas-fg hover:bg-saas-sidebar-hover"
                          >
                            {t("contentPlan.viewPlan")}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRegenerateConfirm(planExistsConflict);
                              setPlanExistsConflict(null);
                              setGenerateError(null);
                            }}
                            className="rounded-lg bg-saas-warning px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
                          >
                            {t("contentPlan.regenerate")}
                          </button>
                        </div>
                      )}
                      {!planExistsConflict && (
                        <button
                          type="button"
                          onClick={() => setGenerateError(null)}
                          className="mt-2 text-sm font-medium text-saas-warning underline hover:no-underline"
                        >
                          {t("contentPlan.retry")}
                        </button>
                      )}
                    </div>
                  )}

                  {plans.length === 0 ? (
                    <div className="mt-6 rounded-lg border border-dashed border-saas-border bg-saas-bg/50 p-8 text-center">
                      <p className="text-sm text-saas-muted">
                        {t("contentPlan.noPlans")}
                      </p>
                      <p className="mt-1 text-sm text-saas-muted/80">
                        {t("contentPlan.noPlansCta")}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mt-6 flex flex-wrap gap-2">
                        {plans.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setSelectedPlanId(p.id)}
                            className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                              selectedPlanId === p.id
                                ? "border-saas-primary bg-saas-primary text-white"
                                : "border-saas-border bg-saas-card text-saas-fg hover:bg-saas-sidebar-hover"
                            }`}
                          >
                            {new Date(p.year, p.month - 1).toLocaleDateString(locale === "ar" ? "ar" : "en", { month: "long", year: "numeric" })}
                          </button>
                        ))}
                      </div>

                      {selectedPlan && (
                        <div className="mt-6">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="text-base font-medium text-saas-fg">
                              {new Date(selectedPlan.year, selectedPlan.month - 1).toLocaleDateString(locale === "ar" ? "ar" : "en", { month: "long", year: "numeric" })}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleExportExcel(selectedPlan.id)}
                                disabled={exportLoading}
                                className="rounded-lg border border-saas-border bg-saas-card px-3 py-1.5 text-sm font-medium text-saas-fg hover:bg-saas-sidebar-hover disabled:opacity-50"
                              >
                                {exportLoading ? (
                                  <>
                                    <span className="me-1.5 inline-block size-4 animate-spin rounded-full border-2 border-saas-border border-t-saas-primary" aria-hidden />
                                    {t("contentPlan.exporting")}
                                  </>
                                ) : (
                                  t("contentPlan.exportToExcel")
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => { setDeletePlanId(selectedPlan.id); setDeletePlanError(null); }}
                                className="rounded-lg border border-saas-danger/40 px-3 py-1.5 text-sm font-medium text-saas-danger hover:bg-saas-danger/10"
                              >
                                {t("contentPlan.deletePlan")}
                              </button>
                            </div>
                          </div>

                          {exportError && (
                            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-saas-danger/30 bg-saas-danger/10 p-3 text-start text-sm text-saas-danger">
                              <span>{exportError}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setExportError(null);
                                  handleExportExcel(selectedPlan.id);
                                }}
                                className="font-medium underline hover:no-underline"
                              >
                                {t("contentPlan.retry")}
                              </button>
                            </div>
                          )}

                          {selectedPlan.items.length === 0 ? (
                            <p className="mt-4 text-sm text-saas-muted">
                              {t("contentPlan.noItems")}
                            </p>
                          ) : (
                            <div className="mt-4 overflow-x-auto">
                              <table className="w-full min-w-[600px] border-collapse text-start text-sm">
                                <thead>
                                  <tr className="border-b border-saas-border">
                                    <th className="py-2 pe-4 font-medium text-saas-muted">
                                      {t("contentPlan.date")}
                                    </th>
                                    <th className="py-2 pe-4 font-medium text-saas-muted">
                                      {t("contentPlan.idea")}
                                    </th>
                                    <th className="py-2 pe-4 font-medium text-saas-muted">
                                      {t("contentPlan.copy")}
                                    </th>
                                    <th className="py-2 pe-4 font-medium text-saas-muted">
                                      {t("contentPlan.contentType")}
                                    </th>
                                    <th className="py-2 pe-4 font-medium text-saas-muted">
                                      {t("contentPlan.objective")}
                                    </th>
                                    <th className="w-16 py-2 pe-2" aria-label={t("contentPlan.edit")} />
                                  </tr>
                                </thead>
                                <tbody>
                                  {selectedPlan.items.map((item) => (
                                    <tr
                                      key={item.id}
                                      className="border-b border-saas-border/60"
                                    >
                                      <td className="py-3 pe-4 text-saas-fg">
                                        {new Date(item.publishDate).toLocaleDateString(locale === "ar" ? "ar" : "en")}
                                      </td>
                                      <td className="max-w-[180px] truncate py-3 pe-4 text-saas-fg" title={item.postIdea}>
                                        {item.postIdea || "—"}
                                      </td>
                                      <td className="max-w-[180px] truncate py-3 pe-4 text-saas-fg" title={item.postCopy}>
                                        {item.postCopy || "—"}
                                      </td>
                                      <td className="py-3 pe-4 text-saas-muted">
                                        {t(`contentPlan.contentTypes.${item.contentType}`)}
                                      </td>
                                      <td className="max-w-[120px] truncate py-3 pe-4 text-saas-muted" title={item.objective ?? ""}>
                                        {item.objective || "—"}
                                      </td>
                                      <td className="py-3 pe-2">
                                        <button
                                          type="button"
                                          onClick={() => openEditItemModal(item, selectedPlan.id)}
                                          className="rounded-lg border border-saas-border bg-saas-card px-2 py-1 text-xs font-medium text-saas-fg hover:bg-saas-sidebar-hover"
                                        >
                                          {t("contentPlan.edit")}
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </section>

            <DesignGenerationSection
              projectId={id}
              token={token}
              planItems={
                selectedPlan?.items.map((item) => ({
                  id: item.id,
                  label: item.postIdea?.trim() ? item.postIdea.slice(0, 50) + (item.postIdea.length > 50 ? "…" : "") : undefined,
                })) ?? []
              }
              onSuccess={(msg) => {
                setContentPlanSuccess(msg);
                setTimeout(() => setContentPlanSuccess(null), 3000);
              }}
            />
          </>
        ) : (
          <section className="rounded-xl border border-saas-border bg-saas-card p-6 shadow-sm">
            <h2 className="text-start text-lg font-semibold text-saas-fg">
              {t("editProject")}
            </h2>
            <div className="mt-4">
              <ProjectForm
                initialValues={{
                  name: project.name,
                  country: project.country,
                  field: project.field,
                  description: project.description,
                  strengths: project.strengths ?? "",
                }}
                onSubmit={handleEditSubmit}
                submitting={editSubmitting}
                errors={editErrors}
                apiError={editApiError}
                onCancel={() => {
                  setEditing(false);
                  setEditErrors({});
                  setEditApiError(null);
                }}
              />
            </div>
          </section>
        )}

        {/* Regenerate plan confirmation */}
        {regenerateConfirm && (
          <div
            className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="regenerate-dialog-title"
          >
            <div className="w-full max-w-md rounded-xl border border-saas-border bg-saas-card p-6 text-start shadow-lg">
              <h2 id="regenerate-dialog-title" className="text-lg font-semibold text-saas-fg">
                {t("contentPlan.regenerate")}
              </h2>
              <p className="mt-2 text-sm text-saas-muted">
                {t("contentPlan.regenerateConfirm", {
                  monthYear: new Date(regenerateConfirm.year, regenerateConfirm.month - 1).toLocaleDateString(locale === "ar" ? "ar" : "en", { month: "long", year: "numeric" }),
                })}
              </p>
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => !regenerateLoading && setRegenerateConfirm(null)}
                  disabled={regenerateLoading}
                  className="rounded-lg border border-saas-border bg-saas-card px-4 py-2 text-sm font-medium text-saas-fg hover:bg-saas-sidebar-hover disabled:opacity-50"
                >
                  {t("contentPlan.cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleRegenerateConfirm}
                  disabled={regenerateLoading}
                  className="rounded-lg bg-saas-warning px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  {regenerateLoading ? t("contentPlan.generating") : t("contentPlan.regenerate")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit plan item modal */}
        {editItem && editItemPlanId && editItemForm && (
          <div
            className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-item-dialog-title"
          >
            <div className="w-full max-w-lg rounded-xl border border-saas-border bg-saas-card p-6 text-start shadow-lg">
              <h2 id="edit-item-dialog-title" className="text-lg font-semibold text-saas-fg">
                {t("contentPlan.edit")}
              </h2>
              {editItemError && (
                <p className="mt-2 text-sm text-saas-danger">{editItemError}</p>
              )}
              <div className="mt-4 grid gap-4">
                <div>
                  <label htmlFor="edit-item-date" className="block text-sm font-medium text-saas-fg">
                    {t("contentPlan.date")}
                  </label>
                  <input
                    id="edit-item-date"
                    type="date"
                    value={editItemForm.publishDate}
                    onChange={(e) => setEditItemForm((f) => (f ? { ...f, publishDate: e.target.value } : null))}
                    className="ms-0 mt-1 block w-full rounded-lg border border-saas-border bg-saas-bg px-3 py-2 text-sm text-saas-fg focus:border-saas-primary focus:outline-none focus:ring-1 focus:ring-saas-primary"
                  />
                </div>
                <div>
                  <label htmlFor="edit-item-idea" className="block text-sm font-medium text-saas-fg">
                    {t("contentPlan.idea")}
                  </label>
                  <textarea
                    id="edit-item-idea"
                    rows={2}
                    value={editItemForm.postIdea}
                    onChange={(e) => setEditItemForm((f) => (f ? { ...f, postIdea: e.target.value } : null))}
                    className="ms-0 mt-1 block w-full rounded-lg border border-saas-border bg-saas-bg px-3 py-2 text-sm text-saas-fg focus:border-saas-primary focus:outline-none focus:ring-1 focus:ring-saas-primary"
                  />
                </div>
                <div>
                  <label htmlFor="edit-item-copy" className="block text-sm font-medium text-saas-fg">
                    {t("contentPlan.copy")}
                  </label>
                  <textarea
                    id="edit-item-copy"
                    rows={3}
                    value={editItemForm.postCopy}
                    onChange={(e) => setEditItemForm((f) => (f ? { ...f, postCopy: e.target.value } : null))}
                    className="ms-0 mt-1 block w-full rounded-lg border border-saas-border bg-saas-bg px-3 py-2 text-sm text-saas-fg focus:border-saas-primary focus:outline-none focus:ring-1 focus:ring-saas-primary"
                  />
                </div>
                <div>
                  <label htmlFor="edit-item-type" className="block text-sm font-medium text-saas-fg">
                    {t("contentPlan.contentType")}
                  </label>
                  <select
                    id="edit-item-type"
                    value={editItemForm.contentType}
                    onChange={(e) => setEditItemForm((f) => (f ? { ...f, contentType: e.target.value as ContentPlanItemType } : null))}
                    className="ms-0 mt-1 block w-full rounded-lg border border-saas-border bg-saas-bg px-3 py-2 text-sm text-saas-fg focus:border-saas-primary focus:outline-none focus:ring-1 focus:ring-saas-primary"
                  >
                    {(["educational", "promotional", "introductory", "success_story"] as const).map((ct) => (
                      <option key={ct} value={ct}>
                        {t(`contentPlan.contentTypes.${ct}`)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="edit-item-objective" className="block text-sm font-medium text-saas-fg">
                    {t("contentPlan.objective")}
                  </label>
                  <input
                    id="edit-item-objective"
                    type="text"
                    value={editItemForm.objective}
                    onChange={(e) => setEditItemForm((f) => (f ? { ...f, objective: e.target.value } : null))}
                    className="ms-0 mt-1 block w-full rounded-lg border border-saas-border bg-saas-bg px-3 py-2 text-sm text-saas-fg focus:border-saas-primary focus:outline-none focus:ring-1 focus:ring-saas-primary"
                  />
                </div>
              </div>
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => !editItemSaving && (setEditItem(null), setEditItemPlanId(null), setEditItemForm(null))}
                  disabled={editItemSaving}
                  className="rounded-lg border border-saas-border bg-saas-card px-4 py-2 text-sm font-medium text-saas-fg hover:bg-saas-sidebar-hover disabled:opacity-50"
                >
                  {t("contentPlan.cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditItem}
                  disabled={editItemSaving}
                  className="rounded-lg bg-saas-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-saas-primary-hover disabled:opacity-50"
                >
                  {editItemSaving ? "…" : t("contentPlan.save")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete plan confirmation */}
        {deletePlanId && (
          <div
            className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-plan-dialog-title"
          >
            <div className="w-full max-w-md rounded-xl border border-saas-border bg-saas-card p-6 text-start shadow-lg">
              <h2 id="delete-plan-dialog-title" className="text-lg font-semibold text-saas-fg">
                {t("contentPlan.deletePlan")}
              </h2>
              <p className="mt-2 text-sm text-saas-muted">
                {t("contentPlan.deletePlanConfirm")}
              </p>
              {deletePlanError && (
                <p className="mt-3 text-sm text-saas-danger">{deletePlanError}</p>
              )}
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { if (!deletePlanSubmitting) { setDeletePlanId(null); setDeletePlanError(null); } }}
                  disabled={deletePlanSubmitting}
                  className="rounded-lg border border-saas-border bg-saas-card px-4 py-2 text-sm font-medium text-saas-fg hover:bg-saas-sidebar-hover disabled:opacity-50"
                >
                  {t("contentPlan.cancel")}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePlan(deletePlanId)}
                  disabled={deletePlanSubmitting}
                  className="rounded-lg bg-saas-danger px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  {deletePlanSubmitting ? "…" : t("delete")}
                </button>
              </div>
            </div>
          </div>
        )}

        <DeleteProjectModal
          open={deleteConfirmOpen}
          submitting={deleteSubmitting}
          onClose={() => setDeleteConfirmOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      </main>
    </div>
  );
}
