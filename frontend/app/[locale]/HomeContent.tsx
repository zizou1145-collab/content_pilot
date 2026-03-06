"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function HomeContent({ locale }: { locale: string }) {
  const t = useTranslations("home");
  const tApp = useTranslations("app");
  const tNav = useTranslations("nav");
  const otherLocale = (locale === "ar" ? "en" : "ar") as "ar" | "en";

  return (
    <div className="min-h-screen bg-saas-bg font-sans">
      {/* Minimal top bar: logo + auth + locale */}
      <header className="sticky top-0 z-10 border-b border-saas-border bg-saas-card/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-saas-fg hover:opacity-90">
            <span className="flex size-8 items-center justify-center rounded-lg bg-saas-primary text-white font-semibold text-sm">
              CP
            </span>
            <span className="font-semibold text-saas-fg">{tApp("name")}</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-saas-muted transition hover:text-saas-fg"
            >
              {tNav("login")}
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-saas-primary px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-saas-primary-hover"
            >
              {tNav("register")}
            </Link>
            <Link
              href="/"
              locale={otherLocale}
              className="text-sm font-medium text-saas-muted transition hover:text-saas-fg"
            >
              {locale === "ar" ? t("switchToEn") : t("switchToAr")}
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* 1. HERO */}
        <section
          className="relative flex min-h-[70vh] flex-col items-center justify-center px-4 py-24 sm:py-32"
          style={{
            background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))",
          }}
        >
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-saas-fg sm:text-5xl lg:text-6xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-5 text-lg text-saas-muted sm:text-xl">
              {t("heroSubtitle")}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="btn-hover inline-flex items-center gap-2 rounded-xl bg-saas-primary px-6 py-3.5 text-base font-medium text-white shadow-lg shadow-saas-primary/25 transition hover:bg-saas-primary-hover"
              >
                {t("getStarted")}
              </Link>
              <Link
                href="/dashboard"
                className="btn-hover inline-flex items-center gap-2 rounded-xl border border-saas-border bg-saas-card px-6 py-3.5 text-base font-medium text-saas-fg shadow-sm transition hover:bg-saas-sidebar-hover hover:border-saas-border"
              >
                {t("viewDashboard")}
              </Link>
            </div>
          </div>
        </section>

        {/* 2. TRUSTED BY */}
        <section className="border-t border-saas-border bg-saas-bg py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <p className="text-center text-sm font-medium uppercase tracking-wider text-saas-muted">
              {t("trustedBy")}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-8 sm:gap-x-16">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex h-10 w-28 items-center justify-center rounded-lg bg-saas-muted/20 grayscale transition hover:grayscale-0"
                  aria-hidden
                >
                  <span className="text-xs font-semibold text-saas-muted">Logo</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. FEATURES */}
        <section id="features" className="border-t border-saas-border bg-saas-card/50 py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-bold text-saas-fg sm:text-3xl">
              {t("featuresTitle")}
            </h2>
            <div className="mt-16 grid gap-8 sm:grid-cols-3">
              <FeatureCard
                icon={<IconChart />}
                title={t("feature1Title")}
                description={t("feature1Desc")}
              />
              <FeatureCard
                icon={<IconCalendar />}
                title={t("feature2Title")}
                description={t("feature2Desc")}
              />
              <FeatureCard
                icon={<IconDesign />}
                title={t("feature3Title")}
                description={t("feature3Desc")}
              />
            </div>
          </div>
        </section>

        {/* 4. PRODUCT PREVIEW */}
        <section className="border-t border-saas-border bg-saas-bg py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold text-saas-fg sm:text-3xl">
                {t("productPreviewTitle")}
              </h2>
              <p className="mt-4 text-saas-muted">
                {t("productPreviewDesc")}
              </p>
            </div>
            <div className="mx-auto mt-14 flex justify-center">
              <DashboardPreview />
            </div>
          </div>
        </section>

        {/* 5. HOW IT WORKS */}
        <section className="border-t border-saas-border bg-saas-card/50 py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-bold text-saas-fg sm:text-3xl">
              {t("howItWorksTitle")}
            </h2>
            <div className="mt-16 flex flex-col items-center justify-center gap-12 sm:flex-row sm:gap-20">
              <Step number={1} icon={<IconProject />} label={t("step1")} />
              <Step number={2} icon={<IconAnalysis />} label={t("step2")} />
              <Step number={3} icon={<IconPlan />} label={t("step3")} />
            </div>
          </div>
        </section>

        {/* 6. TESTIMONIALS */}
        <section className="border-t border-saas-border bg-saas-bg py-24 sm:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-bold text-saas-fg sm:text-3xl">
              {t("testimonialsTitle")}
            </h2>
            <div className="mt-16 grid gap-8 sm:grid-cols-3">
              <TestimonialCard
                name={t("testimonial1Name")}
                quote={t("testimonial1Quote")}
              />
              <TestimonialCard
                name={t("testimonial2Name")}
                quote={t("testimonial2Quote")}
              />
              <TestimonialCard
                name={t("testimonial3Name")}
                quote={t("testimonial3Quote")}
              />
            </div>
          </div>
        </section>

        {/* 7. CTA */}
        <section
          className="border-t border-saas-border py-24 sm:py-32"
          style={{
            background: "linear-gradient(135deg, rgba(59,130,246,0.06), rgba(139,92,246,0.06))",
          }}
        >
          <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
            <h2 className="text-2xl font-bold text-saas-fg sm:text-3xl">
              {t("ctaTitle")}
            </h2>
            <Link
              href="/register"
              className="btn-hover mt-10 inline-flex items-center gap-2 rounded-xl bg-saas-primary px-8 py-4 text-base font-medium text-white shadow-lg shadow-saas-primary/25 transition hover:bg-saas-primary-hover"
            >
              {t("ctaButton")}
            </Link>
          </div>
        </section>

        {/* 8. FOOTER */}
        <footer className="border-t border-saas-border bg-saas-card py-12">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6">
            <Link href="/" className="font-semibold text-saas-fg">
              {tApp("name")}
            </Link>
            <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-saas-muted">
              <span className="font-medium text-saas-fg">{t("footerProduct")}</span>
              <a href="#features" className="transition hover:text-saas-fg">
                {t("footerFeatures")}
              </a>
              <a href="#pricing" className="transition hover:text-saas-fg">
                {t("footerPricing")}
              </a>
              <a href="/#contact" className="transition hover:text-saas-fg">
                {t("footerContact")}
              </a>
            </nav>
          </div>
        </footer>
      </main>
    </div>
  );
}

