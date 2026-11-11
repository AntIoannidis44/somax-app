import { supabase } from './supabase';

export interface FoodProduct {
  code: string;
  name: string;
  brands: string | null;
  servingSize: string | null;
  kcal100g: number | null;
  protein100g: number | null;
  carbs100g: number | null;
  fat100g: number | null;
  fiber100g: number | null;
  sugars100g: number | null;
  source: 'local' | 'openfoodfacts';
}

// Local lookup first - our own mirror of Open Food Facts (see the
// `food_products` table), a single indexed query with no network round
// trip to a third party. Only a barcode we haven't mirrored falls through
// to OFF's live API. Data (c) Open Food Facts contributors, ODbL licensed.
export async function lookupBarcode(code: string): Promise<FoodProduct | null> {
  const { data, error } = await supabase
    .from('food_products')
    .select('code, name, brands, serving_size, kcal_100g, protein_100g, carbs_100g, fat_100g, fiber_100g, sugars_100g')
    .eq('code', code)
    .maybeSingle();

  if (error) {
    console.error('[foodLookup] local lookup failed:', error);
  }

  if (data) {
    return {
      code: data.code,
      name: data.name,
      brands: data.brands,
      servingSize: data.serving_size,
      kcal100g: data.kcal_100g,
      protein100g: data.protein_100g,
      carbs100g: data.carbs_100g,
      fat100g: data.fat_100g,
      fiber100g: data.fiber_100g,
      sugars100g: data.sugars_100g,
      source: 'local',
    };
  }

  return fetchFromOpenFoodFacts(code);
}

async function fetchFromOpenFoodFacts(code: string): Promise<FoodProduct | null> {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=product_name,brands,serving_size,nutriments`
    );
    if (!res.ok) return null;
    const json = await res.json();
    if (json.status !== 1 || !json.product) return null;

    const p = json.product;
    const n = p.nutriments || {};
    if (!p.product_name) return null;

    const result: FoodProduct = {
      code,
      name: p.product_name,
      brands: p.brands ?? null,
      servingSize: p.serving_size ?? null,
      kcal100g: n['energy-kcal_100g'] ?? null,
      protein100g: n['proteins_100g'] ?? null,
      carbs100g: n['carbohydrates_100g'] ?? null,
      fat100g: n['fat_100g'] ?? null,
      fiber100g: n['fiber_100g'] ?? null,
      sugars100g: n['sugars_100g'] ?? null,
      source: 'openfoodfacts',
    };

    // Fire-and-forget: cache this into our own mirror (server-side write,
    // see supabase/functions/cache-food-product) so the next scan of this
    // barcode by anyone is a fast local lookup instead of another live
    // API call. Never blocks or fails the lookup itself.
    if (result.kcal100g !== null) {
      void supabase.functions.invoke('cache-food-product', {
        body: {
          code: result.code,
          name: result.name,
          brands: result.brands,
          servingSize: result.servingSize,
          kcal100g: result.kcal100g,
          protein100g: result.protein100g,
          carbs100g: result.carbs100g,
          fat100g: result.fat100g,
          fiber100g: result.fiber100g,
          sugars100g: result.sugars100g,
        },
      }).catch((err) => console.error('[foodLookup] cache-food-product failed:', err));
    }

    return result;
  } catch (err) {
    console.error('[foodLookup] Open Food Facts fallback failed:', err);
    return null;
  }
}
