import React, { useState, useEffect } from "react";
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
} from "lucide-react";
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

  // Form state
  const [formData, setFormData] = useState<FormState>({
    fullName: "Priya Sharma",
    phone: "98200 98200",
    email: "priya.sharma@example.com",
    houseNo: "Flat 402, Sunshine Apartments",
    street: "Link Road, Andheri West",
    landmark: "Near Infiniti Mall",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400053",
    paymentMethod: "razorpay",
    shippingMethod: "concierge",
  });

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

  // CRITICAL FIX: Reset checkout session state whenever the modal opens or new item is selected
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setOrderConfirmation(null);
      setIsProcessing(false);
      setPaymentError(null);
      setFieldErrors({});
    }
  }, [isOpen, directBuyItem?.product.id]);

  const handleCloseModal = () => {
    if (isProcessing) return;
    setStep(1);
    setOrderConfirmation(null);
    setIsProcessing(false);
    setPaymentError(null);
    setFieldErrors({});
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

  // Quick Autofill helpers
  const handleAutofillMumbai = () => {
    setFormData((prev) => ({
      ...prev,
      fullName: "Priya Sharma",
      phone: "9820098200",
      email: "priya.sharma@example.com",
      houseNo: "Flat 402, Sunshine Apartments",
      street: "Link Road, Andheri West",
      landmark: "Near Infiniti Mall",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400053",
    }));
    setFieldErrors({});
    setPaymentError(null);
  };

  const handleAutofillDelhi = () => {
    setFormData((prev) => ({
      ...prev,
      fullName: "Rohan Verma",
      phone: "9811122334",
      email: "rohan.verma@example.com",
      houseNo: "House 12, Block C",
      street: "Greater Kailash 1",
      landmark: "Near M-Block Market",
      city: "New Delhi",
      state: "Delhi NCR",
      pincode: "110048",
    }));
    setFieldErrors({});
    setPaymentError(null);
  };

  const handleAutofillBengaluru = () => {
    setFormData((prev) => ({
      ...prev,
      fullName: "Ananya Rao",
      phone: "9900012345",
      email: "ananya.rao@example.com",
      houseNo: "Villa 24, Green Glen Layout",
      street: "Outer Ring Road, Bellandur",
      landmark: "Near EcoSpace Tech Park",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560103",
    }));
    setFieldErrors({});
    setPaymentError(null);
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
                Zenvia Checkout
              </span>
              <span className="text-xs text-emerald-700 font-semibold flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% RBI Verified Razorpay Gateway • Fast India Shipping</span>
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
              {/* Header & Autofill */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-200 pb-3 gap-2">
                <div>
                  <h3 className="text-xl font-extrabold text-neutral-900">Customer & Delivery Details</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Enter your contact and shipping details to proceed to payment.</p>
                </div>
                
                <div className="flex flex-wrap gap-2 text-xs shrink-0">
                  <button
                    type="button"
                    onClick={handleAutofillMumbai}
                    className="text-amber-800 hover:underline flex items-center space-x-1 font-medium bg-amber-50 px-2 py-1 rounded border border-amber-200 cursor-pointer text-[11px]"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Autofill Mumbai</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAutofillDelhi}
                    className="text-neutral-600 hover:text-neutral-900 hover:underline bg-neutral-100 px-2 py-1 rounded cursor-pointer text-[11px]"
                  >
                    <span>Autofill Delhi</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAutofillBengaluru}
                    className="text-neutral-600 hover:text-neutral-900 hover:underline bg-neutral-100 px-2 py-1 rounded cursor-pointer text-[11px]"
                  >
                    <span>Autofill Bengaluru</span>
                  </button>
                </div>
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
                        value={formData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        className={`w-full bg-white border ${
                          fieldErrors.fullName ? "border-rose-500 bg-rose-50/20" : "border-neutral-300 focus:border-neutral-900"
                        } rounded-xl px-3.5 py-2.5 text-neutral-900 focus:outline-none font-medium`}
                        placeholder="e.g. Priya Sharma"
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
                        type="text"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className={`w-full bg-white border ${
                          fieldErrors.phone ? "border-rose-500 bg-rose-50/20" : "border-neutral-300 focus:border-neutral-900"
                        } rounded-xl px-3.5 py-2.5 text-neutral-900 font-mono focus:outline-none`}
                        placeholder="98200 98200"
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
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`w-full bg-white border ${
                          fieldErrors.email ? "border-rose-500 bg-rose-50/20" : "border-neutral-300 focus:border-neutral-900"
                        } rounded-xl px-3.5 py-2.5 text-neutral-900 focus:outline-none`}
                        placeholder="priya.sharma@example.com"
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
                        value={formData.houseNo}
                        onChange={(e) => handleInputChange("houseNo", e.target.value)}
                        className={`w-full bg-white border ${
                          fieldErrors.houseNo ? "border-rose-500 bg-rose-50/20" : "border-neutral-300 focus:border-neutral-900"
                        } rounded-xl px-3.5 py-2.5 text-neutral-900 focus:outline-none`}
                        placeholder="e.g. Flat 402, Sunshine Apartments, B-Wing"
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
                        Street / Area <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.street}
                        onChange={(e) => handleInputChange("street", e.target.value)}
                        className={`w-full bg-white border ${
                          fieldErrors.street ? "border-rose-500 bg-rose-50/20" : "border-neutral-300 focus:border-neutral-900"
                        } rounded-xl px-3.5 py-2.5 text-neutral-900 focus:outline-none`}
                        placeholder="e.g. Link Road, Lokhandwala, Andheri West"
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
                        className="w-full bg-white border border-neutral-300 focus:border-neutral-900 rounded-xl px-3.5 py-2.5 text-neutral-900 focus:outline-none"
                        placeholder="e.g. Near Infiniti Mall / Opposite ICICI Bank"
                      />
                    </div>

                    {/* City */}
                    <div>
                      <label className="text-neutral-800 font-bold block mb-1">
                        City <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        className={`w-full bg-white border ${
                          fieldErrors.city ? "border-rose-500 bg-rose-50/20" : "border-neutral-300 focus:border-neutral-900"
                        } rounded-xl px-3.5 py-2.5 text-neutral-900 focus:outline-none font-medium`}
                        placeholder="e.g. Mumbai"
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
                        } rounded-xl px-3.5 py-2.5 text-neutral-900 focus:outline-none font-medium`}
                      >
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
                        maxLength={6}
                        value={formData.pincode}
                        onChange={(e) => handleInputChange("pincode", e.target.value)}
                        className={`w-full bg-white border ${
                          fieldErrors.pincode ? "border-rose-500 bg-rose-50/20" : "border-neutral-300 focus:border-neutral-900"
                        } rounded-xl px-3.5 py-2.5 text-neutral-900 font-mono focus:outline-none`}
                        placeholder="e.g. 400053"
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
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ORDER SUMMARY & PAYMENT SELECTION */}
          {step === 2 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              {/* Verified Customer Details Box */}
              <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                  <span className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Verified Customer & Delivery Address</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-emerald-800 hover:text-emerald-950 font-bold text-xs flex items-center space-x-1 cursor-pointer hover:underline"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Details</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-800 pt-1">
                  <div>
                    <span className="text-neutral-500 block text-[11px]">Customer Name & Contact:</span>
                    <strong className="text-neutral-900 font-bold">{formData.fullName}</strong>
                    <div className="text-[11px] text-neutral-600 mt-0.5">
                      Phone: <span className="font-mono">{formData.phone}</span><br />
                      Email: {formData.email}
                    </div>
                  </div>

                  <div>
                    <span className="text-neutral-500 block text-[11px]">Delivery Location:</span>
                    <address className="not-italic font-medium text-[11px] leading-snug text-neutral-800">
                      {formData.houseNo}, {formData.street}<br />
                      {formData.landmark ? `Landmark: ${formData.landmark}, ` : ""}
                      {formData.city}, {formData.state} - <strong>{formData.pincode}</strong>
                    </address>
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
                  <span className="text-xs font-bold text-neutral-500">Fast Express Shipping Included</span>
                </div>

                <div className="space-y-2">
                  {activeItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-xs">
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-lg object-cover border border-neutral-200 shrink-0"
                        />
                        <div>
                          <h5 className="font-bold text-neutral-900">{item.product.name}</h5>
                          <div className="text-[11px] text-neutral-500 flex flex-wrap gap-2 mt-0.5">
                            {item.selectedColor && <span>Color: <strong>{item.selectedColor}</strong></span>}
                            {item.selectedSize && <span>Size: <strong>{item.selectedSize}</strong></span>}
                            <span>Qty: <strong className="text-neutral-900 font-extrabold">{item.quantity}</strong></span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right font-extrabold text-neutral-900 text-sm font-mono">
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
              <div className="flex justify-between items-center pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isProcessing}
                  className="px-5 py-2.5 rounded-xl border border-neutral-300 text-xs text-neutral-700 font-semibold disabled:opacity-50 cursor-pointer hover:bg-neutral-100"
                >
                  ← Edit Address
                </button>

                <button
                  type="button"
                  onClick={handleExecutePayment}
                  disabled={isProcessing}
                  id="pay-now-razorpay-btn"
                  className={`px-8 py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-lg flex items-center space-x-2 transition-all cursor-pointer ${
                    formData.paymentMethod === "cod"
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-amber-500 hover:bg-amber-600 text-white active:scale-[0.98]"
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Processing Payment...</span>
                    </>
                  ) : formData.paymentMethod === "cod" ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Confirm COD Order • {formattedTotal}</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-white text-white" />
                      <span>Pay Now with Razorpay • {formattedTotal}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ORDER CONFIRMATION & PAYMENT STATUS */}
          {step === 3 && orderConfirmation && (
            <div className="py-4 max-w-2xl mx-auto space-y-6">
              {/* Top Banner */}
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>

                <span className="text-xs font-black uppercase tracking-widest text-emerald-700 block">
                  {orderConfirmation.paymentStatus === "PAID"
                    ? "✓ PAYMENT SUCCESSFUL & VERIFIED"
                    : "✓ ORDER CONFIRMED"}
                </span>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
                  Order Confirmed!
                </h2>

                <p className="text-xs text-neutral-600 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{orderConfirmation.customerDetails.fullName}</strong>! A confirmation SMS and WhatsApp update with tracking link have been dispatched to <strong>{orderConfirmation.customerDetails.phone}</strong>.
                </p>
              </div>

              {/* Detailed Order Summary Card */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 space-y-4 shadow-2xs text-xs">
                {/* Meta details header */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-b border-neutral-200 pb-3">
                  <div>
                    <span className="text-neutral-500 block text-[11px]">Order ID</span>
                    <strong className="font-mono text-neutral-900 block font-bold text-sm">
                      {orderConfirmation.orderId}
                    </strong>
                  </div>

                  {orderConfirmation.paymentId && (
                    <div>
                      <span className="text-neutral-500 block text-[11px]">Razorpay Payment ID</span>
                      <strong className="font-mono text-amber-800 block font-bold text-xs">
                        {orderConfirmation.paymentId}
                      </strong>
                    </div>
                  )}

                  <div>
                    <span className="text-neutral-500 block text-[11px]">Payment Status</span>
                    <span className="inline-flex items-center space-x-1 font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                      <span>{orderConfirmation.paymentStatus}</span>
                    </span>
                  </div>
                </div>

                {/* Purchased Products List */}
                <div>
                  <span className="text-xs font-bold text-neutral-900 block mb-2 uppercase tracking-wider">
                    Purchased Items ({orderConfirmation.items.length})
                  </span>
                  <div className="space-y-2">
                    {orderConfirmation.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-xl border border-neutral-200">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-lg object-cover border border-neutral-200 shrink-0"
                          />
                          <div>
                            <h4 className="font-bold text-neutral-900">{item.product.name}</h4>
                            <div className="text-[11px] text-neutral-500 flex flex-wrap gap-2 mt-0.5">
                              {item.selectedColor && <span>Color: <strong>{item.selectedColor}</strong></span>}
                              {item.selectedSize && <span>Size: <strong>{item.selectedSize}</strong></span>}
                              <span>Qty: <strong className="text-neutral-900 font-extrabold">{item.quantity}</strong></span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right font-extrabold text-neutral-900 font-mono">
                          {formatRupee(item.product.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Details & Shipping Address */}
                <div className="pt-3 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-neutral-500 block mb-1 font-bold">Customer Details:</span>
                    <div className="text-neutral-900 font-semibold space-y-0.5">
                      <div>Name: <strong className="text-neutral-900">{orderConfirmation.customerDetails.fullName}</strong></div>
                      <div>Mobile: <span className="font-mono">{orderConfirmation.customerDetails.phone}</span></div>
                      <div>Email: <span>{orderConfirmation.customerDetails.email}</span></div>
                    </div>
                  </div>

                  <div>
                    <span className="text-neutral-500 block mb-1 font-bold">Delivery Address:</span>
                    <address className="not-italic text-neutral-800 font-medium leading-snug">
                      {orderConfirmation.customerDetails.houseNo}, {orderConfirmation.customerDetails.street}<br />
                      {orderConfirmation.customerDetails.landmark ? `Landmark: ${orderConfirmation.customerDetails.landmark}, ` : ""}
                      {orderConfirmation.customerDetails.city}, {orderConfirmation.customerDetails.state} - <strong>{orderConfirmation.customerDetails.pincode}</strong>
                    </address>
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="pt-3 border-t border-neutral-200 flex flex-wrap items-center justify-between text-xs">
                  <div className="text-neutral-600">
                    <span>Shipping Partner: </span>
                    <strong className="text-neutral-900">BlueDart Air Express (2–3 Days)</strong>
                  </div>

                  <div className="text-right font-extrabold text-neutral-900 text-sm">
                    Amount Paid: <span className="text-amber-800 font-mono">{orderConfirmation.amountPaid}</span>
                  </div>
                </div>
              </div>

              {/* Action Button: Continue Shopping */}
              <div className="flex items-center justify-center pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full sm:w-auto px-10 py-3.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-extrabold uppercase tracking-wider shadow-md cursor-pointer transition-all active:scale-[0.98]"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
