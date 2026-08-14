import fs from "fs";
import path from "path";
import crypto from "crypto";
import { UserProfile, SavedAddress, CustomerOrder, OrderStatus } from "../types";

export interface StoredUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl?: string;
  passwordHash?: string;
  salt?: string;
  authProvider: "google" | "email";
  createdAt: string;
  savedAddresses: SavedAddress[];
}

export interface StoredSession {
  token: string;
  userId: string;
  expiresAt: number;
}

interface DatabaseSchema {
  users: StoredUser[];
  sessions: StoredSession[];
  orders: CustomerOrder[];
}

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "zenvia_store.json");

// In-memory cache synced with disk
let dbCache: DatabaseSchema = {
  users: [],
  sessions: [],
  orders: [],
};

// Initialize DB file
function initDb() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      dbCache = JSON.parse(raw);
    } else {
      // Seed initial mock orders or demo user for rich out-of-the-box demonstration
      dbCache = {
        users: [
          {
            id: "usr_demo_zenvia",
            email: "alexander@zenvia.co.in",
            fullName: "Alexander von Bern",
            phone: "+91 98765 43210",
            avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop",
            authProvider: "google",
            createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
            savedAddresses: [
              {
                id: "addr_1",
                label: "Home",
                fullName: "Alexander von Bern",
                phone: "+91 98765 43210",
                email: "alexander@zenvia.co.in",
                houseNo: "Villa 14, Prestige Golfshire",
                street: "Nandi Hills Road, Devanahalli",
                landmark: "Near Clubhouse",
                city: "Bengaluru",
                state: "Karnataka",
                pincode: "562110",
                isDefault: true,
                createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
              },
              {
                id: "addr_2",
                label: "Work",
                fullName: "Alexander von Bern",
                phone: "+91 98765 43210",
                email: "alexander@zenvia.co.in",
                houseNo: "Floor 24, UB City Tower",
                street: "Vittal Mallya Road",
                landmark: "Opposite JW Marriott",
                city: "Bengaluru",
                state: "Karnataka",
                pincode: "560001",
                isDefault: false,
                createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
              },
            ],
          },
        ],
        sessions: [],
        orders: [
          {
            id: "ZENVIA-COD-891024",
            userId: "usr_demo_zenvia",
            userEmail: "alexander@zenvia.co.in",
            date: new Date(Date.now() - 2 * 86400000).toISOString(),
            items: [
              {
                id: "p1",
                name: "Mini Pocket Thermal Printer",
                price: 1290,
                quantity: 1,
                image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?q=80&w=600&auto=format&fit=crop",
                selectedColor: "Pastel Pink",
              },
            ],
            subtotal: 1290,
            discount: 0,
            shipping: 0,
            total: 1290,
            formattedTotal: "₹1,290",
            paymentMethod: "Cash on Delivery (COD)",
            paymentStatus: "CONFIRMED",
            trackingNumber: "BD-88902143",
            orderStatus: "SHIPPED",
            customerDetails: {
              fullName: "Alexander von Bern",
              phone: "+91 98765 43210",
              email: "alexander@zenvia.co.in",
              houseNo: "Villa 14, Prestige Golfshire",
              street: "Nandi Hills Road, Devanahalli",
              landmark: "Near Clubhouse",
              city: "Bengaluru",
              state: "Karnataka",
              pincode: "562110",
              fullAddress: "Villa 14, Prestige Golfshire, Nandi Hills Road, Devanahalli, Bengaluru, Karnataka - 562110",
            },
            shippingMethod: "BlueDart Air Express (2–3 Days)",
            createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
          },
          {
            id: "ZENVIA-COD-710492",
            userId: "usr_demo_zenvia",
            userEmail: "alexander@zenvia.co.in",
            date: new Date(Date.now() - 14 * 86400000).toISOString(),
            items: [
              {
                id: "p3",
                name: "4-in-1 Handheld Electric Vegetable Cutter Set",
                price: 849,
                quantity: 2,
                image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600&auto=format&fit=crop",
                selectedColor: "Emerald Green",
              },
            ],
            subtotal: 1698,
            discount: 0,
            shipping: 0,
            total: 1698,
            formattedTotal: "₹1,698",
            paymentMethod: "Razorpay (UPI / Cards / NetBanking)",
            paymentStatus: "PAID",
            paymentId: "pay_rzp_9904812",
            trackingNumber: "BD-44120938",
            orderStatus: "DELIVERED",
            customerDetails: {
              fullName: "Alexander von Bern",
              phone: "+91 98765 43210",
              email: "alexander@zenvia.co.in",
              houseNo: "Villa 14, Prestige Golfshire",
              street: "Nandi Hills Road, Devanahalli",
              landmark: "Near Clubhouse",
              city: "Bengaluru",
              state: "Karnataka",
              pincode: "562110",
              fullAddress: "Villa 14, Prestige Golfshire, Nandi Hills Road, Devanahalli, Bengaluru, Karnataka - 562110",
            },
            shippingMethod: "BlueDart Air Express (2–3 Days)",
            createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
          },
        ],
      };
      saveDb();
    }
  } catch (err) {
    console.error("[accountDb] Error initializing DB:", err);
  }
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2), "utf-8");
  } catch (err) {
    console.error("[accountDb] Error writing to DB file:", err);
  }
}

