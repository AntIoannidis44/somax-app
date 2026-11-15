// Recipe import for the Nutrition feature - either a photo of a recipe
// card/cookbook page, or a URL pasted from a recipe site. Separate from
// analyze-food-photo/estimate-food-text: those return per-item macros for
// a plate of food, this returns a full recipe (title, servings, ingredient
// list with amounts, method steps, per-serving macros). Same Claude Haiku
// 5.5 pipeline and inlined-not-imported reasoning as the other functions
// in this project - the Management API's deploy bundler flattens the
// upload root, so relative imports across function folders don't resolve.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? '';
const MAX_PAGE_TEXT = 20000;

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    servings: { type: 'number' },
    ingredients: {
      type: 'array',
      items: {
        type: 'object',
        properties: { name: { type: 'string' }, amount: { type: 'string' } },
        required: ['name', 'amount'],
        additionalProperties: false,
      },
    },
    steps: { type: 'array', items: { type: 'string' } },
    kcal: { type: 'number' },
    proteinG: { type: 'number' },
    carbsG: { type: 'number' },
    fatG: { type: 'number' },
    sourceLabel: { type: 'string' },
  },
  required: ['name', 'servings', 'ingredients', 'steps', 'kcal', 'proteinG', 'carbsG', 'fatG', 'sourceLabel'],
  additionalProperties: false,
};

// mode: 'food' - log ONE food from a link (a menu item, product page,
// recipe, nutrition page...). Returns one serving's macros.
const FOOD_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    serving: { type: 'string' },
    estimatedGrams: { type: 'number' },
    kcal: { type: 'number' },
    proteinG: { type: 'number' },
    carbsG: { type: 'number' },
    fatG: { type: 'number' },
    fromPage: { type: 'boolean' },
    confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
    sourceLabel: { type: 'string' },
    recognized: { type: 'boolean' },
  },
  required: ['name', 'serving', 'estimatedGrams', 'kcal', 'proteinG', 'carbsG', 'fatG', 'fromPage', 'confidence', 'sourceLabel', 'recognized'],
  additionalProperties: false,
};

const FOOD_PROMPT =
  'A user of a fitness app pasted a link to log ONE food they ate. The page could be a restaurant/fast-food menu item ' +
  '(e.g. McDonald\'s, Guzman y Gomez, Subway), a supermarket product, a meal-kit or recipe page (HelloFresh, Marley Spoon, ' +
  'RecipeTin Eats...), or a nutrition page. Work out the single food item the link is about and give ONE serving\'s ' +
  'calories/protein/carbs/fat. If the page states nutrition values (a nutrition table, schema.org NutritionInformation, ' +
  'a product label), use those exact numbers and set fromPage true. If it is a recipe, give macros per serving. If the page ' +
  'content is missing or blocked, identify the item from the URL itself (the path usually names it, e.g. ' +
  '/menu/item/big-mac) and use your knowledge of that brand\'s published nutrition for that market (the domain\'s country), ' +
  'setting fromPage false and confidence accordingly. serving is a short human description ("1 burger", "1 serve (420g)"). ' +
  'name is the product name as a person would say it, including the brand for branded/restaurant items. sourceLabel is the ' +
  'brand or site name. Set recognized false only if you genuinely cannot tell what food the link is about.';

const TEXT_PROMPT =
  'Extract a complete recipe from the page content below for a fitness tracking app. Give the recipe name, servings, every ' +
  'ingredient with its amount exactly as written, every method step in order (do not condense or skip steps - include each ' +
  'one separately), and the estimated calories/protein/carbs/fat PER SERVING using standard nutrition knowledge for the ' +
  'ingredients and quantities given. Set sourceLabel to the site/publication name (e.g. "RecipeTin Eats") if you can tell ' +
  'it from the content, otherwise the domain. If the page contains a schema.org Recipe JSON-LD block, prefer its structured ' +
  'ingredients/instructions over the visible text. If the page is a single dish or product rather than a written recipe (e.g. a ' +
  'restaurant menu item or meal-kit card without a method), still return it: name it, servings 1, list its main components ' +
  'as ingredients, give a short step like "Ready to eat", and use any nutrition the page states. If the page content is ' +
  'missing or blocked, work from the URL itself (the path usually names the dish).';

