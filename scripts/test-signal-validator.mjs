// Inline the lenient isSignal + normalization logic from analyze/route.ts

function normalizeSignals(rawSignals) {
  const isSignal = (value) => {
    if (typeof value !== "object" || value === null) return false;
    return typeof value.text === "string";
  };

  return rawSignals.filter(isSignal).map((v, idx) => ({
    id: v.id != null ? String(v.id) : String(idx),
    text: v.text,
    source: typeof v.source === "string" ? v.source : "Unknown",
    sourceUrl: typeof v.sourceUrl === "string" ? v.sourceUrl : "",
    sentiment: typeof v.sentiment === "string" ? v.sentiment : "neutral",
    date: typeof v.date === "string" ? v.date : "2025-01",
  }));
}

const input = [
  // 1: perfect signal
  { id: "sig-1", text: "Great multimodal support", source: "Reddit", sourceUrl: "https://reddit.com/r/foo", sentiment: "positive", date: "2025-12" },
  // 2: missing sourceUrl and sentiment
  { id: "sig-2", text: "API rate limits are frustrating", source: "Hacker News", date: "2025-11" },
  // 3: numeric id, no date
  { id: 42, text: "Pricing model is confusing compared to competitors", source: "Twitter/X", sourceUrl: "", sentiment: "negative" },
];

const result = normalizeSignals(input);

console.log(`Input: ${input.length} objects → Output: ${result.length} signals\n`);

let allPass = true;
result.forEach((s, i) => {
  const checks = [
    ["id is string",      typeof s.id === "string"],
    ["text present",      typeof s.text === "string" && s.text.length > 0],
    ["source present",    typeof s.source === "string" && s.source.length > 0],
    ["sourceUrl string",  typeof s.sourceUrl === "string"],
    ["sentiment string",  typeof s.sentiment === "string" && s.sentiment.length > 0],
    ["date string",       typeof s.date === "string" && s.date.length > 0],
  ];
  const failed = checks.filter(([, ok]) => !ok);
  const status = failed.length === 0 ? "PASS" : `FAIL (${failed.map(([k]) => k).join(", ")})`;
  if (failed.length) allPass = false;
  console.log(`Signal ${i + 1} [${s.id}]: ${status}`);
  console.log(`  text: "${s.text.slice(0, 50)}", source: "${s.source}", sourceUrl: "${s.sourceUrl}", sentiment: "${s.sentiment}", date: "${s.date}"`);
});

console.log(`\n${allPass ? "PASS: all 3 signals accepted and normalised" : "FAIL: some signals rejected or malformed"}`);
if (!allPass) process.exit(1);
