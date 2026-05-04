/**
 * AI Content Generator using Groq API
 * Generates professional briefs, proposals, and career advice
 */

const { resolveLlmCredentials, defaultModelForProvider, completeMxAgentChat } = require('./ai-chat');

/**
 * Generate a professional project brief using AI
 * @param {string} input - User's project description
 * @param {object} env - Environment variables
 * @returns {Promise<object>} - Generated brief structure
 */
async function generateBriefWithAI(input, env) {
  const creds = resolveLlmCredentials(env);
  if (creds.kind === 'none' || !creds.apiKey) {
    throw new Error('No LLM API key configured. Set GROQ_API_KEY or another provider key.');
  }

  const userPrompt = `Create a professional project brief for this request:\n\n${input}`;
  const response = await completeMxAgentChat({
    env,
    mode: 'brief',
    messages: [{ role: 'user', content: userPrompt }],
  });

  const content = String(response || '');

  // Parse the JSON response
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        title: parsed.title || 'Untitled Project',
        description: parsed.description || '',
        requirements: Array.isArray(parsed.requirements) ? parsed.requirements : [],
        deliverables: Array.isArray(parsed.deliverables) ? parsed.deliverables : [],
        timeline: parsed.timeline || '2-4 weeks',
        budget: parsed.budget || { min: 1000, max: 5000, currency: 'USD' },
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        category: parsed.category || 'Development',
      };
    }
  } catch (e) {
    console.error('Failed to parse AI response:', e);
  }

  // Fallback: return structured data from raw response
  return {
    title: 'AI-Generated Project Brief',
    description: content.slice(0, 500),
    requirements: ['Detailed requirements to be defined'],
    deliverables: ['Project deliverables to be specified'],
    timeline: '2-4 weeks',
    budget: { min: 1000, max: 5000, currency: 'USD' },
    skills: ['React', 'Node.js', 'Design', 'Project Management'],
    category: 'Development',
  };
}

/**
 * Generate a professional proposal using AI
 * @param {string} input - Project details or brief
 * @param {object} env - Environment variables
 * @returns {Promise<string>} - Generated proposal text
 */
async function generateProposalWithAI(input, env) {
  const creds = resolveLlmCredentials(env);
  if (creds.kind === 'none' || !creds.apiKey) {
    throw new Error('No LLM API key configured. Set GROQ_API_KEY or another provider key.');
  }

  const userPrompt = `Write a winning proposal for this project:\n\n${input}`;
  const response = await completeMxAgentChat({
    env,
    mode: 'bid',
    messages: [{ role: 'user', content: userPrompt }],
  });

  return String(response || '');
}

/**
 * Generate career advice using AI
 * @param {string} question - Career question or situation
 * @param {object} profile - User profile data (optional)
 * @param {object} env - Environment variables
 * @returns {Promise<string>} - Generated career advice
 */
async function generateCareerAdvice(question, profile, env) {
  const creds = resolveLlmCredentials(env);
  if (creds.kind === 'none' || !creds.apiKey) {
    throw new Error('No LLM API key configured. Set GROQ_API_KEY or another provider key.');
  }

  let userPrompt = `Career question: ${question}`;
  if (profile) {
    userPrompt += `\n\nMy profile:\n- Role: ${profile.headline || 'Specialist'}\n- Skills: ${profile.skills?.join(', ') || 'Various'}\n- Experience: ${profile.bio || 'Professional services'}`;
  }

  const response = await completeMxAgentChat({
    env,
    mode: 'general',
    messages: [{ role: 'user', content: userPrompt }],
  });

  return String(response || '');
}

module.exports = {
  generateBriefWithAI,
  generateProposalWithAI,
  generateCareerAdvice,
};
