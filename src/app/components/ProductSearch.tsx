"use client";

import React from "react";

type ProductSearchProps = {
  product: string;
  onProductChange: (value: string) => void;
  onSubmit: (overrideProduct?: string) => void;
  disabled?: boolean;
  suggestions: string[];
  compact?: boolean;
};

export function ProductSearch({
  product,
  onProductChange,
  onSubmit,
  disabled,
  suggestions,
  compact,
}: ProductSearchProps) {
  if (compact) {
    return (
      <div className="w-full">
        <div className="flex gap-2">
          <input
            id="product-input"
            type="text"
            value={product}
            onChange={(e) => onProductChange(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-border-main bg-black/30 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="Search another product…"
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); onSubmit(); }
            }}
          />
          <button
            type="button"
            disabled={!product.trim() || disabled}
            onClick={() => onSubmit(product)}
            className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Analyze
          </button>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => { onProductChange(suggestion); onSubmit(suggestion); }}
              className="shrink-0 rounded-full border border-border-main bg-black/20 px-3 py-1 text-xs text-text-primary transition hover:bg-black/40"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl">
      <label className="sr-only" htmlFor="product-input">
        Product name
      </label>
      <input
        id="product-input"
        type="text"
        value={product}
        onChange={(e) => onProductChange(e.target.value)}
        className="w-full rounded-xl border border-border-main bg-black/30 px-4 py-3 text-base text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
        placeholder="e.g., Claude Opus 4.6, GPT-5, Gemini 2.5 Pro"
        disabled={disabled}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit();
          }
        }}
      />

      <button
        type="button"
        disabled={!product.trim() || disabled}
        onClick={() => onSubmit(product)}
        className="mt-4 w-full rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Analyze Market Signals
      </button>

      <div className="mt-6 flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => {
              onProductChange(suggestion);
              onSubmit(suggestion);
            }}
            className="rounded-full border border-border-main bg-black/20 px-4 py-2 text-sm text-text-primary transition hover:bg-black/40"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
