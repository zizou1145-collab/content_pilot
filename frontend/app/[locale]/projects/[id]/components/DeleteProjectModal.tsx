"use client";

import { useTranslations } from "next-intl";

type DeleteProjectModalProps = {
  open: boolean;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteProjectModal({
  open,
  submitting,
  onClose,
  onConfirm,
}: DeleteProjectModalProps) {
  const t = useTranslations("projects");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div className="w-full max-w-md rounded-xl border border-saas-border bg-saas-card p-6 text-start shadow-lg">
        <h2 id="delete-dialog-title" className="text-lg font-semibold text-saas-fg">
          {t("deleteConfirm")}
        </h2>
        <p className="mt-2 text-sm text-saas-muted">{t("deleteConfirmDetail")}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() => !submitting && onClose()}
            disabled={submitting}
            className="rounded-lg border border-saas-border bg-saas-card px-4 py-2 text-sm font-medium text-saas-fg hover:bg-saas-sidebar-hover disabled:opacity-50"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="rounded-lg bg-saas-danger px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "…" : t("delete")}
          </button>
        </div>
      </div>
    </div>
  );
}
