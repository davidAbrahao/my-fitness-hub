/**
 * OpenFoodFacts API client — busca de alimentos por nome ou código de barras.
 * API pública, sem chave necessária. https://world.openfoodfacts.org/
 */

export interface FoodProduct {
  id: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  // Per 100g
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  servingSize?: string;
}

interface OFFProduct {
  code?: string;
  product_name?: string;
  product_name_pt?: string;
  brands?: string;
  image_small_url?: string;
  image_url?: string;
  serving_size?: string;
  nutriments?: {
    'energy-kcal_100g'?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    fiber_100g?: number;
    sugars_100g?: number;
    sodium_100g?: number;
  };
}

function mapProduct(p: OFFProduct, idFallback: string): FoodProduct {
  const n = p.nutriments ?? {};
  return {
    id: p.code ?? idFallback,
    name: p.product_name_pt || p.product_name || 'Produto sem nome',
    brand: p.brands,
    imageUrl: p.image_small_url || p.image_url,
    calories: n['energy-kcal_100g'],
    protein: n.proteins_100g,
    carbs: n.carbohydrates_100g,
    fat: n.fat_100g,
    fiber: n.fiber_100g,
    sugar: n.sugars_100g,
    sodium: n.sodium_100g,
    servingSize: p.serving_size,
  };
}

export async function searchFoods(query: string, limit = 15): Promise<FoodProduct[]> {
  if (!query.trim()) return [];
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
    query
  )}&search_simple=1&action=process&json=1&page_size=${limit}&lc=pt`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('API error');
    const data = (await res.json()) as { products?: OFFProduct[] };
    return (data.products ?? []).map((p, i) => mapProduct(p, `s${i}`));
  } catch (e) {
    console.error('OpenFoodFacts search error:', e);
    return [];
  }
}

export async function getByBarcode(barcode: string): Promise<FoodProduct | null> {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
    if (!res.ok) return null;
    const data = (await res.json()) as { product?: OFFProduct; status?: number };
    if (!data.product || data.status === 0) return null;
    return mapProduct(data.product, barcode);
  } catch {
    return null;
  }
}

/** Calcula os macros para uma quantidade em gramas. */
export function scaleNutrients(food: FoodProduct, grams: number) {
  const factor = grams / 100;
  return {
    calories: Math.round((food.calories ?? 0) * factor),
    protein: +((food.protein ?? 0) * factor).toFixed(1),
    carbs: +((food.carbs ?? 0) * factor).toFixed(1),
    fat: +((food.fat ?? 0) * factor).toFixed(1),
  };
}
