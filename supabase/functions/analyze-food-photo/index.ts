// Called directly from the app (not a DB trigger) once someone takes a
// food or recipe photo in the macro counter. Runs on Claude Haiku 5.5 -
// cheap enough (~$0.0004/photo, see cost discussion) that this is the
// right default; the harder "recipe with many ingredients" case can move
// to a stronger model later if accuracy demands it. The Anthropic API key
// lives only in this function's env - it never reaches the client.
// Inlined rather than imported from a shared file - this is the first
// browser/WebView-invoked function in this project (the others are
// server-to-server webhooks), and the Management API's deploy bundler
// resolves relative imports against a flattened upload root, not this
// repo's folder layout.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? '';

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          estimatedGrams: { type: 'number' },
          kcal: { type: 'number' },
          proteinG: { type: 'number' },
          carbsG: { type: 'number' },
          fatG: { type: 'number' },
          itemConfidence: { type: 'string', enum: ['low', 'medium', 'high'] },
          alternatives: { type: 'array', items: { type: 'string' } },
        },
        required: ['name', 'estimatedGrams', 'kcal', 'proteinG', 'carbsG', 'fatG', 'itemConfidence', 'alternatives'],
        additionalProperties: false,
      },
    },
    totalKcal: { type: 'number' },
    totalProteinG: { type: 'number' },
    totalCarbsG: { type: 'number' },
    totalFatG: { type: 'number' },
    confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
    notes: { type: 'string' },
  },
  required: ['items', 'totalKcal', 'totalProteinG', 'totalCarbsG', 'totalFatG', 'confidence', 'notes'],
  additionalProperties: false,
};

function promptFor(mode: string): string {
  const base =
    "You are estimating nutrition from a photo for a fitness tracking app. Identify each DISTINCT food item visible as its " +
    'own separate entry in items (e.g. a plate with chicken, rice and broccoli is three items, not one combined entry) - ' +
    'estimate each one\'s portion size in grams as actually served/eaten (not a generic 100g reference), and estimate its ' +
    'macros (calories, protein, carbs, fat) for that estimated portion - not per 100g. Use standard nutrition knowledge for ' +
    'common foods and typical restaurant/home portion sizes. For EACH item set itemConfidence individually - "low" when you ' +
    "genuinely aren't sure what the item is (an ambiguous sauce, an unclear protein, a dish that could be one of several " +
    'things); when itemConfidence is "low", put 2-3 plausible alternative names in that item\'s alternatives array (e.g. ' +
    '["grilled chicken breast", "grilled chicken thigh", "turkey breast"]) - otherwise leave alternatives as an empty array. ' +
    'Sum the items into totals. Set the overall confidence to "low" if the image itself is unclear or oddly angled, "high" ' +
    'only for a clear, well-lit, easily identifiable photo. Put any caveats (e.g. "sauce/dressing amount is a guess") in notes.';
  if (mode === 'recipe') {
    return (
      base +
      ' This photo may show a recipe, a multi-ingredient dish, or a cooking step rather than a single packaged item - break ' +
      'it into its component ingredients where visible, and account for cooking method (fried vs grilled, etc.) when it ' +
      'visibly changes the fat content.'
    );
  }
  return base;
}

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
    const { imageBase64, mediaType, mode } = await req.json();
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return new Response(JSON.stringify({ error: 'imageBase64 is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }
    const safeMediaType = typeof mediaType === 'string' && mediaType.startsWith('image/') ? mediaType : 'image/jpeg';

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2026-10-21',
      },
      body: JSON.stringify({
        model: 'claude-haiku-5-5',
        max_tokens: 2048,
        output_config: {
          effort: 'low',
          format: { type: 'json_schema', schema: RESPONSE_SCHEMA },
        },
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: safeMediaType, data: imageBase64 } },
              { type: 'text', text: promptFor(typeof mode === 'string' ? mode : 'food') },
            ],
          },
        ],
      }),
    });

    if (!anthropicRes.ok) {
      const errBody = await anthropicRes.text();
      console.error('[analyze-food-photo] Anthropic API error', anthropicRes.status, errBody);
      return new Response(JSON.stringify({ error: 'Vision analysis failed, please try again' }), {
        status: 502,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    const result = await anthropicRes.json();
    if (result.stop_reason === 'refusal') {
      return new Response(JSON.stringify({ error: 'Could not analyze this photo' }), {
        status: 422,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    const textBlock = (result.content ?? []).find((b: { type: string }) => b.type === 'text');
    if (!textBlock) {
      return new Response(JSON.stringify({ error: 'No analysis returned' }), {
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
    console.error('[analyze-food-photo] unexpected error', err);
    return new Response(JSON.stringify({ error: 'Unexpected error analyzing photo' }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  }
});
