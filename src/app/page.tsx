import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg-primary text-text-primary">
      {/* Hero */}
      <section className="mx-auto flex max-w-4xl flex-col items-center px-4 pb-16 pt-24 text-center">
        <span className="mb-4 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-400">
          GTM x AI Portfolio Project
        </span>
        <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
          Customer Signal Prioritizer
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-text-muted">
          An AI-powered market intelligence tool that scans the web for real customer
          signals about AI products — then clusters, scores, and surfaces the highest-impact
          insights for GTM teams.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/app"
            className="rounded-xl bg-cyan-400 px-6 py-3 text-sm font-bold text-black hover:bg-cyan-300 transition-colors"
          >
            Try the App &rarr;
          </Link>
          <a
            href="https://github.com/aditiiwadhwa/customer-signal-prioritizer"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-border-main bg-black/30 px-6 py-3 text-sm font-semibold text-text-primary hover:bg-black/50 transition-colors"
          >
            View on GitHub
          </a>
        </div>
      </section>

      {/* Why This Matters */}
      <section className="border-t border-border-main bg-black/20">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <h2 className="text-2xl font-bold">Why this matters</h2>
          <p className="mt-3 text-text-muted">
            GTM teams spend hours manually scanning Reddit, review sites, and forums
            to understand what customers actually think. By the time insights make it
            into a deck, they&apos;re stale. This tool automates that entire workflow —
            from web crawling to prioritized action items — in under a minute.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              {
                stat: "&lt; 60s",
                label: "From product name to prioritized insights",
              },
              {
                stat: "10+",
                label: "Live web sources searched per query",
              },
              {
                stat: "0",
                label: "Manual research hours required",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-border-main bg-black/30 p-6 text-center"
              >
                <div
                  className="text-3xl font-bold text-cyan-400"
                  dangerouslySetInnerHTML={{ __html: item.stat }}
                />
                <div className="mt-2 text-sm text-text-muted">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="text-2xl font-bold">How it works</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          {[
            {
              step: "1",
              title: "Enter a product",
              desc: "Type any AI product name — Claude, Cursor, GitHub Copilot, etc.",
            },
            {
              step: "2",
              title: "Web search",
              desc: "Claude uses the web_search tool to pull live signals from Reddit, G2, forums, and more.",
            },
            {
              step: "3",
              title: "AI clustering",
              desc: "Signals are grouped into themes and scored by urgency and business impact.",
            },
            {
              step: "4",
              title: "GTM insights",
              desc: "Get actionable takeaways: top complaints, praise, positioning opportunities, and ICP signals.",
            },
          ].map((item) => (
            <div key={item.step} className="flex flex-col gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400 text-sm font-bold text-black">
                {item.step}
              </div>
              <div className="font-semibold">{item.title}</div>
              <div className="text-sm text-text-muted">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border-main bg-black/20">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <h2 className="text-2xl font-bold">What you get</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Urgency x Impact Matrix",
                desc: "A scatter plot that visually prioritizes which signal clusters deserve immediate GTM attention.",
              },
              {
                title: "Sentiment Breakdown",
                desc: "Pie chart showing the ratio of positive, negative, and neutral signals from real users.",
              },
              {
                title: "Top Priority Cards",
                desc: "The highest-scoring clusters surfaced at the top with supporting quotes and GTM context.",
              },
              {
                title: "GTM Insight Cards",
                desc: "Positioning gaps, ICP signals, and competitive angles extracted automatically.",
              },
              {
                title: "Signal Explorer",
                desc: "Browse every raw signal with source, sentiment, and date for deeper research.",
              },
              {
                title: "Cluster Deep-Dive",
                desc: "Expand any theme cluster to see all contributing signals and urgency/impact scores.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-border-main bg-black/30 p-5"
              >
                <div className="font-semibold text-text-primary">{feature.title}</div>
                <div className="mt-1 text-sm text-text-muted">{feature.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="text-2xl font-bold">Architecture</h2>
        <p className="mt-3 text-text-muted">
          Built to demonstrate how a GTM-focused AI application can be architected
          end-to-end using modern tooling.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[
            {
              layer: "Frontend",
              stack: "Next.js 14 App Router, React, Tailwind CSS, Recharts",
            },
            {
              layer: "AI Layer",
              stack: "Claude claude-sonnet-4-6 via Anthropic API with web_search tool use",
            },
            {
              layer: "API",
              stack: "Next.js Route Handlers — single /api/search endpoint combining research + analysis",
            },
            {
              layer: "Deployment",
              stack: "Vercel — zero-config, edge-ready, CI/CD on push",
            },
          ].map((item) => (
            <div
              key={item.layer}
              className="rounded-2xl border border-border-main bg-black/30 p-5"
            >
              <div className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
                {item.layer}
              </div>
              <div className="mt-1 text-sm text-text-muted">{item.stack}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border-main bg-black/20">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-4 py-16 text-center">
          <h2 className="text-2xl font-bold">See it in action</h2>
          <p className="mt-3 text-text-muted">
            Try it live — enter any AI product and get market intelligence in under a minute.
          </p>
          <Link
            href="/app"
            className="mt-6 rounded-xl bg-cyan-400 px-8 py-3 text-sm font-bold text-black hover:bg-cyan-300 transition-colors"
          >
            Launch the tool &rarr;
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-main py-8 text-center text-xs text-text-muted">
        Built by Aditi Wadhwa &mdash; GTM x AI Portfolio Project &nbsp;|&nbsp; Powered by Claude API
      </footer>
    </main>
  );
}
