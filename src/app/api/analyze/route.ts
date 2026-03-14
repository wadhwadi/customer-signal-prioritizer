import { NextResponse } from "next/server";
import { Anthropic } from "@anthropic-ai/sdk";
import type { Signal } from "../../../../lib/types";
import { getAnalysisPrompt } from "../../../../lib/prompts";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type MessageCreateParams = Parameters<Anthropic["messages"]["create"]>[0];

function extractFinalTextBlock(response: unknown): string {
  if (typeof response === "string") return response;
  if (typeof response !== "object" || response === null) return "";

  const obj = response as Record<string, unknown>;
  const message = obj.message;
  const content = obj.content ?? (typeof message === "object" && message !== null ? (message as Record<string, unknown>).content : undefined);

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

    const lastWithText = [...content].reverse().find(
      (block) => typeof block === "object" && block !== null && typeof (block as Record<string, unknown>).text === "string"
    );
    if (lastWithText) {
      return (lastWithText as Record<string, unknown>).text as string;
    }
  }

  return "";
}

function extractDelimitedJson(text: string): string | null {
  const match = text.match(/<<<JSON>>>([\s\S]*?)<<<END>>>/i);
  return match ? match[1].trim() : null;
}

function findJsonInText(text: string): string | null {
  // Prefer explicit delimiters if present.
  const delimited = extractDelimitedJson(text);
  if (delimited) return delimited;

  const cleaned = text.replace(/```json|```/g, "").trim();
  if (!cleaned) return null;

  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch {
    // continue to attempt extraction
  }

  const candidates = Array.from(cleaned.matchAll(/\{[\s\S]*?\}/g)).map((m) => m[0]);
  const jsonLikeCandidates = candidates.filter((c) => /"[^"\n]*"\s*:/.test(c));
  const toTry = jsonLikeCandidates.length ? jsonLikeCandidates : candidates;

  for (const candidate of toTry) {
    try {
      JSON.parse(candidate);
      return candidate;
    } catch {
      // ignore and keep trying
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
    throw new Error(
      `JSON parse failure: ${errorMessage}. Raw response text: ${JSON.stringify(
        text
      )}`
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { product?: string; signals?: unknown[] };
    const product = body.product?.trim();

    console.log("Analyze API called for:", product);

    console.log("Analyze API raw signals sample:", Array.isArray(body.signals) ? JSON.stringify(body.signals.slice(0, 2)) : "not an array");

    const isSignal = (value: unknown): value is Record<string, unknown> => {
      if (typeof value !== "object" || value === null) return false;
      return typeof (value as Record<string, unknown>).text === "string";
    };

    const signals: Signal[] = Array.isArray(body.signals)
      ? body.signals.filter(isSignal).map((value, idx) => {
          const v = value as Record<string, unknown>;
          return {
            id: v.id != null ? String(v.id) : String(idx),
            text: v.text as string,
            source: typeof v.source === "string" ? v.source : "Unknown",
            sourceUrl: typeof v.sourceUrl === "string" ? v.sourceUrl : "",
            sentiment: typeof v.sentiment === "string" ? v.sentiment : "neutral",
            date: typeof v.date === "string" ? v.date : "2025-01",
          };
        })
      : [];

    console.log("Analyze API received signals count:", Array.isArray(body.signals) ? body.signals.length : 0, "validated:", signals.length);

    if (!product) {
      return NextResponse.json({ error: "Missing product" }, { status: 400 });
    }

    if (!signals.length) {
      return NextResponse.json({ error: "Missing signals" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Missing ANTHROPIC_API_KEY in environment" },
        { status: 500 }
      );
    }

    const prompt = getAnalysisPrompt(product, signals);

    let response: unknown;
    try {
      response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2048,
      } as MessageCreateParams);
    } catch (err: unknown) {
      console.error("/api/analyze AI error", err);
      const asAny = err as any;
      const status = asAny?.status || (asAny?.error?.status ? Number(asAny.error.status) : undefined);
      const message =
        asAny?.message || asAny?.error?.message ||
        "Unknown error calling Anthropic API";

      if (status === 429 || (typeof message === "string" && /rate limit/i.test(message))) {
        const retryAfter = asAny?.headers?.get?.("retry-after") || asAny?.headers?.["retry-after"];
        const headers: Record<string, string> = {};
        if (retryAfter) headers["Retry-After"] = String(retryAfter);
        return NextResponse.json({ error: "Rate limit reached. Please try again later." }, { status: 429, headers });
      }

      throw err;
    }

    const finalText = extractFinalTextBlock(response);
    const parsed = parseJsonFromText(finalText);

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error("/api/analyze error", error);
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
