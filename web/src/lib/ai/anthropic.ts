const PRICES: Record<string, { in: number; out: number }> = {
  "claude-sonnet-5": { in: 3, out: 15 },
  "claude-opus-4-8": { in: 15, out: 75 },
  "claude-haiku-4-5-20251001": { in: 1, out: 5 },
};

const SYSTEM_PROMPT = [
  "You are BrandForge's in-thread AI assistant working inside a client–operator–founder project contract.",
  "Reply concisely and practically to the latest message in the thread.",
  "Never invent project facts; if you don't know, say so and ask the human.",
  "Keep replies under 250 words.",
].join("\n");

export interface ClaudeResult {
  text: string;
  tokens: number;
  cost: number;
}

export async function callClaude(opts: {
  model: string;
  transcript: string;
}): Promise<ClaudeResult> {
  if (process.env.AI_ANTHROPIC_STUB === "1") {
    const tokens = 120;
    const price = PRICES[opts.model] ?? { in: 3, out: 15 };
    const cost = (tokens * price.in + tokens * price.out) / 2 / 1_000_000;
    return {
      text: `[stub:${opts.model}] Thanks — this thread is now in context and the real model will answer once billing is live.`,
      tokens,
      cost,
    };
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY not set");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: opts.model,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: opts.transcript }],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Anthropic ${res.status}: ${detail.slice(0, 300)}`);
  }

  const j = await res.json();
  const text = (j.content ?? [])
    .filter((b: { type: string }) => b.type === "text")
    .map((b: { text: string }) => b.text)
    .join("")
    .trim();
  const inputTokens = j.usage?.input_tokens ?? 0;
  const outputTokens = j.usage?.output_tokens ?? 0;
  const price = PRICES[opts.model] ?? { in: 3, out: 15 };
  const cost = (inputTokens * price.in + outputTokens * price.out) / 1_000_000;
  return { text, tokens: inputTokens + outputTokens, cost };
}
