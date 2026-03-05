"use client";

import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

/**
 * Wraps protected route content. Redirects to login when the user is not
 * authenticated (no token). Locale is preserved by next-intl's router.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token, isReady } = useAuth();
  const router = useRouter();
  const t = useTranslations("dashboard");

  useEffect(() => {
    if (isReady && !token) {
      router.replace("/login");
    }
  }, [isReady, token, router]);

  if (!isReady || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-saas-bg">
        <span className="text-sm text-saas-muted">{t("loading")}</span>
      </div>
    );
  }

  return <>{children}</>;
}
