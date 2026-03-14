"use client";

import React from "react";
import type { AnalysisResult, ResearchResult } from "../../../lib/types";

type DashboardPlaceholderProps = {
  product: string;
  research?: ResearchResult;
  analysis?: AnalysisResult;
};

export function DashboardPlaceholder({ product, research, analysis }: DashboardPlaceholderProps) {
  return (
    <div className="w-full max-w-5xl space-y-6">
      <div className="rounded-2xl border border-border-main bg-black/30 p-6">
        <h2 className="text-xl font-semibold text-text-primary">Analysis complete for “{product}”</h2>
        <p className="mt-2 text-sm text-text-muted">This is a placeholder dashboard; full UI coming next.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border-main bg-black/30 p-5">
          <h3 className="text-lg font-semibold text-text-primary">Research Result</h3>
          <pre className="mt-4 max-h-72 overflow-auto text-xs text-text-muted">
            {JSON.stringify(research, null, 2)}
          </pre>
        </div>

        <div className="rounded-2xl border border-border-main bg-black/30 p-5">
          <h3 className="text-lg font-semibold text-text-primary">Analysis Result</h3>
          <pre className="mt-4 max-h-72 overflow-auto text-xs text-text-muted">
            {JSON.stringify(analysis, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
