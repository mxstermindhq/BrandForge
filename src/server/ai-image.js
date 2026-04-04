/**
 * Image generation via OpenAI Images API (DALL·E 3).
 * Use AI_IMAGE_KEY or an OpenAI-compatible AI_API_KEY (not Anthropic).
 */

function resolveOpenAiImageKey(env) {
  if (env.aiImageKey) return String(env.aiImageKey).trim();
  const openaiNamed = String(env.openaiApiKey || '').trim();
  if (openaiNamed) return openaiNamed;
  const provider = String(env.aiProvider || '').toLowerCase();
  const k = String(env.aiApiKey || '').trim();
  if (!k || k.startsWith('sk-ant-')) return '';
  if (provider === 'anthropic') return '';
  return k;
}

async function generateOpenAiImage({ apiKey, prompt, size = '1024x1024' }) {
  const text = String(prompt || '').trim();
  if (!text) throw new Error('prompt is required');
  if (!apiKey) throw new Error('Image generation requires AI_IMAGE_KEY or an OpenAI AI_API_KEY');

  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: text.slice(0, 4000),
      n: 1,
      size: size === '1792x1024' || size === '1024x1792' ? size : '1024x1024',
      quality: 'standard',
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error?.message || data.message || res.statusText || 'Image API failed';
    throw new Error(msg);
  }
  const url = data.data?.[0]?.url;
  const b64 = data.data?.[0]?.b64_json;
  if (url) return { url, revisedPrompt: data.data[0]?.revised_prompt || null };
  if (b64) return { url: `data:image/png;base64,${b64}`, revisedPrompt: null };
  throw new Error('No image in API response');
}

module.exports = { generateOpenAiImage, resolveOpenAiImageKey };
