"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";

/* KPI accent colors: Projects blue, Content purple, Designs green, Activity orange */
const KPI_PROJECTS = "#2563EB";
const KPI_CONTENT = "#7C3AED";
const KPI_DESIGNS = "#10B981";
const KPI_ACTIVITY = "#F59E0B";

/* Minimal icons for KPI cards and quick actions */
function IconFolder({ className = "size-5 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );
}
function IconDocument({ className = "size-5 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
function IconImage({ className = "size-5 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
function IconClock({ className = "size-5 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg className="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}
function IconChart() {
  return (
    <svg className="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg className="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export type ProjectItem = {
  id: string;
  name: string;
  country: string;
  field: string;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

type ProjectsResponse = { projects: ProjectItem[] };

function formatDate(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

/** Fetches projects list; returns either projects or error message. */
async function fetchProjects(
  token: string
): Promise<{ projects: ProjectItem[] } | { error: string }> {
  try {
    const res = await apiFetch("/api/v1/projects", { token });
    if (res.status === 401) return { error: "Unauthorized" };
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { error: (data?.error as string) || "Request failed" };
    }
    const data: ProjectsResponse = await res.json();
    return { projects: data.projects ?? [] };
  } catch {
    return { error: "Request failed" };
  }
}

export function DashboardContent() {
  const t = useTranslations("dashboard");
  const { user, token } = useAuth();
  const [projects, setProjects] = useState<ProjectItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setError(null);
    setLoading(true);
    fetchProjects(token).then((result) => {
      if (cancelled) return;
      if ("error" in result) {
        setError(result.error === "Unauthorized" ? null : (result.error ?? t("error")));
        setProjects([]);
      } else {
        setProjects(result.projects);
        setError(null);
      }
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [token, t]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    if (!token) {
      setLoading(false);
      return;
    }
    fetchProjects(token).then((result) => {
      if ("error" in result) {
        setError(result.error === "Unauthorized" ? null : (result.error ?? t("error")));
        setProjects([]);
      } else {
        setProjects(result.projects);
        setError(null);
      }
    }).finally(() => setLoading(false));
  };

  const locale = user?.locale ?? "en";
  const plan = user?.subscriptionPlan ?? "Basic";
  const status = user?.subscriptionStatus ?? "active";
  const statusLabel = status ? status.charAt(0).toUpperCase() + status.slice(1) : t("statusActive");
  const totalProjects = projects?.length ?? 0;
  const contentPlansCount = 0;
  const postDesignsCount = 0;
  const lastActivity =
    projects && projects.length > 0
      ? formatDate(
          projects.reduce((latest, p) => (p.updatedAt > latest ? p.updatedAt : latest), projects[0].updatedAt),
          locale
        )
      : "—";
  const firstProjectId = projects && projects.length > 0 ? projects[0].id : null;

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div
        className="rounded-xl px-1 py-2 -mx-1 -mt-1"
        style={{
          background: "linear-gradient(135deg, rgba(59,130,246,0.05), rgba(139,92,246,0.05))",
        }}
      >
        <h1 className="text-start text-2xl font-bold tracking-tight text-saas-fg lg:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-saas-muted">
          {t("subscription")} · {plan} · {statusLabel}
        </p>
      </div>

      <hr className="section-divider my-0" aria-hidden />

      {/* KPI cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Key metrics">
        <div
          className="card-hover rounded-xl border border-saas-border bg-white p-5 shadow-sm transition-all duration-200 ease-[ease]"
          style={{ borderInlineStartWidth: 4, borderInlineStartStyle: "solid", borderInlineStartColor: KPI_PROJECTS }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-saas-muted">{t("kpiTotalProjects")}</p>
              <p className="mt-1 text-2xl font-semibold text-saas-fg">{totalProjects}</p>
            </div>
            <span
              className="relative flex size-10 shrink-0 items-center justify-center rounded-lg text-white transition-all duration-200 ease-[ease]"
              style={{
                backgroundColor: KPI_PROJECTS,
                boxShadow: "0 0 0 6px rgba(37,99,235,0.15)",
              }}
            >
              <IconFolder className="size-5 shrink-0 relative z-10" />
            </span>
          </div>
        </div>
        <div
          className="card-hover rounded-xl border border-saas-border bg-white p-5 shadow-sm transition-all duration-200 ease-[ease]"
          style={{ borderInlineStartWidth: 4, borderInlineStartStyle: "solid", borderInlineStartColor: KPI_CONTENT }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-saas-muted">{t("kpiContentPlans")}</p>
              <p className="mt-1 text-2xl font-semibold text-saas-fg">{contentPlansCount}</p>
            </div>
            <span
              className="relative flex size-10 shrink-0 items-center justify-center rounded-lg text-white transition-all duration-200 ease-[ease]"
              style={{
                backgroundColor: KPI_CONTENT,
                boxShadow: `0 0 0 6px ${KPI_CONTENT}20`,
              }}
            >
              <IconDocument className="size-5 shrink-0 relative z-10" />
            </span>
          </div>
        </div>
        <div
          className="card-hover rounded-xl border border-saas-border border-l-4 bg-white p-5 shadow-sm transition-all duration-200 ease-[ease]"
          style={{ borderLeftColor: KPI_DESIGNS }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-saas-muted">{t("kpiPostDesigns")}</p>
              <p className="mt-1 text-2xl font-semibold text-saas-fg">{postDesignsCount}</p>
            </div>
            <span
              className="relative flex size-10 shrink-0 items-center justify-center rounded-lg text-white transition-all duration-200 ease-[ease]"
              style={{
                backgroundColor: KPI_DESIGNS,
                boxShadow: "0 0 0 6px rgba(16,185,129,0.15)",
              }}
            >
              <IconImage className="size-5 shrink-0 relative z-10" />
            </span>
          </div>
        </div>
        <div
          className="card-hover rounded-xl border border-saas-border bg-white p-5 shadow-sm transition-all duration-200 ease-[ease]"
          style={{ borderInlineStartWidth: 4, borderInlineStartStyle: "solid", borderInlineStartColor: KPI_ACTIVITY }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-saas-muted">{t("kpiLastActivity")}</p>
              <p className="mt-1 text-lg font-semibold text-saas-fg">{lastActivity}</p>
            </div>
            <span
              className="relative flex size-10 shrink-0 items-center justify-center rounded-lg text-white transition-all duration-200 ease-[ease]"
              style={{
                backgroundColor: KPI_ACTIVITY,
                boxShadow: "0 0 0 6px rgba(245,158,11,0.15)",
              }}
            >
              <IconClock className="size-5 shrink-0 relative z-10" />
            </span>
          </div>
        </div>
      </section>

      <hr className="section-divider my-0" aria-hidden />

      {/* Quick Actions */}
      <section
        className="card-hover rounded-xl border border-saas-border bg-white p-5 shadow-sm transition-all duration-200 ease-[ease]"
        aria-labelledby="quick-actions-heading"
      >
        <h2
          id="quick-actions-heading"
          className="text-start text-sm font-bold uppercase tracking-wide text-saas-muted"
        >
          {t("quickActions")}
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/projects/new"
            className="btn-hover inline-flex items-center gap-2 rounded-lg border border-saas-border bg-white px-4 py-2.5 text-sm font-medium text-saas-fg shadow-sm hover:bg-saas-sidebar-hover hover:border-saas-border"
          >
            <IconPlus />
            {t("quickActionNewProject")}
          </Link>
          <Link
            href={firstProjectId ? `/projects/${firstProjectId}` : "/projects/new"}
            className="btn-hover inline-flex items-center gap-2 rounded-lg border border-saas-border bg-white px-4 py-2.5 text-sm font-medium text-saas-fg shadow-sm hover:bg-saas-sidebar-hover hover:border-saas-border"
          >
            <IconChart />
            {t("quickActionMarketAnalysis")}
          </Link>
          <Link
            href={firstProjectId ? `/projects/${firstProjectId}` : "/projects/new"}
            className="btn-hover inline-flex items-center gap-2 rounded-lg border border-saas-border bg-white px-4 py-2.5 text-sm font-medium text-saas-fg shadow-sm hover:bg-saas-sidebar-hover hover:border-saas-border"
          >
            <IconDocument />
            {t("quickActionContentPlan")}
          </Link>
          <Link
            href={firstProjectId ? `/projects/${firstProjectId}` : "/projects/new"}
            className="btn-hover inline-flex items-center gap-2 rounded-lg border border-saas-border bg-white px-4 py-2.5 text-sm font-medium text-saas-fg shadow-sm hover:bg-saas-sidebar-hover hover:border-saas-border"
          >
            <IconImage />
            {t("quickActionPostDesigns")}
          </Link>
        </div>
      </section>

      <hr className="section-divider my-0" aria-hidden />

      {/* Subscription card */}
      <section
        className="card-hover rounded-xl border border-saas-border bg-white p-5 shadow-sm transition-all duration-200 ease-[ease]"
        aria-labelledby="subscription-heading"
      >
        <h2
          id="subscription-heading"
          className="text-start text-sm font-bold uppercase tracking-wide text-saas-muted"
        >
          {t("subscription")}
        </h2>
        <div className="mt-3 flex flex-wrap gap-6 text-start">
          <div>
            <span className="text-sm text-saas-muted">{t("plan")}: </span>
            <span className="font-semibold text-saas-fg">{plan}</span>
          </div>
          <div>
            <span className="text-sm text-saas-muted">{t("status")}: </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-saas-fg">
              <span className="size-2 rounded-full bg-saas-success" aria-hidden />
              {statusLabel}
            </span>
          </div>
        </div>
      </section>

      <hr className="section-divider my-0" aria-hidden />

      {/* Projects section */}
      <section className="space-y-5" aria-labelledby="projects-heading">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2
            id="projects-heading"
            className="text-start text-xl font-bold text-saas-fg"
          >
            {t("projects")}
          </h2>
          <Link
            href="/projects/new"
            className="btn-hover inline-flex items-center gap-2 rounded-lg bg-saas-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-saas-primary-hover"
          >
            <IconPlus />
            {t("newProject")}
          </Link>
        </div>

        {loading && (
          <div className="flex items-center gap-3 rounded-xl border border-saas-border bg-white p-6 text-saas-muted shadow-sm">
            <span className="size-6 animate-spin rounded-full border-2 border-saas-border border-t-saas-primary" />
            <span className="text-sm">{t("loading")}</span>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-saas-danger/30 bg-white p-4 text-start shadow-sm">
            <p className="text-sm text-saas-danger">{error}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="btn-hover mt-2 text-sm font-medium text-saas-danger underline hover:no-underline"
            >
              {t("retry")}
            </button>
          </div>
        )}

        {!loading && !error && projects && projects.length === 0 && (
          <div className="rounded-xl border border-saas-border border-dashed bg-white/80 p-10 text-center shadow-sm">
            <p className="text-saas-muted">{t("noProjects")}</p>
            <Link
              href="/projects/new"
              className="btn-hover mt-4 inline-flex items-center gap-2 rounded-lg bg-saas-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-saas-primary-hover"
            >
              <IconPlus />
              {t("noProjectsCta")}
            </Link>
          </div>
        )}

        {!loading && !error && projects && projects.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2" role="list">
            {projects.map((project) => (
              <li key={project.id}>
                <Link
                  href={`/projects/${project.id}`}
                  className="card-hover block rounded-xl border border-saas-border bg-white p-5 shadow-sm transition-all duration-200 ease-[ease] focus:outline-none focus:ring-2 focus:ring-saas-primary focus:ring-offset-2"
                >
                  <div className="text-start">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-saas-fg">
                        {project.name}
                      </p>
                      <span className="rounded-full bg-saas-primary/10 px-2.5 py-0.5 text-xs font-medium text-saas-primary">
                        {t("statusActive")}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-saas-muted">
                      {project.field} · {project.country}
                    </p>
                    <p className="mt-2 text-xs text-saas-muted/80">
                      {t("lastUpdated")}: {formatDate(project.updatedAt, locale)}
                    </p>
                    {/* Progress: Brand → Market Analysis → Content Plan → Post Designs */}
                    <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-saas-success/10 px-2 py-1 text-xs font-medium text-saas-success">
                        <IconCheck className="size-3.5 shrink-0" />
                        {t("progressBrand")}
                      </span>
                      <span className="text-saas-muted/60" aria-hidden>→</span>
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-saas-border/50 px-2 py-1 text-xs text-saas-muted">
                        {t("progressMarketAnalysis")}
                      </span>
                      <span className="text-saas-muted/60" aria-hidden>→</span>
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-saas-border/50 px-2 py-1 text-xs text-saas-muted">
                        {t("progressContentPlan")}
                      </span>
                      <span className="text-saas-muted/60" aria-hidden>→</span>
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-saas-border/50 px-2 py-1 text-xs text-saas-muted">
                        {t("progressPostDesigns")}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
