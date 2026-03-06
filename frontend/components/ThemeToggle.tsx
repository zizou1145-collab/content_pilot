"use client";

import { useTranslations } from "next-intl";
import { useTheme, type Theme } from "@/lib/theme";
import { useRef, useState, useEffect } from "react";

function IconSun() {
  return (
    <svg className="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg className="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}

function IconSystem() {
  return (
    <svg className="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

export function ThemeToggle() {
  const t = useTranslations("theme");
  const { theme, setTheme, resolved } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: "light", label: t("light"), icon: <IconSun /> },
    { value: "dark", label: t("dark"), icon: <IconMoon /> },
    { value: "system", label: t("system"), icon: <IconSystem /> },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-saas-muted transition-all duration-200 ease-[ease] hover:bg-saas-sidebar-hover hover:text-saas-fg"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={t("ariaLabel")}
      >
        {resolved === "dark" ? <IconMoon /> : <IconSun />}
        <span className="hidden sm:inline">{options.find((o) => o.value === theme)?.label ?? t("system")}</span>
      </button>
      {open && (
        <div
          className="absolute end-0 top-full z-50 mt-1 w-40 rounded-lg border border-saas-border bg-saas-card py-1 shadow-lg"
          role="menu"
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setTheme(opt.value);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-start text-sm transition-all duration-200 ease-[ease] hover:bg-saas-sidebar-hover ${
                theme === opt.value ? "bg-saas-primary/10 text-saas-primary font-medium" : "text-saas-fg"
              }`}
              role="menuitem"
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
