export const CAP_MESSAGE =
  "AI usage limit reached for this ticket — contact BrandForge to increase it";

export const MENTION_MODELS: Record<string, string> = {
  "sonnet-5": "claude-sonnet-5",
  "opus-4.8": "claude-opus-4-8",
  "haiku-4.5": "claude-haiku-4-5-20251001",
};

export const MENTION_RE = /@(sonnet-5|opus-4\.8|haiku-4\.5)/i;

export function parseMentionModel(content: string): { key: string; model: string } | null {
  const m = content.match(MENTION_RE);
  if (!m) return null;
  const key = m[1].toLowerCase();
  const model = MENTION_MODELS[key];
  return model ? { key, model } : null;
}