// Password hashing utility using scrypt
function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

// Convert internal user to clean client DTO
export function sanitizeUser(user: StoredUser): UserProfile {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    authProvider: user.authProvider,
    createdAt: user.createdAt,
    savedAddresses: user.savedAddresses || [],
  };
}

// Generate secure session token
export function createSession(userId: string): string {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  dbCache.sessions.push({ token, userId, expiresAt });
  saveDb();
  return token;
}

// Revoke session token
export function revokeSession(token: string) {
  dbCache.sessions = dbCache.sessions.filter((s) => s.token !== token);
  saveDb();
}

// Get user by Bearer token
export function getUserByToken(token: string): StoredUser | null {
  if (!token) return null;
  const session = dbCache.sessions.find((s) => s.token === token && s.expiresAt > Date.now());
  if (!session) return null;
  const user = dbCache.users.find((u) => u.id === session.userId);
  return user || null;
}

// Google Sign-In handler (Finds existing or creates new)
export function handleGoogleAuth(payload: {
  email: string;
  fullName: string;
  avatarUrl?: string;
  phone?: string;
}): { user: UserProfile; token: string; isNewUser: boolean } {
  const normEmail = payload.email.trim().toLowerCase();
  let user = dbCache.users.find((u) => u.email.toLowerCase() === normEmail);
  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    user = {
      id: "usr_" + crypto.randomBytes(8).toString("hex"),
      email: normEmail,
      fullName: payload.fullName.trim() || "Valued Customer",
      phone: payload.phone || "",
      avatarUrl: payload.avatarUrl,
      authProvider: "google",
      createdAt: new Date().toISOString(),
      savedAddresses: [],
    };
    dbCache.users.push(user);
  } else {
    // Update profile info if Google provided updated name/avatar
    if (payload.fullName && (!user.fullName || user.fullName === "Customer")) {
      user.fullName = payload.fullName.trim();
    }
    if (payload.avatarUrl && !user.avatarUrl) {
      user.avatarUrl = payload.avatarUrl;
    }
  }

  saveDb();
  const token = createSession(user.id);
  return { user: sanitizeUser(user), token, isNewUser };
}

