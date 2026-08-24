/**
 * High-Precision Funnel Analytics & Meta Pixel Event Tracker
 * Supports standard Meta Pixel (window.fbq) and Google Tag Manager (window.dataLayer).
 */

export type FunnelEventName =
  | "product_view"
  | "add_to_cart"
  | "begin_checkout"
  | "payment_method_selected"
  | "razorpay_checkout_opened"
  | "purchase"
  | "payment_failed"
  | "checkout_abandoned";

export interface FunnelEventData {
  productId?: string;
  productName?: string;
  category?: string;
  price?: number;
  quantity?: number;
  value?: number;
  currency?: string;
  paymentMethod?: string;
  items?: Array<{
    id: string;
    name?: string;
    quantity: number;
    price?: number;
  }>;
  orderId?: string;
  errorMessage?: string;
  step?: number;
  [key: string]: any;
}

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * Tracks e-commerce funnel events across Meta Pixel, GTM dataLayer, and console
 */
export function trackFunnelEvent(eventName: FunnelEventName, data: FunnelEventData = {}) {
  const currency = data.currency || "INR";
  const timestamp = new Date().toISOString();

  // 1. Meta Pixel Standard & Custom Event Mapping
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    try {
      switch (eventName) {
        case "product_view":
          window.fbq("track", "ViewContent", {
            content_ids: data.productId ? [data.productId] : undefined,
            content_name: data.productName,
            content_category: data.category,
            content_type: "product",
            value: data.price || data.value || 0,
            currency,
          });
          break;

        case "add_to_cart":
          window.fbq("track", "AddToCart", {
            content_ids: data.productId ? [data.productId] : undefined,
            content_name: data.productName,
            content_category: data.category,
            content_type: "product",
            value: data.value || data.price || 0,
            currency,
            num_items: data.quantity || 1,
          });
          break;

        case "begin_checkout":
          window.fbq("track", "InitiateCheckout", {
            content_ids: data.items ? data.items.map((i) => i.id) : data.productId ? [data.productId] : undefined,
            contents: data.items
              ? data.items.map((i) => ({ id: i.id, quantity: i.quantity, item_price: i.price }))
              : undefined,
            content_type: "product",
            num_items: data.items ? data.items.reduce((s, i) => s + i.quantity, 0) : data.quantity || 1,
            value: data.value || 0,
            currency,
          });
          break;

        case "payment_method_selected":
          window.fbq("trackCustom", "PaymentMethodSelected", {
            payment_method: data.paymentMethod,
            value: data.value || 0,
            currency,
          });
          break;

        case "razorpay_checkout_opened":
          window.fbq("trackCustom", "RazorpayCheckoutOpened", {
            order_id: data.orderId,
            value: data.value || 0,
            currency,
          });
          break;

        case "purchase":
          window.fbq("track", "Purchase", {
            content_ids: data.items ? data.items.map((i) => i.id) : data.productId ? [data.productId] : undefined,
            contents: data.items
              ? data.items.map((i) => ({ id: i.id, quantity: i.quantity, item_price: i.price }))
              : undefined,
            content_type: "product",
            num_items: data.items ? data.items.reduce((s, i) => s + i.quantity, 0) : data.quantity || 1,
            value: data.value || 0,
            currency,
            order_id: data.orderId,
          });
          break;

        case "payment_failed":
          window.fbq("trackCustom", "PaymentFailed", {
            error_message: data.errorMessage,
            payment_method: data.paymentMethod,
            value: data.value || 0,
            currency,
          });
          break;

        case "checkout_abandoned":
          window.fbq("trackCustom", "CheckoutAbandoned", {
            step: data.step || 1,
            payment_method: data.paymentMethod,
            value: data.value || 0,
            currency,
          });
          break;
      }
    } catch (pixelErr) {
      console.warn("[Analytics] Meta Pixel track error:", pixelErr);
    }
  }

  // 2. Google Tag Manager / dataLayer push
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      ecommerce: {
        currency,
        value: data.value || data.price || 0,
        ...data,
      },
      timestamp,
    });
  }

  // 3. Dev Log (informative and non-intrusive)
  if (process.env.NODE_ENV !== "production") {
    console.log(`[Funnel Analytics] ${eventName}:`, data);
  }
}
