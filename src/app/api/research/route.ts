import { NextResponse } from "next/server";
import { Anthropic } from "@anthropic-ai/sdk";
import { getResearchPrompt } from "../../../../lib/prompts";


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
        typeof block === "object" && block !== null && (block as Record<string, unknown>).type === "text" && typeof (block as Record<string, unknown>).text === "string"
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

export function findJsonInText(text: string): string | null {
  // Prefer explicit delimiters if present.
  const delimited = extractDelimitedJson(text);
  if (delimited) return delimited;

  // Strip markdown code fences (e.g. ```json ... ```) to simplify parsing.
  const cleaned = text.replace(/```json|```/g, "").trim();

  // Find the first { and last } to get the largest possible JSON object.
  const firstBrace = cleaned.indexOf("{");
  if (firstBrace === -1) return null;

  // Try progressively shorter substrings from the last } backwards until one parses.
  let lastBrace = cleaned.lastIndexOf("}");
  while (lastBrace > firstBrace) {
    const candidate = cleaned.slice(firstBrace, lastBrace + 1);
    try {
      JSON.parse(candidate);
      return candidate;
    } catch {
      // shrink from the right and try again
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
    throw new Error(
      `JSON parse failure: ${errorMessage}. Raw response text: ${JSON.stringify(
        text
      )}`
    );
  }
}

export async function POST(req: Request) {
  try {
    let body: { product?: string };
    try {
      body = (await req.json()) as { product?: string };
    } catch (parseErr) {
      console.error("/api/research: failed to parse request body", parseErr, "content-type:", req.headers.get("content-type"), "url:", req.url);
      return NextResponse.json({ error: "Invalid or empty request body" }, { status: 400 });
    }
    const product = body.product?.trim();

    console.log("Research API called for:", product);

    if (!product) {
      return NextResponse.json({ error: "Missing product" }, { status: 400 });
    }


    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Missing ANTHROPIC_API_KEY in environment" },
        { status: 500 }
      );
    }

    const prompt = getResearchPrompt(product);
    console.log("Research prompt length", prompt.length);

    let response: unknown;
    try {
      response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 8192,
        tools: [
          {
            type: "web_search_20250305",
            name: "web_search",
          },
        ],
      } as MessageCreateParams);
    } catch (err: unknown) {
      console.error("/api/research AI error", err);
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

    const stopReason = typeof response === "object" && response !== null ? (response as any).stop_reason : undefined;
    let finalText = extractFinalTextBlock(response);

    if (stopReason === "max_tokens") {
      console.warn("/api/research: stop_reason=max_tokens — response was truncated, attempting JSON repair");
      // Find the last complete signal object and close the JSON structure around it.
      const lastCompleteSignal = finalText.lastIndexOf("},");
      const lastSignalClose = finalText.lastIndexOf("}");
      const closeAt = lastCompleteSignal !== -1 ? lastCompleteSignal : lastSignalClose;
      if (closeAt !== -1) {
        finalText = finalText.slice(0, closeAt + 1) + "]}";
        console.warn("/api/research: repaired truncated JSON, trimmed to position", closeAt);
      }
    }

    let parsed;
    try {
      parsed = parseJsonFromText(finalText);
      console.log('Parsed research keys:', Object.keys(parsed));
      console.log('Parsed research signals count:', parsed.signals?.length ?? 'no signals key');
      console.log('Parsed research data preview:', JSON.stringify(parsed).slice(0, 200));
    } catch (parseError: unknown) {
      console.error("/api/research parsing error", {
        error: parseError,
        response,
        finalText,
      });
      throw parseError;
    }

    // Attach token usage info from the Anthropic response so the frontend can
    // decide whether it should pause before making the next request.
    const usage = typeof response === "object" && response !== null ? (response as any).usage : undefined;

    return NextResponse.json({
      ...parsed,
      tokenUsage: usage,
    });
  } catch (error: unknown) {
    console.error("/api/research error", error);
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
