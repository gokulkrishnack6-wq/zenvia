import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import crypto from "crypto";
import Razorpay from "razorpay";
import { PRODUCTS } from "./src/data/products";
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
  console.log(">>> HEALTH REQUEST RECEIVED");

  res.status(200);
  res.setHeader("Content-Type", "text/plain");
  res.end("ZENVIA SERVER OK");
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
          await sendFailedPaymentEmail({
            razorpayOrderId: razorpay_order_id,
            amount: orderDetails?.total || 0,
            items: orderDetails?.items,
            customer: customerDetails,
            status: "PAYMENT VERIFICATION FAILED",
            reason: "Signature mismatch on backend verification",
          });
        }

        return res.status(400).json({
          success: false,
          verified: false,
          error: "Payment verification failed: signature mismatch",
        });
      }
    }

    // Payment Signature verified (or approved in test/demo mode)
    // NOW send New Order Email to Store Owner server-side
    if (customerDetails && orderDetails) {
      await sendNewOrderEmail({
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

    // Send New Order Notification to Store Owner
    await sendNewOrderEmail({
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
    });

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

    await sendFailedPaymentEmail({
      orderId,
      razorpayOrderId,
      items,
      amount: amount || 0,
      customer: customerDetails,
      status: status || "PAYMENT CANCELLED",
      reason: reason || "User closed payment window or transaction was declined",
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