/** Realistic app-window preview: browser bar, sidebar, dashboard cards, floating effect. */
function DashboardPreview() {
  const navItems = [
    { label: "Dashboard", active: true },
    { label: "Projects" },
    { label: "Analytics" },
    { label: "Designs" },
    { label: "Settings" },
  ];
  const kpis = [
    { label: "Projects", value: "12", color: "#2563EB" },
    { label: "Content", value: "48", color: "#7C3AED" },
    { label: "Designs", value: "24", color: "#10B981" },
    { label: "Activity", value: "156", color: "#F59E0B" },
  ];
  return (
    <div
      className="w-full max-w-[min(960px,100%)] overflow-hidden rounded-2xl border border-saas-border bg-saas-card"
      style={{
        transform: "translateY(-6px)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
      }}
    >
      {/* Browser bar */}
      <div className="flex h-10 items-center gap-3 border-b border-saas-border bg-saas-sidebar px-4">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-red-400/90" aria-hidden />
          <span className="size-2.5 rounded-full bg-amber-400/90" aria-hidden />
          <span className="size-2.5 rounded-full bg-emerald-400/90" aria-hidden />
        </div>
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-saas-border bg-saas-card px-3 py-1.5">
          <span className="text-saas-muted">🔒</span>
          <span className="truncate text-xs text-saas-muted">
            app.contentpilot.io/dashboard
          </span>
        </div>
      </div>
      <div className="flex min-h-80 sm:min-h-90">
        {/* Sidebar */}
        <aside className="flex w-45 shrink-0 flex-col border-r border-saas-border bg-saas-sidebar py-4">
          <div className="mb-4 flex items-center gap-2 px-4">
            <span className="flex size-8 items-center justify-center rounded-lg bg-saas-primary text-xs font-semibold text-white">
              CP
            </span>
            <span className="truncate text-sm font-semibold text-saas-fg">Content Pilot</span>
          </div>
          <nav className="flex flex-col gap-0.5 px-2">
            {navItems.map((item) => (
              <div
                key={item.label}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  item.active
                    ? "bg-saas-primary/10 text-saas-primary"
                    : "text-saas-muted hover:bg-saas-sidebar-hover hover:text-saas-fg"
                }`}
              >
                {item.label}
              </div>
            ))}
          </nav>
        </aside>
        {/* Main content: dashboard */}
        <div className="flex flex-1 flex-col bg-saas-bg p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-saas-fg">Dashboard</h3>
          <p className="mt-0.5 text-sm text-saas-muted">Overview of your content and projects</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {kpis.map((k) => (
              <div
                key={k.label}
                className="rounded-xl border border-saas-border bg-saas-card p-4 shadow-sm"
              >
                <p className="text-xs font-medium text-saas-muted">{k.label}</p>
                <p className="mt-1 text-2xl font-bold text-saas-fg" style={{ color: k.color }}>
                  {k.value}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-1 flex-col gap-3 rounded-xl border border-saas-border bg-saas-card p-4 shadow-sm">
            <p className="text-sm font-medium text-saas-fg">Recent projects</p>
            <div className="space-y-2">
              {["Campaign Q1", "Product Launch", "Social Calendar"].map((name, i) => (
                <div
                  key={name}
                  className="flex items-center justify-between rounded-lg border border-saas-border bg-saas-bg px-3 py-2"
                >
                  <span className="text-sm text-saas-fg">{name}</span>
                  <span className="text-xs text-saas-muted">
                    {["2 days ago", "1 week ago", "2 weeks ago"][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-saas-border bg-saas-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] sm:p-8">
      <div className="flex size-12 items-center justify-center rounded-xl bg-saas-primary/10 text-saas-primary [&_svg]:size-6">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-saas-fg">{title}</h3>
      <p className="mt-2 text-sm text-saas-muted">{description}</p>
    </div>
  );
}

function TestimonialCard({ name, quote }: { name: string; quote: string }) {
  return (
    <div className="rounded-2xl border border-saas-border bg-saas-card p-6 shadow-sm sm:p-8">
      <div className="flex size-12 items-center justify-center rounded-full bg-saas-primary/15 text-saas-primary">
        <span className="text-lg font-semibold">
          {name.charAt(0).toUpperCase()}
        </span>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-saas-muted">&ldquo;{quote}&rdquo;</p>
      <p className="mt-4 text-sm font-medium text-saas-fg">{name}</p>
    </div>
  );
}

function Step({
  number,
  icon,
  label,
}: {
  number: number;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-saas-border bg-saas-card text-saas-primary shadow-sm [&_svg]:size-7">
        {icon}
      </div>
      <span className="mt-3 text-xs font-semibold text-saas-primary">
        {number}
      </span>
      <p className="mt-1 max-w-45 text-sm font-medium text-saas-fg">
        {label}
      </p>
    </div>
  );
}

function IconChart() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function IconDesign() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

function IconProject() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  );
}

function IconAnalysis() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
    </svg>
  );
}

function IconPlan() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.38 3.39a15.995 15.995 0 004.769-4.769 15.994 15.994 0 00-3.39-1.622m-5.043.025a15.998 15.998 0 001.622 3.39m-3.38-3.39a15.995 15.995 0 01-4.77 4.77 15.994 15.994 0 003.39 1.622m5.043-.025a15.998 15.998 0 01-1.622-3.39" />
    </svg>
  );
}
