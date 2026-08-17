import fs from "fs";
import path from "path";
import { CustomerOrder } from "../types";

export interface PendingOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  selectedColor?: string;
  selectedSize?: string;
  itemSubtotal: number;
}

export interface PendingOrderIntent {
  orderId: string;
  items: PendingOrderItem[];
  rawSubtotal: number;
  discountPercent: number;
  discountAmount: number;
  shippingCost: number;
  finalTotalRupees: number;
  amountInPaise: number;
  currency: string;
  createdAt: string;
}

interface OrdersDatabaseSchema {
  orders: CustomerOrder[];
  pendingIntents?: Record<string, PendingOrderIntent>;
}

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "zenvia_store.json");

let dbCache: OrdersDatabaseSchema = {
  orders: [],
  pendingIntents: {},
};

// Initialize DB file
function initDb() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      dbCache = {
        orders: Array.isArray(parsed.orders) ? parsed.orders : [],
        pendingIntents: parsed.pendingIntents && typeof parsed.pendingIntents === "object" ? parsed.pendingIntents : {},
      };
    } else {
      dbCache = { orders: [], pendingIntents: {} };
      saveDb();
    }
  } catch (err) {
    console.error("[orderDb] Error initializing DB:", err);
  }
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2), "utf-8");
  } catch (err) {
    console.error("[orderDb] Error writing to DB file:", err);
  }
}

initDb();

// Save or update pending order intent created during create-order
export function savePendingOrderIntent(intent: PendingOrderIntent): PendingOrderIntent {
  initDb();
  if (!dbCache.pendingIntents) {
    dbCache.pendingIntents = {};
  }
  dbCache.pendingIntents[intent.orderId] = intent;
  saveDb();
  return intent;
}

// Retrieve pending order intent by Razorpay orderId
export function getPendingOrderIntent(orderId: string): PendingOrderIntent | undefined {
  initDb();
  return dbCache.pendingIntents ? dbCache.pendingIntents[orderId] : undefined;
}

// Save customer order
export function saveOrder(order: CustomerOrder): CustomerOrder {
  initDb();
  const existingIdx = dbCache.orders.findIndex((o) => o.id === order.id);
  if (existingIdx >= 0) {
    dbCache.orders[existingIdx] = order;
  } else {
    dbCache.orders.unshift(order);
  }
  saveDb();
  return order;
}

// Retrieve an order by order ID
export function getOrderById(orderId: string): CustomerOrder | undefined {
  initDb();
  return dbCache.orders.find((o) => o.id === orderId);
}

// Retrieve an order by Razorpay payment ID (for idempotency verification)
export function getOrderByPaymentId(paymentId: string): CustomerOrder | undefined {
  initDb();
  if (!paymentId) return undefined;
  return dbCache.orders.find((o) => o.paymentId === paymentId);
}

