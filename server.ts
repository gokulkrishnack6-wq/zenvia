import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import crypto from "crypto";
import Razorpay from "razorpay";
import { PRODUCTS } from "./src/data/products";
import {
  calculateItemSubtotal,
  calculateCODCharge,
  calculateCODTotal,
  calculateDeliveryFee,
} from "./src/lib/pricing";
import { formatRupeeExact } from "./src/lib/currency";
import { findProductBySlugOrId, getProductSlug } from "./src/lib/slug";
import {
  sendNewOrderEmail,
  sendFailedPaymentEmail,
  sendContactFormEmail,
  sendReviewSubmissionEmail,
  sendNewsletterSignupEmail,
  STORE_OWNER_EMAIL,
} from "./src/server/email";
import {
  saveOrder,
  getOrderById,
  getOrderByPaymentId,
  savePendingOrderIntent,
  getPendingOrderIntent,
} from "./src/server/orderDb";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to sanitize environment keys (trims spaces, quotes, newlines, semicolons, and inadvertent prefixes)
function cleanKey(val?: string): string {
  if (!val) return "";
  let clean = val.trim();
  // Strip BOM, zero-width characters, and non-printable control characters
  clean = clean.replace(/[\u200B-\u200D\uFEFF\u00A0\x00-\x1F\x7F-\x9F]/g, "").trim();
  // Strip outer quotes (both double, single, and backticks)
  while (
    (clean.startsWith('"') && clean.endsWith('"')) ||
    (clean.startsWith("'") && clean.endsWith("'")) ||
    (clean.startsWith("`") && clean.endsWith("`"))
  ) {
    clean = clean.slice(1, -1).trim();
  }
  // Strip inadvertent prefixes, suffixes, and noise
  clean = clean
    .replace(/^RAZORPAY_KEY_ID\s*[:=]\s*/i, "")
    .replace(/^RAZORPAY_KEY_SECRET\s*[:=]\s*/i, "")
    .replace(/^key_id\s*[:=]\s*/i, "")
    .replace(/^key_secret\s*[:=]\s*/i, "")
    .replace(/^Bearer\s+/i, "")
    .replace(/^Basic\s+/i, "")
    .replace(/[;\r\n\t]/g, "")
    .trim();
  return clean;
}

// Razorpay SDK Client Initializer
function getRazorpayClient(): { razorpay: Razorpay; keyId: string; keySecret: string } | null {
  const keyId = cleanKey(process.env.RAZORPAY_KEY_ID);
  const keySecret = cleanKey(process.env.RAZORPAY_KEY_SECRET);

  if (!keyId || !keySecret) {
    return null;
  }

  try {
    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    return { razorpay: instance, keyId, keySecret };
  } catch (err) {
    console.error("[Razorpay] Initialization error:", err);
    return null;
  }
}

// Lazy Google Gen AI initialization
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (err) {
      console.warn("Failed to initialize GoogleGenAI client:", err);
    }
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    brand: "Zenvia Ultra-Luxury",
    razorpayConfigured: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
  });
});

// Authoritative Server Time & Promotion Sync
app.get("/api/time", (_req, res) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.json({
    serverTime: Date.now(),
    iso: new Date().toISOString(),
  });
});

// Real PIN Code Serviceability Cache & Validator
const serverPincodeCache = new Map<string, any>();
const SERVER_DUMMY_PINS = new Set([
  "000000", "111111", "222222", "333333", "444444", "555555",
  "666666", "777777", "888888", "999999", "123456", "654321",
  "123123", "987654", "100000", "200000", "300000", "400000",
  "500000", "600000", "700000", "800000", "900000",
]);

const SERVER_VALID_PREFIXES = new Set([
  "11", "12", "13", "14", "15", "16", "17", "18", "19",
  "20", "21", "22", "23", "24", "25", "26", "27", "28",
  "30", "31", "32", "33", "34", "36", "37", "38", "39",
  "40", "41", "42", "43", "44", "45", "46", "47", "48", "49",
  "50", "51", "52", "53", "56", "57", "58", "59",
  "60", "61", "62", "63", "64", "67", "68", "69",
  "70", "71", "72", "73", "74", "75", "76", "77", "78", "79",
  "80", "81", "82", "83", "84", "85",
]);

