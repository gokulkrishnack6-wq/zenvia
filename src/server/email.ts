import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const STORE_OWNER_EMAIL = process.env.STORE_OWNER_EMAIL || "zenviashopindia@gmail.com";

// Set to track sent order/payment notification IDs to prevent duplicate emails
const sentNotificationIds = new Set<string>();

// Lazy creation of Nodemailer Transporter if valid SMTP credentials exist
function createTransporter() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  // Strip spaces from password in case the user pasted a 16-character Google App Password with spaces
  const pass = process.env.SMTP_PASS?.trim().replace(/\s+/g, "");
  const port = Number(process.env.SMTP_PORT) || 587;

  // Timeout configuration to prevent hanging sockets or delayed connections
  const timeoutConfig = {
    connectionTimeout: 6000, // 6 seconds max to connect
    greetingTimeout: 6000,   // 6 seconds max for greeting
    socketTimeout: 8000,     // 8 seconds max socket activity
  };

  // Verify non-empty and non-placeholder credentials
  if (user && pass && pass !== "MY_SMTP_PASS" && pass.length > 0) {
    const isGmail = (host && host.toLowerCase().includes("gmail")) || user.toLowerCase().includes("@gmail.com");

    if (isGmail) {
      return nodemailer.createTransport({
        service: "gmail",
        auth: {
          user,
          pass,
        },
        ...timeoutConfig,
      });
    }

    if (host) {
      return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
        tls: {
          rejectUnauthorized: false,
        },
        ...timeoutConfig,
      });
    }
  }
  return null;
}

// Core mail sender function
async function sendEmailNotification(subject: string, textBody: string, htmlBody?: string) {
  console.log(`\n==================================================`);
  console.log(`[ZENVIA EMAIL NOTIFICATION TO STORE OWNER]`);
  console.log(`To: ${STORE_OWNER_EMAIL}`);
  console.log(`Subject: ${subject}`);
  console.log(`--------------------------------------------------`);
  console.log(textBody);
  console.log(`==================================================\n`);

  try {
    const transporter = createTransporter();
    if (transporter) {
      const fromAddress = process.env.SMTP_USER?.trim() || STORE_OWNER_EMAIL;
      await transporter.sendMail({
        from: `"Zenvia Store System" <${fromAddress}>`,
        to: STORE_OWNER_EMAIL,
        subject,
        text: textBody,
        html: htmlBody || `<pre style="font-family: monospace; font-size: 13px; line-height: 1.5; color: #111;">${textBody}</pre>`,
      });
      console.log(`[ZENVIA EMAIL] Successfully dispatched via SMTP to ${STORE_OWNER_EMAIL}`);
    } else {
      console.log(`[ZENVIA EMAIL] SMTP not configured or credentials inactive. Notification captured in server log above.`);
    }
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    if (errMsg.includes("535") || errMsg.includes("Invalid login") || errMsg.includes("Username and Password not accepted")) {
      console.warn(
        `[ZENVIA EMAIL NOTICE] SMTP Authentication (535): The provided SMTP password for ${process.env.SMTP_USER || "SMTP"} was not accepted by the mail server.\n` +
        `💡 Gmail Note: If using Gmail, Google requires a 16-character App Password (https://myaccount.google.com/apppasswords) rather than your personal account password.\n` +
        `Notification has been safely captured in the server console log above.`
      );
    } else {
      console.warn(`[ZENVIA EMAIL NOTICE] SMTP delivery note: ${errMsg}. Notification captured in server console log above.`);
    }
  }
}

