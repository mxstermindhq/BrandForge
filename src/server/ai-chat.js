/**
 * mx Agent — multi-provider chat (Anthropic, OpenAI-compatible, Gemini).
 * Set named keys in .env and AI_PROVIDER, or use legacy AI_API_KEY alone.
 */

const OPENAI_DEFAULT_BASE = 'https://api.openai.com/v1';

function resolveProviderId(explicit, fallbackInfer) {
  const e = String(explicit || '').toLowerCase().trim();
  const allowed = new Set([
    'anthropic',
    'openai',
    'groq',
    'openrouter',
    'mistral',
    'together',
    'xai',
    'gemini',
    'google',
  ]);
  if (allowed.has(e)) return e === 'google' ? 'gemini' : e;
  return fallbackInfer;
}

/**
 * Pick credentials from env. Does not read filesystem — pass getEnv() result.
 */
function resolveLlmCredentials(env) {
  const legacy = String(env.aiApiKey || '').trim();
  const anthropicKey = String(env.anthropicApiKey || '').trim();
  const openaiKey = String(env.openaiApiKey || '').trim();
  const groqKey = String(env.groqApiKey || '').trim();
  const openrouterKey = String(env.openrouterApiKey || '').trim();
  const mistralKey = String(env.mistralApiKey || '').trim();
  const togetherKey = String(env.togetherApiKey || '').trim();
  const xaiKey = String(env.xaiApiKey || '').trim();
  const geminiKey = String(env.geminiApiKey || '').trim();

  const inferFromKeys = () => {
    if (anthropicKey || legacy.startsWith('sk-ant-')) return 'anthropic';
    if (openaiKey || (legacy && !legacy.startsWith('sk-ant-'))) return 'openai';
    if (groqKey) return 'groq';
    if (openrouterKey) return 'openrouter';
    if (mistralKey) return 'mistral';
    if (togetherKey) return 'together';
    if (xaiKey) return 'xai';
    if (geminiKey) return 'gemini';
    return '';
  };

  const provider = resolveProviderId(env.aiProvider, inferFromKeys());

  if (provider === 'anthropic') {
    const apiKey = anthropicKey || (legacy.startsWith('sk-ant-') ? legacy : '');
    return apiKey
      ? { kind: 'anthropic', apiKey, providerId: 'anthropic' }
      : { kind: 'none', providerId: 'anthropic' };
  }

  if (provider === 'gemini') {
    const apiKey = geminiKey;
    return apiKey ? { kind: 'gemini', apiKey, providerId: 'gemini' } : { kind: 'none', providerId: 'gemini' };
  }

  const openAiCompatMap = {
    openai: {
      apiKey: openaiKey || (legacy && !legacy.startsWith('sk-ant-') ? legacy : ''),
      baseUrl: env.aiOpenaiBaseUrl || OPENAI_DEFAULT_BASE,
      extraHeaders: {},
    },
    groq: {
      apiKey: groqKey,
      baseUrl: 'https://api.groq.com/openai/v1',
      extraHeaders: {},
    },
    openrouter: {
      apiKey: openrouterKey,
      baseUrl: 'https://openrouter.ai/api/v1',
      extraHeaders: {
        ...(env.openrouterHttpReferer ? { 'HTTP-Referer': String(env.openrouterHttpReferer) } : {}),
        'X-Title': 'mxstermind',
      },
    },
    mistral: {
      apiKey: mistralKey,
      baseUrl: 'https://api.mistral.ai/v1',
      extraHeaders: {},
    },
    together: {
      apiKey: togetherKey,
      baseUrl: 'https://api.together.xyz/v1',
      extraHeaders: {},
    },
    xai: {
      apiKey: xaiKey,
      baseUrl: 'https://api.x.ai/v1',
      extraHeaders: {},
    },
  };

  if (openAiCompatMap[provider]) {
    const { apiKey, baseUrl, extraHeaders } = openAiCompatMap[provider];
    if (!apiKey) return { kind: 'none', providerId: provider };
    return {
      kind: 'openai_compat',
      apiKey,
      baseUrl: String(baseUrl).replace(/\/$/, ''),
      extraHeaders,
      providerId: provider,
    };
  }

  if (legacy) {
    if (legacy.startsWith('sk-ant-')) {
      return { kind: 'anthropic', apiKey: legacy, providerId: 'anthropic' };
    }
    return {
      kind: 'openai_compat',
      apiKey: legacy,
      baseUrl: (env.aiOpenaiBaseUrl || OPENAI_DEFAULT_BASE).replace(/\/$/, ''),
      extraHeaders: {},
      providerId: 'openai',
    };
  }

  return { kind: 'none', providerId: '' };
}

function hasConfiguredLlm(env) {
  const c = resolveLlmCredentials(env);
  return c.kind !== 'none' && Boolean(c.apiKey);
}

function defaultModelForProvider(providerId, modelOverride) {
  if (modelOverride && String(modelOverride).trim()) return String(modelOverride).trim();
  const d = {
    anthropic: 'claude-sonnet-4-20250514',
    openai: 'gpt-4o-mini',
    groq: 'llama-3.3-70b-versatile',
    openrouter: 'openai/gpt-4o-mini',
    mistral: 'mistral-small-latest',
    together: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    xai: 'grok-2-latest',
    gemini: 'gemini-2.0-flash',
  };
  return d[providerId] || 'gpt-4o-mini';
}