app.get("/api/pincode/check", async (req, res) => {
  const rawPincode = String(req.query.pincode || "").trim();

  // 1. Format validation
  if (!rawPincode) {
    return res.json({
      serviceable: false,
      status: "invalid_format",
      title: "Invalid PIN Code",
      message: "Please enter a valid 6-digit Indian PIN code.",
    });
  }

  if (!/^\d+$/.test(rawPincode) || rawPincode.length !== 6 || rawPincode.startsWith("0")) {
    return res.json({
      serviceable: false,
      status: "invalid_format",
      title: "Invalid PIN Code",
      message: "Please enter a valid 6-digit Indian PIN code.",
    });
  }

  // 2. Reject obvious dummy sequences
  if (SERVER_DUMMY_PINS.has(rawPincode)) {
    return res.json({
      serviceable: false,
      status: "unavailable",
      title: "Delivery Not Available",
      message: "Sorry, delivery is currently unavailable for this PIN code.",
    });
  }

  // 3. Reject invalid postal circle prefixes
  const prefix = rawPincode.substring(0, 2);
  if (!SERVER_VALID_PREFIXES.has(prefix)) {
    return res.json({
      serviceable: false,
      status: "unavailable",
      title: "Delivery Not Available",
      message: "Sorry, delivery is currently unavailable for this PIN code.",
    });
  }

  // 4. In-memory cache check
  if (serverPincodeCache.has(rawPincode)) {
    return res.json(serverPincodeCache.get(rawPincode));
  }

  // 5. Query official India Post national directory
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const postalRes = await fetch(`https://api.postalpincode.in/pincode/${rawPincode}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (postalRes.ok) {
      const data = (await postalRes.json()) as any;
      if (
        Array.isArray(data) &&
        data.length > 0 &&
        data[0].Status === "Success" &&
        Array.isArray(data[0].PostOffice) &&
        data[0].PostOffice.length > 0
      ) {
        const po = data[0].PostOffice[0];
        const locationName = po.District
          ? `${po.District}, ${po.State}`
          : po.Name
          ? `${po.Name}, ${po.State}`
          : po.State || "India";

        const validResult = {
          serviceable: true,
          status: "available",
          title: "Delivery Available",
          message: "We deliver to this PIN code.",
          location: locationName,
          district: po.District || "",
          state: po.State || "",
          codAvailable: true,
          courier: "BlueDart / Delhivery Express",
        };

        serverPincodeCache.set(rawPincode, validResult);
        return res.json(validResult);
      }
    }
  } catch (fetchErr) {
    console.warn(`[Pincode Check] Error or timeout querying India Post API for ${rawPincode}:`, fetchErr);
  }

  const unserviceableResult = {
    serviceable: false,
    status: "unavailable",
    title: "Delivery Not Available",
    message: "Sorry, delivery is currently unavailable for this PIN code.",
  };

  serverPincodeCache.set(rawPincode, unserviceableResult);
  return res.json(unserviceableResult);
});

// Razorpay 1: Secure Order Creation Endpoint
app.post("/api/razorpay/create-order", async (req, res) => {
  try {
    // Robust check for required environment variables
    const rawKeyId = process.env.RAZORPAY_KEY_ID;
    const rawKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!rawKeyId || !rawKeySecret || !rawKeyId.trim() || !rawKeySecret.trim()) {
      return res.status(500).json({
        success: false,
        error: "Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to the Google AI Studio project settings (Settings > Secrets).",
      });
    }

    const rzpClient = getRazorpayClient();
    if (!rzpClient) {
      return res.status(500).json({
        success: false,
        error: "Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to the Google AI Studio project settings (Settings > Secrets).",
      });
    }

    const { items, discountPercent = 0 } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: "Order items array is required" });
    }

    // Securely calculate canonical amount on server side using PRODUCTS catalog
    let rawSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = PRODUCTS.find((p) => p.id === item.id);
      if (!product) {
        return res.status(400).json({ success: false, error: `Invalid product ID: ${item.id}` });
      }
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const itemSubtotal = calculateItemSubtotal(product, qty);
      rawSubtotal += itemSubtotal;
      validatedItems.push({
        id: product.id,
        name: product.name,
        price: product.price,
        itemSubtotal,
        quantity: qty,
      });
    }

    const numericDiscount = Math.max(0, Number(discountPercent) || 0);
    const discountAmount = Math.round((rawSubtotal * numericDiscount) / 100);
    const shippingCost = calculateDeliveryFee(rawSubtotal);
    const finalTotalRupees = Math.max(1, rawSubtotal - discountAmount + shippingCost);
    const amountInPaise = Math.round(finalTotalRupees * 100);

    const receipt = `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const order = await rzpClient.razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        store: "Zenvia India",
        itemsCount: validatedItems.length.toString(),
      },
    });

    return res.json({
      success: true,
      keyId: rzpClient.keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      summary: {
        subtotal: rawSubtotal,
        discount: discountAmount,
        shipping: shippingCost,
        finalTotal: finalTotalRupees,
      },
    });
  } catch (error: any) {
    console.error("Razorpay create-order error:", error);
    const errorDesc =
      error?.error?.description ||
      error?.description ||
      error?.message ||
      "Failed to create Razorpay order";

    const isAuthError =
      errorDesc.toLowerCase().includes("auth") ||
      (error?.error?.code === "BAD_REQUEST_ERROR" && errorDesc.toLowerCase().includes("auth"));

    const userMessage = isAuthError
      ? "Razorpay authentication failed: The Key Secret does not match the Key ID. Please verify your Razorpay API keys in Settings > Secrets or choose Cash on Delivery (COD)."
      : `Razorpay order creation failed: ${errorDesc}`;

    return res.status(400).json({
      success: false,
      isAuthError,
      error: userMessage,
    });
  }
});

