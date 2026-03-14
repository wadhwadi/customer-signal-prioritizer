// Inline copy of findJsonInText from src/app/api/research/route.ts
// (can't import the route directly due to next/server dependency)

function extractDelimitedJson(text) {
  const match = text.match(/<<<JSON>>>([\s\S]*?)<<<END>>>/i);
  return match ? match[1].trim() : null;
}

function findJsonInText(text) {
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

// Sample input that mimics actual Claude output
const input = `Based on my research about GPT-4o, here are the findings:
\`\`\`json
{"product":"GPT-4o","signalsFound":3,"signals":[{"id":1,"text":"GPT-4o is fast but sometimes hallucinates","source":"Reddit","sourceUrl":"","sentiment":"negative","date":"2025-12"},{"id":2,"text":"Love the multimodal capabilities","source":"Twitter/X","sourceUrl":"","sentiment":"positive","date":"2025-11"},{"id":3,"text":"Pricing is confusing compared to competitors","source":"Hacker News","sourceUrl":"","sentiment":"negative","date":"2025-12"}],"sourceSummary":{"Reddit":1,"Twitter/X":1,"Hacker News":1}}
\`\`\``;

console.log("Input length:", input.length);

const result = findJsonInText(input);
if (!result) {
  console.log("FAIL: findJsonInText returned null");
  process.exit(1);
}

let parsed;
try {
  parsed = JSON.parse(result);
} catch (e) {
  console.log("FAIL: JSON.parse threw:", e.message);
  console.log("Raw result:", result.slice(0, 300));
  process.exit(1);
}

console.log("Parsed keys:", Object.keys(parsed));
console.log("signals count:", parsed.signals?.length ?? "no signals key");

if (Array.isArray(parsed.signals) && parsed.signals.length === 3) {
  console.log("PASS: signals array has 3 items");
} else {
  console.log("FAIL: expected signals.length === 3, got:", parsed.signals?.length ?? "no signals key");
  process.exit(1);
}
