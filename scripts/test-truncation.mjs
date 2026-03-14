// Test the max_tokens truncation safety net logic inline

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

// Simulate a truncated response: JSON cuts off mid-signal at "sentiment"
const truncatedText = `Now I have comprehensive data about the product. Here are my findings:

<<<JSON>>>
{
  "product": "GPT-4o",
  "signalsFound": 5,
  "signals": [
    {"id":1,"text":"GPT-4o handles vision tasks well but struggles with complex diagrams","source":"Reddit","sourceUrl":"","sentiment":"negative","date":"2025-12"},
    {"id":2,"text":"The API latency has improved significantly in recent months","source":"Hacker News","sourceUrl":"","sentiment":"positive","date":"2025-11"},
    {"id":3,"text":"Pricing structure is hard to predict for high-volume use cases","source":"Twitter/X","sourceUrl":"","sentiment":"negative","date":"2025-12"},
    {"id":4,"text":"Context window of 128k is great for document analysis","source":"Reddit","sourceUrl":"","sentiment":"positive","date":"2025-11"},
    {"id":5,"text":"Inconsistent JSON mode outputs break our pipelines","source":"Hacker News","sourceUrl":"","sentiment`;
// ^ cuts off here — no closing quote, no closing braces

// Replicate the safety net logic from the route
let finalText = truncatedText;
const stopReason = "max_tokens"; // simulated

if (stopReason === "max_tokens") {
  console.log("Simulating max_tokens safety net...");
  const lastCompleteSignal = finalText.lastIndexOf("},");
  const lastSignalClose = finalText.lastIndexOf("}");
  const closeAt = lastCompleteSignal !== -1 ? lastCompleteSignal : lastSignalClose;
  if (closeAt !== -1) {
    finalText = finalText.slice(0, closeAt + 1) + "]}";
    console.log("Repaired at position", closeAt);
    console.log("Repaired tail:", JSON.stringify(finalText.slice(-60)));
  }
}

const jsonStr = findJsonInText(finalText);
if (!jsonStr) {
  console.log("FAIL: findJsonInText returned null after repair");
  process.exit(1);
}

let parsed;
try {
  parsed = JSON.parse(jsonStr);
} catch (e) {
  console.log("FAIL: JSON.parse threw after repair:", e.message);
  console.log("Attempted JSON tail:", jsonStr.slice(-100));
  process.exit(1);
}

console.log("Parsed keys:", Object.keys(parsed));
console.log("Recovered signals count:", parsed.signals?.length ?? "no signals key");
parsed.signals?.forEach((s) => console.log(`  [${s.id}] ${s.text.slice(0, 60)}`));

if (Array.isArray(parsed.signals) && parsed.signals.length === 4) {
  console.log("PASS: recovered 4 complete signals (signal 5 was truncated and dropped)");
} else {
  console.log("FAIL: unexpected signals count:", parsed.signals?.length);
  process.exit(1);
}
