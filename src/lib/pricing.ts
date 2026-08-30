import { Product, CartItem, QuantityPricingTier } from "../types";

/**
 * Universal Quantity Offer Normalizer:
 * Retrieves and standardizes quantity offers from either `product.quantityOffers` or `product.pricingTiers`.
 * Automatically computes perPiecePrice, savings, labels, and badges if not explicitly set.
 */
export function getProductQuantityOffers(product: Product): QuantityPricingTier[] | undefined {
  const rawOffers = product.quantityOffers || product.pricingTiers;
  if (!rawOffers || !Array.isArray(rawOffers) || rawOffers.length === 0) {
    return undefined;
  }

  // Sort by quantity ascending
  const sorted = [...rawOffers].sort((a, b) => a.quantity - b.quantity);

  return sorted.map((tier) => {
    const qty = Math.max(1, tier.quantity);
    const totalPrice = Number(tier.totalPrice ?? tier.price ?? product.price * qty);
    const perPiecePrice =
      tier.perPiecePrice !== undefined
        ? Number(tier.perPiecePrice)
        : Math.round((totalPrice / qty) * 100) / 100;
    const savings =
      tier.savings !== undefined
        ? Number(tier.savings)
        : Math.max(0, product.price * qty - totalPrice);

    const defaultLabel = qty === 1 ? "1 UNIT" : `${qty} UNITS`;
    const label = tier.label || defaultLabel;

    const badge =
      tier.badge ||
      (tier.isBestValue ? "BEST VALUE" : tier.isPopular ? "MOST POPULAR" : undefined);

    const isPopular = Boolean(
      tier.isPopular ||
      (badge && badge.toUpperCase().includes("POPULAR"))
    );

    const isBestValue = Boolean(
      tier.isBestValue ||
      (badge && badge.toUpperCase().includes("VALUE"))
    );

    return {
      quantity: qty,
      totalPrice,
      price: totalPrice,
      perPiecePrice,
      savings,
      label,
      badge,
      isPopular,
      isBestValue,
      image: tier.image,
    };
  });
}

/**
 * Checks if a product has a special quantity offer configured (with 2+ units and discount).
 */
export function hasQuantityOffers(product: Product): boolean {
  const offers = getProductQuantityOffers(product);
  if (!offers || offers.length === 0) return false;
  // Has at least one multi-unit offer
  return offers.some((o) => o.quantity > 1);
}

/**
 * Calculates the exact subtotal for an item based on its quantity and any quantity-based offers.
 * Automatically checks universal product offers.
 * If no offer is configured, falls back to standard single-unit price * quantity.
 */
export function calculateItemSubtotal(product: Product, quantity: number): number {
  const qty = Math.max(1, Math.floor(quantity) || 1);
  const offers = getProductQuantityOffers(product);

  // If product has specific quantity offers configured
  if (offers && offers.length > 0) {
    // 1. Look for exact tier match (e.g. 1 unit, 2 units, 3 units)
    const exactTier = offers.find((t) => t.quantity === qty);
    if (exactTier) {
      return exactTier.totalPrice;
    }

    // 2. For quantities greater than highest defined tier, optimize with largest bundle + remainder
    const highestTier = offers[offers.length - 1];
    if (highestTier && qty > highestTier.quantity && highestTier.quantity > 1) {
      const maxBundleQty = highestTier.quantity;
      const bundles = Math.floor(qty / maxBundleQty);
      const remainder = qty % maxBundleQty;

      let remainderCost = 0;
      if (remainder > 0) {
        // Recursively evaluate subtotal for remainder
        remainderCost = calculateItemSubtotal(product, remainder);
      }

      return bundles * highestTier.totalPrice + remainderCost;
    }

    // 3. Fallback for intermediate undefined quantities (e.g. qty 2 when only 1 and 3 are defined)
    const lowerTier = [...offers].reverse().find((t) => t.quantity <= qty);
    if (lowerTier) {
      const remainder = qty - lowerTier.quantity;
      return lowerTier.totalPrice + remainder * product.price;
    }
  }

  // Fallback / standard multiplication for regular items without quantity offers
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

/**
 * Free Delivery threshold in INR (Free delivery on all orders across India)
 */
export const FREE_DELIVERY_THRESHOLD = 0;

/**
 * Standard Delivery fee in INR (₹0 - Free Delivery across India)
 */
export const STANDARD_DELIVERY_FEE = 0;

/**
 * Calculates delivery fee based on cart/order subtotal.
 * All orders enjoy 100% Free Delivery across India (₹0).
 */
export function calculateDeliveryFee(_subtotal?: number): number {
  return 0;
}

/**
 * Standard Cash on Delivery (COD) Handling Charge Percentage (5%)
 */
export const COD_HANDLING_PERCENT = 5;

/**
 * Calculates the 5% COD handling charge on the base payable online amount.
 * Returns exact amount rounded to 2 decimal places.
 */
export function calculateCODCharge(baseAmount: number): number {
  if (baseAmount <= 0) return 0;
  return Math.round(baseAmount * (COD_HANDLING_PERCENT / 100) * 100) / 100;
}

/**
 * Calculates the final total for Cash on Delivery (baseAmount + 5% COD handling charge).
 * Returns exact amount rounded to 2 decimal places.
 */
export function calculateCODTotal(baseAmount: number): number {
  if (baseAmount <= 0) return 0;
  const charge = calculateCODCharge(baseAmount);
  return Math.round((baseAmount + charge) * 100) / 100;
}

