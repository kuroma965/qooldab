// lib/Cats-Prod-Db.js
/**
 * Utility for calling products & categories API and mapping category_id -> category name
 * Usage:
 *   import { fetchProducts, getCategoriesList } from '@/lib/api';
 *
 * Notes:
 * - uses in-memory cache for categories (TTL 5 minutes)
 * - assumes endpoints:
 *    GET /api/admin/products?q=...&page=1&limit=12
 *    GET /api/admin/categories?limit=100
 * - will attach `category_name` to each product (if category_id is present)
 */

const CATEGORIES_TTL = 5 * 60 * 1000; // 5 minutes cache

let _categoriesCache = {
  ts: 0,
  data: null, // array
};

/**
 * internal helper to normalize response into array of items and total
 */
function _normalizeListResponse(json) {
  // Accept shapes: { items, total, page, limit } OR array-of-items
  if (!json) return { items: [], total: 0 };
  if (Array.isArray(json)) {
    return { items: json, total: json.length };
  }
  const items = json.items ?? json.data ?? [];
  const total = (typeof json.total === 'number') ? json.total : (Array.isArray(items) ? items.length : 0);
  return { items, total, page: json.page ?? 1, limit: json.limit ?? items.length };
}

/**
 * Fetch categories and return maps:
 *  { byId: { [id]: category }, bySlug: { [slug]: category }, list: [category...] }
 *
 * opts:
 *  - forceReload: boolean (skip cache)
 *  - fetchOptions: optional options passed to fetch (eg credentials)
 */
export async function getCategoriesMap(opts = {}) {
  const { forceReload = false, fetchOptions = { cache: 'no-store', credentials: 'include' } } = opts;
  const now = Date.now();
  if (!forceReload && _categoriesCache.data && (now - _categoriesCache.ts) < CATEGORIES_TTL) {
    const list = _categoriesCache.data;
    const byId = {};
    const bySlug = {};
    for (const c of list) {
      if (c.id != null) byId[String(c.id)] = c;
      if (c.slug) bySlug[String(c.slug)] = c;
    }
    return { byId, bySlug, list };
  }

  const url = '/api/categories?limit=100';
  try {
    const res = await fetch(url, fetchOptions);
    if (!res.ok) {
      // fallback: try to parse body for error message
      const err = await res.text().catch(() => '');
      throw new Error(`Failed to fetch categories (${res.status}) ${err}`);
    }
    const json = await res.json().catch(() => null);
    const { items } = _normalizeListResponse(json);
    // ensure each category has id, name, slug
    const list = (items || []).map((c) => ({
      id: c.id ?? null,
      name: c.name ?? c.title ?? c.slug ?? String(c.id ?? ''),
      slug: c.slug ?? null,
      ...c,
    }));
    _categoriesCache = { ts: Date.now(), data: list };

    const byId = {};
    const bySlug = {};
    for (const c of list) {
      if (c.id != null) byId[String(c.id)] = c;
      if (c.slug) bySlug[String(c.slug)] = c;
    }
    return { byId, bySlug, list };
  } catch (err) {
    // On error, clear cache and rethrow
    _categoriesCache = { ts: 0, data: null };
    throw err;
  }
}

/**
 * Return categories list (convenience)
 * opts same as getCategoriesMap
 */
export async function getCategoriesList(opts = {}) {
  const map = await getCategoriesMap(opts);
  return map.list;
}

/**
 * Clear categories cache
 */
export function clearCategoriesCache() {
  _categoriesCache = { ts: 0, data: null };
}

/**
 * Fetch products from API and enrich with category_name
 *
 * params:
 *  - q, page, limit, recommended, category, price_min, price_max, sort, etc.
 *
 * opts:
 *  - fetchOptions: options forwarded to fetch (default: { cache: 'no-store', credentials: 'include' })
 *  - ensureCategories: boolean (default true) - if true, will fetch categories map to attach names
 */
export async function fetchProducts(params = {}, opts = {}) {
  const {
    fetchOptions = { cache: 'no-store', credentials: 'include' },
    ensureCategories = true,
    productsPath = '/api/products',
  } = opts;

  const sp = new URLSearchParams();
  for (const k of Object.keys(params || {})) {
    const v = params[k];
    if (v === undefined || v === null || v === '') continue;
    // boolean and numbers OK
    sp.set(k, String(v));
  }
  const url = `${productsPath}${sp.toString() ? `?${sp.toString()}` : ''}`;

  const res = await fetch(url, fetchOptions);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`fetchProducts failed (${res.status}) ${body}`);
  }
  const json = await res.json().catch(() => null);
  const { items, total, page, limit } = _normalizeListResponse(json);

  // Enrich with category_name
  let categoriesMap = null;
  if (ensureCategories) {
    try {
      categoriesMap = await getCategoriesMap({ fetchOptions });
    } catch (err) {
      // don't fail entire call if categories fail; just leave names empty
      console.warn('fetchProducts: failed to load categories', err);
      categoriesMap = { byId: {}, bySlug: {}, list: [] };
    }
  } else {
    categoriesMap = { byId: {}, bySlug: {}, list: [] };
  }

  const enriched = (items || []).map((p) => {
    const prod = { ...p };
    // try category name by several possible fields
    let catName = null;
    if (prod.category_name) catName = prod.category_name;
    if (!catName && prod.category_id != null) {
      catName = categoriesMap.byId[String(prod.category_id)]?.name ?? null;
    }
    if (!catName && prod.category) {
      // if backend already provides category object or name
      if (typeof prod.category === 'object') catName = prod.category.name ?? prod.category.title ?? null;
      else catName = String(prod.category);
    }
    if (!catName && prod.category_slug) {
      catName = categoriesMap.bySlug[String(prod.category_slug)]?.name ?? null;
    }
    prod.category_name = catName ?? null;

    // normalize price/stock/sold numeric types
    prod.price = prod.price != null ? Number(prod.price) : 0;
    prod.stock = prod.stock != null ? Number(prod.stock) : 0;
    prod.sold = prod.sold != null ? Number(prod.sold) : 0;

    return prod;
  });

  return {
    items: enriched,
    total: Number(total ?? enriched.length),
    page: Number(page ?? params.page ?? 1),
    limit: Number(limit ?? params.limit ?? enriched.length),
  };
}
