"use client";

import { useRouter } from "@/i18n/navigation";
import { setGlobal401Handler } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";

/**
 * Registers a global 401 handler that clears auth and redirects to login with
 * session=expired. Mount once inside AuthProvider (e.g. in locale layout).
 */
export function Auth401Handler() {
  const { clearAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setGlobal401Handler(() => {
      clearAuth();
      router.replace("/login?session=expired");
    });
    return () => setGlobal401Handler(null);
  }, [clearAuth, router]);

  return null;
}
