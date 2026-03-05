"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiPath } from "@/lib/api";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterForm() {
  const t = useTranslations("auth");
  const tApp = useTranslations("app");
  const router = useRouter();
  const locale = useLocale();
  const { setAuth, token, isReady } = useAuth();

  useEffect(() => {
    if (isReady && token) {
      router.replace("/dashboard");
    }
  }, [isReady, token, router]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!email.trim()) next.email = t("errors.required");
    else if (!EMAIL_RE.test(email)) next.email = t("errors.emailInvalid");
    if (!password) next.password = t("errors.required");
    else if (password.length < 8) next.password = t("errors.passwordMin");
    if (password !== passwordConfirm) next.passwordConfirm = t("errors.passwordMismatch");
    setErrors(next);
    setApiError(null);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || submitting) return;
    setSubmitting(true);
    setApiError(null);
    try {
      const body: { email: string; password: string; name?: string; locale?: string } = {
        email: email.trim(),
        password,
      };
      if (name.trim()) body.name = name.trim();
      if (locale === "ar" || locale === "en") body.locale = locale;
      const res = await fetch(apiPath("/api/v1/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 201) {
        setAuth(data.token, data.user);
        router.push("/dashboard");
        return;
      }
      if (res.status === 409) {
        setApiError(t("errors.emailAlreadyRegistered"));
        return;
      }
      if (res.status === 400 && Array.isArray(data.errors)) {
        const next: Record<string, string> = {};
        for (const err of data.errors) {
          const field = err.path ?? err.param ?? "form";
          next[field] = err.msg ?? err.message ?? String(err);
        }
        setErrors(next);
        if (Object.keys(next).length === 0) setApiError(data.message || t("errors.required"));
        return;
      }
      setApiError(data?.error ?? t("errors.genericError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-saas-bg px-4 py-12">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,var(--color-saas-primary)/15%,transparent)]" aria-hidden />
      <main className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-saas-fg hover:opacity-90">
            <span className="flex size-10 items-center justify-center rounded-xl bg-saas-primary text-white font-bold text-lg">
              CP
            </span>
            <span className="font-semibold text-xl text-saas-fg">{tApp("name")}</span>
          </Link>
          <p className="mt-2 text-sm text-saas-muted">{tApp("tagline")}</p>
        </div>
        <div className="rounded-2xl border border-saas-border bg-saas-card p-6 shadow-sm sm:p-8">
          <h1 className="text-start text-xl font-bold text-saas-fg sm:text-2xl">
            {t("registerTitle")}
          </h1>
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            {apiError && (
              <p className="rounded-lg bg-saas-danger/10 px-3 py-2 text-sm text-saas-danger" role="alert">
                {apiError}
              </p>
            )}
            <div>
              <label htmlFor="register-email" className="mb-1 block text-start text-sm font-medium text-saas-fg">
                {t("email")}
              </label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-saas-border bg-saas-bg px-3 py-2.5 text-start text-saas-fg focus:border-saas-primary focus:outline-none focus:ring-1 focus:ring-saas-primary"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "register-email-err" : undefined}
              />
              {errors.email && (
                <p id="register-email-err" className="mt-1 text-start text-sm text-saas-danger">
                  {errors.email}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="register-password" className="mb-1 block text-start text-sm font-medium text-saas-fg">
                {t("password")}
              </label>
              <input
                id="register-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-saas-border bg-saas-bg px-3 py-2.5 text-start text-saas-fg focus:border-saas-primary focus:outline-none focus:ring-1 focus:ring-saas-primary"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "register-password-err" : undefined}
              />
              {errors.password && (
                <p id="register-password-err" className="mt-1 text-start text-sm text-saas-danger">
                  {errors.password}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="register-password-confirm" className="mb-1 block text-start text-sm font-medium text-saas-fg">
                {t("passwordConfirm")}
              </label>
              <input
                id="register-password-confirm"
                type="password"
                autoComplete="new-password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full rounded-lg border border-saas-border bg-saas-bg px-3 py-2.5 text-start text-saas-fg focus:border-saas-primary focus:outline-none focus:ring-1 focus:ring-saas-primary"
                aria-invalid={!!errors.passwordConfirm}
              />
              {errors.passwordConfirm && (
                <p className="mt-1 text-start text-sm text-saas-danger">
                  {errors.passwordConfirm}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="register-name" className="mb-1 block text-start text-sm font-medium text-saas-fg">
                {t("name")}
              </label>
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-saas-border bg-saas-bg px-3 py-2.5 text-start text-saas-fg focus:border-saas-primary focus:outline-none focus:ring-1 focus:ring-saas-primary"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 w-full rounded-lg bg-saas-primary py-3 font-medium text-white shadow-sm hover:bg-saas-primary-hover disabled:opacity-50"
            >
              {submitting ? "…" : t("submitRegister")}
            </button>
          </form>
          <p className="mt-4 border-t border-saas-border pt-4 text-center text-sm text-saas-muted">
            <Link href="/login" className="font-medium text-saas-primary hover:underline">
              {t("linkToLogin")}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
