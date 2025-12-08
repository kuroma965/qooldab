/**
 * lib/Cats-Prod-Db.js
 *
 * (ปรับให้ fetchProducts คืนเฉพาะ { items } เพื่อความง่าย)
 */

const PRODUCTS_ENDPOINT = '/api/products'; // change if your products API path differs
const CATEGORIES_ENDPOINT = '/api/categories';   // change if your categories API path differs

const DEFAULT_FETCH_OPTIONS = { cache: 'no-store', credentials: 'include' };

const CATEGORIES_TTL = 5 * 60 * 1000; // 5 minutes cache

let _categoriesCache = {
  ts: 0,
  data: null, // array
};

function _normalizeListResponse(json) {
  if (!json) return { items: [], total: 0 };
  if (Array.isArray(json)) {
    return { items: json, total: json.length };
  }
  const items = json.items ?? json.data ?? [];
  const total = (typeof json.total === 'number') ? json.total : (Array.isArray(items) ? items.length : 0);
  return { items, total, page: json.page ?? 1, limit: json.limit ?? items.length };
}

export async function getCategoriesMap(opts = {}) {
  const { forceReload = false, fetchOptions = DEFAULT_FETCH_OPTIONS } = opts;
  const now = Date.now();
  if (!forceReload && _categoriesCache.data && (now - _categoriesCache.ts) < CATEGORIES_TTL) {
    const list = _categoriesCache.data;
    const byId = {};
    const bySlug = {};
    for (const c of list) {
      if (c.id != null) byId[String(c.id)] = c;
      if (c.slug) bySlug[String(c.slug).toLowerCase()] = c;
    }
    return { byId, bySlug, list };
  }

  const url = `${CATEGORIES_ENDPOINT}`;
  try {
    const res = await fetch(url, fetchOptions);
    if (!res.ok) {
      const err = await res.text().catch(() => '');
      throw new Error(`Failed to fetch categories (${res.status}) ${err}`);
    }
    const json = await res.json().catch(() => null);
    const { items } = _normalizeListResponse(json);
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
      if (c.slug) bySlug[String(c.slug).toLowerCase()] = c;
    }
    return { byId, bySlug, list };
  } catch (err) {
    _categoriesCache = { ts: 0, data: null };
    throw err;
  }
}

export async function getCategoriesList(opts = {}) {
  const map = await getCategoriesMap(opts);
  return map.list;
}

export function clearCategoriesCache() {
  _categoriesCache = { ts: 0, data: null };
}

/**
 * fetchProducts: Now returns only { items } (no total/page/limit)
 */
export async function fetchProducts(params = {}, opts = {}) {
  const {
    fetchOptions = DEFAULT_FETCH_OPTIONS,
    ensureCategories = true,
    productsPath = PRODUCTS_ENDPOINT,
  } = opts;

  const sp = new URLSearchParams();
  for (const k of Object.keys(params || {})) {
    const v = params[k];
    if (v === undefined || v === null || v === '') continue;
    sp.set(k, String(v));
  }
  const url = `${productsPath}${sp.toString() ? `?${sp.toString()}` : ''}`;

  const res = await fetch(url, fetchOptions);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`fetchProducts failed (${res.status}) ${body}`);
  }
  const json = await res.json().catch(() => null);
  const { items: rawItems } = _normalizeListResponse(json);

  // Enrich with category_name
  let categoriesMap = null;
  if (ensureCategories) {
    try {
      categoriesMap = await getCategoriesMap({ fetchOptions });
    } catch (err) {
      console.warn('fetchProducts: failed to load categories', err);
      categoriesMap = { byId: {}, bySlug: {}, list: [] };
    }
  } else {
    categoriesMap = { byId: {}, bySlug: {}, list: [] };
  }

  const enriched = (rawItems || []).map((p) => {
    const prod = { ...p };
    let catName = null;
    if (prod.category_name) catName = prod.category_name;

    if (!catName && prod.category_id != null) {
      catName = categoriesMap.byId[String(prod.category_id)]?.name ?? null;
    }

    if (!catName && prod.category) {
      if (typeof prod.category === 'object') catName = prod.category.name ?? prod.category.title ?? null;
      else catName = String(prod.category);
    }

    if (!catName && prod.category_slug) {
      catName = categoriesMap.bySlug[String(prod.category_slug).toLowerCase()]?.name ?? null;
    }

    prod.category_name = catName ?? null;

    prod.price = prod.price != null ? Number(prod.price) : 0;
    prod.stock = prod.stock != null ? Number(prod.stock) : 0;
    prod.sold = prod.sold != null ? Number(prod.sold) : 0;

    return prod;
  });

  // <-- RETURN only items now -->
  return { items: enriched };
}
