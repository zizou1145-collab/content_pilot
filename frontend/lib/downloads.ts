/**
 * Shared asset download helper for S4-4.
 * Calls GET /api/v1/designs/asset/:assetId/download with auth and triggers browser download.
 */

import { apiFetch } from "./api";

export type DownloadAssetOptions = {
  token: string | null;
  /** Optional fallback filename when Content-Disposition is missing */
  filename?: string;
};

/**
 * Downloads a single asset by ID. Uses Bearer token; triggers browser download
 * with filename from Content-Disposition or fallback.
 * Rejects with an error message on 403, 404, 5xx or network failure.
 */
export async function downloadAsset(
  assetId: string,
  options: DownloadAssetOptions
): Promise<void> {
  const { token, filename: fallbackFilename } = options;
  if (!token) {
    throw new Error("Not authenticated");
  }

  const res = await apiFetch(`/api/v1/designs/asset/${assetId}/download`, {
    token,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message =
      typeof (data as { error?: string })?.error === "string"
        ? (data as { error: string }).error
        : undefined;
    if (res.status === 403) throw new Error(message ?? "Forbidden");
    if (res.status === 404) throw new Error(message ?? "Asset not found");
    throw new Error(message ?? "Download failed");
  }

  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition");
  let filename = fallbackFilename ?? `asset-${assetId.slice(0, 8)}`;
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
}
