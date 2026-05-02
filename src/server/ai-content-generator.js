/**
 * AI Content Generator using Groq API
 * Generates professional briefs, proposals, and career advice
 */

const { resolveLlmCredentials, defaultModelForProvider } = require('./ai-chat');

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

  const providerId = creds.providerId || 'groq';
  const model = defaultModelForProvider(providerId, env.aiModel || 'llama-3.3-70b-versatile');

  const systemPrompt = `You are an expert project brief generator. Create professional, structured project briefs based on user input.

Respond ONLY with a valid JSON object in this exact format:
{
  "title": "Project title (max 80 chars)",
  "description": "Detailed project description (2-3 paragraphs)",
  "requirements": ["requirement 1", "requirement 2", "requirement 3", "requirement 4"],
  "deliverables": ["deliverable 1", "deliverable 2", "deliverable 3"],
  "timeline": "X weeks/months",
  "budget": { "min": 1000, "max": 5000, "currency": "USD" },
  "skills": ["skill 1", "skill 2", "skill 3", "skill 4"],
  "category": "Category name"
}

Rules:
- Title should be concise and professional
- Requirements should be specific and actionable
- Budget min/max should be realistic numbers based on project scope
- Skills should be relevant technical or professional skills
- Category should be one of: Development, Design, Marketing, Writing, Consulting, Other`;

  const userPrompt = `Create a professional project brief for this request:\n\n${input}`;

  const response = await fetch(`${creds.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${creds.apiKey}`,
      ...(creds.extraHeaders || {}),
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI API error: ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

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

  const providerId = creds.providerId || 'groq';
  const model = defaultModelForProvider(providerId, env.aiModel || 'llama-3.3-70b-versatile');

  const systemPrompt = `You are an expert proposal writer for a professional services marketplace. Write compelling, structured proposals that win projects.

Your proposals should include:
1. Executive Summary - Brief overview of understanding and approach
2. Proposed Solution - Detailed methodology and approach
3. Timeline & Milestones - Clear project phases with deliverables
4. Investment - Value proposition and pricing justification
5. Why Choose Me - Unique qualifications and differentiators
6. Next Steps - Clear call to action

Write in a professional, confident tone. Format with clear markdown-style headers. Keep it concise but comprehensive (300-500 words).`;

  const userPrompt = `Write a winning proposal for this project:\n\n${input}`;

  const response = await fetch(`${creds.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${creds.apiKey}`,
      ...(creds.extraHeaders || {}),
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.75,
      max_tokens: 2500,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI API error: ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
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

  const providerId = creds.providerId || 'groq';
  const model = defaultModelForProvider(providerId, env.aiModel || 'llama-3.3-70b-versatile');

  const systemPrompt = `You are an expert career advisor for freelance professionals and specialists on BrandForge, a professional services marketplace.

Provide actionable, specific advice on:
- Pricing and rate strategies
- Portfolio development and presentation
- Client acquisition and retention
- Skill development and certification
- Work-life balance as a freelancer
- Building professional reputation
- Handling difficult client situations

Be encouraging but realistic. Provide concrete steps and examples. Keep responses helpful and concise (200-400 words).`;

  let userPrompt = `Career question: ${question}`;
  
  if (profile) {
    userPrompt += `\n\nMy profile:\n- Role: ${profile.headline || 'Specialist'}\n- Skills: ${profile.skills?.join(', ') || 'Various'}\n- Experience: ${profile.bio || 'Professional services'}`;
  }

  const response = await fetch(`${creds.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${creds.apiKey}`,
      ...(creds.extraHeaders || {}),
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI API error: ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

module.exports = {
  generateBriefWithAI,
  generateProposalWithAI,
  generateCareerAdvice,
};
