"use client";

import React, { useMemo, useState } from "react";
import type { AnalysisResult, ResearchResult } from "../../../lib/types";

type Props = {
  product: string;
  research: ResearchResult;
  analysis: AnalysisResult;
};

export function ExportReport({ product, research, analysis }: Props) {
  const [copied, setCopied] = useState(false);

  const exportJson = useMemo(() => {
    return JSON.stringify({ product, research, analysis }, null, 2);
  }, [product, research, analysis]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  };

  const handleDownload = () => {
    const blob = new Blob([exportJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${product.replace(/\s+/g, "_")}_signals_report.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-border-main bg-black/30 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Export report</h2>
          <div className="text-sm text-text-muted">Download or copy the full analysis data.</div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-xl border border-border-main bg-black/40 px-4 py-2 text-xs font-semibold text-text-primary hover:bg-black/50"
          >
            {copied ? "Copied!" : "Copy JSON"}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-xl border border-border-main bg-black/40 px-4 py-2 text-xs font-semibold text-text-primary hover:bg-black/50"
          >
            Download JSON
          </button>
        </div>
      </div>

      <div className="mt-6">
        <textarea
          readOnly
          value={exportJson}
          className="h-72 w-full resize-none rounded-xl border border-border-main bg-black/40 p-4 text-xs text-text-primary"
        />
      </div>
    </div>
  );
}
