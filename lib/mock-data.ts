import type { AnalysisResult, ResearchResult } from "./types";

export const mockResearchResult: ResearchResult = {
  product: "Example Product",
  signalsFound: 20,
  signals: [
    {
      id: "1",
      text: "Users are asking for better performance when loading large datasets.",
      source: "Reddit r/ai",
      sourceUrl: "https://reddit.com/r/ai/example",
      sentiment: "negative",
      date: "2026-02",
    },
    {
      id: "2",
      text: "People love how easy it is to integrate with their workflow.",
      source: "Twitter/X",
      sourceUrl: "https://twitter.com/example/status/1",
      sentiment: "positive",
      date: "2026-01",
    },
  ],
  sourceSummary: {
    Reddit: 8,
    "Twitter/X": 6,
    "Tech Blogs": 3,
    Other: 3,
  },
};

export const mockAnalysisResult: AnalysisResult = {
  clusters: [
    {
      theme: "Performance bottlenecks",
      signals: [1],
      urgency: 9,
      impact: 8,
      summary: "Users are experiencing slow loading times with large datasets, which could lead to churn.",
      capability: "API Reliability & Infrastructure",
      sentiment: "mostly_negative",
    },
    {
      theme: "Integration ease",
      signals: [2],
      urgency: 4,
      impact: 6,
      summary: "Customers appreciate how quickly they can integrate the product into existing workflows.",
      capability: "Developer Experience & SDKs",
      sentiment: "mostly_positive",
    },
  ],
  gtmInsights: [
    {
      insight: "Improve performance around large dataset imports to reduce churn among enterprise customers.",
      type: "Retention",
    },
    {
      insight: "Highlight easy integration in marketing materials to capture developer interest.",
      type: "Acquisition",
    },
  ],
  sentimentBreakdown: {
    positive: 50,
    negative: 40,
    request: 10,
  },
  topPraise: "Users love how easy it is to integrate into their workflows.",
  topComplaint: "Performance degrades sharply with large datasets.",
};
