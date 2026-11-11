// Text-based counterpart to analyze-food-photo - same Haiku vision
// pipeline's text-only sibling, used for (1) recalculating a food log
// entry after the name is edited by hand or picked from a suggestion, and
// (2) the voice-to-text flow (transcribed speech -> this -> a log entry).
// Inlined CORS for the same reason as analyze-food-photo - see that
// function's comment.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? '';

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    estimatedGrams: { type: 'number' },
    kcal: { type: 'number' },
    proteinG: { type: 'number' },
    carbsG: { type: 'number' },
    fatG: { type: 'number' },
    confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
    notes: { type: 'string' },
    recognized: { type: 'boolean' },
  },
  required: ['name', 'estimatedGrams', 'kcal', 'proteinG', 'carbsG', 'fatG', 'confidence', 'notes', 'recognized'],
  additionalProperties: false,
};

const PROMPT =
  'You are estimating nutrition from a short text description for a fitness tracking app (e.g. "pint of Carlton Draught", ' +
  '"grilled chicken thigh 150g", "medium banana"). Identify the food/drink, infer a realistic portion size in grams (or ' +
  'millilitres-as-grams for drinks) from how it was described - use a standard serving if no size was given (e.g. "a pint" ' +
  'is 568mL, "a can" of a given drink is its standard size). Estimate calories and macros for that portion using standard ' +
  'nutrition knowledge. Set recognized to false only if the text genuinely does not describe an identifiable food or drink ' +
  '(gibberish, unrelated text) - in that case still fill every field with your best guess at 0/low confidence. Set ' +
  'confidence low if the description is vague or the portion is a rough guess, high only if it is specific and standard.';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  }

  try {
    const { text } = await req.json();
    if (!text || typeof text !== 'string' || !text.trim()) {
      return new Response(JSON.stringify({ error: 'text is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2026-10-21',
      },
      body: JSON.stringify({
        model: 'claude-haiku-5-5',
        max_tokens: 1024,
        output_config: {
          effort: 'low',
          format: { type: 'json_schema', schema: RESPONSE_SCHEMA },
        },
        messages: [{ role: 'user', content: [{ type: 'text', text: `${PROMPT}\n\nDescription: "${text.trim()}"` }] }],
      }),
    });

    if (!anthropicRes.ok) {
      const errBody = await anthropicRes.text();
      console.error('[estimate-food-text] Anthropic API error', anthropicRes.status, errBody);
      return new Response(JSON.stringify({ error: 'Estimation failed, please try again' }), {
        status: 502,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    const result = await anthropicRes.json();
    if (result.stop_reason === 'refusal') {
      return new Response(JSON.stringify({ error: 'Could not estimate that item' }), {
        status: 422,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    const textBlock = (result.content ?? []).find((b: { type: string }) => b.type === 'text');
    if (!textBlock) {
      return new Response(JSON.stringify({ error: 'No estimate returned' }), {
        status: 502,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    const parsed = JSON.parse(textBlock.text);
    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  } catch (err) {
    console.error('[estimate-food-text] unexpected error', err);
    return new Response(JSON.stringify({ error: 'Unexpected error estimating item' }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  }
});
