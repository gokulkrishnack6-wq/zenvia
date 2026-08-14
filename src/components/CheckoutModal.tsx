import React, { useState, useEffect, useRef } from "react";
import {
  X,
  CheckCircle2,
  Truck,
  Sparkles,
  Building,
  Banknote,
  ShieldCheck,
  ShoppingBag,
  AlertCircle,
  Loader2,
  Lock,
  ArrowRight,
  Zap,
  MapPin,
  User,
  Phone,
  Mail,
  Home,
  Navigation,
  Edit3,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { CartItem, Currency, CheckoutData } from "../types";
import { formatRupee } from "../lib/currency";
import { loadRazorpayScript } from "../lib/loadRazorpay";
import { ZenviaLogo } from "./ZenviaLogo";

interface CheckoutModalProps {
  isOpen: boolean;
  cartItems: CartItem[];
  directBuyItem?: CartItem | null;
  currency: Currency;
  discountPercent: number;
  onClose: () => void;
  onOrderComplete: () => void;
}

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Delhi NCR",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

interface FormState {
  fullName: string;
  phone: string;
  email: string;
  houseNo: string;
  street: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  paymentMethod: "razorpay" | "cod";
  shippingMethod: "concierge" | "standard";
}

interface ValidationErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  houseNo?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  cartItems,
  directBuyItem,
  discountPercent,
  onClose,
  onOrderComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Customer & Address Details, 2: Payment & Order Summary, 3: Confirmation
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Initial empty form state
  const initialFormState: FormState = {
    fullName: "",
    phone: "",
    email: "",
    houseNo: "",
    street: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "razorpay",
    shippingMethod: "concierge",
  };

  // Form state
  const [formData, setFormData] = useState<FormState>(initialFormState);

  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});

  // Success state payload
  const [orderConfirmation, setOrderConfirmation] = useState<{
    orderId: string;
    paymentId?: string;
    paymentMethod: string;
    paymentStatus: string;
    verified: boolean;
    amountPaid: string;
    trackingNumber: string;
    items: CartItem[];
    customerDetails: {
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
  } | null>(null);

  const [showDetails, setShowDetails] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const prevIsOpenRef = useRef(isOpen);

  // Reset checkout session state ONLY when the modal transitions from closed to open
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setStep(1);
      setFormData(initialFormState);
      setOrderConfirmation(null);
      setIsProcessing(false);
      setPaymentError(null);
      setFieldErrors({});
      setShowDetails(false);
      setCopiedKey(null);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen]);

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2000);
  };

  const handleCloseModal = () => {
    if (isProcessing) return;
    onClose();
  };

  if (!isOpen) return null;

  const activeItems = directBuyItem ? [directBuyItem] : cartItems;

  const rawSubtotal = activeItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = (rawSubtotal * discountPercent) / 100;
  const shippingCost = rawSubtotal >= 499 ? 0 : 49;
  const finalTotal = Math.max(0, rawSubtotal - discountAmount + shippingCost);

  const formattedTotal = formatRupee(finalTotal);

  // Validation function
  const validateForm = (data: FormState): ValidationErrors => {
    const errors: ValidationErrors = {};

    // Full Name
    if (!data.fullName.trim()) {
      errors.fullName = "Please enter your full name.";
    }

    // Mobile Number (10-digit Indian phone)
    const cleanPhone = data.phone.replace(/\D/g, "");
    if (!data.phone.trim() || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      errors.phone = "Please enter a valid 10-digit Indian mobile number.";
    }

    // Email Address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email.trim() || !emailRegex.test(data.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    // House / Flat / Building Number
    if (!data.houseNo.trim()) {
      errors.houseNo = "Please enter your house/flat/building number.";
    }

    // Street / Area
    if (!data.street.trim()) {
      errors.street = "Please enter your street/area.";
    }

    // City
    if (!data.city.trim()) {
      errors.city = "Please enter your city.";
    }

    // State
    if (!data.state.trim()) {
      errors.state = "Please select your state.";
    }

    // PIN code (6 digits)
    const cleanPincode = data.pincode.trim();
    if (!cleanPincode || !/^\d{6}$/.test(cleanPincode)) {
      errors.pincode = "Please enter your 6-digit PIN code.";
    }

    return errors;
  };

  // Helper for input change with error clearing
  const handleInputChange = (key: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key as keyof ValidationErrors]) {
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  // Proceed from Step 1 -> Step 2
  const handleProceedToPaymentStep = () => {
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setPaymentError("Please correct all highlighted validation errors before proceeding.");
      return;
    }

    setFieldErrors({});
    setPaymentError(null);
    setStep(2);
  };

  // Payment Execution (Step 2 -> Step 3)
  const handleExecutePayment = async () => {
    setPaymentError(null);

    // Strict validation check before triggering payment
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setStep(1); // Return to step 1 so user can correct fields
      setPaymentError("Required checkout details are missing or invalid. Please update them below.");
      return;
    }

    const fullAddress = `${formData.houseNo}, ${formData.street}${formData.landmark ? `, ${formData.landmark}` : ""}, ${formData.city}, ${formData.state} - ${formData.pincode}`;

    // COD Flow
    if (formData.paymentMethod === "cod") {
      setIsProcessing(true);
      try {
        const codRes = await fetch("/api/orders/cod", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: activeItems.map((item) => ({
              id: item.product.id,
              quantity: item.quantity,
              selectedColor: item.selectedColor,
              selectedSize: item.selectedSize,
            })),
            customerDetails: {
              fullName: formData.fullName,
              phone: formData.phone,
              email: formData.email,
              houseNo: formData.houseNo,
              street: formData.street,
              landmark: formData.landmark,
              city: formData.city,
              state: formData.state,
              pincode: formData.pincode,
              fullAddress,
            },
            discountPercent,
          }),
        });

        const codData = await codRes.json();

        if (codRes.ok && codData.success) {
          setOrderConfirmation({
            orderId: codData.orderId,
            paymentMethod: "Cash on Delivery (COD)",
            paymentStatus: "COD - Cash on Delivery",
            verified: true,
            amountPaid: formattedTotal,
            trackingNumber: codData.trackingNumber,
            items: [...activeItems],
            customerDetails: {
              fullName: formData.fullName,
              phone: formData.phone,
              email: formData.email,
              houseNo: formData.houseNo,
              street: formData.street,
              landmark: formData.landmark,
              city: formData.city,
              state: formData.state,
              pincode: formData.pincode,
              fullAddress,
            },
          });

          setIsProcessing(false);
          setStep(3);

          try {
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 },
              colors: ["#F59E0B", "#10B981", "#3B82F6"],
            });
          } catch (e) {
            console.log("Confetti trigger:", e);
          }

          onOrderComplete();
        } else {
          setIsProcessing(false);
          setPaymentError(codData.error || "Failed to place COD order. Please try again.");
        }
      } catch (codErr: any) {
        setIsProcessing(false);
        setPaymentError("Network error while placing COD order. Please try again.");
      }
      return;
    }

    // Razorpay Flow
    setIsProcessing(true);

    try {
      // 1. Load Razorpay Checkout Script dynamically
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setPaymentError("Failed to load Razorpay Checkout SDK. Please check your internet connection.");
        setIsProcessing(false);
        return;
      }

      // 2. Call backend to create Razorpay Order securely
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: activeItems.map((item) => ({
            id: item.product.id,
            quantity: item.quantity,
          })),
          discountPercent,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        setPaymentError(orderData.error || "Failed to initialize payment order on server.");
        setIsProcessing(false);
        return;
      }

      // 3. Launch Razorpay Checkout Modal
      const cleanContact = formData.phone.replace(/\D/g, "");

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Zenvia Store",
        description: directBuyItem
          ? `Direct Purchase: ${directBuyItem.product.name}`
          : `Zenvia Order (${activeItems.length} items)`,
        image: activeItems[0]?.product.image || "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=300&auto=format&fit=crop",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // Received Razorpay response, now send signature to backend for verification
          setIsProcessing(true);
          try {
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                isTestMode: orderData.isTestMode,
                orderDetails: {
                  orderId: response.razorpay_order_id,
                  items: activeItems.map((i) => ({
                    name: i.product.name,
                    quantity: i.quantity,
                    price: i.product.price,
                    selectedColor: i.selectedColor,
                    selectedSize: i.selectedSize,
                  })),
                  subtotal: rawSubtotal,
                  discount: discountAmount,
                  shipping: shippingCost,
                  total: finalTotal,
                },
                customerDetails: {
                  fullName: formData.fullName,
                  phone: formData.phone,
                  email: formData.email,
                  houseNo: formData.houseNo,
                  street: formData.street,
                  landmark: formData.landmark,
                  city: formData.city,
                  state: formData.state,
                  pincode: formData.pincode,
                  fullAddress,
                },
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.verified) {
              const trackingId = "BD-" + Math.floor(10000000 + Math.random() * 90000000);

              setOrderConfirmation({
                orderId: verifyData.orderId,
                paymentId: verifyData.paymentId,
                paymentMethod: "Razorpay (UPI / Cards / NetBanking)",
                paymentStatus: "PAID",
                verified: true,
                amountPaid: formattedTotal,
                trackingNumber: trackingId,
                items: [...activeItems],
                customerDetails: {
                  fullName: formData.fullName,
                  phone: formData.phone,
                  email: formData.email,
                  houseNo: formData.houseNo,
                  street: formData.street,
                  landmark: formData.landmark,
                  city: formData.city,
                  state: formData.state,
                  pincode: formData.pincode,
                  fullAddress,
                },
              });

              setIsProcessing(false);
              setStep(3);

              try {
                confetti({
                  particleCount: 150,
                  spread: 90,
                  origin: { y: 0.6 },
                  colors: ["#F59E0B", "#10B981", "#3B82F6", "#EC4899"],
                });
              } catch (e) {
                console.log("Confetti trigger:", e);
              }

              onOrderComplete();
            } else {
              setIsProcessing(false);
              setPaymentError(
                verifyData.error || "Payment verification failed on server. Order was NOT marked as paid."
              );
            }
          } catch (verifyErr: any) {
            setIsProcessing(false);
            setPaymentError("Network error during payment verification. Please contact Zenvia Support.");
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: cleanContact,
          method: "upi",
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: "Instant UPI Intent (Google Pay, PhonePe, Paytm, BHIM)",
                instruments: [
                  {
                    method: "upi",
                    flows: ["intent", "qr", "omni"],
                  },
                ],
              },
              other: {
                name: "Cards, Net Banking & Wallets",
                instruments: [
                  { method: "card" },
                  { method: "netbanking" },
                  { method: "wallet" },
                ],
              },
            },
            sequence: ["block.upi", "block.other"],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        notes: {
          shipping_address: fullAddress,
        },
        theme: {
          color: "#F59E0B",
          backdrop_color: "rgba(0,0,0,0.6)",
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setPaymentError("Payment window was closed or cancelled. You can retry anytime.");

            // Send backend notification for cancelled payment attempt
            fetch("/api/notifications/payment-failed", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: orderData.orderId,
                amount: finalTotal,
                items: activeItems.map((i) => ({
                  name: i.product.name,
                  quantity: i.quantity,
                  price: i.product.price,
                })),
                customerDetails: {
                  fullName: formData.fullName,
                  phone: formData.phone,
                  email: formData.email,
                  houseNo: formData.houseNo,
                  street: formData.street,
                  landmark: formData.landmark,
                  city: formData.city,
                  state: formData.state,
                  pincode: formData.pincode,
                  fullAddress,
                },
                status: "PAYMENT CANCELLED",
                reason: "Customer dismissed payment popup window",
              }),
            }).catch((err) => console.log("Payment failure alert error:", err));
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);

      rzp.on("payment.failed", function (response: any) {
        setIsProcessing(false);
        const desc = response.error?.description || "Transaction failed or was declined by bank.";
        setPaymentError(`Razorpay Payment Failed: ${desc}`);

        // Send backend notification for failed payment attempt
        fetch("/api/notifications/payment-failed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpayOrderId: orderData.orderId,
            amount: finalTotal,
            items: activeItems.map((i) => ({
              name: i.product.name,
              quantity: i.quantity,
              price: i.product.price,
            })),
            customerDetails: {
              fullName: formData.fullName,
              phone: formData.phone,
              email: formData.email,
              houseNo: formData.houseNo,
              street: formData.street,
              landmark: formData.landmark,
              city: formData.city,
              state: formData.state,
              pincode: formData.pincode,
              fullAddress,
            },
            status: "PAYMENT FAILED",
            reason: desc,
          }),
        }).catch((err) => console.log("Payment failure alert error:", err));
      });

      rzp.open();
    } catch (err: any) {
      setIsProcessing(false);
      console.error("Razorpay error:", err);
      setPaymentError(err.message || "An unexpected error occurred during Razorpay checkout.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border border-neutral-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ZenviaLogo variant="dark" className="h-9 w-auto" />
            <div>
              <span className="text-lg font-extrabold text-neutral-900 tracking-wide uppercase block">
                {step === 3 ? "Order Confirmed" : "Zenvia Checkout"}
              </span>
              <span className="text-xs text-emerald-700 font-semibold flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>
                  {step === 3
                    ? "Official Purchase Receipt • Zenvia Guarantee"
                    : "100% RBI Verified Razorpay Gateway • Fast India Shipping"}
                </span>
              </span>
            </div>
          </div>

          <button
            onClick={handleCloseModal}
            disabled={isProcessing}
            className="text-neutral-500 hover:text-neutral-900 p-1.5 rounded-full hover:bg-neutral-200 disabled:opacity-50 cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Header */}
        {step < 3 && (
          <div className="px-6 py-2.5 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between text-xs font-semibold overflow-x-auto no-scrollbar">
            <div className={`flex items-center space-x-2 shrink-0 ${step === 1 ? "text-amber-800 font-bold" : "text-neutral-900"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 1 ? "bg-amber-600 text-white font-bold" : "bg-emerald-600 text-white"}`}>
                {step > 1 ? "✓" : "1"}
              </span>
              <span>1. Customer & Delivery Details</span>
            </div>
            <span className="text-neutral-300 shrink-0">→</span>
            <div className={`flex items-center space-x-2 shrink-0 ${step === 2 ? "text-amber-800 font-bold" : "text-neutral-400"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 2 ? "bg-amber-600 text-white font-bold" : "bg-neutral-200"}`}>
                2
              </span>
              <span>2. Order Summary & Payment</span>
            </div>
            <span className="text-neutral-300 shrink-0">→</span>
            <div className="flex items-center space-x-2 shrink-0 text-neutral-400">
              <span className="w-5 h-5 rounded-full bg-neutral-200 flex items-center justify-center text-[11px]">
                3
              </span>
              <span>3. Order Confirmed</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {/* Error Banner */}
          {paymentError && (
            <div className="mb-5 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start space-x-2.5 shadow-2xs">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block text-rose-900">Checkout Notice</span>
                <span>{paymentError}</span>
              </div>
              <button
                onClick={() => setPaymentError(null)}
                className="text-rose-500 hover:text-rose-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Active Order Summary Header (Preview) */}
          {step < 3 && activeItems.length > 0 && (
            <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3.5 mb-6 shadow-xs max-w-2xl mx-auto">
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-2 mb-2">
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    {directBuyItem ? "⚡ Direct Buy Summary" : "Cart Order Summary"} ({activeItems.length} {activeItems.length === 1 ? "item" : "items"})
                  </span>
                </div>
                <span className="text-xs font-extrabold text-amber-900">Total: {formattedTotal}</span>
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-neutral-700 gap-y-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px]">
                  <span>Subtotal: <strong className="text-neutral-900">{formatRupee(rawSubtotal)}</strong></span>
                  {discountAmount > 0 && (
                    <span className="text-emerald-700 font-bold">Discount: -{formatRupee(discountAmount)}</span>
                  )}
                  <span>Delivery: <strong className="text-emerald-700 font-bold">{shippingCost === 0 ? "FREE" : formatRupee(shippingCost)}</strong></span>
                </div>
                <div className="font-extrabold text-neutral-900 text-xs">
                  Payable: <span className="text-amber-800 font-bold">{formattedTotal}</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: CUSTOMER DETAILS & DELIVERY ADDRESS FORM */}
          {step === 1 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              {/* Header */}
              <div className="border-b border-neutral-200 pb-3">
                <h3 className="text-xl font-extrabold text-neutral-900">Customer & Delivery Details</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Enter your contact and shipping information once. You will review everything in the next step.
                </p>
              </div>

              {/* Form Grid */}
              <div className="space-y-5">
                {/* Section 1: Customer Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    <User className="w-4 h-4 text-amber-600" />
                    <span>Customer Information</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {/* Full Name */}
                    <div className="sm:col-span-2">
                      <label className="text-neutral-800 font-bold block mb-1">
                        Full Name <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        autoComplete="name"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        className={`w-full bg-white border ${
                          fieldErrors.fullName ? "border-rose-500 bg-rose-50/20" : "border-neutral-300 focus:border-neutral-900"
                        } rounded-xl px-3.5 py-3 text-neutral-900 focus:outline-none font-medium text-sm`}
                        placeholder="Enter your full name"
                      />
                      {fieldErrors.fullName && (
                        <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{fieldErrors.fullName}</span>
                        </p>
                      )}
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label className="text-neutral-800 font-bold block mb-1">
                        Mobile Number (+91) <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        maxLength={10}
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value.replace(/\D/g, ""))}
                        className={`w-full bg-white border ${
                          fieldErrors.phone ? "border-rose-500 bg-rose-50/20" : "border-neutral-300 focus:border-neutral-900"
                        } rounded-xl px-3.5 py-3 text-neutral-900 font-mono text-sm focus:outline-none`}
                        placeholder="10-digit mobile number"
                      />
                      {fieldErrors.phone && (
                        <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{fieldErrors.phone}</span>
                        </p>
                      )}
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="text-neutral-800 font-bold block mb-1">
                        Email Address <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`w-full bg-white border ${
                          fieldErrors.email ? "border-rose-500 bg-rose-50/20" : "border-neutral-300 focus:border-neutral-900"
                        } rounded-xl px-3.5 py-3 text-neutral-900 text-sm focus:outline-none`}
                        placeholder="name@example.com"
                      />
                      {fieldErrors.email && (
                        <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{fieldErrors.email}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 2: Delivery Address */}
                <div className="space-y-3 pt-2 border-t border-neutral-100">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    <span>Delivery Address</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {/* House / Flat / Building */}
                    <div className="sm:col-span-2">
                      <label className="text-neutral-800 font-bold block mb-1">
                        House / Flat / Building Number <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        autoComplete="address-line1"
                        value={formData.houseNo}
                        onChange={(e) => handleInputChange("houseNo", e.target.value)}
                        className={`w-full bg-white border ${
                          fieldErrors.houseNo ? "border-rose-500 bg-rose-50/20" : "border-neutral-300 focus:border-neutral-900"
                        } rounded-xl px-3.5 py-3 text-neutral-900 text-sm focus:outline-none`}
                        placeholder="House / Flat / Apartment / Building No."
                      />
                      {fieldErrors.houseNo && (
                        <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{fieldErrors.houseNo}</span>
                        </p>
                      )}
                    </div>

                    {/* Street / Area */}
                    <div className="sm:col-span-2">
                      <label className="text-neutral-800 font-bold block mb-1">
                        Street / Area / Locality <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        autoComplete="address-line2"
                        value={formData.street}
                        onChange={(e) => handleInputChange("street", e.target.value)}
                        className={`w-full bg-white border ${
                          fieldErrors.street ? "border-rose-500 bg-rose-50/20" : "border-neutral-300 focus:border-neutral-900"
                        } rounded-xl px-3.5 py-3 text-neutral-900 text-sm focus:outline-none`}
                        placeholder="Street / Area / Locality"
                      />
                      {fieldErrors.street && (
                        <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{fieldErrors.street}</span>
                        </p>
                      )}
                    </div>

                    {/* Landmark (Optional) */}
                    <div className="sm:col-span-2">
                      <label className="text-neutral-800 font-bold block mb-1">
                        Landmark <span className="text-neutral-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.landmark}
                        onChange={(e) => handleInputChange("landmark", e.target.value)}
                        className="w-full bg-white border border-neutral-300 focus:border-neutral-900 rounded-xl px-3.5 py-3 text-neutral-900 text-sm focus:outline-none"
                        placeholder="Nearby landmark (e.g. Near Apollo Hospital, Opposite Metro Station)"
                      />
                    </div>

                    {/* City */}
                    <div>
                      <label className="text-neutral-800 font-bold block mb-1">
                        City <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        autoComplete="address-level2"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        className={`w-full bg-white border ${
                          fieldErrors.city ? "border-rose-500 bg-rose-50/20" : "border-neutral-300 focus:border-neutral-900"
                        } rounded-xl px-3.5 py-3 text-neutral-900 focus:outline-none font-medium text-sm`}
                        placeholder="City"
                      />
                      {fieldErrors.city && (
                        <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{fieldErrors.city}</span>
                        </p>
                      )}
                    </div>

                    {/* State */}
                    <div>
                      <label className="text-neutral-800 font-bold block mb-1">
                        State <span className="text-rose-600">*</span>
                      </label>
                      <select
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        className={`w-full bg-white border ${
                          fieldErrors.state ? "border-rose-500 bg-rose-50/20" : "border-neutral-300 focus:border-neutral-900"
                        } rounded-xl px-3.5 py-3 text-neutral-900 focus:outline-none font-medium text-sm`}
                      >
                        <option value="">Select State</option>
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      {fieldErrors.state && (
                        <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{fieldErrors.state}</span>
                        </p>
                      )}
                    </div>

                    {/* 6-Digit PIN Code */}
                    <div className="sm:col-span-2">
                      <label className="text-neutral-800 font-bold block mb-1">
                        6-Digit PIN Code <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        maxLength={6}
                        value={formData.pincode}
                        onChange={(e) => handleInputChange("pincode", e.target.value.replace(/\D/g, ""))}
                        className={`w-full bg-white border ${
                          fieldErrors.pincode ? "border-rose-500 bg-rose-50/20" : "border-neutral-300 focus:border-neutral-900"
                        } rounded-xl px-3.5 py-3 text-neutral-900 font-mono text-sm focus:outline-none`}
                        placeholder="6-digit PIN code (e.g. 110001)"
                      />
                      {fieldErrors.pincode && (
                        <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{fieldErrors.pincode}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 1 Action Button */}
              <div className="flex justify-end pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={handleProceedToPaymentStep}
                  id="proceed-to-payment-step-btn"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-extrabold uppercase tracking-wider shadow-md flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ORDER SUMMARY & PAYMENT */}
          {step === 2 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              {/* Header */}
              <div className="border-b border-neutral-200 pb-3">
                <h3 className="text-xl font-extrabold text-neutral-900">Order Summary & Payment</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Review your delivery destination and select your payment method.
                </p>
              </div>

              {/* READ-ONLY DELIVERY SUMMARY (NO DUPLICATE INPUT FIELDS) */}
              <div className="bg-neutral-50 border border-neutral-200/90 rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-neutral-900">
                      DELIVERING TO
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    id="edit-delivery-details-btn"
                    className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-white border border-neutral-300 hover:border-neutral-900 text-neutral-800 hover:text-neutral-950 font-bold text-xs shadow-2xs transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Edit Details</span>
                  </button>
                </div>

                <div className="text-xs text-neutral-800 space-y-1.5">
                  <div className="font-extrabold text-neutral-950 text-sm">
                    {formData.fullName}
                  </div>
                  <div className="text-neutral-700 leading-relaxed">
                    <span>{formData.houseNo}, {formData.street}</span>
                    {formData.landmark && (
                      <span className="block text-neutral-500 text-[11px]">Landmark: {formData.landmark}</span>
                    )}
                    <span className="block font-semibold text-neutral-900">
                      {formData.city}, {formData.state} - <span className="font-mono">{formData.pincode}</span>
                    </span>
                  </div>
                  <div className="pt-2 border-t border-neutral-200/80 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-neutral-600">
                    <div>
                      <span className="font-semibold text-neutral-500">Phone: </span>
                      <strong className="text-neutral-900 font-mono">+91 {formData.phone}</strong>
                    </div>
                    <div>
                      <span className="font-semibold text-neutral-500">Email: </span>
                      <strong className="text-neutral-900">{formData.email}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchased Items Detailed List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-neutral-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <ShoppingBag className="w-4 h-4 text-amber-600" />
                    <span>Order Items ({activeItems.length})</span>
                  </h4>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Free Express Delivery
                  </span>
                </div>

                <div className="space-y-2">
                  {activeItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-xs">
                      <div className="flex items-center space-x-3 min-w-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-lg object-cover border border-neutral-200 shrink-0 bg-white"
                        />
                        <div className="min-w-0">
                          <h5 className="font-bold text-neutral-900 truncate">{item.product.name}</h5>
                          <div className="text-[11px] text-neutral-500 flex flex-wrap gap-2 mt-0.5">
                            {item.selectedColor && <span>Color: <strong>{item.selectedColor}</strong></span>}
                            {item.selectedSize && <span>Size: <strong>{item.selectedSize}</strong></span>}
                            <span>Qty: <strong className="text-neutral-900 font-extrabold">{item.quantity}</strong></span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right font-extrabold text-neutral-900 text-sm font-mono shrink-0 pl-2">
                        {formatRupee(item.product.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Option Selector */}
              <div className="space-y-3 pt-2 border-t border-neutral-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-neutral-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    <span>Select Payment Method</span>
                  </h4>
                  <span className="text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-semibold">
                    256-Bit Encrypted
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Razorpay Option */}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: "razorpay" })}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
                      formData.paymentMethod === "razorpay"
                        ? "border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/30 shadow-md"
                        : "border-neutral-200 bg-white hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black text-xs shadow-xs">
                          <Zap className="w-4 h-4 fill-white" />
                        </div>
                        <div>
                          <span className="text-sm font-extrabold text-neutral-900 block">
                            UPI & Razorpay Checkout
                          </span>
                          <span className="text-[10px] font-bold text-amber-800">
                            UPI Intent • Instant Mobile App Switch
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-600 mt-2">
                      Directly opens Google Pay, PhonePe or Paytm app on mobile, or use Cards & Net Banking.
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-1 pt-2 border-t border-amber-200/80">
                      <span className="text-[10px] bg-white border border-amber-200 text-neutral-800 px-1.5 py-0.5 rounded font-mono font-bold">GPay</span>
                      <span className="text-[10px] bg-white border border-amber-200 text-neutral-800 px-1.5 py-0.5 rounded font-mono font-bold">PhonePe</span>
                      <span className="text-[10px] bg-white border border-amber-200 text-neutral-800 px-1.5 py-0.5 rounded font-mono font-bold">Paytm</span>
                      <span className="text-[10px] bg-white border border-amber-200 text-neutral-800 px-1.5 py-0.5 rounded font-mono font-bold">Cards</span>
                    </div>
                  </button>

                  {/* Cash on Delivery Option */}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentMethod: "cod" })}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative ${
                      formData.paymentMethod === "cod"
                        ? "border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/30 shadow-md"
                        : "border-neutral-200 bg-white hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          <Banknote className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-sm font-extrabold text-neutral-900 block">
                            Cash on Delivery (COD)
                          </span>
                          <span className="text-[10px] font-bold text-emerald-800">
                            Pay Cash or UPI at Doorstep
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-600 mt-2">
                      Pay using Cash or UPI to the courier agent upon delivery.
                    </p>

                    <div className="mt-3 pt-2 border-t border-emerald-200 text-[10px] text-emerald-800 font-semibold">
                      ✓ Available for PIN code <strong>{formData.pincode}</strong>
                    </div>
                  </button>
                </div>
              </div>

              {/* Total Payable Summary Card */}
              <div className="p-4 rounded-2xl bg-neutral-900 text-white flex items-center justify-between shadow-md">
                <div>
                  <span className="text-xs text-neutral-400 block font-medium">Total Amount Payable:</span>
                  <span className="text-2xl font-black text-amber-400 font-mono">{formattedTotal}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-emerald-400 font-extrabold block">
                    {formData.paymentMethod === "cod" ? "Cash on Delivery" : "Razorpay Guaranteed"}
                  </span>
                  <span className="text-[10px] text-neutral-400 block">Includes GST & Express Shipping</span>
                </div>
              </div>

              {/* Step 2 Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-neutral-300 text-xs text-neutral-700 font-semibold disabled:opacity-50 cursor-pointer hover:bg-neutral-100 flex items-center justify-center space-x-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>

                <button
                  type="button"
                  onClick={handleExecutePayment}
                  disabled={isProcessing}
                  id="pay-now-razorpay-btn"
                  className={`w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                    formData.paymentMethod === "cod"
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.98]"
                      : "bg-amber-500 hover:bg-amber-600 text-neutral-950 active:scale-[0.98]"
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-current" />
                      <span>Processing Payment...</span>
                    </>
                  ) : formData.paymentMethod === "cod" ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Confirm COD Order • {formattedTotal}</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-neutral-950 text-neutral-950" />
                      <span>Pay Now with Razorpay • {formattedTotal}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ORDER CONFIRMATION & PAYMENT STATUS */}
          {step === 3 && orderConfirmation && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="py-2 max-w-2xl mx-auto space-y-6"
            >
              {/* 1. Large Animated Success Checkmark & Header */}
              <div className="text-center space-y-3">
                <div className="relative inline-flex items-center justify-center">
                  {/* Subtle pulsing glow ring */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0.6 }}
                    animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-24 h-24 rounded-full bg-emerald-400/30"
                  />
                  {/* Main animated checkmark badge */}
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 18,
                      delay: 0.1,
                    }}
                    className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-600/30 border-4 border-white"
                  >
                    <Check className="w-10 h-10 stroke-[3] text-white" />
                  </motion.div>
                </div>

                <div className="space-y-1">
                  <motion.h2
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight"
                  >
                    Order Placed Successfully!
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    className="text-sm text-neutral-600 max-w-md mx-auto leading-relaxed"
                  >
                    Thank you for shopping with Zenvia. Your order has been confirmed.
                  </motion.p>
                </div>
              </div>

              {/* 2. Order ID & Tracking Numbers Quick Bar */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                {/* Order ID */}
                <div className="bg-neutral-50 border border-neutral-200/90 rounded-xl p-3.5 flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                      Order ID
                    </span>
                    <span className="font-mono text-sm font-black text-neutral-900">
                      {orderConfirmation.orderId}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(orderConfirmation.orderId, "orderId")}
                    className="p-2 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-700 transition-colors flex items-center space-x-1 cursor-pointer text-xs font-semibold"
                    title="Copy Order ID"
                  >
                    {copiedKey === "orderId" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[11px] text-emerald-600 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-neutral-500" />
                        <span className="text-[11px] text-neutral-600">Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Tracking Number */}
                <div className="bg-neutral-50 border border-neutral-200/90 rounded-xl p-3.5 flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                      Tracking Number (BlueDart)
                    </span>
                    <span className="font-mono text-sm font-black text-neutral-900">
                      {orderConfirmation.trackingNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(orderConfirmation.trackingNumber, "tracking")}
                    className="p-2 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-700 transition-colors flex items-center space-x-1 cursor-pointer text-xs font-semibold"
                    title="Copy Tracking Number"
                  >
                    {copiedKey === "tracking" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[11px] text-emerald-600 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-neutral-500" />
                        <span className="text-[11px] text-neutral-600">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>

              {/* 3. Payment Status Callout (COD vs Razorpay) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                {orderConfirmation.paymentStatus === "PAID" ? (
                  // Razorpay Verified Banner
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/90 flex items-start space-x-3.5 shadow-2xs">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-900">
                          Payment Successful
                        </span>
                        {orderConfirmation.paymentId && (
                          <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                            ID: {orderConfirmation.paymentId}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-emerald-800 mt-0.5 font-medium">
                        Your payment has been securely received via Razorpay. A tax invoice has been sent to <strong>{orderConfirmation.customerDetails.email}</strong>.
                      </p>
                    </div>
                  </div>
                ) : (
                  // COD Confirmed Banner
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-200/90 flex items-start space-x-3.5 shadow-2xs">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-900">
                          Cash on Delivery
                        </span>
                        <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          Pay on Arrival
                        </span>
                      </div>
                      <p className="text-xs text-neutral-800 mt-0.5 font-medium">
                        Pay when your order arrives. You can pay via Cash or any UPI app (Google Pay, PhonePe, Paytm) directly to the delivery executive.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* 4. Express Delivery Tracker Progress */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-neutral-900 text-white rounded-2xl p-5 shadow-md"
              >
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                      Your order is on its way.
                    </span>
                  </div>
                  <span className="text-[11px] font-extrabold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                    BlueDart Express (2–3 Days)
                  </span>
                </div>

                {/* Stepper tracker */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="space-y-1.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-xs font-bold shadow-sm shadow-emerald-500/50">
                      ✓
                    </div>
                    <span className="text-[10px] font-bold text-neutral-200 block">Confirmed</span>
                    <span className="text-[9px] text-emerald-400 block font-medium">Completed</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="w-7 h-7 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center mx-auto text-xs font-bold animate-pulse">
                      2
                    </div>
                    <span className="text-[10px] font-bold text-neutral-200 block">Processing</span>
                    <span className="text-[9px] text-amber-400 block font-medium">Packing now</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto text-xs font-bold border border-neutral-700">
                      3
                    </div>
                    <span className="text-[10px] font-medium text-neutral-400 block">Dispatched</span>
                    <span className="text-[9px] text-neutral-500 block">Within 24h</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto text-xs font-bold border border-neutral-700">
                      4
                    </div>
                    <span className="text-[10px] font-medium text-neutral-400 block">Delivered</span>
                    <span className="text-[9px] text-neutral-500 block">2–3 Days</span>
                  </div>
                </div>
              </motion.div>

              {/* 5. Purchased Products List */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="bg-neutral-50 border border-neutral-200/90 rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs text-xs"
              >
                <div className="flex items-center justify-between border-b border-neutral-200 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                      Ordered Products ({orderConfirmation.items.length})
                    </span>
                  </div>
                  <span className="text-xs font-black text-neutral-900 font-mono">
                    Total: {orderConfirmation.amountPaid}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {orderConfirmation.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-white p-3 rounded-xl border border-neutral-200/80 shadow-2xs"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="w-13 h-13 rounded-lg object-cover border border-neutral-200 shrink-0 bg-neutral-100"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-neutral-900 text-xs sm:text-sm truncate">
                            {item.product.name}
                          </h4>
                          <div className="text-[11px] text-neutral-500 flex flex-wrap gap-2 mt-0.5 font-medium">
                            {item.selectedColor && (
                              <span>
                                Color: <strong className="text-neutral-700">{item.selectedColor}</strong>
                              </span>
                            )}
                            {item.selectedSize && (
                              <span>
                                Size: <strong className="text-neutral-700">{item.selectedSize}</strong>
                              </span>
                            )}
                            <span className="text-neutral-800">
                              Qty: <strong className="text-neutral-950 font-black">{item.quantity}</strong>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right font-black text-neutral-900 font-mono text-xs sm:text-sm shrink-0 ml-3">
                        {formatRupee(item.product.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing Breakdown Row */}
                <div className="pt-2 border-t border-neutral-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="text-neutral-500">
                    Payment Method:{" "}
                    <strong className="text-neutral-900">{orderConfirmation.paymentMethod}</strong>
                  </div>
                  <div className="text-neutral-900 font-bold text-sm">
                    Amount Payable / Paid:{" "}
                    <span className="text-amber-800 font-black font-mono">
                      {orderConfirmation.amountPaid}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* 6. Expandable Order & Delivery Details Accordion */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-neutral-50 border border-neutral-200/90 rounded-2xl overflow-hidden shadow-2xs text-xs"
              >
                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-100/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-neutral-900">
                      {showDetails ? "Hide Delivery & Customer Details" : "View Order Details & Delivery Address"}
                    </span>
                  </div>
                  {showDetails ? (
                    <ChevronUp className="w-4 h-4 text-neutral-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-600" />
                  )}
                </button>

                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-neutral-200 p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white"
                    >
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                          Customer Information
                        </span>
                        <div className="text-xs text-neutral-900 font-medium space-y-1">
                          <p>
                            Name: <strong className="text-neutral-950 font-bold">{orderConfirmation.customerDetails.fullName}</strong>
                          </p>
                          <p>
                            Mobile: <span className="font-mono">{orderConfirmation.customerDetails.phone}</span>
                          </p>
                          <p>
                            Email: <span>{orderConfirmation.customerDetails.email}</span>
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                          Shipping Address
                        </span>
                        <address className="not-italic text-xs text-neutral-800 font-medium leading-relaxed">
                          {orderConfirmation.customerDetails.houseNo}, {orderConfirmation.customerDetails.street}
                          {orderConfirmation.customerDetails.landmark && (
                            <>, Landmark: {orderConfirmation.customerDetails.landmark}</>
                          )}
                          <br />
                          {orderConfirmation.customerDetails.city}, {orderConfirmation.customerDetails.state} -{" "}
                          <strong className="font-bold">{orderConfirmation.customerDetails.pincode}</strong>
                        </address>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* 7. Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3"
              >
                <button
                  type="button"
                  onClick={handleCloseModal}
                  id="continue-shopping-btn"
                  className="w-full sm:w-auto px-10 py-4 rounded-xl bg-neutral-950 hover:bg-neutral-900 active:scale-[0.98] text-white text-xs font-black uppercase tracking-wider shadow-lg hover:shadow-xl cursor-pointer transition-all flex items-center justify-center space-x-2"
                >
                  <span>Continue Shopping</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