// Razorpay 2: Backend Signature Verification & Payment Verification Endpoint
app.post("/api/razorpay/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customerDetails,
      items,
      discountPercent = 0,
      saveAddressToProfile = false,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: "Missing required payment parameters for verification.",
      });
    }

    if (!customerDetails || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: "Missing customer details or items for order recording.",
      });
    }

    const rzpClient = getRazorpayClient();
    if (!rzpClient) {
      return res.status(500).json({
        success: false,
        verified: false,
        error: "Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to the server environment.",
      });
    }

    // PHASE 9: Duplicate Payment Protection / Idempotency
    const existingOrder = getOrderByPaymentId(razorpay_payment_id);
    if (existingOrder) {
      return res.json({
        success: true,
        verified: true,
        orderId: existingOrder.id,
        paymentId: razorpay_payment_id,
        status: "PAID",
        alreadyProcessed: true,
      });
    }

    // PHASE 7: Cryptographic HMAC SHA-256 signature verification
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", rzpClient.keySecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.warn("Razorpay payment verification failed: cryptographic signature mismatch");

      if (customerDetails) {
        void sendFailedPaymentEmail({
          razorpayOrderId: razorpay_order_id,
          amount: 0,
          items,
          customer: customerDetails,
          status: "PAYMENT VERIFICATION FAILED",
          reason: "Cryptographic signature mismatch on backend verification",
        }).catch((err) => console.error("[ZENVIA EMAIL] Signature mismatch email failed:", err));
      }

      return res.status(400).json({
        success: false,
        verified: false,
        error: "Payment verification failed: cryptographic signature mismatch.",
      });
    }

    // Calculate canonical expected amounts from database catalog
    let verifiedSubtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const prod = PRODUCTS.find((p) => p.id === item.id);
      if (!prod) {
        return res.status(400).json({
          success: false,
          verified: false,
          error: `Invalid product in order: ${item.id}`,
        });
      }
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const itemSubtotal = calculateItemSubtotal(prod, qty);
      verifiedSubtotal += itemSubtotal;
      verifiedItems.push({
        id: prod.id,
        name: prod.name,
        price: prod.price,
        itemSubtotal,
        quantity: qty,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
      });
    }

    const verifiedDiscount = Math.round((verifiedSubtotal * (Math.max(0, Number(discountPercent)) || 0)) / 100);
    const verifiedShipping = calculateDeliveryFee(verifiedSubtotal);
    const verifiedTotalRupees = Math.max(1, verifiedSubtotal - verifiedDiscount + verifiedShipping);
    const verifiedAmountPaise = Math.round(verifiedTotalRupees * 100);

    // PHASE 8: Verify actual order and payment directly with Razorpay API (Fail closed)
    let rzpOrder: any;
    try {
      rzpOrder = await rzpClient.razorpay.orders.fetch(razorpay_order_id);
    } catch (orderFetchErr: any) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: "Razorpay order could not be retrieved from gateway.",
      });
    }

    if (!rzpOrder) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: "Razorpay order not found on gateway.",
      });
    }

    if (rzpOrder.currency !== "INR") {
      return res.status(400).json({
        success: false,
        verified: false,
        error: "Order currency on gateway is not INR.",
      });
    }

    if (Number(rzpOrder.amount) !== verifiedAmountPaise) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: "Order amount on gateway does not match server expected amount.",
      });
    }

    let rzpPayment: any;
    try {
      rzpPayment = await rzpClient.razorpay.payments.fetch(razorpay_payment_id);
    } catch (paymentFetchErr: any) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: "Razorpay payment could not be retrieved from gateway.",
      });
    }

    if (!rzpPayment) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: "Razorpay payment record not found on gateway.",
      });
    }

    if (rzpPayment.order_id !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: "Payment record does not belong to the verified Razorpay order.",
      });
    }

    if (Number(rzpPayment.amount) !== verifiedAmountPaise) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: "Payment amount does not match expected order total.",
      });
    }

    if (rzpPayment.currency !== "INR") {
      return res.status(400).json({
        success: false,
        verified: false,
        error: "Payment currency is not INR.",
      });
    }

    if (rzpPayment.status !== "captured") {
      return res.status(400).json({
        success: false,
        verified: false,
        error: `Payment status is '${rzpPayment.status}'. Payment must be captured.`,
      });
    }

    // PHASE 10: Order Persistence and Confirmation
    const nowIso = new Date().toISOString();
    const trackingNumber = "BD-" + Math.floor(10000000 + Math.random() * 90000000);
    const fullAddress =
      customerDetails.fullAddress ||
      `${customerDetails.houseNo || ""}, ${customerDetails.street || ""}${customerDetails.landmark ? `, ${customerDetails.landmark}` : ""}, ${customerDetails.city || ""}, ${customerDetails.state || ""} - ${customerDetails.pincode || ""}`.trim();

    saveOrder({
      id: razorpay_order_id,
      userEmail: customerDetails.email || "",
      date: nowIso,
      items: verifiedItems,
      subtotal: verifiedSubtotal,
      discount: verifiedDiscount,
      shipping: verifiedShipping,
      total: verifiedTotalRupees,
      formattedTotal: `₹${verifiedTotalRupees.toLocaleString("en-IN")}`,
      paymentMethod: "Razorpay",
      paymentStatus: "PAID",
      paymentId: razorpay_payment_id,
      trackingNumber,
      orderStatus: "CONFIRMED",
      customerDetails: {
        fullName: customerDetails.fullName || "Customer",
        phone: customerDetails.phone || "",
        email: customerDetails.email || "",
        houseNo: customerDetails.houseNo || "",
        street: customerDetails.street || "",
        landmark: customerDetails.landmark,
        city: customerDetails.city || "",
        state: customerDetails.state || "",
        pincode: customerDetails.pincode || "",
        fullAddress,
      },
      shippingMethod: "Express Shipping (2–3 Days)",
      createdAt: nowIso,
    });

    // Send confirmation email in background
    void sendNewOrderEmail({
      orderId: razorpay_order_id,
      items: verifiedItems,
      subtotal: verifiedSubtotal,
      discount: verifiedDiscount,
      shipping: verifiedShipping,
      total: verifiedTotalRupees,
      customer: {
        fullName: customerDetails.fullName || "Customer",
        phone: customerDetails.phone || "",
        email: customerDetails.email || "",
        houseNo: customerDetails.houseNo || "",
        street: customerDetails.street || "",
        landmark: customerDetails.landmark,
        city: customerDetails.city || "",
        state: customerDetails.state || "",
        pincode: customerDetails.pincode || "",
        fullAddress,
      },
      payment: {
        method: "Razorpay",
        status: "PAID",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      },
    }).catch((emailError) => {
      console.error("[ZENVIA EMAIL] Razorpay order notification failed:", emailError);
    });

    return res.json({
      success: true,
      verified: true,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      trackingNumber,
      status: "PAID",
      timestamp: nowIso,
    });
  } catch (error: any) {
    console.error("Razorpay verification error:", error);
    return res.status(500).json({
      success: false,
      verified: false,
      error: error.message || "Internal server error during payment verification",
    });
  }
});