// Email + Password Registration
export function registerEmailUser(payload: {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}): { user: UserProfile; token: string } {
  const normEmail = payload.email.trim().toLowerCase();
  if (dbCache.users.some((u) => u.email.toLowerCase() === normEmail)) {
    throw new Error("An account with this email address already exists. Please sign in.");
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(payload.password, salt);

  const newUser: StoredUser = {
    id: "usr_" + crypto.randomBytes(8).toString("hex"),
    email: normEmail,
    fullName: payload.fullName.trim() || "Customer",
    phone: payload.phone.trim() || "",
    passwordHash,
    salt,
    authProvider: "email",
    createdAt: new Date().toISOString(),
    savedAddresses: [],
  };

  dbCache.users.push(newUser);
  saveDb();
  const token = createSession(newUser.id);
  return { user: sanitizeUser(newUser), token };
}

// Email + Password Login
export function loginEmailUser(email: string, password: string): { user: UserProfile; token: string } {
  const normEmail = email.trim().toLowerCase();
  const user = dbCache.users.find((u) => u.email.toLowerCase() === normEmail);

  if (!user || !user.passwordHash || !user.salt) {
    throw new Error("Invalid email or password. If you signed up with Google, please use 'Continue with Google'.");
  }

  const calculatedHash = hashPassword(password, user.salt);
  if (calculatedHash !== user.passwordHash) {
    throw new Error("Invalid email or password. Please try again.");
  }

  const token = createSession(user.id);
  return { user: sanitizeUser(user), token };
}

// Update Profile
export function updateUserProfile(
  userId: string,
  updates: { fullName?: string; phone?: string; avatarUrl?: string }
): UserProfile {
  const user = dbCache.users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found");

  if (updates.fullName !== undefined) user.fullName = updates.fullName.trim();
  if (updates.phone !== undefined) user.phone = updates.phone.trim();
  if (updates.avatarUrl !== undefined) user.avatarUrl = updates.avatarUrl.trim();

  saveDb();
  return sanitizeUser(user);
}

// Add Saved Address
export function addSavedAddress(
  userId: string,
  address: Omit<SavedAddress, "id" | "createdAt">
): UserProfile {
  const user = dbCache.users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found");

  const newAddress: SavedAddress = {
    ...address,
    id: "addr_" + crypto.randomBytes(6).toString("hex"),
    createdAt: new Date().toISOString(),
  };

  // If this is set to default, or if it's their first address, mark as default and unset others
  if (newAddress.isDefault || user.savedAddresses.length === 0) {
    newAddress.isDefault = true;
    user.savedAddresses.forEach((a) => (a.isDefault = false));
  }

  user.savedAddresses.push(newAddress);
  saveDb();
  return sanitizeUser(user);
}

// Update Saved Address
export function updateSavedAddress(
  userId: string,
  addressId: string,
  updates: Partial<SavedAddress>
): UserProfile {
  const user = dbCache.users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found");

  const addrIndex = user.savedAddresses.findIndex((a) => a.id === addressId);
  if (addrIndex === -1) throw new Error("Address not found");

  if (updates.isDefault) {
    user.savedAddresses.forEach((a) => (a.isDefault = false));
  }

  user.savedAddresses[addrIndex] = {
    ...user.savedAddresses[addrIndex],
    ...updates,
  };

  saveDb();
  return sanitizeUser(user);
}

// Delete Saved Address
export function deleteSavedAddress(userId: string, addressId: string): UserProfile {
  const user = dbCache.users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found");

  const wasDefault = user.savedAddresses.find((a) => a.id === addressId)?.isDefault;
  user.savedAddresses = user.savedAddresses.filter((a) => a.id !== addressId);

  // If we deleted the default and there are remaining addresses, set first as default
  if (wasDefault && user.savedAddresses.length > 0) {
    user.savedAddresses[0].isDefault = true;
  }

  saveDb();
  return sanitizeUser(user);
}

// Set Default Address
export function setDefaultAddress(userId: string, addressId: string): UserProfile {
  const user = dbCache.users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found");

  user.savedAddresses.forEach((a) => {
    a.isDefault = a.id === addressId;
  });

  saveDb();
  return sanitizeUser(user);
}

// Orders: Save newly placed order (Razorpay or COD)
export function saveOrder(order: CustomerOrder): CustomerOrder {
  // Check if order with ID already exists
  const existingIdx = dbCache.orders.findIndex((o) => o.id === order.id);
  if (existingIdx > -1) {
    dbCache.orders[existingIdx] = order;
  } else {
    dbCache.orders.unshift(order); // newest first
  }
  saveDb();
  return order;
}

// Orders: Retrieve orders for a specific authenticated user
export function getOrdersForUser(userId: string, userEmail: string): CustomerOrder[] {
  const normEmail = (userEmail || "").trim().toLowerCase();
  return dbCache.orders
    .filter((o) => (userId && o.userId === userId) || (normEmail && o.userEmail.toLowerCase() === normEmail))
    .sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());
}

// Orders: Retrieve a single order by ID with authorization verification
export function getOrderById(orderId: string, userId?: string, userEmail?: string): CustomerOrder | null {
  const order = dbCache.orders.find((o) => o.id === orderId);
  if (!order) return null;

  // If userId/email provided, enforce authorization
  if (userId || userEmail) {
    const isOwner =
      (userId && order.userId === userId) ||
      (userEmail && order.userEmail.toLowerCase() === userEmail.toLowerCase());
    if (!isOwner) return null;
  }

  return order;
}

// Link guest order to newly registered user
export function linkGuestOrder(orderId: string, userId: string, userEmail: string): boolean {
  const order = dbCache.orders.find((o) => o.id === orderId);
  if (!order) return false;

  const normUserEmail = userEmail.toLowerCase();
  if (order.userEmail.toLowerCase() === normUserEmail || !order.userId) {
    order.userId = userId;
    saveDb();
    return true;
  }
  return false;
}

// Initialize on boot
initDb();
