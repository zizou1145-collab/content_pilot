"use client";

import { useTranslations } from "next-intl";
import { useState, useRef, useEffect, useCallback } from "react";
import { apiFetch, getApiUrl } from "@/lib/api";
import { downloadAsset as downloadAssetHelper } from "@/lib/downloads";

const ACCEPT_IMAGES = "image/jpeg,image/png,image/gif,image/webp";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;

export type BrandProject = {
  id: string;
  logoUrl: string | null;
  brandColors: string | null;
  theme: string | null;
  referencePostUrl: string | null;
};

function parseBrandColors(s: string | null): { primary: string; secondary: string } {
  if (!s || !s.trim()) return { primary: "", secondary: "" };
  try {
    const o = JSON.parse(s) as Record<string, unknown>;
    const primary = typeof o?.primary === "string" ? o.primary : "";
    const secondary = typeof o?.secondary === "string" ? o.secondary : "";
    return { primary: HEX_REGEX.test(primary) ? primary : "", secondary: HEX_REGEX.test(secondary) ? secondary : "" };
  } catch {
    return { primary: "", secondary: "" };
  }
}

type BrandSettingsSectionProps = {
  project: BrandProject;
  onProjectUpdate: (updates: Partial<BrandProject>) => void;
  token: string | null;
  saveSuccessMessage: (msg: string) => void;
  saveErrorMessage: (msg: string) => void;
};

