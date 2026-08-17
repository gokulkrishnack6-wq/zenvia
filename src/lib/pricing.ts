import { Product, CartItem } from "../types";

/**
 * Calculates the exact subtotal for an item based on its quantity and any quantity-based pricing tiers.
 * For example, Retractable Car Sunshade Umbrella (p12):
 * 1 piece  = ₹699
 * 2 pieces = ₹1,299 (saves ₹99 compared to 2 × ₹699 = ₹1,398)
 * 3 pieces = ₹1,799 (saves ₹298 compared to 3 × ₹699 = ₹2,097)
 */
export function calculateItemSubtotal(product: Product, quantity: number): number {
  const qty = Math.max(1, Math.floor(quantity) || 1);

  // If product has specific pricing tiers defined
  if (product.pricingTiers && product.pricingTiers.length > 0) {
    // Look for exact tier match
    const exactTier = product.pricingTiers.find((t) => t.quantity === qty);
    if (exactTier) {
      return exactTier.totalPrice;
    }

    // For quantities greater than 3, calculate using 3-pack bundles + remainder
    const tier3 = product.pricingTiers.find((t) => t.quantity === 3);
    const tier2 = product.pricingTiers.find((t) => t.quantity === 2);
    const tier1 = product.pricingTiers.find((t) => t.quantity === 1);

    const price3 = tier3 ? tier3.totalPrice : product.price * 3;
    const price2 = tier2 ? tier2.totalPrice : product.price * 2;
    const price1 = tier1 ? tier1.totalPrice : product.price;

    const bundlesOf3 = Math.floor(qty / 3);
    const remainder = qty % 3;

    let remainderCost = 0;
    if (remainder === 2) {
      remainderCost = price2;
    } else if (remainder === 1) {
      remainderCost = price1;
    }

    return bundlesOf3 * price3 + remainderCost;
  }

  // Fallback / standard multiplication for regular items
  return product.price * qty;
}

/**
 * Calculates the total subtotal for all items in the cart
 */
export function calculateCartSubtotal(items: CartItem[]): number {
  return items.reduce((acc, item) => {
    return acc + calculateItemSubtotal(item.product, item.quantity);
  }, 0);
}

/**
 * Calculates bundle savings in rupees compared to base price × quantity
 */
export function calculateBundleSavings(product: Product, quantity: number): number {
  const baseTotal = product.price * quantity;
  const bundleTotal = calculateItemSubtotal(product, quantity);
  return Math.max(0, baseTotal - bundleTotal);
}

/**
 * Gets the effective per-piece price for a product and quantity
 */
export function calculatePerPiecePrice(product: Product, quantity: number): number {
  const total = calculateItemSubtotal(product, quantity);
  return total / quantity;
}
