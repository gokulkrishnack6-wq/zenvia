# Razorpay Payment Gateway Setup Guide

This guide explains how to obtain and configure your **Razorpay API Keys** (`RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`) securely in Google AI Studio.

---

## 1. Obtain Your Razorpay API Keys

1. Log in to the [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Toggle between **Test Mode** (for testing) or **Live Mode** (for real transactions).
3. Navigate to **Account & Settings** (or Settings in the sidebar) > **API Keys**.
4. Click **Generate Key** (or **Regenerate Key** if you already have one):
   - **Key ID**: Starts with `rzp_test_` (for Test Mode) or `rzp_live_` (for Live Mode).
   - **Key Secret**: A 24+ character secret string shown once upon generation. Copy it immediately.

---

## 2. Add Secrets to Google AI Studio

> **Security Note:** Never hardcode secrets in client-side code or public files. Google AI Studio manages environment variables securely on the server container.

1. In the Google AI Studio interface, open the **Project Settings** (gear icon) or **Secrets / Environment Variables** panel.
2. Add the two environment variables:

| Secret Name | Description | Example Value |
|---|---|---|
| `RAZORPAY_KEY_ID` | Your Razorpay Key ID | `rzp_test_1DP5mmOlF5G5ag` |
| `RAZORPAY_KEY_SECRET` | Your Razorpay Key Secret | `28374hfkjdhskfjh72938472` |

3. Save the secrets. The dev server will automatically reload with the updated credentials.

---

## 3. How the Integration Works

- **Server-Side Security**: All order creation (`POST /api/razorpay/create-order`) and cryptographic HMAC SHA-256 signature verification (`POST /api/razorpay/verify-payment`) are processed securely on the Node.js backend.
- **Fail-Closed Verification**: Payments are verified directly with Razorpay's API before orders are saved to the database.
- **Cash on Delivery (COD)**: Always available as an instant fallback if online payment gateway credentials are not yet configured or when customer prefers paying at doorstep.

---

## 4. Troubleshooting

- **Authentication Failed**: Occurs if `RAZORPAY_KEY_SECRET` does not correspond to `RAZORPAY_KEY_ID` (e.g. Test Key ID paired with Live Secret, or mismatched regeneration). Ensure both keys are copied from the same active pair in your Razorpay dashboard.
- **Missing Keys**: If either key is absent, the backend safely returns an informative error directing you to configure the environment variables in Google AI Studio Settings > Secrets.