// 1. Send New Order Email
export async function sendNewOrderEmail(orderData: {
  orderId: string;
  items: Array<{ name: string; quantity: number; price: number; selectedColor?: string; selectedSize?: string }>;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  customer: {
    fullName: string;
    phone: string;
    email: string;
    houseNo: string;
    street: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    fullAddress: string;
  };
  payment: {
    method: string;
    status: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
  };
  timestamp?: string;
}) {
  const deduplicationKey = `order_${orderData.orderId}_${orderData.payment.razorpayPaymentId || "cod"}`;
  if (sentNotificationIds.has(deduplicationKey)) {
    console.log(`[ZENVIA EMAIL] Duplicate order notification blocked for key: ${deduplicationKey}`);
    return;
  }
  sentNotificationIds.add(deduplicationKey);

  const dateStr = orderData.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const itemsListFormatted = orderData.items
    .map(
      (item, idx) =>
        `  ${idx + 1}. ${item.name}` +
        (item.selectedColor ? ` (Color: ${item.selectedColor})` : "") +
        (item.selectedSize ? ` (Size: ${item.selectedSize})` : "") +
        ` x${item.quantity} - ₹${(item.price * item.quantity).toLocaleString("en-IN")}`
    )
    .join("\n");

  const textBody = `ZENVIA
Smart Finds. Better Living.

--------------------------------------------------
NEW ORDER - ${orderData.orderId}
--------------------------------------------------

Order ID: ${orderData.orderId}
Date: ${dateStr}

CUSTOMER DETAILS
Name: ${orderData.customer.fullName}
Mobile: ${orderData.customer.phone}
Email: ${orderData.customer.email}

DELIVERY LOCATION
Address: ${orderData.customer.houseNo}, ${orderData.customer.street}${orderData.customer.landmark ? `, Landmark: ${orderData.customer.landmark}` : ""}
City: ${orderData.customer.city}
State: ${orderData.customer.state}
PIN Code: ${orderData.customer.pincode}
Full Address: ${orderData.customer.fullAddress}

ORDER ITEMS
${itemsListFormatted}

FINANCIAL BREAKDOWN
Subtotal: ₹${orderData.subtotal.toLocaleString("en-IN")}
Discount: -₹${orderData.discount.toLocaleString("en-IN")}
Delivery Charge: ₹${orderData.shipping === 0 ? "FREE" : orderData.shipping.toLocaleString("en-IN")}
TOTAL AMOUNT: ₹${orderData.total.toLocaleString("en-IN")}

PAYMENT DETAILS
Method: ${orderData.payment.method}
Status: ${orderData.payment.status}
Razorpay Order ID: ${orderData.payment.razorpayOrderId || "N/A (COD)"}
Razorpay Payment ID: ${orderData.payment.razorpayPaymentId || "N/A (COD)"}

--------------------------------------------------
Notification automatically generated for store owner (${STORE_OWNER_EMAIL}).
`;

  await sendEmailNotification(`New Zenvia Order – ${orderData.orderId}`, textBody);
}

// 2. Send Order Attempt / Failed Payment Email
export async function sendFailedPaymentEmail(attemptData: {
  orderId?: string;
  razorpayOrderId?: string;
  items?: Array<{ name: string; quantity: number; price: number }>;
  amount: number;
  customer?: {
    fullName?: string;
    phone?: string;
    email?: string;
    houseNo?: string;
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    fullAddress?: string;
  };
  status: string; // e.g. "PAYMENT FAILED", "PAYMENT CANCELLED"
  reason?: string;
  timestamp?: string;
}) {
  const dateStr = attemptData.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const deduplicationKey = `failed_${attemptData.razorpayOrderId || Date.now()}_${attemptData.reason || "cancel"}`;

  if (sentNotificationIds.has(deduplicationKey)) {
    return;
  }
  sentNotificationIds.add(deduplicationKey);

  const itemsListFormatted = attemptData.items && attemptData.items.length > 0
    ? attemptData.items.map((i, idx) => `  ${idx + 1}. ${i.name} x${i.quantity} - ₹${(i.price * i.quantity).toLocaleString("en-IN")}`).join("\n")
    : "  N/A";

  const textBody = `ZENVIA
Smart Finds. Better Living.

--------------------------------------------------
ZENVIA PAYMENT ATTEMPT ALERT
--------------------------------------------------

Status: ${attemptData.status} (UNPAID)
Date: ${dateStr}
Razorpay Order ID: ${attemptData.razorpayOrderId || "N/A"}
Failure/Cancel Reason: ${attemptData.reason || "Customer closed or cancelled transaction"}

CUSTOMER DETAILS
Name: ${attemptData.customer?.fullName || "N/A"}
Mobile: ${attemptData.customer?.phone || "N/A"}
Email: ${attemptData.customer?.email || "N/A"}

DELIVERY DETAILS
PIN Code: ${attemptData.customer?.pincode || "N/A"}
Address: ${attemptData.customer?.fullAddress || "N/A"}

PURCHASE ATTEMPT DETAILS
Items:
${itemsListFormatted}
Attempted Total Amount: ₹${attemptData.amount.toLocaleString("en-IN")}

--------------------------------------------------
NOTE: This order was NOT marked as paid.
Notification generated for store owner (${STORE_OWNER_EMAIL}).
`;

  await sendEmailNotification(`Zenvia Payment Attempt – ${attemptData.status}`, textBody);
}

