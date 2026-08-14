import { Product } from "../types";
import { PRODUCTS } from "../data/products";

const ALIAS_MAP: Record<string, string> = {
  "mini-thermal-pocket-printer": "p1",
  "mini-thermal-printer": "p1",
  "multi-blade-vegetable-chopper": "p2",
  "vegetable-chopper-pro": "p2",
  "coquette-pink-bow-glass-tumbler": "p3",
  "pink-bow-glasses": "p3",
  "light-panda-night-lamp": "p4",
  "soft-silicone-panda-night-light": "p4",
  "silicone-panda-lamp": "p4",
  "cordless-neck-shoulder-massager": "p5",
  "3d-shiatsu-neck-massager": "p5",
  "ultrasonic-jewelry-glasses-cleaner": "p6",
  "portable-mini-desk-vacuum": "p7",
  "sunset-halo-projection-lamp": "p8",
  "usb-sunset-projection-lamp": "p8",
  "smart-led-temperature-water-bottle": "p9",
  "smart-hydration-water-bottle": "p9",
  "cordless-hair-straightener-brush": "p10",
  "silicone-scalp-massager-brush": "p11",
  "retractable-car-sunshade-umbrella": "p12",
  "car-sunshade-umbrella": "p12",
};

/**
 * Converts a product name into a clean, URL-friendly slug.
 * Example: "Mini Thermal Printer" -> "mini-thermal-printer"
 */
export function getProductSlug(product: Product): string {
  if (!product) return "";
  if (product.slug) return product.slug;
  if (!product.name) return "";
  return product.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Looks up a product by slug or ID.
 * Supports slug (e.g. "mini-thermal-pocket-printer"), ID (e.g. "p1"), or URL encoded name.
 */
export function findProductBySlugOrId(slugOrId: string): Product | undefined {
  if (!slugOrId) return undefined;
  const clean = decodeURIComponent(slugOrId)
    .toLowerCase()
    .trim()
    .split("?")[0]
    .replace(/^\/+|\/+$/g, "");

  if (!clean) return undefined;

  // 1. Alias lookup map
  if (ALIAS_MAP[clean]) {
    const foundByAlias = PRODUCTS.find((p) => p.id === ALIAS_MAP[clean]);
    if (foundByAlias) return foundByAlias;
  }

  // 2. Exact match on product ID
  const byId = PRODUCTS.find((p) => p.id.toLowerCase() === clean);
  if (byId) return byId;

  // 3. Exact match on custom slug or generated slug
  const bySlug = PRODUCTS.find(
    (p) => (p.slug && p.slug.toLowerCase() === clean) || getProductSlug(p) === clean
  );
  if (bySlug) return bySlug;

  // 4. Partial match on slug / name / ID
  return PRODUCTS.find((p) => {
    const pSlug = getProductSlug(p);
    return (
      clean.includes(p.id.toLowerCase()) ||
      pSlug.includes(clean) ||
      clean.includes(pSlug)
    );
  });
}

