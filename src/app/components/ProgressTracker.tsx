"use client";

import React from "react";

export type ProgressStep = {
  id: string;
  label: string;
  description?: string;
};

type ProgressTrackerProps = {
  steps: ProgressStep[];
  currentStepIndex: number;
  extra?: string;
};

export function ProgressTracker({ steps, currentStepIndex, extra }: ProgressTrackerProps) {
  return (
    <div className="w-full max-w-3xl rounded-2xl border border-border-main bg-black/30 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Analyzing market signals…</h2>
        {extra ? <span className="text-sm text-text-muted">{extra}</span> : null}
      </div>

      <div className="mt-6 space-y-4">
        {steps.map((step, idx) => {
          const isActive = idx === currentStepIndex;
          const isCompleted = idx < currentStepIndex;
          return (
            <div key={step.id} className="flex gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border-main bg-black/30">
                {isCompleted ? (
                  <span className="text-accent">✓</span>
                ) : isActive ? (
                  <span className="animate-pulse text-accent">●</span>
                ) : (
                  <span className="text-text-muted">{idx + 1}</span>
                )}
              </div>
              <div>
                <div className={`text-sm font-medium ${isCompleted ? "text-text-primary" : "text-text-muted"}`}>
                  {step.label}
                </div>
                {step.description ? (
                  <div className="text-xs text-text-muted">{step.description}</div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
