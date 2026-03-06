"use client";

import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "@/i18n/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState, useRef, useEffect } from "react";

const localeNames: Record<string, string> = { ar: "العربية", en: "English" };

function IconDashboard() {
  return (
    <svg className="size-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function IconProjects() {
  return (
    <svg className="size-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );
}

function IconAnalytics() {
  return (
    <svg className="size-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function IconDesigns() {
  return (
    <svg className="size-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg className="size-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg className="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("nav");
  const tApp = useTranslations("app");
  const tDashboard = useTranslations("dashboard");
  const pathname = usePathname();
  const { user, clearAuth } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    setUserMenuOpen(false);
    clearAuth();
    router.replace("/login");
  };

  const plan = user?.subscriptionPlan ?? "Basic";
  const locale = useLocale();
  const isRtl = locale === "ar";
  const nextLocale = isRtl ? "en" : "ar";
  const switchLocalePath = pathname ? `/${nextLocale}${pathname}` : `/${nextLocale}`;
  const sidebarClosedTranslate = isRtl ? "translate-x-full" : "-translate-x-full";

  const navItems = [
    { href: "/dashboard", label: t("dashboard"), icon: IconDashboard },
    { href: "/projects", label: t("projects"), icon: IconProjects },
    { href: "/dashboard", label: t("analytics"), icon: IconAnalytics },
    { href: "/dashboard", label: t("designs"), icon: IconDesigns },
    { href: "/dashboard", label: t("settings"), icon: IconSettings },
  ];

  return (
    <div className="flex min-h-screen bg-saas-bg">
      {/* Mobile overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        aria-hidden={!sidebarOpen}
        style={{ opacity: sidebarOpen ? 1 : 0, pointerEvents: sidebarOpen ? "auto" : "none" }}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar: LTR left, RTL right; off-screen when closed on mobile */}
      <aside
        className={`
          fixed inset-y-0 z-50 w-64 shrink-0 border-saas-border bg-saas-sidebar
          transition-transform duration-200 ease-out
          start-0 border-e
          lg:relative lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : `${sidebarClosedTranslate} lg:translate-x-0`}
          [dir=rtl]:start-auto [dir=rtl]:end-0 [dir=rtl]:border-e-0 [dir=rtl]:border-s
        `}
      >
        <div className="flex h-full flex-col">
          {/* Logo + mobile close */}
          <div className="flex items-center justify-between gap-2 border-b border-saas-border px-4 py-4">
            <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden text-saas-fg hover:opacity-90">
              <span className="flex size-9 items-center justify-center rounded-lg bg-saas-primary text-white font-semibold text-sm">
                CP
              </span>
              <span className="truncate font-semibold text-saas-fg">{tApp("name")}</span>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-2 text-saas-muted transition-all duration-200 ease-[ease] hover:bg-saas-sidebar-hover hover:text-saas-fg lg:hidden"
              aria-label="Close menu"
            >
              <IconClose />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-0.5 px-3 py-4" aria-label="Main">
            {navItems.map(({ href, label, icon: Icon }, index) => {
              const isDashboardLink = href === "/dashboard";
              const isActive = isDashboardLink
                ? pathname === "/dashboard" && index === 0
                : pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-[ease] ${
                    isActive
                      ? "bg-[rgba(59,130,246,0.12)] text-saas-primary font-semibold [&>svg]:text-saas-primary"
                      : "text-saas-muted hover:bg-saas-sidebar-hover hover:text-saas-fg [&>svg]:transition-[color] [&>svg]:duration-200 [&>svg]:ease-[ease] [&:hover>svg]:text-saas-primary"
                  }`}
                >
                  <Icon />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Plan badge + User */}
          <div className="border-t border-saas-border p-3 space-y-2">
            <div className="rounded-lg bg-saas-card px-3 py-2 text-center">
              <span className="text-xs font-medium uppercase tracking-wide text-saas-muted">{tDashboard("plan")}</span>
              <p className="mt-0.5 font-semibold text-saas-fg">{plan}</p>
            </div>
            <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-saas-muted">
              <span className="size-8 rounded-full bg-saas-primary/20 flex items-center justify-center font-medium text-saas-primary">
                {(user?.email ?? "?").charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0 truncate">{user?.email ?? "—"}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main area: top bar + content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-saas-border bg-saas-header px-4 py-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-saas-muted hover:bg-saas-sidebar-hover lg:hidden"
            aria-label="Open menu"
          >
            <IconMenu />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href={switchLocalePath}
              className="rounded-lg px-3 py-2 text-sm font-medium text-saas-muted transition-all duration-200 ease-[ease] hover:bg-saas-sidebar-hover hover:text-saas-fg"
            >
              {localeNames[nextLocale]}
            </a>
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-lg border border-saas-border bg-saas-card px-3 py-2 text-sm text-saas-fg transition-all duration-200 ease-[ease] hover:bg-saas-sidebar-hover"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <span className="size-7 rounded-full bg-saas-primary/20 flex items-center justify-center text-xs font-medium text-saas-primary">
                  {(user?.email ?? "?").charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:inline max-w-[120px] truncate">{user?.email ?? "—"}</span>
                <IconChevronDown />
              </button>
              {userMenuOpen && (
                <div
                  className="absolute end-0 top-full mt-1 w-56 rounded-lg border border-saas-border bg-saas-card py-1 shadow-lg"
                  role="menu"
                >
                  <div className="border-b border-saas-border px-3 py-2 text-xs text-saas-muted">
                    {plan} · {tDashboard("status")}
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-3 py-2 text-start text-sm text-saas-fg transition-all duration-200 ease-[ease] hover:bg-saas-sidebar-hover"
                    role="menuitem"
                  >
                    {tDashboard("logout")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