// COD Order Server Endpoint
app.post("/api/orders/cod", async (req, res) => {
  try {
    const { items, customerDetails, discountPercent = 0, saveAddressToProfile } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0 || !customerDetails) {
      return res.status(400).json({ error: "Items array and customer details are required" });
    }

    let rawSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = PRODUCTS.find((p) => p.id === item.id);
      if (!product) {
        return res.status(400).json({ error: `Invalid product ID: ${item.id}` });
      }
      const qty = Math.max(1, parseInt(item.quantity) || 1);
      const itemSubtotal = calculateItemSubtotal(product, qty);
      rawSubtotal += itemSubtotal;
      validatedItems.push({
        id: product.id,
        name: product.name,
        price: product.price,
        itemSubtotal,
        quantity: qty,
        image: product.image,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
      });
    }

    const numericDiscount = Math.max(0, Number(discountPercent) || 0);
    const discountAmount = Math.round((rawSubtotal * numericDiscount) / 100);
    const shippingCost = calculateDeliveryFee(rawSubtotal);
    const baseOnlineTotal = Math.max(0, rawSubtotal - discountAmount + shippingCost);
    const codCharge = calculateCODCharge(baseOnlineTotal);
    const finalTotal = calculateCODTotal(baseOnlineTotal);
    const formattedCodTotal = formatRupeeExact(finalTotal);

    const codOrderId = "ZENVIA-COD-" + Math.floor(100000 + Math.random() * 900000);
    const trackingId = "BD-" + Math.floor(10000000 + Math.random() * 90000000);
    const nowIso = new Date().toISOString();

    // Save order into database with authoritative COD charge and total
    saveOrder({
      id: codOrderId,
      userEmail: customerDetails.email || "",
      date: nowIso,
      items: validatedItems,
      subtotal: rawSubtotal,
      discount: discountAmount,
      shipping: shippingCost,
      codCharge,
      total: finalTotal,
      formattedTotal: formattedCodTotal,
      paymentMethod: "Cash on Delivery (COD)",
      paymentStatus: "CONFIRMED",
      trackingNumber: trackingId,
      orderStatus: "CONFIRMED",
      customerDetails: {
        fullName: customerDetails.fullName || "Customer",
        phone: customerDetails.phone || "",
        email: customerDetails.email || "",
        houseNo: customerDetails.houseNo || "",
        street: customerDetails.street || "",
        landmark: customerDetails.landmark,
        city: customerDetails.city || "",
        state: customerDetails.state || "",
        pincode: customerDetails.pincode || "",
        fullAddress: customerDetails.fullAddress || "",
      },
      shippingMethod: "BlueDart Air Express (2–3 Days)",
      createdAt: nowIso,
    });

    // Send New Order Notification to Store Owner in the background (non-blocking)
    void sendNewOrderEmail({
      orderId: codOrderId,
      items: validatedItems,
      subtotal: rawSubtotal,
      discount: discountAmount,
      shipping: shippingCost,
      codCharge,
      total: finalTotal,
      customer: {
        fullName: customerDetails.fullName || "Customer",
        phone: customerDetails.phone || "",
        email: customerDetails.email || "",
        houseNo: customerDetails.houseNo || "",
        street: customerDetails.street || "",
        landmark: customerDetails.landmark,
        city: customerDetails.city || "",
        state: customerDetails.state || "",
        pincode: customerDetails.pincode || "",
        fullAddress: customerDetails.fullAddress || "",
      },
      payment: {
        method: "Cash on Delivery (COD)",
        status: "COD - Pending Cash/UPI at Doorstep",
      },
    }).catch((emailError) => {
      console.error("[ZENVIA EMAIL] COD order notification failed:", emailError);
    });

    // Immediately return success to customer without waiting for SMTP
    return res.json({
      success: true,
      orderId: codOrderId,
      trackingNumber: trackingId,
      status: "CONFIRMED",
      paymentMethod: "Cash on Delivery (COD)",
      codCharge,
      total: finalTotal,
      formattedTotal: formattedCodTotal,
    });
  } catch (error: any) {
    console.error("COD order processing error:", error);
    return res.status(500).json({ error: error.message || "Failed to process COD order" });
  }
});

