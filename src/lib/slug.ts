import { Product } from "../types";
import { PRODUCTS } from "../data/products";

/**
 * Converts a product name into a clean, URL-friendly slug.
 * Example: "Mini Thermal Printer" -> "mini-thermal-printer"
 */
export function getProductSlug(product: Product): string {
  if (!product || !product.name) return "";
  return product.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Looks up a product by slug or ID.
 * Supports slug (e.g. "mini-thermal-printer"), ID (e.g. "p1"), or URL encoded name.
 */
export function findProductBySlugOrId(slugOrId: string): Product | undefined {
  if (!slugOrId) return undefined;
  const clean = decodeURIComponent(slugOrId).toLowerCase().trim();

  // 1. Exact match on product ID
  const byId = PRODUCTS.find((p) => p.id.toLowerCase() === clean);
  if (byId) return byId;

  // 2. Exact match on product slug
  const bySlug = PRODUCTS.find((p) => getProductSlug(p) === clean);
  if (bySlug) return bySlug;

  // 3. Match on slug prefix/partial name fallback
  return PRODUCTS.find((p) =>
    getProductSlug(p).includes(clean) || clean.includes(getProductSlug(p))
  );
}
