"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export type ProjectFormValues = {
  name: string;
  country: string;
  field: string;
  description: string;
  strengths: string;
};

type ProjectFormProps = {
  initialValues?: Partial<ProjectFormValues>;
  onSubmit: (values: ProjectFormValues) => void;
  submitting: boolean;
  errors: Record<string, string>;
  apiError: string | null;
  submitLabel?: string;
  onCancel?: () => void;
};

export function ProjectForm({
  initialValues,
  onSubmit,
  submitting,
  errors,
  apiError,
  submitLabel,
  onCancel,
}: ProjectFormProps) {
  const t = useTranslations("projects");
  const [name, setName] = useState(initialValues?.name ?? "");
  const [country, setCountry] = useState(initialValues?.country ?? "");
  const [field, setField] = useState(initialValues?.field ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [strengths, setStrengths] = useState(initialValues?.strengths ?? "");

  // Sync when initialValues change (e.g. edit mode)
  useEffect(() => {
    if (initialValues) {
      if (initialValues.name !== undefined) setName(initialValues.name);
      if (initialValues.country !== undefined) setCountry(initialValues.country);
      if (initialValues.field !== undefined) setField(initialValues.field);
      if (initialValues.description !== undefined) setDescription(initialValues.description);
      if (initialValues.strengths !== undefined) setStrengths(initialValues.strengths);
    }
  }, [initialValues?.name, initialValues?.country, initialValues?.field, initialValues?.description, initialValues?.strengths]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ name, country, field, description, strengths });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-saas-border bg-saas-card p-6 shadow-sm"
    >
      {apiError && (
        <p className="text-start text-sm text-saas-danger" role="alert">
          {apiError}
        </p>
      )}
      <div>
        <label htmlFor="project-name" className="mb-1 block text-start text-sm font-medium text-saas-fg">
          {t("projectName")}
        </label>
        <input
          id="project-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-saas-border bg-saas-bg px-3 py-2 text-start text-saas-fg focus:border-saas-primary focus:outline-none focus:ring-1 focus:ring-saas-primary"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "project-name-err" : undefined}
        />
        {errors.name && (
          <p id="project-name-err" className="mt-1 text-start text-sm text-saas-danger">
            {errors.name}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="project-country" className="mb-1 block text-start text-sm font-medium text-saas-fg">
          {t("country")}
        </label>
        <input
          id="project-country"
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full rounded-lg border border-saas-border bg-saas-bg px-3 py-2 text-start text-saas-fg focus:border-saas-primary focus:outline-none focus:ring-1 focus:ring-saas-primary"
          aria-invalid={!!errors.country}
          aria-describedby={errors.country ? "project-country-err" : undefined}
        />
        {errors.country && (
          <p id="project-country-err" className="mt-1 text-start text-sm text-saas-danger">
            {errors.country}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="project-field" className="mb-1 block text-start text-sm font-medium text-saas-fg">
          {t("field")}
        </label>
        <input
          id="project-field"
          type="text"
          value={field}
          onChange={(e) => setField(e.target.value)}
          className="w-full rounded-lg border border-saas-border bg-saas-bg px-3 py-2 text-start text-saas-fg focus:border-saas-primary focus:outline-none focus:ring-1 focus:ring-saas-primary"
          aria-invalid={!!errors.field}
          aria-describedby={errors.field ? "project-field-err" : undefined}
        />
        {errors.field && (
          <p id="project-field-err" className="mt-1 text-start text-sm text-saas-danger">
            {errors.field}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="project-description" className="mb-1 block text-start text-sm font-medium text-saas-fg">
          {t("description")}
        </label>
        <textarea
          id="project-description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-saas-border bg-saas-bg px-3 py-2 text-start text-saas-fg focus:border-saas-primary focus:outline-none focus:ring-1 focus:ring-saas-primary"
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? "project-description-err" : undefined}
        />
        {errors.description && (
          <p id="project-description-err" className="mt-1 text-start text-sm text-saas-danger">
            {errors.description}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="project-strengths" className="mb-1 block text-start text-sm font-medium text-saas-fg">
          {t("strengths")}
        </label>
        <textarea
          id="project-strengths"
          rows={2}
          value={strengths}
          onChange={(e) => setStrengths(e.target.value)}
          className="w-full rounded-lg border border-saas-border bg-saas-bg px-3 py-2 text-start text-saas-fg focus:border-saas-primary focus:outline-none focus:ring-1 focus:ring-saas-primary"
          aria-invalid={!!errors.strengths}
          aria-describedby={errors.strengths ? "project-strengths-err" : undefined}
        />
        {errors.strengths && (
          <p id="project-strengths-err" className="mt-1 text-start text-sm text-saas-danger">
            {errors.strengths}
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-saas-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-saas-primary-hover disabled:opacity-50"
        >
          {submitting ? "…" : (submitLabel ?? t("save"))}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-saas-border bg-saas-card px-4 py-2 text-sm font-medium text-saas-fg hover:bg-saas-sidebar-hover"
          >
            {t("cancel")}
          </button>
        )}
      </div>
    </form>
  );
}
