import type { Signal } from "./types";

const researchPromptTemplate = `You are a market research analyst. Search the web thoroughly for user feedback, reviews, discussions, complaints, praise, and feature requests about "{{product}}".

Search across: Reddit, Hacker News, Twitter/X, tech blogs, YouTube video comments and reviews, product review sites (G2, Product Hunt), developer forums, and news articles.

After searching, compile your findings into a JSON object with this exact structure (no markdown, no backticks):

<<<JSON>>>
{
  "product": "{{product}}",
  "signalsFound": 25,
  "signals": [
    {
      "id": 1,
      "text": "paraphrased user feedback in 1-2 sentences",
      "source": "Reddit r/ChatGPT",
      "sourceUrl": "url if available, empty string if not",
      "sentiment": "positive | negative | request",
      "date": "2025-12 or approximate"
    }
  ],
  "sourceSummary": {
    "Reddit": 8,
    "Hacker News": 5,
    "Twitter/X": 4,
    "Tech Blogs": 3,
    "Other": 5
  }
}
<<<END>>>

Find 10-15 distinct signals. Keep signal text brief — maximum one sentence each. Paraphrase everything — do not copy exact quotes. Focus on substantive feedback, not generic praise. Prioritize recent discussions (last 6 months).`;

const analysisPromptTemplate = `You are a GTM strategist for AI products. Analyze these real user signals about "{{product}}" gathered from across the web.

Return ONLY a valid JSON object (no markdown, no backticks). Wrap the JSON in the delimiters shown below exactly:

<<<JSON>>>
{
  "clusters": [
    {
      "theme": "short descriptive theme name",
      "signals": [1, 2, 5],
      "urgency": 8.5,
      "impact": 9.0,
      "summary": "one-sentence summary of what users are saying and the business implication",
      "capability": "one of the product capabilities listed below",
      "sentiment": "mostly_positive | mostly_negative | mixed"
    }
  ],
  "gtmInsights": [
    {
      "insight": "one-sentence actionable GTM recommendation referencing specific findings",
      "type": "Retention | Expansion | Efficiency | Acquisition"
    }
  ],
  "sentimentBreakdown": {
    "positive": 45,
    "negative": 35,
    "request": 20
  },
  "topPraise": "the single most common positive theme in one sentence",
  "topComplaint": "the single most common complaint in one sentence"
}
<<<END>>>

Rules:
- Each signal belongs to exactly one cluster
- Signal numbers match the id field from input
- Urgency (1-10): How time-sensitive? Are users actively churning or blocked?
- Impact (1-10): How much does addressing this affect adoption, revenue, or market position?
- Create 3-7 clusters
- Provide 4-6 GTM insights covering different motion types
- capability must be one of: Model Quality & Performance, API Reliability & Infrastructure, Rate Limits & Scaling, Enterprise Security & Compliance, Billing & Cost Management, Developer Experience & SDKs, Documentation & Onboarding, Fine-tuning & Customization, New Modalities, Collaboration & Team Features, Pricing & Packaging, Batch & Async Processing
- sentimentBreakdown values should be percentages that add up to 100
- Reference specific competitive dynamics where relevant

Signals:
{{signals}}
`;

export function getResearchPrompt(product: string): string {
  return researchPromptTemplate.replaceAll("{{product}}", product);
}

export function getAnalysisPrompt(product: string, signals: Signal[]): string {
  return analysisPromptTemplate
    .replaceAll("{{product}}", product)
    .replaceAll("{{signals}}", JSON.stringify(signals, null, 2));
}
