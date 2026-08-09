import express from "express";
import dotenv from "dotenv";
import Razorpay from "razorpay";

dotenv.config();

const app = express();
app.use(express.json());

// Health Check Endpoint
app.get("/api/health", (_req, res) => {
  console.log(">>> HEALTH REQUEST RECEIVED");
  res.status(200);
  res.setHeader("Content-Type", "text/plain");
  res.end("ZENVIA SERVER OK");
});

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

// Razorpay Create Order Endpoint
app.post("/api/razorpay/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;
    const options = {
      amount: Math.round(Number(amount) * 100), // amount in smallest currency unit (paise)
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error("Razorpay Order Creation Error:", error);
    res.status(500).json({ error: "Failed to create Razorpay order" });
  }
});

// Razorpay Verify Payment Endpoint
app.post("/api/razorpay/verify-payment", async (req, res) => {
  // Paste your existing verification logic here
  res.status(200).json({ status: "ok" });
});

// COD Endpoint
app.post("/api/orders/cod", async (req, res) => {
  // Paste your existing COD order logic here
  res.status(200).json({ status: "ok" });
});

// Notification Endpoints
app.post("/api/notifications/payment-failed", async (req, res) => {
  // Paste your existing payment-failed notification logic here
  res.status(200).json({ status: "ok" });
});

app.post("/api/notifications/contact", async (req, res) => {
  // Paste your existing contact notification logic here
  res.status(200).json({ status: "ok" });
});

app.post("/api/notifications/review", async (req, res) => {
  // Paste your existing review notification logic here
  res.status(200).json({ status: "ok" });
});

app.post("/api/notifications/newsletter", async (req, res) => {
  // Paste your existing newsletter notification logic here
  res.status(200).json({ status: "ok" });
});

// AI Concierge Endpoint
app.post("/api/ai-concierge", async (req, res) => {
  // Paste your existing AI concierge logic here
  res.status(200).json({ status: "ok" });
});

export default app;