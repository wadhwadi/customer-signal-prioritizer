export interface Signal {
  id: string;
  text: string;
  source: string;
  sourceUrl: string;
  sentiment: "positive" | "negative" | "neutral" | string;
  date: string; // ISO date string
}

export type ClusterSentiment = "mostly_positive" | "mostly_negative" | "mixed" | string;

export interface Cluster {
  theme: string;
  signals: number[]; // indexes into the signals array
  urgency: number; // e.g., 0-10
  impact: number; // e.g., 0-10
  summary: string;
  capability: string;
  sentiment: ClusterSentiment;
}

export type GTMInsightType = "Retention" | "Expansion" | "Efficiency" | "Acquisition" | string;

export interface GTMInsight {
  insight: string;
  type: GTMInsightType;
}

export interface ResearchResult {
  product: string;
  signalsFound: number;
  signals: Signal[];
  sourceSummary: Record<string, number>;
  // Optional metadata added by the backend for debug/rate-limit handling.
  tokenUsage?: {
    input_tokens?: number;
    output_tokens?: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  };
}

export interface AnalysisResult {
  clusters: Cluster[];
  gtmInsights: GTMInsight[];
  sentimentBreakdown: Record<string, number>;
  topPraise: string;
  topComplaint: string;
}
