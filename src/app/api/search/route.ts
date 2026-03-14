import { NextResponse } from "next/server";
import { Anthropic } from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type MessageCreateParams = Parameters<Anthropic["messages"]["create"]>[0];

const PROMPT_TEMPLATE = `You are a market research analyst and GTM strategist. Search the web for recent user feedback, reviews, complaints, praise, and feature requests about "{{product}}".

Search across: Reddit, Hacker News, Twitter/X, tech blogs, product review sites (G2, Product Hunt), and developer forums.

After searching, return ONLY a valid JSON object — no explanation, no markdown, no backticks. Use these exact delimiters:

<<<JSON>>>
{
  "product": "{{product}}",
  "signalsFound": 9,
  "signals": [
    {
      "id": 1,
      "text": "one sentence paraphrase of user feedback",
      "source": "Reddit r/MachineLearning",
      "sourceUrl": "url if available, empty string if not",
      "sentiment": "positive | negative | request",
      "date": "2025-12 or approximate"
    }
  ],
  "sourceSummary": { "Reddit": 3, "Hacker News": 2, "Twitter/X": 2, "Other": 2 },
  "clusters": [
    {
      "theme": "short descriptive theme name",
      "signals": [1, 3, 5],
      "urgency": 8,
      "impact": 9,
      "summary": "one-sentence summary of what users are saying and the business implication",
      "capability": "one of the capabilities listed below",
      "sentiment": "mostly_positive | mostly_negative | mixed"
    }
  ],
  "gtmInsights": [
    {
      "insight": "one-sentence actionable GTM recommendation referencing specific findings",
      "type": "Retention | Expansion | Efficiency | Acquisition"
    }
  ],
  "sentimentBreakdown": { "positive": 45, "negative": 35, "request": 20 },
  "topPraise": "the single most common positive theme in one sentence",
  "topComplaint": "the single most common complaint in one sentence"
}
<<<END>>>

Rules:
- Find 8-10 distinct signals. Keep signal text brief — maximum one sentence each.
- Paraphrase everything — do not copy exact quotes. Focus on substantive feedback, not generic praise.
- Prioritize recent discussions (last 6 months).
- Each signal belongs to exactly one cluster. Signal numbers in clusters match the id field.
- Urgency (1-10): How time-sensitive? Are users actively churning or blocked?
- Impact (1-10): How much does addressing this affect adoption, revenue, or market position?
- Create 3-6 clusters and 3-5 GTM insights covering different motion types.
- capability must be one of: Model Quality & Performance, API Reliability & Infrastructure, Rate Limits & Scaling, Enterprise Security & Compliance, Billing & Cost Management, Developer Experience & SDKs, Documentation & Onboarding, Fine-tuning & Customization, New Modalities, Collaboration & Team Features, Pricing & Packaging, Batch & Async Processing
- sentimentBreakdown values are percentages that add up to 100.`;

function extractFinalTextBlock(response: unknown): string {
  if (typeof response === "string") return response;
  if (typeof response !== "object" || response === null) return "";

  const obj = response as Record<string, unknown>;
  const content = obj.content;

  if (Array.isArray(content) && content.length > 0) {
    const textBlocks = content.filter(
      (block): block is Record<string, unknown> =>
        typeof block === "object" &&
        block !== null &&
        (block as Record<string, unknown>).type === "text" &&
        typeof (block as Record<string, unknown>).text === "string"
    );
    if (textBlocks.length > 0) {
      return textBlocks[textBlocks.length - 1].text as string;
    }
  }

  return "";
}

function extractDelimitedJson(text: string): string | null {
  const match = text.match(/<<<JSON>>>([\s\S]*?)<<<END>>>/i);
  return match ? match[1].trim() : null;
}

function findJsonInText(text: string): string | null {
  const delimited = extractDelimitedJson(text);
  if (delimited) return delimited;

  const cleaned = text.replace(/```json|```/g, "").trim();
  const firstBrace = cleaned.indexOf("{");
  if (firstBrace === -1) return null;

  let lastBrace = cleaned.lastIndexOf("}");
  while (lastBrace > firstBrace) {
    const candidate = cleaned.slice(firstBrace, lastBrace + 1);
    try {
      JSON.parse(candidate);
      return candidate;
    } catch {
      lastBrace = cleaned.lastIndexOf("}", lastBrace - 1);
    }
  }

  return null;
}

function parseJsonFromText(text: string) {
  const jsonBlock = findJsonInText(text);
  if (!jsonBlock) {
    throw new Error("Failed to locate JSON object within response text.");
  }
  try {
    return JSON.parse(jsonBlock);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    throw new Error(`JSON parse failure: ${errorMessage}. Raw text: ${JSON.stringify(text.slice(0, 500))}`);
  }
}

export async function POST(req: Request) {
  try {
    let body: { product?: string };
    try {
      body = (await req.json()) as { product?: string };
    } catch (parseErr) {
      console.error("/api/search: failed to parse request body", parseErr);
      return NextResponse.json({ error: "Invalid or empty request body" }, { status: 400 });
    }

    const product = body.product?.trim();
    console.log("Search API called for:", product);

    if (!product) {
      return NextResponse.json({ error: "Missing product" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "Missing ANTHROPIC_API_KEY in environment" }, { status: 500 });
    }

    const prompt = PROMPT_TEMPLATE.replaceAll("{{product}}", product);
    console.log("Search prompt length:", prompt.length);

    let response: unknown;
    try {
      response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 8192,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
      } as MessageCreateParams);
    } catch (err: unknown) {
      console.error("/api/search AI error", err);
      const asAny = err as any;
      const status = asAny?.status || (asAny?.error?.status ? Number(asAny.error.status) : undefined);
      const message = asAny?.message || asAny?.error?.message || "Unknown error calling Anthropic API";

      if (status === 429 || (typeof message === "string" && /rate limit/i.test(message))) {
        const retryAfter = asAny?.headers?.get?.("retry-after") || asAny?.headers?.["retry-after"];
        const headers: Record<string, string> = {};
        if (retryAfter) headers["Retry-After"] = String(retryAfter);
        return NextResponse.json({ error: "Rate limit reached. Please try again later." }, { status: 429, headers });
      }

      throw err;
    }

    const stopReason = typeof response === "object" && response !== null ? (response as any).stop_reason : undefined;
    let finalText = extractFinalTextBlock(response);
    console.log("Search finalText length:", finalText.length, "stop_reason:", stopReason);

    if (stopReason === "max_tokens") {
      console.warn("/api/search: stop_reason=max_tokens — response truncated, attempting JSON repair");
      const lastCompleteSignal = finalText.lastIndexOf("},");
      const lastSignalClose = finalText.lastIndexOf("}");
      const closeAt = lastCompleteSignal !== -1 ? lastCompleteSignal : lastSignalClose;
      if (closeAt !== -1) {
        finalText = finalText.slice(0, closeAt + 1) + "]}";
        console.warn("/api/search: repaired truncated JSON at position", closeAt);
      }
    }

    let parsed;
    try {
      parsed = parseJsonFromText(finalText);
      console.log("Search parsed keys:", Object.keys(parsed));
      console.log("Search signals count:", parsed.signals?.length ?? "no signals key");
      console.log("Search clusters count:", parsed.clusters?.length ?? "no clusters key");
    } catch (parseError: unknown) {
      console.error("/api/search parsing error", { error: parseError, finalText: finalText.slice(0, 500) });
      throw parseError;
    }

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error("/api/search error", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, unknown>;
    if (typeof err.message === "string") return err.message;
  }
  return String(error ?? "Unknown error");
}