export function BrandSettingsSection({
  project,
  onProjectUpdate,
  token,
  saveSuccessMessage,
  saveErrorMessage,
}: BrandSettingsSectionProps) {
  const t = useTranslations("projects.brand");
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState(() => parseBrandColors(project.brandColors).primary || "#2563eb");
  const [secondaryColor, setSecondaryColor] = useState(() => parseBrandColors(project.brandColors).secondary || "#64748b");
  const [theme, setTheme] = useState(project.theme ?? "");
  const [referencePostUrl, setReferencePostUrl] = useState(project.referencePostUrl ?? "");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [colorErrors, setColorErrors] = useState<{ primary?: string; secondary?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoAssetId, setLogoAssetId] = useState<string | null>(null);
  const [logoDownloadError, setLogoDownloadError] = useState<string | null>(null);

  const tDesigns = useTranslations("projects.designs");

  const fetchLogoAssetId = useCallback(async () => {
    if (!project.id || !project.logoUrl || !token) return;
    try {
      const res = await apiFetch(`/api/v1/designs/${project.id}/assets`, { token });
      if (!res.ok) return;
      const data = await res.json();
      const list = (data.assets ?? []) as { id: string; kind: string }[];
      const logo = list.find((a) => a.kind === "logo");
      setLogoAssetId(logo?.id ?? null);
    } catch {
      setLogoAssetId(null);
    }
  }, [project.id, project.logoUrl, token]);

  useEffect(() => {
    if (project.logoUrl) fetchLogoAssetId();
    else setLogoAssetId(null);
  }, [project.logoUrl, fetchLogoAssetId]);

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token || !project.id) return;
    setLogoError(null);
    if (file.size > MAX_FILE_SIZE) {
      setLogoError(t("fileTooLarge"));
      e.target.value = "";
      return;
    }
    setLogoUploading(true);
    try {
      const formData = new FormData();
      formData.append("logo", file);
      const res = await apiFetch(`/api/v1/designs/${project.id}/logo`, {
        token,
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 201 && data.logoUrl) {
        onProjectUpdate({ logoUrl: data.logoUrl });
        saveSuccessMessage(t("uploadSuccess"));
      } else if (res.status === 400) {
        const msg = typeof data?.error === "string" ? data.error : t("uploadError");
        setLogoError(/only images|invalid type/i.test(String(msg)) ? t("onlyImagesAllowed") : msg);
      } else {
        setLogoError(t("uploadError"));
      }
    } catch {
      setLogoError(t("uploadError"));
    } finally {
      setLogoUploading(false);
      e.target.value = "";
    }
  }

  async function handleSaveBrand() {
    if (!token || !project.id) return;
    const primary = primaryColor.trim();
    const secondary = secondaryColor.trim();
    const errs: { primary?: string; secondary?: string } = {};
    if (primary && !HEX_REGEX.test(primary)) errs.primary = t("invalidHex");
    if (secondary && !HEX_REGEX.test(secondary)) errs.secondary = t("invalidHex");
    if (Object.keys(errs).length > 0) {
      setColorErrors(errs);
      return;
    }
    setColorErrors({});
    setSaveError(null);
    setSaveLoading(true);
    try {
      const body: { brandColors?: string; theme?: string; referencePostUrl?: string } = {};
      if (primary || secondary) {
        body.brandColors = JSON.stringify({ primary: primary || undefined, secondary: secondary || undefined });
      }
      if (theme.trim()) body.theme = theme.trim();
      if (referencePostUrl.trim()) body.referencePostUrl = referencePostUrl.trim();
      const res = await apiFetch(`/api/v1/projects/${project.id}`, {
        token,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 200 && data.project) {
        const p = data.project as BrandProject;
        onProjectUpdate({
          brandColors: p.brandColors ?? null,
          theme: p.theme ?? null,
          referencePostUrl: p.referencePostUrl ?? null,
        });
        setPrimaryColor(parseBrandColors(p.brandColors).primary || primary || "#2563eb");
        setSecondaryColor(parseBrandColors(p.brandColors).secondary || secondary || "#64748b");
        setTheme(p.theme ?? "");
        setReferencePostUrl(p.referencePostUrl ?? "");
        saveSuccessMessage(t("brandSaved"));
        setSaveError(null);
      } else if (res.status === 400) {
        setSaveError(typeof data?.error === "string" ? data.error : t("validationFailed"));
      } else if (res.status === 404) {
        setSaveError(t("projectNotFound"));
      } else {
        setSaveError(t("somethingWentWrong"));
      }
    } catch {
      setSaveError(t("somethingWentWrong"));
    } finally {
      setSaveLoading(false);
    }
  }

  const logoSrc = project.logoUrl ? `${getApiUrl()}/uploads/${project.logoUrl}` : null;

  async function handleDownloadLogo() {
    if (!logoAssetId || !token) return;
    setLogoDownloadError(null);
    try {
      await downloadAssetHelper(logoAssetId, { token, filename: "logo.png" });
    } catch {
      setLogoDownloadError(tDesigns("downloadFailed"));
    }
  }

  return (
    <section
      className="mt-8 rounded-xl border border-saas-border bg-saas-card p-6 text-start shadow-sm"
      aria-labelledby="brand-settings-heading"
    >
      <h2
        id="brand-settings-heading"
        className="text-lg font-semibold text-saas-fg"
      >
        {t("brandSettings")}
      </h2>

      {/* Logo */}
      <div className="mt-4 flex flex-wrap items-start gap-6">
        <div className="flex flex-col items-start gap-2">
          {logoSrc ? (
            <>
              <img
                src={logoSrc}
                alt=""
                className="h-24 w-24 rounded-lg border border-saas-border object-contain"
              />
              {logoAssetId && (
                <button
                  type="button"
                  onClick={handleDownloadLogo}
                  className="rounded-lg border border-saas-border bg-saas-card px-2 py-1 text-xs font-medium text-saas-fg hover:bg-saas-sidebar-hover"
                  aria-label={tDesigns("download")}
                >
                  {tDesigns("download")}
                </button>
              )}
            </>
          ) : (
            <div
              className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed border-saas-border bg-saas-bg text-center text-xs text-saas-muted"
              aria-hidden
            >
              {t("logoPlaceholder")}
            </div>
          )}
          {logoDownloadError && (
            <p className="text-sm text-saas-danger" role="alert">
              {logoDownloadError}
            </p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_IMAGES}
            onChange={handleLogoChange}
            disabled={logoUploading}
            className="block w-full max-w-xs text-sm file:me-2 file:rounded-lg file:border-0 file:bg-saas-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-saas-primary"
            aria-label={t("uploadLogo")}
          />
          {logoUploading && (
            <span className="flex items-center gap-1.5 text-sm text-saas-muted">
              <span className="size-4 animate-spin rounded-full border-2 border-saas-border border-t-saas-primary" aria-hidden />
              {t("uploading")}
            </span>
          )}
          {logoError && (
            <p className="text-sm text-saas-danger" role="alert">
              {logoError}
            </p>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          {/* Brand colors */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="brand-primary-color" className="block text-sm font-medium text-saas-fg">
                {t("primaryColor")}
              </label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  id="brand-primary-color"
                  type="color"
                  value={primaryColor || "#2563eb"}
                  onChange={(e) => {
                    setPrimaryColor(e.target.value);
                    setColorErrors((prev) => ({ ...prev, primary: undefined }));
                  }}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-saas-border"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => {
                    setPrimaryColor(e.target.value);
                    setColorErrors((prev) => ({ ...prev, primary: undefined }));
                  }}
                  placeholder="#2563eb"
                  className="w-28 rounded-lg border border-saas-border bg-saas-bg px-2 py-1.5 text-sm text-saas-fg focus:border-saas-primary focus:outline-none focus:ring-1 focus:ring-saas-primary"
                />
              </div>
              {colorErrors.primary && (
                <p className="mt-0.5 text-sm text-saas-danger">{colorErrors.primary}</p>
              )}
            </div>
            <div>
              <label htmlFor="brand-secondary-color" className="block text-sm font-medium text-saas-fg">
                {t("secondaryColor")}
              </label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  id="brand-secondary-color"
                  type="color"
                  value={secondaryColor || "#64748b"}
                  onChange={(e) => {
                    setSecondaryColor(e.target.value);
                    setColorErrors((prev) => ({ ...prev, secondary: undefined }));
                  }}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-saas-border"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => {
                    setSecondaryColor(e.target.value);
                    setColorErrors((prev) => ({ ...prev, secondary: undefined }));
                  }}
                  placeholder="#64748b"
                  className="w-28 rounded-lg border border-saas-border bg-saas-bg px-2 py-1.5 text-sm text-saas-fg focus:border-saas-primary focus:outline-none focus:ring-1 focus:ring-saas-primary"
                />
              </div>
              {colorErrors.secondary && (
                <p className="mt-0.5 text-sm text-saas-danger">{colorErrors.secondary}</p>
              )}
            </div>
          </div>

          {/* Theme */}
          <div>
            <label htmlFor="brand-theme" className="block text-sm font-medium text-saas-fg">
              {t("theme")}
            </label>
            <select
              id="brand-theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="ms-0 mt-1 block rounded-lg border border-saas-border bg-saas-bg px-3 py-2 text-sm text-saas-fg focus:border-saas-primary focus:outline-none focus:ring-1 focus:ring-saas-primary"
            >
              <option value="">—</option>
              <option value="minimal">{t("themeMinimal")}</option>
              <option value="bold">{t("themeBold")}</option>
              <option value="professional">{t("themeProfessional")}</option>
              <option value="custom">{t("themeCustom")}</option>
            </select>
          </div>

          {/* Reference URL */}
          <div>
            <label htmlFor="brand-reference-url" className="block text-sm font-medium text-saas-fg">
              {t("referenceImageUrl")}
            </label>
            <input
              id="brand-reference-url"
              type="url"
              value={referencePostUrl}
              onChange={(e) => setReferencePostUrl(e.target.value)}
              placeholder="https://…"
              className="ms-0 mt-1 block w-full rounded-lg border border-saas-border bg-saas-bg px-3 py-2 text-sm text-saas-fg focus:border-saas-primary focus:outline-none focus:ring-1 focus:ring-saas-primary"
            />
            <p className="mt-0.5 text-xs text-saas-muted">{t("referenceImageUrlHint")}</p>
            {referencePostUrl.trim() && (
              <p className="mt-1 text-sm">
                <a
                  href={referencePostUrl.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-saas-primary hover:underline"
                >
                  {referencePostUrl.trim()}
                </a>
              </p>
            )}
          </div>

          {saveError && (
            <p className="text-sm text-saas-danger" role="alert">
              {saveError}
            </p>
          )}

          <button
            type="button"
            onClick={handleSaveBrand}
            disabled={saveLoading}
            className="rounded-lg bg-saas-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-saas-primary-hover disabled:opacity-50"
          >
            {saveLoading ? "…" : t("saveBrand")}
          </button>
        </div>
      </div>
    </section>
  );
}