// 3. Send Customer Contact Form Email
export async function sendContactFormEmail(contactData: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  timestamp?: string;
}) {
  const dateStr = contactData.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const textBody = `ZENVIA
Smart Finds. Better Living.

--------------------------------------------------
NEW CUSTOMER ENQUIRY
--------------------------------------------------

Date: ${dateStr}
Name: ${contactData.name}
Email: ${contactData.email}
Mobile Number: ${contactData.phone || "Not provided"}
Subject: ${contactData.subject || "General Enquiry"}

MESSAGE:
"${contactData.message}"

--------------------------------------------------
Notification generated for store owner (${STORE_OWNER_EMAIL}).
`;

  await sendEmailNotification(`New Customer Enquiry – Zenvia (${contactData.name})`, textBody);
}

// 4. Send Product Review Submission Email
export async function sendReviewSubmissionEmail(reviewData: {
  author: string;
  email?: string;
  productName: string;
  rating: number;
  headline?: string;
  comment: string;
  orderNumber?: string;
  verified: boolean;
  photoUrl?: string;
  timestamp?: string;
}) {
  const dateStr = reviewData.timestamp || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const textBody = `ZENVIA
Smart Finds. Better Living.

--------------------------------------------------
NEW PRODUCT REVIEW SUBMITTED
--------------------------------------------------

Date: ${dateStr}
Product Name: ${reviewData.productName}
Customer Name: ${reviewData.author}
Customer Email: ${reviewData.email || "Not provided"}
Rating: ${reviewData.rating} / 5 Stars
Verified Purchase: ${reviewData.verified ? "Yes (Order #" + reviewData.orderNumber + ")" : "Unverified Submission"}
Headline: ${reviewData.headline || "N/A"}

REVIEW COMMENT:
"${reviewData.comment}"

Customer Photo Provided: ${reviewData.photoUrl ? "Yes (" + reviewData.photoUrl.substring(0, 80) + "...)" : "No"}

--------------------------------------------------
Notification generated for store owner (${STORE_OWNER_EMAIL}).
`;

  await sendEmailNotification(`New Product Review – ${reviewData.productName}`, textBody);
}

// 5. Send Newsletter Signup Email
export async function sendNewsletterSignupEmail(email: string) {
  const dateStr = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const textBody = `ZENVIA
Smart Finds. Better Living.

--------------------------------------------------
NEW NEWSLETTER SUBSCRIBER
--------------------------------------------------

Date: ${dateStr}
Subscriber Email: ${email}

--------------------------------------------------
Notification generated for store owner (${STORE_OWNER_EMAIL}).
`;

  await sendEmailNotification(`New Newsletter Subscriber – Zenvia`, textBody);
}