function buildSystemPrompt(mode) {
  const base =
    'You are mx Agent on mxstermind — an AI assistant for professional marketplace work. ' +
    'Be concise and practical. Label uncertainty. Never claim to have taken actions on the platform.';
  const modes = {
    general: `${base} Answer the user directly.`,
    brief: `${base} Turn the user's rough idea into a structured brief with sections: Summary, Scope, Deliverables, Timeline, Budget guidance. Keep it editable.`,
    bid: `${base} Draft a professional bid: approach, timeline, pricing rationale (ranges OK), and assumptions.`,
    summarize: `${base} Summarize the pasted text: key points, decisions, open questions. Use short bullets.`,
    price: `${base} Suggest a fair price range and delivery timeline; explain briefly in 2–4 sentences.`,
    milestones: `${base} Propose 4–8 project milestones as a numbered list (title — one line description each).`,
    research:
      `${base} You are producing a Deep Research-style memo. Use clear sections: Overview, Key findings, Competitors/alternatives (if relevant), Risks & unknowns, Recommended next steps. ` +
      'You do not have live web access in this deployment: do not invent URLs or claim you browsed. ' +
      'End with a short "Reference types to verify" list (e.g. industry reports, company filings) the reader should look up — not fake citations.',
  };
  return modes[mode] || modes.general;
}

function mergeAnthropicTurns(messages) {
  const out = [];
  for (const m of messages) {
    const role = m.role === 'assistant' ? 'assistant' : 'user';
    const prev = out[out.length - 1];
    if (prev && prev.role === role) {
      prev.content = [{ type: 'text', text: `${prev.content[0].text}\n\n${m.content}` }];
    } else {
      out.push({ role, content: [{ type: 'text', text: m.content }] });
    }
  }
  return out;
}

async function anthropicComplete({ apiKey, model, system, messages }) {
  const body = {
    model,
    max_tokens: 4096,
    system,
    messages: mergeAnthropicTurns(messages),
  };
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error?.message || data.message || res.statusText || 'Anthropic request failed';
    throw new Error(msg);
  }
  const block = (data.content || []).find((b) => b.type === 'text');
  return block && block.text ? String(block.text) : '';
}

async function openaiCompatibleComplete({ apiKey, baseUrl, model, system, messages, extraHeaders = {} }) {
  const apiMessages = [{ role: 'system', content: system }, ...messages];
  const url = `${baseUrl}/chat/completions`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      messages: apiMessages,
      temperature: 0.6,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error?.message || data.message || res.statusText || 'LLM request failed';
    throw new Error(msg);
  }
  const text = data.choices?.[0]?.message?.content;
  return text != null ? String(text) : '';
}

async function geminiComplete({ apiKey, model, system, messages }) {
  const userBlob = messages.map((m) => `${m.role}: ${m.content}`).join('\n\n');
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const url = `${endpoint}?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: userBlob }] }],
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error?.message || data.message || res.statusText || 'Gemini request failed';
    throw new Error(msg);
  }
  const parts = data.candidates?.[0]?.content?.parts || [];
  const text = parts.map((p) => p.text || '').join('');
  return text ? String(text) : '';
}

/**
 * @param {object} opts
 * @param {object} opts.env - result of getEnv()
 * @param {string} [opts.model] - override default model
 * @param {string} opts.mode
 * @param {{role: string, content: string}[]} opts.messages
 */
async function completeMxAgentChat(opts) {
  const { env, model: modelOverride, mode, messages } = opts;
  const creds = resolveLlmCredentials(env);
  if (creds.kind === 'none' || !creds.apiKey) {
    throw new Error(
      'No LLM API key configured. Set ANTHROPIC_API_KEY, OPENAI_API_KEY, GROQ_API_KEY, or another provider key (see .env.example), or legacy AI_API_KEY.',
    );
  }

  const raw = Array.isArray(messages) ? messages : [];
  const normalized = raw
    .map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content || '').trim(),
    }))
    .filter((m) => m.content);
  if (!normalized.length) throw new Error('At least one message is required');

  const system = buildSystemPrompt(mode);
  const providerId = creds.providerId || 'openai';
  const model = defaultModelForProvider(providerId, modelOverride || env.aiModel);

  if (creds.kind === 'anthropic') {
    return anthropicComplete({ apiKey: creds.apiKey, model, system, messages: normalized });
  }
  if (creds.kind === 'gemini') {
    return geminiComplete({ apiKey: creds.apiKey, model, system, messages: normalized });
  }
  return openaiCompatibleComplete({
    apiKey: creds.apiKey,
    baseUrl: creds.baseUrl,
    model,
    system,
    messages: normalized,
    extraHeaders: creds.extraHeaders,
  });
}

module.exports = {
  completeMxAgentChat,
  resolveLlmCredentials,
  hasConfiguredLlm,
  buildSystemPrompt,
};
