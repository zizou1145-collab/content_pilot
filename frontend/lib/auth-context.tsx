"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

const AUTH_STORAGE_KEY = "content_pilot_auth";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  locale: string;
  subscriptionPlan: string;
  subscriptionStatus?: string;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isReady: boolean;
};

type AuthContextValue = AuthState & {
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function loadStored(): { token: string; user: AuthUser } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { token: string; user: AuthUser };
    if (data.token && data.user?.id) return data;
  } catch {
    // ignore
  }
  return null;
}

function saveStored(token: string, user: AuthUser) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, user }));
  } catch {
    // ignore
  }
}

function clearStored() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isReady: false,
  });

  useEffect(() => {
    const stored = loadStored();
    setState({
      user: stored?.user ?? null,
      token: stored?.token ?? null,
      isReady: true,
    });
  }, []);

  const setAuth = useCallback((token: string, user: AuthUser) => {
    saveStored(token, user);
    setState({ user, token, isReady: true });
  }, []);

  const clearAuth = useCallback(() => {
    clearStored();
    setState((s) => ({ ...s, user: null, token: null }));
  }, []);

  const value: AuthContextValue = {
    ...state,
    setAuth,
    clearAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