const PHOTO_PROMPT =
  'This photo shows a recipe - this could be a printed recipe card, a cookbook page, a meal-kit instruction sheet, someone\'s ' +
  'OWN HANDWRITTEN recipe (read the handwriting carefully, including abbreviations like "tbsp"/"c."/"tsp"), or a screenshot ' +
  'of a notes app / saved recipe text. Extract the complete recipe for a fitness tracking app: the recipe name (if the photo ' +
  'does not show one, infer a reasonable name from the ingredients/dish), servings (default to 4 if not stated), every ' +
  'ingredient with its amount exactly as written, every method step in order (do not condense or skip steps), and the ' +
  'estimated calories/protein/carbs/fat PER SERVING using standard nutrition knowledge for the ingredients and quantities ' +
  'shown. Set sourceLabel to "Imported from your photo".';

// Extracted directly from the raw HTML rather than asked of Claude - an
// LLM copying a long image URL verbatim into a JSON string is exactly the
// kind of thing that silently truncates/mangles, where a plain regex over
// the actual markup never does.
function extractImageUrl(html: string): string | null {
  const ldBlocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const m of ldBlocks) {
    try {
      const json = JSON.parse(m[1]);
      const candidates = Array.isArray(json) ? json : json['@graph'] ? json['@graph'] : [json];
      const recipe = candidates.find((c: unknown) => {
        const t = (c as { '@type'?: string | string[] })?.['@type'];
        return t === 'Recipe' || (Array.isArray(t) && t.includes('Recipe'));
      }) as { image?: unknown } | undefined;
      if (recipe?.image) {
        const img = recipe.image;
        if (typeof img === 'string') return img;
        if (Array.isArray(img) && typeof img[0] === 'string') return img[0];
        if (Array.isArray(img) && img[0] && typeof img[0] === 'object' && 'url' in (img[0] as object)) {
          return (img[0] as { url: string }).url;
        }
        if (typeof img === 'object' && img && 'url' in img) return (img as { url: string }).url;
      }
    } catch {
      // Not valid/relevant JSON-LD - fall through to the og:image meta tag.
    }
  }
  const og = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i.exec(html);
  if (og) return og[1];
  const ogReversed = /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i.exec(html);
  if (ogReversed) return ogReversed[1];
  return null;
}

// Everything structured a page offers, for pages that are not a recipe
// (menus, products): every JSON-LD block, framework data blobs that carry
// the real content on JS-rendered sites, and the title/meta description.
function structuredBits(html: string): string {
  const out: string[] = [];
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1]?.trim();
  if (title) out.push(`TITLE: ${title}`);
  for (const m of html.matchAll(/<meta[^>]+(?:name|property)=["'](?:description|og:title|og:description|product:[^"']+)["'][^>]*>/gi)) {
    const c = /content=["']([^"']*)["']/i.exec(m[0])?.[1];
    if (c) out.push(`META: ${c}`);
  }
  for (const m of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    out.push(`JSON-LD: ${m[1].replace(/\s+/g, ' ').slice(0, 6000)}`);
  }
  for (const m of html.matchAll(/<script[^>]*id=["'](?:__NEXT_DATA__|__NUXT_DATA__)["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    out.push(`PAGE DATA: ${m[1].replace(/\s+/g, ' ').slice(0, 12000)}`);
  }
  return out.join('\n').slice(0, MAX_PAGE_TEXT);
}

function stripHtml(html: string): string {
  // Pull out schema.org Recipe JSON-LD first - it's exact structured data
  // (ingredients/instructions), much higher quality than parsing visible
  // text ever could be.
  const ldBlocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const m of ldBlocks) {
    try {
      const json = JSON.parse(m[1]);
      const candidates = Array.isArray(json) ? json : json['@graph'] ? json['@graph'] : [json];
      const recipe = candidates.find((c: unknown) => {
        const t = (c as { '@type'?: string | string[] })?.['@type'];
        return t === 'Recipe' || (Array.isArray(t) && t.includes('Recipe'));
      });
      if (recipe) return 'STRUCTURED RECIPE DATA (schema.org/Recipe):\n' + JSON.stringify(recipe).slice(0, MAX_PAGE_TEXT);
    } catch {
      // Not valid/relevant JSON-LD - keep looking, then fall back to text.
    }
  }
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#?\w+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const bits = structuredBits(html);
  return (bits ? bits + '\n\nVISIBLE TEXT:\n' : '') + text.slice(0, MAX_PAGE_TEXT);
}

