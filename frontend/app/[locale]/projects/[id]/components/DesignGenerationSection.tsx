"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { getApiUrl } from "@/lib/api";
import { downloadAsset as downloadAssetHelper } from "@/lib/downloads";
import { parse403Response } from "@/lib/limit-errors";
import { LimitReachedAlert } from "@/components/LimitReachedAlert";

export type DesignAsset = {
  id: string;
  filePath: string;
  contentPlanItemId: string | null;
  kind: string;
  mimeType: string | null;
  createdAt: string;
  url?: string;
};

type PlanItemForDesign = { id: string; label?: string };

type DesignGenerationSectionProps = {
  projectId: string;
  token: string | null;
  /** Plan items to show checkboxes for (current plan). When empty, generate form is hidden or disabled. */
  planItems: PlanItemForDesign[];
  onSuccess?: (message: string) => void;
};

export function DesignGenerationSection({
  projectId,
  token,
  planItems,
  onSuccess,
}: DesignGenerationSectionProps) {
  const t = useTranslations("projects.designs");
  const tLimits = useTranslations("limits");

  const [assets, setAssets] = useState<DesignAsset[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [assetsError, setAssetsError] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [showLimitUpgradeCta, setShowLimitUpgradeCta] = useState(false);

  const [downloadAllLoading, setDownloadAllLoading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    if (!projectId || !token) return;
    setAssetsError(null);
    setAssetsLoading(true);
    try {
      const res = await apiFetch(`/api/v1/designs/${projectId}/assets`, { token });
      if (!res.ok) {
        setAssetsError(t("error"));
        setAssets([]);
        return;
      }
      const data = await res.json();
      const list = (data.assets ?? []) as DesignAsset[];
      setAssets(list);
    } catch {
      setAssetsError(t("error"));
      setAssets([]);
    } finally {
      setAssetsLoading(false);
    }
  }, [projectId, token, t]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  useEffect(() => {
    if (planItems.length > 0) {
      setSelectedIds(new Set(planItems.map((i) => i.id)));
    } else {
      setSelectedIds(new Set());
    }
  }, [planItems]);

  const generatedPosts = assets.filter((a) => a.kind === "generated_post");
  const planItemIds = new Set(planItems.map((i) => i.id));
  const planScopedAssets = generatedPosts.filter(
    (a) => a.contentPlanItemId && planItemIds.has(a.contentPlanItemId)
  );

  function toggleItem(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selectedIds.size === planItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(planItems.map((i) => i.id)));
    }
  }

  async function handleGenerate() {
    if (!projectId || !token || selectedIds.size === 0) return;
    setGenerateError(null);
    setShowLimitUpgradeCta(false);
    setGenerateLoading(true);
    try {
      const res = await apiFetch(`/api/v1/designs/${projectId}/generate`, {
        token,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentPlanItemIds: Array.from(selectedIds),
          replaceExisting: false,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 201) {
        await fetchAssets();
        onSuccess?.(t("success"));
        setGenerateError(null);
        return;
      }
      if (res.status === 403) {
        const parsed = parse403Response(data);
        if (parsed.isLimitReached) {
          setGenerateError(parsed.message ?? t("designsLimitReached"));
          setShowLimitUpgradeCta(true);
          return;
        }
        setGenerateError(tLimits("accessDenied"));
        return;
      }
      if (res.status === 400) {
        setGenerateError(typeof data?.error === "string" ? data.error : t("error"));
        return;
      }
      setGenerateError(t("error"));
    } catch {
      setGenerateError(t("error"));
    } finally {
      setGenerateLoading(false);
    }
  }

  function thumbnailUrl(asset: DesignAsset): string {
    const base = getApiUrl().replace(/\/$/, "");
    return `${base}/uploads/${asset.filePath}`;
  }

  async function downloadAsset(asset: DesignAsset) {
    if (!token) return;
    setDownloadError(null);
    try {
      const fallback =
        asset.kind === "logo" ? "logo.png" : `design-${asset.id.slice(0, 8)}.png`;
      await downloadAssetHelper(asset.id, { token, filename: fallback });
    } catch {
      setDownloadError(t("downloadFailed"));
    }
  }

  async function handleDownloadAllPlan() {
    if (planScopedAssets.length === 0 || !token) return;
    setDownloadError(null);
    setDownloadAllLoading(true);
    try {
      for (let i = 0; i < planScopedAssets.length; i++) {
        await downloadAssetHelper(planScopedAssets[i].id, {
          token,
          filename: `design-${planScopedAssets[i].id.slice(0, 8)}.png`,
        });
        if (i < planScopedAssets.length - 1) {
          await new Promise((r) => setTimeout(r, 300));
        }
      }
    } catch {
      setDownloadError(t("downloadFailed"));
    } finally {
      setDownloadAllLoading(false);
    }
  }

  async function handleDownloadAllProject() {
    if (assets.length === 0 || !token) return;
    setDownloadError(null);
    setDownloadAllLoading(true);
    try {
      for (let i = 0; i < assets.length; i++) {
        const a = assets[i];
        const fallback = a.kind === "logo" ? "logo.png" : `design-${a.id.slice(0, 8)}.png`;
        await downloadAssetHelper(a.id, { token, filename: fallback });
        if (i < assets.length - 1) {
          await new Promise((r) => setTimeout(r, 300));
        }
      }
    } catch {
      setDownloadError(t("downloadFailed"));
    } finally {
      setDownloadAllLoading(false);
    }
  }

  const canGenerate = planItems.length > 0 && selectedIds.size > 0 && !generateLoading;

  return (
    <section
      className="mt-8 rounded-xl border border-saas-border bg-saas-card p-6 text-start shadow-sm"
      aria-labelledby="designs-heading"
    >
      <h2
        id="designs-heading"
        className="text-lg font-semibold text-saas-fg"
      >
        {t("sectionTitle")}
      </h2>

      {planItems.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-saas-fg">
            {t("selectPlanItems")}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-saas-fg">
              <input
                type="checkbox"
                checked={selectedIds.size === planItems.length}
                onChange={toggleAll}
                className="rounded border-saas-border text-saas-primary focus:ring-saas-primary"
              />
              {t("allItems")}
            </label>
            {planItems.map((item) => (
              <label
                key={item.id}
                className="flex cursor-pointer items-center gap-2 text-sm text-saas-fg"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(item.id)}
                  onChange={() => toggleItem(item.id)}
                  className="rounded border-saas-border text-saas-primary focus:ring-saas-primary"
                />
                <span className="truncate max-w-[180px]" title={item.label ?? item.id}>
                  {item.label ?? `${item.id.slice(0, 8)}…`}
                </span>
              </label>
            ))}
          </div>
          <div className="mt-3">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="rounded-lg bg-saas-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-saas-primary-hover disabled:opacity-50"
            >
              {generateLoading ? t("generatingDesigns") : t("generateDesigns")}
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
                dismissLabel={t("retry")}
              />
            </div>
          )}
          {generateError && !showLimitUpgradeCta && (
            <div className="mt-4 rounded-lg border border-saas-warning/40 bg-saas-warning/10 p-3 text-start text-sm text-saas-warning">
              <p>{generateError}</p>
              <button
                type="button"
                onClick={() => setGenerateError(null)}
                className="mt-2 text-sm font-medium underline hover:no-underline"
              >
                {t("retry")}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        {(generatedPosts.length > 0 || assets.length > 0) && (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm text-saas-muted">
              {generatedPosts.length === 1
                ? t("designCountOne")
                : t("designCount", { count: generatedPosts.length })}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {planScopedAssets.length > 0 && (
                <button
                  type="button"
                  onClick={handleDownloadAllPlan}
                  disabled={downloadAllLoading}
                  className="rounded-lg border border-saas-border bg-saas-card px-3 py-1.5 text-sm font-medium text-saas-fg hover:bg-saas-sidebar-hover disabled:opacity-50"
                  aria-label={t("downloadAllForPlan")}
                >
                  {downloadAllLoading ? t("preparingDownload") : t("downloadAllForPlan")}
                </button>
              )}
              {assets.length > 0 && (
                <button
                  type="button"
                  onClick={handleDownloadAllProject}
                  disabled={downloadAllLoading}
                  className="rounded-lg border border-saas-border bg-saas-card px-3 py-1.5 text-sm font-medium text-saas-fg hover:bg-saas-sidebar-hover disabled:opacity-50"
                  aria-label={t("downloadAllForProject")}
                >
                  {downloadAllLoading ? t("preparingDownload") : t("downloadAllForProject")}
                </button>
              )}
            </div>
          </div>
        )}
        {downloadError && (
          <div
            className="mb-3 rounded-lg border border-saas-danger/30 bg-saas-danger/10 p-3 text-start text-sm text-saas-danger"
            role="alert"
          >
            {downloadError}
            <button
              type="button"
              onClick={() => setDownloadError(null)}
              className="ms-2 font-medium underline hover:no-underline"
            >
              {t("retry")}
            </button>
          </div>
        )}

        {assetsLoading && (
          <div className="flex items-center gap-2 text-saas-muted">
            <span className="size-5 animate-spin rounded-full border-2 border-saas-border border-t-saas-primary" aria-hidden />
            <span className="text-sm">{t("loading")}</span>
          </div>
        )}

        {!assetsLoading && assetsError && (
          <div className="rounded-lg border border-saas-danger/30 bg-saas-danger/10 p-4 text-start">
            <p className="text-sm text-saas-danger">{assetsError}</p>
            <button
              type="button"
              onClick={() => fetchAssets()}
              className="mt-2 text-sm font-medium text-saas-danger underline hover:no-underline"
            >
              {t("retry")}
            </button>
          </div>
        )}

        {!assetsLoading && !assetsError && generatedPosts.length === 0 && (
          <div className="rounded-lg border border-dashed border-saas-border bg-saas-bg/50 p-6 text-center">
            <p className="text-sm text-saas-muted">{t("noDesignsYet")}</p>
            <p className="mt-1 text-sm text-saas-muted/80">{t("noDesignsYetCta")}</p>
          </div>
        )}

        {!assetsLoading && !assetsError && generatedPosts.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {generatedPosts.map((asset) => (
              <div
                key={asset.id}
                className="flex flex-col overflow-hidden rounded-lg border border-saas-border"
              >
                <div className="relative aspect-square bg-saas-bg">
                  <img
                    src={thumbnailUrl(asset)}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.onerror = null;
                      target.style.display = "none";
                      const wrap = target.closest(".relative");
                      const placeholder = wrap?.querySelector(".thumbnail-placeholder");
                      if (placeholder instanceof HTMLElement) placeholder.style.display = "flex";
                    }}
                  />
                  <div
                    className="thumbnail-placeholder absolute inset-0 hidden items-center justify-center bg-saas-border/60"
                    style={{ display: "none" }}
                    aria-hidden
                  >
                    <span className="text-3xl text-saas-muted">🖼</span>
                  </div>
                </div>
                <div className="flex justify-end p-2">
                  <button
                    type="button"
                    onClick={() => downloadAsset(asset)}
                    className="rounded-lg border border-saas-border bg-saas-card px-2 py-1 text-xs font-medium text-saas-fg hover:bg-saas-sidebar-hover"
                    aria-label={t("download")}
                  >
                    {t("download")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
