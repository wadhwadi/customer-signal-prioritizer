#!/usr/bin/env node

import { Anthropic } from "@anthropic-ai/sdk";

function getResearchPrompt(product) {
  return `You are a market research analyst. Search the web thoroughly for user feedback, reviews, discussions, complaints, praise, and feature requests about "${product}".

Search across: Reddit, Hacker News, Twitter/X, tech blogs, YouTube video comments and reviews, product review sites (G2, Product Hunt), developer forums, and news articles.

After searching, compile your findings into a JSON object with this exact structure (no markdown, no backticks):

{
  "product": "${product}",
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

Find at least 20 distinct signals. Paraphrase everything — do not copy exact quotes. Focus on substantive feedback, not generic praise. Prioritize recent discussions (last 6 months).`;
}

function getAnalysisPrompt(product, signals) {
  return `You are a GTM strategist for AI products. Analyze these real user signals about "${product}" gathered from across the web.

Return ONLY a valid JSON object (no markdown, no backticks):

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
${JSON.stringify(signals, null, 2)}
`;
}

function extractFinalTextBlock(response) {
  const obj = response;
  if (!obj || typeof obj !== "object") return "";
  const content = obj?.content ?? (obj?.message?.content ?? null);
  if (Array.isArray(content)) {
    const textBlocks = content
      .filter((block) => block && typeof block === "object" && block.type === "text" && typeof block.text === "string")
      .map((block) => block.text);
    if (textBlocks.length) return textBlocks[textBlocks.length - 1];
    const last = content.reverse().find((block) => block && typeof block === "object" && typeof block.text === "string");
    return last?.text ?? "";
  }
  return typeof content === "string" ? content : "";
}

function parseJsonFromText(text) {
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

async function run() {
  const product = process.argv[2];
  if (!product) {
    console.error("Usage: node scripts/run-analysis.js \"<product name>\"");
    process.exit(1);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("Error: ANTHROPIC_API_KEY must be set in the environment.");
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });

  console.log(`Researching signals for: ${product}`);
  const researchResp = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    messages: [{ role: "user", content: getResearchPrompt(product) }],
    max_tokens: 4096,
  });

  const researchFinalText = extractFinalTextBlock(researchResp);
  const researchData = parseJsonFromText(researchFinalText);
  console.log("Research done. Signals found: ", researchData.signals?.length || 0);

  console.log("Analyzing...");
  const analysisResp = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    messages: [{ role: "user", content: getAnalysisPrompt(product, researchData.signals || []) }],
    max_tokens: 4096,
  });

  const analysisFinalText = extractFinalTextBlock(analysisResp);
  const analysisData = parseJsonFromText(analysisFinalText);

  console.log("Analysis result:");
  console.log(JSON.stringify({ product, research: researchData, analysis: analysisData }, null, 2));
}

run().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
