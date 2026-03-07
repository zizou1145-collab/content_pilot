"use client";

import { useTranslations, useLocale } from "next-intl";

export type MarketAnalysisResult = {
  id: string;
  contentTypes: string[] | null;
  postIdeas: string[] | null;
  strategies: Record<string, unknown> | null;
  createdAt: string;
};

const CONTENT_TYPE_AR: Record<string, string> = {
  challenges: "التحديات",
  "tips and tricks": "نصائح وحيل",
  "success stories": "قصص نجاح",
  promotional: "ترويجي",
  educational: "تعليمي",
  introductory: "تعريفي",
  success_story: "قصص نجاح",
  entertaining: "ترفيهي",
  inspirational: "إلهامي",
  awareness: "توعوي",
  interactive: "تفاعلي",
  behind_the_scenes: "خلف الكواليس",
  user_stories: "قصص المستخدمين",
};

const TAG_COLORS = [
  { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-700 dark:text-blue-300", border: "border-blue-200 dark:border-blue-800" },
  { bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-700 dark:text-violet-300", border: "border-violet-200 dark:border-violet-800" },
  { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" },
  { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
  { bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-700 dark:text-rose-300", border: "border-rose-200 dark:border-rose-800" },
  { bg: "bg-cyan-50 dark:bg-cyan-950/40", text: "text-cyan-700 dark:text-cyan-300", border: "border-cyan-200 dark:border-cyan-800" },
];

function mapContentType(value: string, isRtl: boolean): string {
  if (isRtl) return CONTENT_TYPE_AR[value.toLowerCase().trim()] ?? value;
  return value;
}

function formatDate(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
  } catch { return iso; }
}

function StrategyCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-saas-border bg-saas-bg p-4">
      <div className="flex items-center gap-2 text-saas-muted">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm font-medium text-saas-fg leading-relaxed">{value}</p>
    </div>
  );
}

function IconPlatforms() {
  return <svg className="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" /></svg>;
}
function IconTone() {
  return <svg className="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;
}
function IconFrequency() {
  return <svg className="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
}
function IconPosts() {
  return <svg className="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>;
}
function IconClock() {
  return <svg className="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
}
function IconSummary() {
  return <svg className="size-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
}
function IconLightbulb() {
  return <svg className="size-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m1.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
}
function IconTags() {
  return <svg className="size-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>;
}
function IconChart() {
  return <svg className="size-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
}

type MarketAnalysisSectionProps = {
  analysis: MarketAnalysisResult | null;
  loading: boolean;
  runLoading: boolean;
  error: string | null;
  onRunAnalysis: () => void;
  onRetry: () => void;
};

export function MarketAnalysisSection({
  analysis,
  loading,
  runLoading,
  error,
  onRunAnalysis,
  onRetry,
}: MarketAnalysisSectionProps) {
  const t = useTranslations("projects");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const dir = isRtl ? "rtl" : "ltr";

  const strategies = analysis?.strategies ?? null;
  const summary = strategies && typeof strategies.summary === "string" ? strategies.summary : null;
  const platforms = strategies
    ? Array.isArray(strategies.platforms)
      ? (strategies.platforms as string[]).join("، ")
      : typeof strategies.platforms === "string"
        ? strategies.platforms
        : null
    : null;
  const tone = strategies && typeof strategies.tone === "string" ? strategies.tone : null;
  const frequency = strategies && typeof strategies.frequency === "string" ? strategies.frequency : null;
  const numberOfPosts = strategies && typeof strategies.numberOfPosts === "string" ? strategies.numberOfPosts : null;
  const bestPostingTimes = strategies && typeof strategies.bestPostingTimes === "string" ? strategies.bestPostingTimes : null;

  return (
    <section
      className="mt-8 rounded-xl border border-saas-border bg-saas-card shadow-sm overflow-hidden"
      style={{ direction: dir }}
      aria-labelledby="market-analysis-heading"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-saas-border bg-saas-sidebar px-6 py-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-saas-primary/10 text-saas-primary">
            <IconChart />
          </span>
          <div>
            <h2 id="market-analysis-heading" className="text-base font-semibold text-saas-fg">
              {t("marketAnalysis.sectionTitle")}
            </h2>
            {analysis && (
              <p className="text-xs text-saas-muted">
                {formatDate(analysis.createdAt, locale)}
              </p>
            )}
          </div>
        </div>

        {analysis !== null && !loading && (
          <button
            type="button"
            onClick={onRunAnalysis}
            disabled={runLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-saas-border bg-saas-card px-3 py-1.5 text-sm font-medium text-saas-fg hover:bg-saas-sidebar-hover disabled:opacity-50 transition-colors"
          >
            {runLoading ? (
              <>
                <span className="size-3.5 animate-spin rounded-full border-2 border-saas-border border-t-saas-primary" />
                {t("marketAnalysis.loading")}
              </>
            ) : (
              t("marketAnalysis.refreshAnalysis")
            )}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="m-6 rounded-lg border border-saas-danger/30 bg-saas-danger/5 p-4" role="alert">
          <p className="text-sm text-saas-danger">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 text-sm font-medium text-saas-danger underline hover:no-underline"
          >
            {t("marketAnalysis.retry")}
          </button>
        </div>
      )}

      {/* Loading */}
      {!error && loading && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-saas-muted">
          <span className="size-8 animate-spin rounded-full border-[3px] border-saas-border border-t-saas-primary" />
          <span className="text-sm">{t("marketAnalysis.loading")}</span>
        </div>
      )}

      {/* Empty state */}
      {!error && !loading && analysis === null && (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center px-6">
          <span className="flex size-14 items-center justify-center rounded-full bg-saas-primary/10 text-saas-primary">
            <IconChart />
          </span>
          <div>
            <p className="font-medium text-saas-fg">{t("marketAnalysis.noAnalysisYet")}</p>
            <p className="mt-1 text-sm text-saas-muted">{t("marketAnalysis.runAnalysisCta")}</p>
          </div>
          <button
            type="button"
            onClick={onRunAnalysis}
            disabled={runLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-saas-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-saas-primary-hover disabled:opacity-50 transition-colors"
          >
            {runLoading ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                {t("marketAnalysis.loading")}
              </>
            ) : t("marketAnalysis.runAnalysisCta")}
          </button>
        </div>
      )}

      {/* Report */}
      {!error && !loading && analysis !== null && (
        <div className="divide-y divide-saas-border">

          {/* 1. Summary */}
          {summary && (
            <div className="px-6 py-5">
              <div className="flex items-center gap-2 text-saas-primary mb-3">
                <IconSummary />
                <h3 className="text-sm font-semibold uppercase tracking-wide">
                  {t("marketAnalysis.summary")}
                </h3>
              </div>
              <p className="text-sm text-saas-fg leading-relaxed rounded-lg bg-saas-primary/5 border border-saas-primary/15 px-4 py-3">
                {summary}
              </p>
            </div>
          )}

          {/* 2. Strategy cards */}
          {(platforms || tone || frequency || numberOfPosts || bestPostingTimes) && (
            <div className="px-6 py-5">
              <div className="flex items-center gap-2 text-saas-muted mb-3">
                <IconChart />
                <h3 className="text-sm font-semibold uppercase tracking-wide">
                  {t("marketAnalysis.strategies")}
                </h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {platforms && (
                  <StrategyCard icon={<IconPlatforms />} label={t("marketAnalysis.platforms")} value={platforms} />
                )}
                {tone && (
                  <StrategyCard icon={<IconTone />} label={t("marketAnalysis.tone")} value={tone} />
                )}
                {frequency && (
                  <StrategyCard icon={<IconFrequency />} label={t("marketAnalysis.frequency")} value={frequency} />
                )}
                {numberOfPosts && (
                  <StrategyCard icon={<IconPosts />} label={t("marketAnalysis.numberOfPosts")} value={numberOfPosts} />
                )}
                {bestPostingTimes && (
                  <StrategyCard icon={<IconClock />} label={t("marketAnalysis.bestPostingTimes")} value={bestPostingTimes} />
                )}
              </div>
            </div>
          )}

          {/* 3. Content types */}
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 text-saas-muted mb-3">
              <IconTags />
              <h3 className="text-sm font-semibold uppercase tracking-wide">
                {t("marketAnalysis.contentTypes")}
              </h3>
            </div>
            {Array.isArray(analysis.contentTypes) && analysis.contentTypes.length > 0 ? (
              <ul className="flex flex-wrap gap-2" role="list">
                {analysis.contentTypes.map((ct, i) => {
                  const color = TAG_COLORS[i % TAG_COLORS.length];
                  return (
                    <li
                      key={i}
                      className={`rounded-full border px-3 py-1 text-sm font-medium ${color.bg} ${color.text} ${color.border}`}
                    >
                      {mapContentType(ct, isRtl)}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-saas-muted">{t("marketAnalysis.emptyContentTypes")}</p>
            )}
          </div>

          {/* 4. Post ideas */}
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 text-saas-muted mb-3">
              <IconLightbulb />
              <h3 className="text-sm font-semibold uppercase tracking-wide">
                {t("marketAnalysis.postIdeas")}
              </h3>
            </div>
            {Array.isArray(analysis.postIdeas) && analysis.postIdeas.length > 0 ? (
              <ol className="grid gap-2 sm:grid-cols-2">
                {analysis.postIdeas.map((idea, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-lg border border-saas-border bg-saas-bg px-4 py-3"
                  >
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-saas-primary/10 text-xs font-bold text-saas-primary">
                      {i + 1}
                    </span>
                    <span className="text-sm text-saas-fg leading-relaxed">{idea}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-saas-muted">{t("marketAnalysis.emptyPostIdeas")}</p>
            )}
          </div>

        </div>
      )}
    </section>
  );
}