async function callClaude(content: Array<Record<string, unknown>>, schema: Record<string, unknown> = RESPONSE_SCHEMA): Promise<Response> {
  return fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2026-10-21',
    },
    body: JSON.stringify({
      model: 'claude-haiku-5-5',
      max_tokens: 3072,
      output_config: { effort: 'low', format: { type: 'json_schema', schema } },
      messages: [{ role: 'user', content }],
    }),
  });
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
    const { imageBase64, mediaType, url, mode } = await req.json();
    const food = mode === 'food';

    let content: Array<Record<string, unknown>>;
    let pageImageUrl: string | null = null;
    // False when the site blocked us / had no readable content - then any
    // numbers are estimates, whatever the model says.
    let pageReadable = false;
    if (typeof url === 'string' && url) {
      if (!/^https?:\/\//i.test(url)) {
        return new Response(JSON.stringify({ error: 'That doesn\'t look like a web link' }), {
          status: 400,
          headers: { ...corsHeaders, 'content-type': 'application/json' },
        });
      }
      // Many sites (fast-food menus, supermarkets) block obvious bots or
      // render with JS - send a normal browser's headers, and if the page
      // still can't be read, carry on from the URL alone rather than fail:
      // its path usually names the item (/menu/item/big-mac).
      let pageText = '';
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 12000);
        const pageRes = await fetch(url, {
          headers: {
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
            accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'accept-language': 'en-AU,en;q=0.9',
          },
          redirect: 'follow',
          signal: ctrl.signal,
        });
        clearTimeout(timer);
        if (pageRes.ok) {
          const pageHtml = await pageRes.text();
          pageImageUrl = extractImageUrl(pageHtml);
          pageText = stripHtml(pageHtml);
        } else {
          console.warn('[import-recipe] page returned', pageRes.status, url);
        }
      } catch (fetchErr) {
        console.warn('[import-recipe] page fetch failed, using URL only', fetchErr);
      }
      pageReadable = pageText.length >= 200;
      if (!pageReadable) pageText = `(The page content could not be read - it may block automated access or need JavaScript. Work from the URL.)\n${pageText}`;
      content = [{ type: 'text', text: `${food ? FOOD_PROMPT : TEXT_PROMPT}\n\nPage URL: ${url}\n\nPAGE CONTENT:\n${pageText}` }];
    } else if (typeof imageBase64 === 'string' && imageBase64) {
      const safeMediaType = typeof mediaType === 'string' && mediaType.startsWith('image/') ? mediaType : 'image/jpeg';
      content = [
        { type: 'image', source: { type: 'base64', media_type: safeMediaType, data: imageBase64 } },
        { type: 'text', text: PHOTO_PROMPT },
      ];
    } else {
      return new Response(JSON.stringify({ error: 'Provide either url or imageBase64' }), {
        status: 400,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    const anthropicRes = await callClaude(content, food ? FOOD_SCHEMA : RESPONSE_SCHEMA);
    if (!anthropicRes.ok) {
      const errBody = await anthropicRes.text();
      console.error('[import-recipe] Anthropic API error', anthropicRes.status, errBody);
      return new Response(JSON.stringify({ error: 'Recipe import failed, please try again' }), {
        status: 502,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    const result = await anthropicRes.json();
    if (result.stop_reason === 'refusal') {
      return new Response(JSON.stringify({ error: 'Could not read a recipe from that' }), {
        status: 422,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    const textBlock = (result.content ?? []).find((b: { type: string }) => b.type === 'text');
    if (!textBlock) {
      return new Response(JSON.stringify({ error: 'No recipe returned' }), {
        status: 502,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    const parsed = JSON.parse(textBlock.text);
    if (food && !pageReadable) {
      parsed.fromPage = false;
      if (parsed.confidence === 'high') parsed.confidence = 'medium';
    }
    return new Response(JSON.stringify({ ...parsed, imageUrl: pageImageUrl }), {
      status: 200,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  } catch (err) {
    console.error('[import-recipe] unexpected error', err);
    return new Response(JSON.stringify({ error: 'Unexpected error importing recipe' }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  }
});
