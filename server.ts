import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import crypto from "crypto";
import Razorpay from "razorpay";
import { PRODUCTS } from "./src/data/products";
import { findProductBySlugOrId, getProductSlug } from "./src/lib/slug";
import {
  sendNewOrderEmail,
  sendFailedPaymentEmail,
  sendContactFormEmail,
  sendReviewSubmissionEmail,
  sendNewsletterSignupEmail,
  STORE_OWNER_EMAIL,
} from "./src/server/email";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy Razorpay initialization
function getRazorpayInstance(): Razorpay | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (keyId && keySecret) {
    try {
      return new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    } catch (err) {
      console.warn("Failed to initialize Razorpay SDK:", err);
    }
  }
  return null;
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

// Razorpay 1: Secure Order Creation Endpoint
app.post("/api/razorpay/create-order", async (req, res) => {
  try {
    const { items, discountPercent = 0 } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order items array is required" });
    }

    // Securely calculate amount on server side using canonical PRODUCTS catalog
    let rawSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = PRODUCTS.find((p) => p.id === item.id);
      if (!product) {
        return res.status(400).json({ error: `Invalid product ID: ${item.id}` });
      }
      const qty = Math.max(1, parseInt(item.quantity) || 1);
      rawSubtotal += product.price * qty;
      validatedItems.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: qty,
      });
    }

    const numericDiscount = Math.max(0, Number(discountPercent) || 0);
    const discountAmount = (rawSubtotal * numericDiscount) / 100;
    const shippingCost = rawSubtotal >= 499 ? 0 : 49;
    const finalTotalRupees = Math.max(0, rawSubtotal - discountAmount + shippingCost);
    const amountInPaise = Math.round(finalTotalRupees * 100);

    const razorpay = getRazorpayInstance();
    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_ZenviaStoreKey";

    if (razorpay) {
      const options = {
        amount: amountInPaise,
        currency: "INR",
        receipt: `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        notes: {
          store: "Zenvia India",
          itemsCount: validatedItems.length.toString(),
        },
      };

      const order = await razorpay.orders.create(options);
      return res.json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId,
        isTestMode: false,
        summary: {
          subtotal: rawSubtotal,
          discount: discountAmount,
          shipping: shippingCost,
          finalTotal: finalTotalRupees,
        },
      });
    } else {
      // Demo/Test mode when environment variables are not configured
      const demoOrderId = `order_demo_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`;
      return res.json({
        success: true,
        orderId: demoOrderId,
        amount: amountInPaise,
        currency: "INR",
        keyId,
        isTestMode: true,
        message: "Demo mode active: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET not set in environment.",
        summary: {
          subtotal: rawSubtotal,
          discount: discountAmount,
          shipping: shippingCost,
          finalTotal: finalTotalRupees,
        },
      });
    }
  } catch (error: any) {
    console.error("Razorpay create-order error:", error);
    return res.status(500).json({ error: error.message || "Failed to create Razorpay order" });
  }
});

// Razorpay 2: Backend Signature Verification Endpoint
app.post("/api/razorpay/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      isTestMode = false,
      orderDetails,
      customerDetails,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: "Missing required payment parameters for verification",
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keySecret && !isTestMode) {
      // HMAC SHA-256 signature verification
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(body.toString())
        .digest("hex");

      const isSignatureValid = expectedSignature === razorpay_signature;

      if (!isSignatureValid) {
        console.warn("Razorpay payment verification failed: signature mismatch");

        // Send alert email for failed verification attempt
        if (customerDetails) {
          void sendFailedPaymentEmail({
            razorpayOrderId: razorpay_order_id,
            amount: orderDetails?.total || 0,
            items: orderDetails?.items,
            customer: customerDetails,
            status: "PAYMENT VERIFICATION FAILED",
            reason: "Signature mismatch on backend verification",
          }).catch((err) => console.error("[ZENVIA EMAIL] Signature mismatch email failed:", err));
        }

        return res.status(400).json({
          success: false,
          verified: false,
          error: "Payment verification failed: signature mismatch",
        });
      }
    }

    // Payment Signature verified (or approved in test/demo mode)
    // Send New Order Email to Store Owner in background (non-blocking)
    if (customerDetails && orderDetails) {
      void sendNewOrderEmail({
        orderId: orderDetails.orderId || razorpay_order_id,
        items: orderDetails.items || [],
        subtotal: orderDetails.subtotal || 0,
        discount: orderDetails.discount || 0,
        shipping: orderDetails.shipping || 0,
        total: orderDetails.total || 0,
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
          method: "Razorpay (UPI / Cards / NetBanking)",
          status: "PAID",
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
        },
      }).catch((emailError) => {
        console.error("[ZENVIA EMAIL] Razorpay order notification failed:", emailError);
      });
    }

    return res.json({
      success: true,
      verified: true,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      status: "PAID",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Razorpay verification error:", error);
    return res.status(500).json({
      success: false,
      verified: false,
      error: error.message || "Internal server error during verification",
    });
  }
});

// COD Order Server Endpoint
app.post("/api/orders/cod", async (req, res) => {
  try {
    const { items, customerDetails, discountPercent = 0 } = req.body;

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
      rawSubtotal += product.price * qty;
      validatedItems.push({
        name: product.name,
        price: product.price,
        quantity: qty,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
      });
    }

    const numericDiscount = Math.max(0, Number(discountPercent) || 0);
    const discountAmount = (rawSubtotal * numericDiscount) / 100;
    const shippingCost = rawSubtotal >= 499 ? 0 : 49;
    const finalTotal = Math.max(0, rawSubtotal - discountAmount + shippingCost);

    const codOrderId = "ZENVIA-COD-" + Math.floor(100000 + Math.random() * 900000);
    const trackingId = "BD-" + Math.floor(10000000 + Math.random() * 90000000);

    // Send New Order Notification to Store Owner in the background (non-blocking)
    void sendNewOrderEmail({
      orderId: codOrderId,
      items: validatedItems,
      subtotal: rawSubtotal,
      discount: discountAmount,
      shipping: shippingCost,
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
      formattedTotal: `₹${finalTotal.toLocaleString("en-IN")}`,
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
