"use client";

import { useTranslations } from "next-intl";

export type MarketAnalysisResult = {
  id: string;
  contentTypes: string[] | null;
  postIdeas: string[] | null;
  strategies: Record<string, unknown> | null;
  createdAt: string;
};

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

  return (
    <section
      className="mt-8 rounded-xl border border-saas-border bg-saas-card p-6 text-start shadow-sm"
      aria-labelledby="market-analysis-heading"
    >
      <h2
        id="market-analysis-heading"
        className="text-lg font-semibold text-saas-fg"
      >
        {t("marketAnalysis.sectionTitle")}
      </h2>

      {error && (
        <div
          className="mt-4 rounded-lg border border-saas-danger/30 bg-saas-danger/10 p-4 text-start"
          role="alert"
        >
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

      {!error && loading && (
        <div className="mt-4 flex items-center gap-2 text-saas-muted">
          <span className="size-5 animate-spin rounded-full border-2 border-saas-border border-t-saas-primary" />
          <span className="text-sm">{t("marketAnalysis.loading")}</span>
        </div>
      )}

      {!error && !loading && analysis === null && (
        <div className="mt-4 text-start">
          <p className="text-sm text-saas-muted">
            {t("marketAnalysis.noAnalysisYet")}
          </p>
          <button
            type="button"
            onClick={onRunAnalysis}
            disabled={runLoading}
            className="mt-3 rounded-lg bg-saas-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-saas-primary-hover disabled:opacity-50"
          >
            {runLoading
              ? t("marketAnalysis.loading")
              : t("marketAnalysis.runAnalysisCta")}
          </button>
        </div>
      )}

      {!error && !loading && analysis !== null && (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onRunAnalysis}
              disabled={runLoading}
              className="rounded-lg border border-saas-border bg-saas-card px-4 py-2 text-sm font-medium text-saas-fg hover:bg-saas-sidebar-hover disabled:opacity-50"
            >
              {runLoading
                ? t("marketAnalysis.loading")
                : t("marketAnalysis.refreshAnalysis")}
            </button>
            {runLoading && (
              <span className="text-sm text-saas-muted">
                {t("marketAnalysis.loading")}
              </span>
            )}
          </div>

          <div className="mt-6 grid gap-6">
            <div>
              <h3 className="text-sm font-medium text-saas-muted">
                {t("marketAnalysis.contentTypes")}
              </h3>
              {analysis.contentTypes && analysis.contentTypes.length > 0 ? (
                <ul className="mt-1 flex flex-wrap gap-2" role="list">
                  {analysis.contentTypes.map((ct, i) => (
                    <li
                      key={i}
                      className="rounded-lg bg-saas-bg px-2.5 py-1 text-sm text-saas-fg"
                    >
                      {ct}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-sm text-saas-muted">
                  {t("marketAnalysis.emptyContentTypes")}
                </p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-saas-muted">
                {t("marketAnalysis.postIdeas")}
              </h3>
              {analysis.postIdeas && analysis.postIdeas.length > 0 ? (
                <ol
                  className="mt-1 list-inside list-decimal space-y-1 text-start text-sm text-saas-fg"
                  role="list"
                >
                  {analysis.postIdeas.map((idea, i) => (
                    <li key={i}>{idea}</li>
                  ))}
                </ol>
              ) : (
                <p className="mt-1 text-sm text-saas-muted">
                  {t("marketAnalysis.emptyPostIdeas")}
                </p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-saas-muted">
                {t("marketAnalysis.strategies")}
              </h3>
              {analysis.strategies &&
              typeof analysis.strategies === "object" &&
              Object.keys(analysis.strategies).length > 0 ? (
                <dl className="mt-1 grid gap-2 text-start sm:grid-cols-1">
                  {Object.entries(analysis.strategies).map(([key, value]) => {
                    const label =
                      key === "platforms"
                        ? t("marketAnalysis.platforms")
                        : key === "tone"
                          ? t("marketAnalysis.tone")
                          : key === "frequency"
                            ? t("marketAnalysis.frequency")
                            : key === "summary"
                              ? t("marketAnalysis.summary")
                              : key;
                    const display =
                      Array.isArray(value)
                        ? value.join(", ")
                        : value !== null && value !== undefined
                          ? String(value)
                          : "";
                    if (display === "") return null;
                    return (
                      <div key={key}>
                        <dt className="text-sm font-medium text-saas-muted">
                          {label}
                        </dt>
                        <dd className="mt-0.5 text-sm text-saas-fg">
                          {display}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              ) : (
                <p className="mt-1 text-sm text-saas-muted">
                  {t("marketAnalysis.emptyStrategies")}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
