// Called right after a barcode lookup falls through to Open Food Facts'
// live API (see src/lib/foodLookup.ts) - writes that result into our own
// food_products mirror using the service role key, server-side, so the
// next scan of the same barcode (by anyone) is a fast local lookup
// instead of another live API call. Writing here instead of letting the
// client upsert directly avoids needing a broad client-side write policy
// on a table that's otherwise read-only to users.
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const code = typeof body.code === 'string' ? body.code.trim() : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const kcal100g = typeof body.kcal100g === 'number' ? body.kcal100g : null;

    if (!code || !name || kcal100g === null) {
      return new Response(JSON.stringify({ error: 'code, name and kcal100g are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { error } = await supabase.from('food_products').upsert({
      code,
      name,
      brands: typeof body.brands === 'string' ? body.brands : null,
      serving_size: typeof body.servingSize === 'string' ? body.servingSize : null,
      kcal_100g: kcal100g,
      protein_100g: typeof body.protein100g === 'number' ? body.protein100g : null,
      carbs_100g: typeof body.carbs100g === 'number' ? body.carbs100g : null,
      fat_100g: typeof body.fat100g === 'number' ? body.fat100g : null,
      fiber_100g: typeof body.fiber100g === 'number' ? body.fiber100g : null,
      sugars_100g: typeof body.sugars100g === 'number' ? body.sugars100g : null,
      source: 'openfoodfacts',
    });

    if (error) {
      console.error('[cache-food-product] upsert failed', error.message);
      return new Response(JSON.stringify({ error: 'Cache write failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  } catch (err) {
    console.error('[cache-food-product] unexpected error', err);
    return new Response(JSON.stringify({ error: 'Unexpected error' }), {
      status: 500,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  }
});
