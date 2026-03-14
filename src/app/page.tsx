"use client";

import { useMemo, useState } from "react";
import { ProductSearch } from "./components/ProductSearch";
import { ProgressTracker } from "./components/ProgressTracker";
import { Dashboard } from "./components/Dashboard";
import type { ResearchResult, AnalysisResult } from "../../lib/types";
import { productSuggestions } from "../../lib/product-suggestions";

const steps = [
  { id: "search", label: "Searching the web and analyzing signals..." },
  { id: "done", label: "Processing results..." },
];

export default function HomePage() {
  const [product, setProduct] = useState("");
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [research, setResearch] = useState<ResearchResult | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const showResults = Boolean(analysis);

  const progressExtra = useMemo(() => {
    if (!research) return undefined;
    const sources = research.sourceSummary ? Object.keys(research.sourceSummary).length : 0;
    return `Found ${research.signalsFound} signals across ${sources} sources`;
  }, [research]);

  const reset = () => {
    setLoading(false);
    setStepIndex(0);
    setResearch(null);
    setAnalysis(null);
    setError(null);
  };

  const startNewSearch = () => {
    reset();
    setProduct("");
  };

  const runAnalysis = async (overrideProduct?: string) => {
    const productToSearch = overrideProduct?.trim() || product.trim();
    if (!productToSearch) return;

    setResearch(null);
    setAnalysis(null);
    setError(null);
    setLoading(true);
    setStepIndex(0);

    console.log("Starting analysis for:", productToSearch);

    try {
      setStepIndex(0);
      console.log("About to fetch search for:", productToSearch);
      const resp = await fetch("/api/search", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: productToSearch }),
      });

      const json = (await resp.json()) as (ResearchResult & AnalysisResult) | { error: string };
      if ("error" in json) throw new Error(json.error);

      console.log("Search response keys:", Object.keys(json));

      setResearch({
        product: (json as any).product,
        signalsFound: (json as any).signalsFound,
        signals: (json as any).signals ?? [],
        sourceSummary: (json as any).sourceSummary ?? {},
      });
      setStepIndex(1);

      setAnalysis({
        clusters: (json as any).clusters ?? [],
        gtmInsights: (json as any).gtmInsights ?? [],
        sentimentBreakdown: (json as any).sentimentBreakdown ?? {},
        topPraise: (json as any).topPraise ?? "",
        topComplaint: (json as any).topComplaint ?? "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-12">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Customer Signal Prioritizer</h1>
          <p className="text-base text-text-muted">
            Type any AI product name and get instant market intelligence.
          </p>
        </header>

        <div className={`mt-6 flex flex-1 flex-col ${!showResults ? "items-center justify-center" : ""}`}>
          {!showResults ? (
            <div className="w-full">
              <ProductSearch
                product={product}
                onProductChange={setProduct}
                onSubmit={runAnalysis}
                disabled={loading}
                suggestions={productSuggestions}
              />

              {loading ? (
                <div className="mt-10">
                  <ProgressTracker steps={steps} currentStepIndex={stepIndex} extra={progressExtra} />
                </div>
              ) : null}

              {error ? (
                <div className="mt-8 rounded-2xl border border-red-600 bg-black/40 p-4 text-sm text-red-200">
                  <div className="font-semibold">Something went wrong:</div>
                  <div>{error}</div>
                  <button
                    className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-black"
                    onClick={() => {
                      setError(null);
                      reset();
                    }}
                  >
                    Try Again
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="w-full">
              <div className="flex flex-col gap-6">
                <div className="rounded-2xl border border-border-main bg-black/30 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-base font-semibold text-text-primary">
                      Results for {product}
                    </span>
                    <button
                      className="rounded-lg border border-border-main bg-black/30 px-3 py-1 text-xs font-semibold text-text-primary hover:bg-black/40"
                      onClick={startNewSearch}
                    >
                      New search
                    </button>
                  </div>
                  <ProductSearch
                    product={product}
                    onProductChange={setProduct}
                    onSubmit={runAnalysis}
                    disabled={loading}
                    suggestions={[]}
                    compact={true}
                  />
                </div>
                <Dashboard product={product} research={research!} analysis={analysis!} />
              </div>
            </div>
          )}
        </div>

        <footer className="mt-12 text-center text-xs text-text-muted">
          Built by Aditi Wadhwa — GTM x AI Portfolio Project | Powered by Claude API
        </footer>
      </div>
    </main>
  );
}