// Endpoint for Payment Failure or Cancellation Notification
app.post("/api/notifications/payment-failed", async (req, res) => {
  try {
    const { orderId, razorpayOrderId, items, amount, customerDetails, status, reason } = req.body;

    void sendFailedPaymentEmail({
      orderId,
      razorpayOrderId,
      items,
      amount: amount || 0,
      customer: customerDetails,
      status: status || "PAYMENT CANCELLED",
      reason: reason || "User closed payment window or transaction was declined",
    }).catch((err) => {
      console.error("[ZENVIA EMAIL] Payment failure notification error:", err);
    });

    return res.json({ success: true, message: "Payment attempt logged and store owner notified." });
  } catch (error: any) {
    console.error("Payment failure notification error:", error);
    return res.status(500).json({ error: "Failed to record payment attempt notification" });
  }
});

// Endpoint for Customer Contact Form
app.post("/api/notifications/contact", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email and message are required" });
    }

    await sendContactFormEmail({
      name,
      email,
      phone,
      subject,
      message,
    });

    return res.json({ success: true, message: "Your message has been sent to Zenvia Client Concierge." });
  } catch (error: any) {
    console.error("Contact form error:", error);
    return res.status(500).json({ error: "Failed to process contact submission" });
  }
});

// Endpoint for Product Review Submission
app.post("/api/notifications/review", async (req, res) => {
  try {
    const { author, email, productName, rating, headline, comment, orderNumber, verified, photoUrl } = req.body;
    if (!author || !productName || !rating || !comment) {
      return res.status(400).json({ error: "Missing required review fields" });
    }

    await sendReviewSubmissionEmail({
      author,
      email,
      productName,
      rating: Number(rating) || 5,
      headline,
      comment,
      orderNumber,
      verified: Boolean(verified),
      photoUrl,
    });

    return res.json({ success: true, message: "Review recorded and store owner notified." });
  } catch (error: any) {
    console.error("Review notification error:", error);
    return res.status(500).json({ error: "Failed to send review notification" });
  }
});

