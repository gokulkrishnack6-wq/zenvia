import React, { useState, useEffect, useRef } from "react";
import {
  X,
  CheckCircle2,
  Truck,
  Sparkles,
  Banknote,
  ShieldCheck,
  ShoppingBag,
  AlertCircle,
  Loader2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Zap,
  MapPin,
  User,
  Phone,
  Mail,
  Home,
  Navigation,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Package,
  CreditCard,
  Building,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { CartItem, Currency } from "../types";
import { formatRupee, formatRupeeExact } from "../lib/currency";
import { calculateItemSubtotal, calculateCODCharge, calculateCODTotal } from "../lib/pricing";
import { loadRazorpayScript } from "../lib/loadRazorpay";
import {
  checkPincodeServiceability,
  validatePincodeFormat,
  PincodeValidationResult,
} from "../lib/pincodeService";
import { ZenviaLogo } from "./ZenviaLogo";

interface CheckoutModalProps {
  isOpen: boolean;
  cartItems: CartItem[];
  directBuyItem?: CartItem | null;
  currency: Currency;
  discountPercent: number;
  onClose: () => void;
  onOrderComplete: () => void;
  onOpenAccount?: () => void;
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
  const [step, setStep] = useState<1 | 2>(1); // 1: Checkout Form (Delivery & Payment), 2: Confirmation
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState<string>("");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isOrderSummaryExpanded, setIsOrderSummaryExpanded] = useState(false);

  // Pincode validation state
  const [pincodeCheckState, setPincodeCheckState] = useState<{
    status: "idle" | "checking" | "serviceable" | "unserviceable" | "invalid";
    message?: string;
    location?: string;
  }>({ status: "idle" });

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
  };

  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

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

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const prevIsOpenRef = useRef(isOpen);
  const formTopRef = useRef<HTMLDivElement>(null);

  // Reset checkout session state ONLY when the modal transitions from closed to open
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setStep(1);
      setOrderConfirmation(null);
      setIsProcessing(false);
      setProcessingMessage("");
      setPaymentError(null);
      setFieldErrors({});
      setTouchedFields({});
      setCopiedKey(null);
      setPincodeCheckState({ status: "idle" });
      setIsOrderSummaryExpanded(false);
      setFormData(initialFormState);
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
  const totalItemCount = activeItems.reduce((sum, item) => sum + item.quantity, 0);

  const rawSubtotal = activeItems.reduce(
    (acc, item) => acc + calculateItemSubtotal(item.product, item.quantity),
    0
  );
  const discountAmount = Math.round((rawSubtotal * discountPercent) / 100);
  const shippingCost = rawSubtotal >= 499 ? 0 : 49;
  const baseOnlineTotal = Math.max(0, rawSubtotal - discountAmount + shippingCost);

  // Cash on Delivery 5% Handling Fee
  const codHandlingCharge = calculateCODCharge(baseOnlineTotal);
  const codTotal = calculateCODTotal(baseOnlineTotal);

  const isCOD = formData.paymentMethod === "cod";
  const currentPayableAmount = isCOD ? codTotal : baseOnlineTotal;

  const formattedOnlineTotal = formatRupeeExact(baseOnlineTotal);
  const formattedCodTotal = formatRupeeExact(codTotal);
  const formattedCodCharge = formatRupeeExact(codHandlingCharge);
  const formattedTotal = formatRupeeExact(currentPayableAmount);

  // Validate field on blur or change
  const validateSingleField = (key: keyof FormState, value: string): string | undefined => {
    switch (key) {
      case "fullName":
        if (!value.trim()) return "Enter your full name";
        break;
      case "phone": {
        const cleanPhone = value.replace(/\D/g, "");
        if (!value.trim() || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
          return "Enter a valid 10-digit mobile number";
        }
        break;
      }
      case "email": {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim() || !emailRegex.test(value.trim())) {
          return "Enter a valid email address";
        }
        break;
      }
      case "houseNo":
        if (!value.trim()) return "Enter house / flat / building";
        break;
      case "street":
        if (!value.trim()) return "Enter area / street / locality";
        break;
      case "city":
        if (!value.trim()) return "Enter your city";
        break;
      case "state":
        if (!value.trim()) return "Select your state";
        break;
      case "pincode": {
        const cleanPin = value.trim();
        if (!cleanPin || cleanPin.length !== 6 || !/^\d{6}$/.test(cleanPin)) {
          return "Enter your 6-digit pincode";
        }
        break;
      }
      default:
        break;
    }
    return undefined;
  };

  // Validate entire form
  const validateAll = (): ValidationErrors => {
    const errors: ValidationErrors = {};
    const keys: (keyof FormState)[] = [
      "fullName",
      "phone",
      "email",
      "houseNo",
      "street",
      "city",
      "state",
      "pincode",
    ];

    keys.forEach((key) => {
      const err = validateSingleField(key, formData[key]);
      if (err) errors[key as keyof ValidationErrors] = err;
    });

    return errors;
  };

  // Handle Input Change
  const handleInputChange = (key: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));

    if (fieldErrors[key as keyof ValidationErrors]) {
      const err = validateSingleField(key, value);
      setFieldErrors((prev) => ({ ...prev, [key]: err }));
    }

    // Live pincode validation when 6 digits are typed
    if (key === "pincode") {
      const clean = value.replace(/\D/g, "");
      if (clean.length === 6) {
        verifyPincodeServiceability(clean);
      } else {
        setPincodeCheckState({ status: "idle" });
      }
    }
  };

  const handleBlur = (key: keyof FormState) => {
    setTouchedFields((prev) => ({ ...prev, [key]: true }));
    const err = validateSingleField(key, formData[key]);
    setFieldErrors((prev) => ({ ...prev, [key]: err }));

    if (key === "pincode" && formData.pincode.trim().length === 6) {
      verifyPincodeServiceability(formData.pincode.trim());
    }
  };

  // Verify PIN Code with Indian Postal Serviceability
  const verifyPincodeServiceability = async (pincode: string) => {
    const formatCheck = validatePincodeFormat(pincode);
    if (!formatCheck.isValid) {
      setPincodeCheckState({
        status: "invalid",
        message: formatCheck.reason || "Invalid PIN code",
      });
      return;
    }

    setPincodeCheckState({ status: "checking" });
    try {
      const result: PincodeValidationResult = await checkPincodeServiceability(pincode);
      if (result.serviceable) {
        setPincodeCheckState({
          status: "serviceable",
          message: "Delivery Available • Standard Shipping",
          location: result.location || (result.district ? `${result.district}, ${result.state}` : result.state),
        });

        // Auto-fill city and state if currently empty
        setFormData((prev) => ({
          ...prev,
          city: prev.city || result.district || "",
          state: prev.state || (result.state && INDIAN_STATES.includes(result.state) ? result.state : prev.state),
        }));

        if (result.district && fieldErrors.city) {
          setFieldErrors((prev) => ({ ...prev, city: undefined }));
        }
        if (result.state && fieldErrors.state) {
          setFieldErrors((prev) => ({ ...prev, state: undefined }));
        }
      } else {
        setPincodeCheckState({
          status: "unserviceable",
          message: result.message || "Delivery currently unavailable for this PIN code.",
        });
      }
    } catch {
      setPincodeCheckState({
        status: "unserviceable",
        message: "Could not verify PIN code. Please check and retry.",
      });
    }
  };

  // Primary Action: Submit Order (Razorpay or COD)
  const handlePrimaryAction = async () => {
    setPaymentError(null);

    // Mark all as touched to show errors if any
    const allTouched: Record<string, boolean> = {
      fullName: true,
      phone: true,
      email: true,
      houseNo: true,
      street: true,
      city: true,
      state: true,
      pincode: true,
    };
    setTouchedFields(allTouched);

    const errors = validateAll();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setPaymentError("Please fill in all required delivery details marked in red.");
      formTopRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (pincodeCheckState.status === "unserviceable" || pincodeCheckState.status === "invalid") {
      setPaymentError("Please enter a serviceable 6-digit Indian PIN code to continue.");
      return;
    }

    const fullAddress = `${formData.houseNo}, ${formData.street}${
      formData.landmark ? `, ${formData.landmark}` : ""
    }, ${formData.city}, ${formData.state} - ${formData.pincode}`;

    // ==========================================
    // 1. CASH ON DELIVERY (COD) FLOW
    // ==========================================
    if (formData.paymentMethod === "cod") {
      setIsProcessing(true);
      setProcessingMessage("Placing Order...");

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
          setProcessingMessage("Confirming Order...");
          await new Promise((resolve) => setTimeout(resolve, 500));

          setOrderConfirmation({
            orderId: codData.orderId,
            paymentMethod: "Cash on Delivery (COD)",
            paymentStatus: "COD - Cash on Delivery",
            verified: true,
            amountPaid: codData.formattedTotal || formattedCodTotal,
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
          setProcessingMessage("");
          setStep(2);

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
          setProcessingMessage("");
          setPaymentError(codData.error || "Failed to place COD order. Please check your details and try again.");
        }
      } catch (codErr: any) {
        setIsProcessing(false);
        setProcessingMessage("");
        setPaymentError("Network connection error while placing order. Please try again.");
      }
      return;
    }

    // ==========================================
    // 2. RAZORPAY PAYMENT FLOW
    // ==========================================
    setIsProcessing(true);
    setProcessingMessage("Connecting to Secure Payment...");

    try {
      // 1. Load Razorpay Checkout Script dynamically
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setPaymentError("Failed to load Razorpay Checkout SDK. Please check your internet connection.");
        setIsProcessing(false);
        setProcessingMessage("");
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

      let orderData: any = null;
      try {
        orderData = await orderRes.json();
      } catch (jsonErr) {
        console.warn("Could not parse order creation JSON response", jsonErr);
      }

      if (!orderRes.ok || !orderData?.success) {
        setIsProcessing(false);
        setProcessingMessage("");
        const serverError =
          orderData?.error ||
          "Unable to initialize Razorpay payment. You can choose Cash on Delivery (COD) below.";
        setPaymentError(serverError);
        return;
      }

      // 3. Launch Razorpay Checkout Modal
      const cleanContact = formData.phone.replace(/\D/g, "");

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Zenvia",
        description: directBuyItem
          ? `Purchase: ${directBuyItem.product.name}`
          : `Zenvia Order (${activeItems.length} items)`,
        image:
          activeItems[0]?.product.image ||
          "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=300&auto=format&fit=crop",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          setIsProcessing(true);
          setProcessingMessage("Verifying secure transaction...");

          try {
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                discountPercent,
                items: activeItems.map((i) => ({
                  id: i.product.id,
                  name: i.product.name,
                  quantity: i.quantity,
                  price: i.product.price,
                  selectedColor: i.selectedColor,
                  selectedSize: i.selectedSize,
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
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.verified) {
              setProcessingMessage("Confirming Your Order...");
              await new Promise((resolve) => setTimeout(resolve, 500));

              setOrderConfirmation({
                orderId: verifyData.orderId,
                paymentId: verifyData.paymentId,
                paymentMethod: "Razorpay (UPI / Cards / Net Banking)",
                paymentStatus: "PAID",
                verified: true,
                amountPaid: formattedOnlineTotal,
                trackingNumber:
                  verifyData.trackingNumber ||
                  `TRK-${verifyData.orderId.replace(/[^a-zA-Z0-9]/g, "").slice(-8).toUpperCase()}`,
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
              setProcessingMessage("");
              setStep(2);

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
              setProcessingMessage("");
              setPaymentError(
                verifyData.error || "Payment verification failed on server. Please contact support."
              );
            }
          } catch (verifyErr: any) {
            setIsProcessing(false);
            setProcessingMessage("");
            setPaymentError(
              "Network error during payment verification. Please contact support if your account was debited."
            );
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: cleanContact,
        },
        theme: {
          color: "#D97706",
          backdrop_color: "rgba(0,0,0,0.6)",
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setProcessingMessage("");
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);

      rzp.on("payment.failed", function (response: any) {
        setIsProcessing(false);
        setProcessingMessage("");
        const desc = response.error?.description || "Transaction failed or was declined by bank.";
        setPaymentError(`Payment Failed: ${desc}`);
      });

      rzp.open();
      setIsProcessing(false);
      setProcessingMessage("");
    } catch (err: any) {
      setIsProcessing(false);
      setProcessingMessage("");
      console.error("Razorpay error:", err);
      setPaymentError(err.message || "An unexpected error occurred during Razorpay checkout.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs md:p-4 overflow-hidden">
      <div
        className="relative w-full h-full md:h-auto md:max-h-[92vh] md:max-w-4xl bg-white md:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        id="zenvia-mobile-checkout-modal"
      >
        {/* =======================================================
            1. COMPACT MOBILE CHECKOUT HEADER
        ======================================================= */}
        <div className="shrink-0 px-4 py-3 sm:px-6 sm:py-3.5 bg-white border-b border-neutral-200 flex items-center justify-between z-10">
          <div className="flex items-center space-x-2.5">
            {step === 1 ? (
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isProcessing}
                className="flex items-center space-x-1 text-xs font-bold text-neutral-600 hover:text-neutral-900 active:text-neutral-950 p-1 -ml-1 rounded-lg transition-colors cursor-pointer"
                title="Back to shopping"
              >
                <ArrowLeft className="w-4 h-4 text-neutral-800" />
                <span className="hidden sm:inline">Back</span>
              </button>
            ) : null}

            <div className="flex items-center space-x-2">
              <ZenviaLogo variant="dark" className="h-6 sm:h-7 w-auto" />
              <div className="h-4 w-px bg-neutral-300 mx-1 hidden sm:block" />
              <div className="flex items-center space-x-1.5 text-neutral-900 font-extrabold text-sm sm:text-base tracking-tight">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{step === 2 ? "Order Confirmed" : "Secure Checkout"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="hidden sm:flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>256-Bit SSL Encrypted</span>
            </span>

            <button
              onClick={handleCloseModal}
              disabled={isProcessing}
              className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 transition-colors cursor-pointer"
              title="Close Checkout"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* =======================================================
            MODAL BODY (SCROLLABLE)
        ======================================================= */}
        <div
          ref={formTopRef}
          className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-6 pb-28 md:pb-8 bg-neutral-50/50"
        >
          {/* ===================================================
              ERROR ALERT BANNER
          =================================================== */}
          {paymentError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3.5 sm:p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start space-x-2.5 shadow-2xs"
            >
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <span className="font-extrabold block text-rose-950">Notice</span>
                <p className="leading-relaxed text-rose-800 text-[11.5px]">{paymentError}</p>
                {formData.paymentMethod === "razorpay" && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, paymentMethod: "cod" }));
                        setPaymentError(null);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-[11px] font-bold cursor-pointer transition-colors inline-flex items-center space-x-1.5 shadow-2xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Switch to Cash on Delivery (COD)</span>
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => setPaymentError(null)}
                className="text-rose-400 hover:text-rose-700 cursor-pointer p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* ===================================================
              STEP 1: CHECKOUT FORM (DELIVERY & PAYMENT)
          =================================================== */}
          {step === 1 && (
            <div className="max-w-2xl mx-auto space-y-5">
              {/* ===================================================
                  A. COMPACT EXPANDABLE ORDER SUMMARY
              =================================================== */}
              <div className="bg-white border border-neutral-200 rounded-xl shadow-2xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsOrderSummaryExpanded(!isOrderSummaryExpanded)}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-neutral-50/80 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-800 shrink-0">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-neutral-900 block">
                        ORDER SUMMARY
                      </span>
                      <span className="text-xs text-neutral-500 font-medium">
                        {totalItemCount} {totalItemCount === 1 ? "item" : "items"} •{" "}
                        <strong className="text-neutral-900 font-bold">{formattedTotal}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-xs font-bold text-amber-800">
                    <span>{isOrderSummaryExpanded ? "Hide details" : "Tap to view"}</span>
                    {isOrderSummaryExpanded ? (
                      <ChevronUp className="w-4 h-4 text-amber-700" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-amber-700" />
                    )}
                  </div>
                </button>

                {/* Expanded items & price breakdown */}
                <AnimatePresence initial={false}>
                  {isOrderSummaryExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-neutral-100 px-4 py-3 space-y-3 bg-neutral-50/50 text-xs"
                    >
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {activeItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-neutral-200/70"
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                referrerPolicy="no-referrer"
                                className="w-11 h-11 rounded-md object-cover border border-neutral-200 shrink-0 bg-neutral-100"
                              />
                              <div className="min-w-0">
                                <h5 className="font-bold text-neutral-900 text-xs truncate">
                                  {item.product.name}
                                </h5>
                                <div className="text-[11px] text-neutral-500 flex flex-wrap gap-2 mt-0.5">
                                  {item.selectedColor && (
                                    <span>
                                      Color: <strong>{item.selectedColor}</strong>
                                    </span>
                                  )}
                                  {item.selectedSize && (
                                    <span>
                                      Size: <strong>{item.selectedSize}</strong>
                                    </span>
                                  )}
                                  <span>
                                    Qty: <strong className="text-neutral-900 font-bold">{item.quantity}</strong>
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right font-extrabold text-neutral-900 text-xs font-mono shrink-0 pl-2">
                              {formatRupee(calculateItemSubtotal(item.product, item.quantity))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pricing Breakdown */}
                      <div className="pt-2 border-t border-neutral-200/80 space-y-1.5 text-neutral-600 text-xs">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span className="font-semibold text-neutral-900">{formatRupeeExact(rawSubtotal)}</span>
                        </div>
                        {discountAmount > 0 && (
                          <div className="flex justify-between text-emerald-700 font-semibold">
                            <span>Coupon Discount ({discountPercent}%):</span>
                            <span>-{formatRupeeExact(discountAmount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span>Shipping & Delivery:</span>
                          <span className="font-bold text-emerald-700">
                            {shippingCost === 0 ? "FREE (Pan-India)" : formatRupeeExact(shippingCost)}
                          </span>
                        </div>
                        {isCOD && (
                          <div className="flex justify-between items-center text-amber-900 font-semibold bg-amber-50/80 -mx-1 px-1.5 py-1 rounded">
                            <span>COD Handling Charge (5%):</span>
                            <span className="font-bold font-mono text-amber-950">+{formattedCodCharge}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t border-neutral-200 text-neutral-900 font-extrabold text-sm">
                          <span>Total Payable:</span>
                          <span className="text-amber-800 font-black font-mono text-base">
                            {formattedTotal}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ===================================================
                  B. CUSTOMER DETAILS (DELIVERY DETAILS)
              =================================================== */}
              <div className="bg-white border border-neutral-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3.5">
                <div className="flex items-center space-x-2 border-b border-neutral-100 pb-2.5">
                  <User className="w-4 h-4 text-amber-600 shrink-0" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900">
                    DELIVERY DETAILS
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Full Name */}
                  <div>
                    <label className="text-neutral-800 font-bold block mb-1">
                      Full Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      autoComplete="name"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      onBlur={() => handleBlur("fullName")}
                      className={`w-full bg-white border ${
                        touchedFields.fullName && fieldErrors.fullName
                          ? "border-rose-500 bg-rose-50/20"
                          : "border-neutral-300 focus:border-neutral-900"
                      } rounded-xl px-3.5 py-3 text-neutral-900 focus:outline-none font-medium text-[16px] md:text-sm min-h-[48px]`}
                      placeholder="Enter your full name"
                    />
                    {touchedFields.fullName && fieldErrors.fullName && (
                      <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.fullName}</span>
                      </p>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="text-neutral-800 font-bold block mb-1">
                      Mobile Number <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-neutral-500 font-bold text-sm pointer-events-none select-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        maxLength={10}
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value.replace(/\D/g, ""))}
                        onBlur={() => handleBlur("phone")}
                        className={`w-full bg-white border ${
                          touchedFields.phone && fieldErrors.phone
                            ? "border-rose-500 bg-rose-50/20"
                            : "border-neutral-300 focus:border-neutral-900"
                        } rounded-xl pl-13 pr-3.5 py-3 text-neutral-900 font-mono text-[16px] md:text-sm focus:outline-none min-h-[48px]`}
                        placeholder="10-digit mobile number"
                      />
                    </div>
                    {touchedFields.phone && fieldErrors.phone && (
                      <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
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
                      inputMode="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      className={`w-full bg-white border ${
                        touchedFields.email && fieldErrors.email
                          ? "border-rose-500 bg-rose-50/20"
                          : "border-neutral-300 focus:border-neutral-900"
                      } rounded-xl px-3.5 py-3 text-neutral-900 text-[16px] md:text-sm focus:outline-none min-h-[48px]`}
                      placeholder="name@example.com"
                    />
                    {touchedFields.email && fieldErrors.email && (
                      <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.email}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ===================================================
                  C. DELIVERY ADDRESS
              =================================================== */}
              <div className="bg-white border border-neutral-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3.5">
                <div className="flex items-center space-x-2 border-b border-neutral-100 pb-2.5">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900">
                    DELIVERY ADDRESS
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  {/* House / Flat / Building */}
                  <div>
                    <label className="text-neutral-800 font-bold block mb-1">
                      House / Flat / Building <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      autoComplete="address-line1"
                      value={formData.houseNo}
                      onChange={(e) => handleInputChange("houseNo", e.target.value)}
                      onBlur={() => handleBlur("houseNo")}
                      className={`w-full bg-white border ${
                        touchedFields.houseNo && fieldErrors.houseNo
                          ? "border-rose-500 bg-rose-50/20"
                          : "border-neutral-300 focus:border-neutral-900"
                      } rounded-xl px-3.5 py-3 text-neutral-900 text-[16px] md:text-sm focus:outline-none min-h-[48px]`}
                      placeholder="Flat / House / Floor / Building No."
                    />
                    {touchedFields.houseNo && fieldErrors.houseNo && (
                      <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.houseNo}</span>
                      </p>
                    )}
                  </div>

                  {/* Area / Street / Locality */}
                  <div>
                    <label className="text-neutral-800 font-bold block mb-1">
                      Area / Street / Locality <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      autoComplete="address-line2"
                      value={formData.street}
                      onChange={(e) => handleInputChange("street", e.target.value)}
                      onBlur={() => handleBlur("street")}
                      className={`w-full bg-white border ${
                        touchedFields.street && fieldErrors.street
                          ? "border-rose-500 bg-rose-50/20"
                          : "border-neutral-300 focus:border-neutral-900"
                      } rounded-xl px-3.5 py-3 text-neutral-900 text-[16px] md:text-sm focus:outline-none min-h-[48px]`}
                      placeholder="Street name, Area, Colony, Locality"
                    />
                    {touchedFields.street && fieldErrors.street && (
                      <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.street}</span>
                      </p>
                    )}
                  </div>

                  {/* Landmark (Optional) */}
                  <div>
                    <label className="text-neutral-800 font-bold block mb-1">
                      Landmark <span className="text-neutral-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.landmark}
                      onChange={(e) => handleInputChange("landmark", e.target.value)}
                      className="w-full bg-white border border-neutral-300 focus:border-neutral-900 rounded-xl px-3.5 py-3 text-neutral-900 text-[16px] md:text-sm focus:outline-none min-h-[48px]"
                      placeholder="Nearby landmark (e.g. Near Metro, Opposite Park)"
                    />
                  </div>

                  {/* Pincode with real validation */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-neutral-800 font-bold">
                        Pincode <span className="text-rose-600">*</span>
                      </label>
                      {pincodeCheckState.status === "checking" && (
                        <span className="text-[11px] text-amber-700 flex items-center space-x-1 font-semibold">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Checking delivery...</span>
                        </span>
                      )}
                    </div>

                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={(e) => handleInputChange("pincode", e.target.value.replace(/\D/g, ""))}
                      onBlur={() => handleBlur("pincode")}
                      className={`w-full bg-white border ${
                        touchedFields.pincode && (fieldErrors.pincode || pincodeCheckState.status === "unserviceable" || pincodeCheckState.status === "invalid")
                          ? "border-rose-500 bg-rose-50/20"
                          : pincodeCheckState.status === "serviceable"
                          ? "border-emerald-500 bg-emerald-50/10"
                          : "border-neutral-300 focus:border-neutral-900"
                      } rounded-xl px-3.5 py-3 text-neutral-900 font-mono text-[16px] md:text-sm focus:outline-none min-h-[48px]`}
                      placeholder="6-digit PIN code (e.g. 110001)"
                    />

                    {/* Pincode Availability Notification (Accurate Validation Only) */}
                    {pincodeCheckState.status === "serviceable" && (
                      <p className="text-xs text-emerald-700 mt-1.5 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                        <span>
                          {pincodeCheckState.message}
                          {pincodeCheckState.location ? ` (${pincodeCheckState.location})` : ""}
                        </span>
                      </p>
                    )}

                    {pincodeCheckState.status === "unserviceable" && (
                      <p className="text-xs text-rose-600 mt-1.5 font-bold flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                        <span>{pincodeCheckState.message}</span>
                      </p>
                    )}

                    {touchedFields.pincode && fieldErrors.pincode && pincodeCheckState.status === "idle" && (
                      <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.pincode}</span>
                      </p>
                    )}
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
                      onBlur={() => handleBlur("city")}
                      className={`w-full bg-white border ${
                        touchedFields.city && fieldErrors.city
                          ? "border-rose-500 bg-rose-50/20"
                          : "border-neutral-300 focus:border-neutral-900"
                      } rounded-xl px-3.5 py-3 text-neutral-900 focus:outline-none font-medium text-[16px] md:text-sm min-h-[48px]`}
                      placeholder="City / District"
                    />
                    {touchedFields.city && fieldErrors.city && (
                      <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
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
                      autoComplete="address-level1"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      onBlur={() => handleBlur("state")}
                      className={`w-full bg-white border ${
                        touchedFields.state && fieldErrors.state
                          ? "border-rose-500 bg-rose-50/20"
                          : "border-neutral-300 focus:border-neutral-900"
                      } rounded-xl px-3.5 py-3 text-neutral-900 focus:outline-none font-medium text-[16px] md:text-sm min-h-[48px]`}
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    {touchedFields.state && fieldErrors.state && (
                      <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.state}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ===================================================
                  D. PAYMENT METHOD SELECTION
              =================================================== */}
              <div className="bg-white border border-neutral-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-amber-600 shrink-0" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900">
                      PAYMENT METHOD
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>Safe & Encrypted</span>
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Option 1: Razorpay (UPI, Cards, Net Banking) */}
                  <div
                    onClick={() => setFormData({ ...formData, paymentMethod: "razorpay" })}
                    className={`p-3.5 sm:p-4 rounded-xl border-2 transition-all cursor-pointer select-none flex items-start space-x-3.5 ${
                      formData.paymentMethod === "razorpay"
                        ? "border-amber-600 bg-amber-50/50 shadow-xs"
                        : "border-neutral-200 bg-white hover:border-neutral-300"
                    }`}
                  >
                    {/* Radio circle */}
                    <div className="mt-0.5">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          formData.paymentMethod === "razorpay"
                            ? "border-amber-600 bg-amber-600 text-white"
                            : "border-neutral-300 bg-white"
                        }`}
                      >
                        {formData.paymentMethod === "razorpay" && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <span className="text-sm font-extrabold text-neutral-900 block">
                          UPI / Cards / Net Banking
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-black text-neutral-900 font-mono">
                            {formattedOnlineTotal}
                          </span>
                          <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded">
                            Fastest Checkout
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-600 mt-1">
                        Direct switch to Google Pay, PhonePe, Paytm, BHIM, or use Credit/Debit Cards & Net Banking.
                      </p>
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] bg-white border border-neutral-200 font-bold px-2 py-0.5 rounded text-neutral-800">
                          GPay
                        </span>
                        <span className="text-[10px] bg-white border border-neutral-200 font-bold px-2 py-0.5 rounded text-neutral-800">
                          PhonePe
                        </span>
                        <span className="text-[10px] bg-white border border-neutral-200 font-bold px-2 py-0.5 rounded text-neutral-800">
                          Paytm
                        </span>
                        <span className="text-[10px] bg-white border border-neutral-200 font-bold px-2 py-0.5 rounded text-neutral-800">
                          Cards / NetBanking
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Option 2: Cash on Delivery */}
                  <div
                    onClick={() => setFormData({ ...formData, paymentMethod: "cod" })}
                    className={`p-3.5 sm:p-4 rounded-xl border-2 transition-all cursor-pointer select-none flex items-start space-x-3.5 ${
                      formData.paymentMethod === "cod"
                        ? "border-emerald-600 bg-emerald-50/50 shadow-xs"
                        : "border-neutral-200 bg-white hover:border-neutral-300"
                    }`}
                  >
                    {/* Radio circle */}
                    <div className="mt-0.5">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          formData.paymentMethod === "cod"
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-neutral-300 bg-white"
                        }`}
                      >
                        {formData.paymentMethod === "cod" && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <span className="text-sm font-extrabold text-neutral-900 block">
                          Cash on Delivery (COD)
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-black text-neutral-900 font-mono">
                            {formattedCodTotal}
                          </span>
                          <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                            Pay on Arrival
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-600 mt-1">
                        Pay cash or scan UPI directly to the courier executive upon doorstep arrival.
                      </p>
                      <p className="text-[11px] font-bold text-amber-800 mt-1 flex items-center space-x-1">
                        <span>• Includes {formattedCodCharge} COD handling charge</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop embedded submit button */}
              <div className="hidden md:block pt-2">
                <button
                  type="button"
                  onClick={handlePrimaryAction}
                  disabled={isProcessing}
                  id="desktop-checkout-submit-btn"
                  className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                    formData.paymentMethod === "cod"
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.99]"
                      : "bg-amber-500 hover:bg-amber-600 text-neutral-950 active:scale-[0.99]"
                  } disabled:opacity-75 disabled:cursor-not-allowed`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-current shrink-0" />
                      <span>{processingMessage || "Processing..."}</span>
                    </>
                  ) : formData.paymentMethod === "cod" ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-white" />
                      <span>Place Order — {formattedTotal}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 fill-neutral-950" />
                      <span>Pay {formattedTotal} Securely</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ===================================================
              STEP 2: ORDER CONFIRMATION RECEIPT
          =================================================== */}
          {step === 2 && orderConfirmation && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="py-2 max-w-2xl mx-auto space-y-4 sm:space-y-5"
            >
              {/* Animated Header */}
              <div className="text-center space-y-2.5 pt-2">
                <div className="relative inline-flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0.4 }}
                    animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.1, 0.4] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-20 h-20 rounded-full bg-emerald-400/30 blur-xs"
                  />
                  <div className="relative w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 border-2 border-white">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                    Order Placed Successfully!
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-600">
                    Thank you, <strong>{orderConfirmation.customerDetails.fullName}</strong>. A confirmation has been recorded.
                  </p>
                </div>
              </div>

              {/* Order ID & Status Bar */}
              <div className="bg-white border border-neutral-200 rounded-xl p-3.5 flex items-center justify-between shadow-2xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                    ORDER ID
                  </span>
                  <span className="font-mono text-xs sm:text-sm font-black text-neutral-900">
                    {orderConfirmation.orderId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(orderConfirmation.orderId, "orderId")}
                  className="px-2.5 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 text-neutral-700 transition-colors flex items-center space-x-1 cursor-pointer text-xs font-semibold"
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

              {/* Payment details banner */}
              <div
                className={`p-3.5 rounded-xl border flex items-start space-x-3 shadow-2xs ${
                  orderConfirmation.paymentStatus === "PAID"
                    ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                    : "bg-amber-50/80 border-amber-200 text-amber-900"
                }`}
              >
                <div className="mt-0.5">
                  {orderConfirmation.paymentStatus === "PAID" ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Banknote className="w-5 h-5 text-amber-700" />
                  )}
                </div>
                <div className="text-xs">
                  <span className="font-extrabold block text-neutral-900">
                    {orderConfirmation.paymentMethod}
                  </span>
                  <span className="text-neutral-700 mt-0.5 block">
                    {orderConfirmation.paymentStatus === "PAID"
                      ? "Payment verified & secured. Receipt sent to your email."
                      : `Please keep ${orderConfirmation.amountPaid} ready in Cash or UPI upon courier arrival.`}
                  </span>
                </div>
              </div>

              {/* Delivery Address Card */}
              <div className="bg-white border border-neutral-200 rounded-xl p-3.5 sm:p-4 text-xs space-y-1.5 shadow-2xs">
                <div className="flex items-center space-x-1.5 border-b border-neutral-100 pb-2">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  <span className="font-extrabold text-neutral-900 uppercase tracking-wider text-[11px]">
                    Delivery Address
                  </span>
                </div>
                <div className="text-neutral-800 leading-relaxed pt-0.5">
                  <p className="font-bold text-neutral-950">{orderConfirmation.customerDetails.fullName}</p>
                  <p>
                    {orderConfirmation.customerDetails.houseNo}, {orderConfirmation.customerDetails.street}
                    {orderConfirmation.customerDetails.landmark && (
                      <>, {orderConfirmation.customerDetails.landmark}</>
                    )}
                  </p>
                  <p className="font-semibold text-neutral-900">
                    {orderConfirmation.customerDetails.city}, {orderConfirmation.customerDetails.state} -{" "}
                    <span className="font-mono font-bold">{orderConfirmation.customerDetails.pincode}</span>
                  </p>
                  <p className="text-neutral-500 mt-1">
                    Phone: <strong className="text-neutral-800">+91 {orderConfirmation.customerDetails.phone}</strong>
                  </p>
                </div>
              </div>

              {/* Ordered Products summary */}
              <div className="bg-white border border-neutral-200 rounded-xl p-3.5 sm:p-4 text-xs space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <span className="font-extrabold text-neutral-900 uppercase tracking-wider text-[11px]">
                    Purchased Items ({orderConfirmation.items.length})
                  </span>
                  <span className="font-black text-neutral-900 font-mono">
                    Total: {orderConfirmation.amountPaid}
                  </span>
                </div>

                <div className="space-y-2">
                  {orderConfirmation.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded object-cover border border-neutral-200 shrink-0 bg-neutral-100"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-neutral-900 truncate">{item.product.name}</p>
                          <p className="text-[11px] text-neutral-500">
                            Qty: <strong className="text-neutral-800">{item.quantity}</strong>
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-neutral-900">
                        {formatRupee(calculateItemSubtotal(item.product, item.quantity))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Continue Shopping */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  id="continue-shopping-success-btn"
                  className="w-full py-3.5 rounded-xl bg-neutral-950 hover:bg-neutral-900 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 active:scale-[0.98]"
                >
                  <span>Continue Shopping</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* =======================================================
            STICKY MOBILE ACTION BAR (ONLY FOR STEP 1 ON MOBILE)
        ======================================================= */}
        {step === 1 && (
          <div className="md:hidden shrink-0 bg-white border-t border-neutral-200/90 px-4 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[max(0.75rem,env(safe-area-inset-bottom))] z-30">
            <div className="flex items-center justify-between gap-3">
              <div className="shrink-0">
                <span className="text-[10px] uppercase font-bold text-neutral-500 block leading-tight">
                  Total
                </span>
                <span className="text-lg font-black text-neutral-900 font-mono leading-tight">
                  {formattedTotal}
                </span>
              </div>

              <button
                type="button"
                onClick={handlePrimaryAction}
                disabled={isProcessing}
                id="mobile-checkout-submit-btn"
                className={`flex-1 min-h-[52px] h-[52px] py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1.5 active:scale-[0.98] ${
                  formData.paymentMethod === "cod"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-amber-500 hover:bg-amber-600 text-neutral-950"
                } disabled:opacity-75 disabled:cursor-not-allowed`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
                    <span className="truncate">
                      {processingMessage ||
                        (formData.paymentMethod === "cod"
                          ? "Placing Order..."
                          : "Connecting to Secure Payment...")}
                    </span>
                  </>
                ) : formData.paymentMethod === "cod" ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                    <span className="truncate">Place Order — {formattedTotal}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 fill-current shrink-0" />
                    <span className="truncate">Pay {formattedTotal} Securely</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
