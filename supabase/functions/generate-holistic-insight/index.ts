/**
 * Atlas Core — generate-holistic-insight Edge Function
 *
 * Receives a pre-computed Health Dossier (JSON) and returns structured
 * AI insights by tier:
 *   - free:        1 teaser insight (headline only, body blurred client-side)
 *   - pro:         Full insights (training + nutrition + recovery correlations)
 *   - performance: Clinical insights (lab exams + protocols + all correlations)
 *
 * Expected body:
 *   { dossier: object, tier: 'free'|'pro'|'performance', locale?: string }
 *
 * Returns:
 *   { insights: Insight[], meta: { model, tokens_used, tier } }
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ── System Prompts by Tier ───────────────────────────────────────────────────

const SYSTEM_PROMPT_BASE = `You are Atlas AI, an expert sports scientist, strength coach, and clinical advisor.
You receive a structured Health Dossier (JSON) containing pre-computed metrics about a user.
Your job is to INTERPRET and CORRELATE these metrics — never recalculate them.

Rules:
- Be direct, practical, and evidence-based.
- Never diagnose or prescribe. Always recommend consulting a doctor for clinical decisions.
- Reference specific numbers from the dossier to support your insights.
- Each insight must have a clear, actionable recommendation.
- Respond in the locale language requested.`;

const SYSTEM_PROMPT_FREE = `${SYSTEM_PROMPT_BASE}

TIER: FREE
Generate exactly 1 insight. The insight should be intriguing and surface-level — enough to demonstrate value but leave the user wanting more detail. Focus on the most obvious pattern in the data.`;

const SYSTEM_PROMPT_PRO = `${SYSTEM_PROMPT_BASE}

TIER: PRO
Generate 3-5 insights covering different domains. Correlate across training, nutrition, and recovery. Be specific and actionable. Include:
1. A headline insight about the most important pattern
2. Training-specific insight (PRs, volume, adherence, muscle balance)
3. Nutrition insight (macro adherence, calorie balance vs goals)
4. Recovery insight (sleep, energy, hydration patterns)
5. A "next best action" — the single most impactful thing to do today`;

const SYSTEM_PROMPT_PERFORMANCE = `${SYSTEM_PROMPT_BASE}

TIER: PERFORMANCE
Generate 5-8 insights covering ALL domains including clinical data. This is the premium tier — be thorough and sophisticated. Include:
1. A headline insight correlating the most critical pattern across all data
2. Training performance insight with PR analysis and periodization suggestions
3. Nutrition insight with body composition correlation
4. Recovery and readiness assessment
5. Lab exam analysis — flag any markers out of range and correlate with training/nutrition
6. Protocol assessment — evaluate current supplementation/hormonal protocols against lab results
7. Risk alerts — any concerning patterns that warrant medical attention
8. Strategic recommendation — the optimal focus for the next training block`;

const TIER_PROMPTS: Record<string, string> = {
  free: SYSTEM_PROMPT_FREE,
  pro: SYSTEM_PROMPT_PRO,
  performance: SYSTEM_PROMPT_PERFORMANCE,
};

const TIER_MAX_TOKENS: Record<string, number> = {
  free: 400,
  pro: 1200,
  performance: 2000,
};

// ── Response Schema ──────────────────────────────────────────────────────────

const INSIGHT_SCHEMA = {
  type: 'object',
  properties: {
    insights: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Unique slug for this insight, e.g. "sleep-performance-correlation"' },
          category: {
            type: 'string',
            enum: ['headline', 'training', 'nutrition', 'recovery', 'lab_exams', 'protocols', 'risk_alert', 'next_action'],
          },
          icon: {
            type: 'string',
            enum: ['brain', 'dumbbell', 'utensils', 'moon', 'flask', 'pill', 'alert-triangle', 'target', 'trophy', 'trending-up', 'trending-down', 'zap'],
          },
          title: { type: 'string', description: 'Short impactful headline (max 12 words)' },
          body: { type: 'string', description: 'Detailed analysis paragraph (2-4 sentences)' },
          action: { type: 'string', description: 'One concrete actionable recommendation (1 sentence)' },
          severity: { type: 'string', enum: ['positive', 'neutral', 'attention', 'warning'] },
          confidence: { type: 'number', description: 'Confidence score 0-100 based on data quality' },
          data_sources: {
            type: 'array',
            items: { type: 'string' },
            description: 'Which dossier sections were used, e.g. ["training", "recovery"]',
          },
        },
        required: ['id', 'category', 'icon', 'title', 'body', 'action', 'severity', 'confidence', 'data_sources'],
      },
    },
  },
  required: ['insights'],
};

// ── Handler ──────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    const { dossier, tier = 'free', locale = 'en-US' } = await req.json();

    if (!dossier) {
      return new Response(JSON.stringify({ error: 'dossier is required' }), {
        status: 400,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
        status: 503,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = TIER_PROMPTS[tier] || TIER_PROMPTS.free;
    const maxTokens = TIER_MAX_TOKENS[tier] || TIER_MAX_TOKENS.free;

    const userPrompt = `Locale: ${locale}

Health Dossier:
${JSON.stringify(dossier, null, 2)}

Analyze this dossier and return structured insights as JSON matching this schema:
${JSON.stringify(INSIGHT_SCHEMA, null, 2)}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[generate-holistic-insight] Anthropic error:', err);
      return new Response(JSON.stringify({ error: 'LLM request failed' }), {
        status: 502,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const result = await response.json();
    const text = result.content?.[0]?.text ?? '';
    const usage = result.usage || {};

    // Parse JSON from response
    let insights = [];
    try {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      const parsed = JSON.parse(match ? match[1] : text);
      insights = parsed.insights || [parsed];
    } catch {
      // If parsing fails, create a single text insight
      insights = [{
        id: 'general-insight',
        category: 'headline',
        icon: 'brain',
        title: 'Analysis Complete',
        body: text,
        action: 'Review the analysis above and adjust your plan accordingly.',
        severity: 'neutral',
        confidence: 50,
        data_sources: ['training', 'nutrition', 'recovery'],
      }];
    }

    return new Response(
      JSON.stringify({
        insights,
        meta: {
          model: 'claude-haiku-4-5-20251001',
          tokens_input: usage.input_tokens || 0,
          tokens_output: usage.output_tokens || 0,
          tier,
          generated_at: new Date().toISOString(),
        },
      }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[generate-holistic-insight] unexpected error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