// Endpoint for Newsletter Subscription
app.post("/api/notifications/newsletter", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email address required" });
    }

    await sendNewsletterSignupEmail(email);

    return res.json({ success: true, message: "Newsletter registration confirmed." });
  } catch (error: any) {
    console.error("Newsletter notification error:", error);
    return res.status(500).json({ error: "Failed to send newsletter notification" });
  }
});

// AI Concierge & Smart Product Advisor Endpoint
app.post("/api/ai-concierge", async (req, res) => {
  try {
    const { query, productsCatalog } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const ai = getAIClient();
    if (ai) {
      const prompt = `You are the AI Concierge for Zenvia, an ultra-luxury lifestyle brand.
Client Query: "${query}"

Available Luxury Products in Catalog:
${JSON.stringify(productsCatalog?.map((p: any) => ({
  id: p.id,
  name: p.name,
  category: p.category,
  price: p.price,
  description: p.description,
  tags: p.tags
})), null, 2)}

Instructions:
1. Speak with the tone of an elite luxury concierge (sophisticated, warm, polite, discerning).
2. Select 1 to 3 best-matching product IDs from the catalog.
3. Provide a concise, elegant recommendation response explaining why these curated items fit the client's request.
4. Return strictly valid JSON with format:
{
  "recommendationText": "Your concierge response here...",
  "recommendedProductIds": ["id1", "id2"],
  "curatedTips": "A brief luxury styling or lifestyle tip..."
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        return res.json(parsed);
      }
    }

    // Fallback if no GEMINI_API_KEY or AI response failure
    const lower = query.toLowerCase();
    const matchedIds = (productsCatalog || [])
      .filter((p: any) =>
        p.name.toLowerCase().includes(lower) ||
        p.category.toLowerCase().includes(lower) ||
        p.description.toLowerCase().includes(lower) ||
        (p.tags && p.tags.some((t: string) => lower.includes(t.toLowerCase())))
      )
      .slice(0, 3)
      .map((p: any) => p.id);

    return res.json({
      recommendationText: `Welcome to Zenvia Concierge. Based on your interest in "${query}", we have curated these exceptional masterworks from our current collection.`,
      recommendedProductIds: matchedIds.length > 0 ? matchedIds : ["p1", "p2"],
      curatedTips: "Each Zenvia creation comes with complimentary white-glove climate-controlled shipping and a lifetime certificate of authenticity."
    });
  } catch (error: any) {
    console.error("AI Concierge error:", error);
    return res.status(500).json({
      error: "Concierge service temporarily unavailable",
      recommendationText: "Our concierge team is reviewing your query. Please browse our curated collections below.",
      recommendedProductIds: ["p1", "p2", "p3"],
      curatedTips: "Enjoy complimentary worldwide white-glove delivery on all purchases."
    });
  }
});

function escapeHtml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderProductPageWithMeta(rawSlug: string): string | null {
  const product = findProductBySlugOrId(rawSlug);
  if (!product) return null;

  const indexPath =
    process.env.NODE_ENV === "production"
      ? path.join(process.cwd(), "dist", "index.html")
      : path.join(process.cwd(), "index.html");

  if (!fs.existsSync(indexPath)) return null;

  let html = fs.readFileSync(indexPath, "utf-8");
  const siteName = "ZENVIA";
  const slug = getProductSlug(product);
  const canonicalUrl = `https://zenviaco.in/product/${slug}`;
  const pageTitle = `${product.name} | Zenvia`;
  const description = `${product.name} — ${product.tagline || product.description}. Order online at Zenvia with Free India Express Shipping & Cash on Delivery.`;
  const imageUrl = product.image;

  // Replace default title
  html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(pageTitle)}</title>`);

  const metaTagsHtml = `
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:title" content="${escapeHtml(pageTitle)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:type" content="product" />
    <meta property="og:site_name" content="${escapeHtml(siteName)}" />
    <meta property="product:price:amount" content="${product.price}" />
    <meta property="product:price:currency" content="INR" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
  `;

  return html.replace("</head>", `${metaTagsHtml}\n</head>`);
}

// Serve product pages with injected Open Graph metadata for crawlers & direct visits
app.get("/product/*", (req, res, next) => {
  try {
    const rawSlug = req.path.replace(/^\/product\//, "");
    const htmlWithMeta = renderProductPageWithMeta(rawSlug);
    if (htmlWithMeta) {
      return res.status(200).set({ "Content-Type": "text/html" }).send(htmlWithMeta);
    }
  } catch (err) {
    console.error("Product meta injection error:", err);
  }
  next();
});

// Setup Vite development middleware or static production serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Zenvia] Server running on http://localhost:${PORT}`);
  });
}

startServer();
