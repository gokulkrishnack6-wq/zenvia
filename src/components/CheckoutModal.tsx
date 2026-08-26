import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { CartItem, Currency } from "../types";
import { formatRupeeExact } from "../lib/currency";
import {
  calculateItemSubtotal,
  calculateCODCharge,
  calculateCODTotal,
  calculateDeliveryFee,
  FREE_DELIVERY_THRESHOLD,
} from "../lib/pricing";
import { loadRazorpayScript } from "../lib/loadRazorpay";
import {
  checkPincodeServiceability,
  validatePincodeFormat,
  PincodeValidationResult,
} from "../lib/pincodeService";
import { trackFunnelEvent } from "../lib/analytics";
import { ZenviaLogo } from "./ZenviaLogo";
import { PromotionCountdownBadge } from "./PromotionCountdownBadge";
import {
  CheckoutStep1Details,
  CheckoutFormState,
  ValidationErrors,
  INDIAN_STATES,
} from "./CheckoutStep1Details";
import { CheckoutStep2Payment } from "./CheckoutStep2Payment";
import { CheckoutProgressBar } from "./CheckoutProgressBar";
import {
  CheckoutOrderConfirmation,
  OrderConfirmationData,
} from "./CheckoutOrderConfirmation";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

interface CheckoutModalProps {
  isOpen: boolean;
  cartItems: CartItem[];
  directBuyItem?: CartItem | null;
  currency: Currency;
  discountPercent: number;
  onClose: () => void;
  onOrderComplete: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  cartItems,
  directBuyItem,
  discountPercent,
  onClose,
  onOrderComplete,
}) => {
  // Navigation Steps:
  // Step 1: Customer Details Page (Where should we deliver your order?)
  // Step 2: Payment Page (Choose Your Payment Method + Order Summary)
  // Step 3: Order Confirmation (After successful payment/COD)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
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

  // Form State
  const initialFormState: CheckoutFormState = {
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

  const [formData, setFormData] = useState<CheckoutFormState>(initialFormState);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  // Success state payload
  const [orderConfirmation, setOrderConfirmation] =
    useState<OrderConfirmationData | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const prevIsOpenRef = useRef(isOpen);
  const formTopRef = useRef<HTMLDivElement>(null);

  // Reset checkout session state ONLY when modal transitions from closed to open
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setCurrentStep(1);
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
    if (currentStep === 1 || currentStep === 2) {
      trackFunnelEvent("checkout_abandoned", {
        step: currentStep,
        paymentMethod: formData.paymentMethod,
        value: currentPayableAmount,
        currency: "INR",
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  const activeItems = directBuyItem ? [directBuyItem] : cartItems;

  const rawSubtotal = activeItems.reduce(
    (acc, item) => acc + calculateItemSubtotal(item.product, item.quantity),
    0
  );
  const discountAmount = Math.round((rawSubtotal * discountPercent) / 100);
  const shippingCost = calculateDeliveryFee(rawSubtotal);
  const isFreeDelivery = rawSubtotal >= FREE_DELIVERY_THRESHOLD;
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

  // Validate single field
  const validateSingleField = (
    key: keyof CheckoutFormState,
    value: string
  ): string | undefined => {
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
          return "Enter your 6-digit PIN code";
        }
        break;
      }
      default:
        break;
    }
    return undefined;
  };

  // Validate entire Step 1 form
  const validateAll = (): ValidationErrors => {
    const errors: ValidationErrors = {};
    const keys: (keyof CheckoutFormState)[] = [
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
  const handleInputChange = (key: keyof CheckoutFormState, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));

    if (fieldErrors[key as keyof ValidationErrors]) {
      const err = validateSingleField(key, value);
      setFieldErrors((prev) => ({ ...prev, [key]: err }));
    }

    // Live PIN code verification when 6 digits are typed
    if (key === "pincode") {
      const clean = value.replace(/\D/g, "");
      if (clean.length === 6) {
        verifyPincodeServiceability(clean);
      } else {
        setPincodeCheckState({ status: "idle" });
      }
    }
  };

  const handleBlur = (key: keyof CheckoutFormState) => {
    setTouchedFields((prev) => ({ ...prev, [key]: true }));
    const err = validateSingleField(key, formData[key]);
    setFieldErrors((prev) => ({ ...prev, [key]: err }));

    if (key === "pincode" && formData.pincode.trim().length === 6) {
      verifyPincodeServiceability(formData.pincode.trim());
    }
  };

  // Verify PIN Code
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
      const result: PincodeValidationResult = await checkPincodeServiceability(
        pincode
      );
      if (result.serviceable) {
        setPincodeCheckState({
          status: "serviceable",
          message: "Delivery Available",
          location:
            result.location ||
            (result.district ? `${result.district}, ${result.state}` : result.state),
        });

        // Auto-fill city and state if currently empty
        setFormData((prev) => ({
          ...prev,
          city: prev.city || result.district || "",
          state:
            prev.state ||
            (result.state && INDIAN_STATES.includes(result.state)
              ? result.state
              : prev.state),
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
          message:
            result.message || "Delivery currently unavailable for this PIN code.",
        });
      }
    } catch {
      setPincodeCheckState({
        status: "unserviceable",
        message: "Could not verify PIN code. Please check and retry.",
      });
    }
  };

  // Step 1: Continue to Payment
  const handleContinueToPayment = () => {
    setPaymentError(null);

    // Mark all as touched to display errors if any
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

    if (
      pincodeCheckState.status === "unserviceable" ||
      pincodeCheckState.status === "invalid"
    ) {
      setPaymentError("Please enter a valid serviceable PIN code to continue.");
      return;
    }

    // Funnel event: customer details completed, entering payment
    trackFunnelEvent("add_shipping_info", {
      value: currentPayableAmount,
      currency: "INR",
    });

    // Move to Step 2: Payment Page
    setCurrentStep(2);
    formTopRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Step 2: Submit Order (Razorpay or COD)
  const handleSubmitOrder = async () => {
    setPaymentError(null);

    const fullAddress = `${formData.houseNo}, ${formData.street}${
      formData.landmark ? `, ${formData.landmark}` : ""
    }, ${formData.city}, ${formData.state} - ${formData.pincode}`;

    // Funnel event: begin_checkout
    trackFunnelEvent("begin_checkout", {
      items: activeItems.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: calculateItemSubtotal(item.product, item.quantity),
      })),
      value: currentPayableAmount,
      currency: "INR",
      paymentMethod: formData.paymentMethod,
    });

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
          // Funnel event: purchase (COD)
          trackFunnelEvent("purchase", {
            orderId: codData.orderId,
            items: activeItems.map((item) => ({
              id: item.product.id,
              name: item.product.name,
              quantity: item.quantity,
              price: calculateItemSubtotal(item.product, item.quantity),
            })),
            value: codData.total ?? currentPayableAmount,
            currency: "INR",
            paymentMethod: "COD",
          });

          setProcessingMessage("Confirming Order...");
          await new Promise((resolve) => setTimeout(resolve, 400));

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
          setCurrentStep(3);

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
          setPaymentError(
            codData.error ||
              "Failed to place COD order. Please check your details and try again."
          );
        }
      } catch {
        setIsProcessing(false);
        setProcessingMessage("");
        setPaymentError(
          "Network connection error while placing order. Please try again."
        );
      }
      return;
    }

    // ==========================================
    // 2. RAZORPAY PAYMENT FLOW
    // ==========================================
    setIsProcessing(true);
    setProcessingMessage("Connecting to Secure Payment...");

    try {
      // 1. Load Razorpay Checkout Script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setPaymentError(
          "Failed to load Razorpay Checkout SDK. Please check your connection."
        );
        setIsProcessing(false);
        setProcessingMessage("");
        return;
      }

      // 2. Create Razorpay Order
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
          "Unable to initialize online payment. You can choose Cash on Delivery (COD).";
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
              // Funnel event: purchase (Razorpay)
              trackFunnelEvent("purchase", {
                orderId: verifyData.orderId,
                items: activeItems.map((item) => ({
                  id: item.product.id,
                  name: item.product.name,
                  quantity: item.quantity,
                  price: calculateItemSubtotal(item.product, item.quantity),
                })),
                value: currentPayableAmount,
                currency: "INR",
                paymentMethod: "Razorpay",
              });

              setProcessingMessage("Confirming Your Order...");
              await new Promise((resolve) => setTimeout(resolve, 400));

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
              setCurrentStep(3);

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
                verifyData.error ||
                  "Payment verification failed on server. Please contact support."
              );
            }
          } catch {
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
            setPaymentError(
              "Payment was cancelled. You can try again or choose Cash on Delivery."
            );
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);

      rzp.on("payment.failed", function (response: any) {
        setIsProcessing(false);
        setProcessingMessage("");
        const desc =
          response.error?.description ||
          "Transaction failed or was declined by bank.";

        trackFunnelEvent("payment_failed", {
          errorMessage: desc,
          paymentMethod: "Razorpay",
          value: currentPayableAmount,
          currency: "INR",
        });

        setPaymentError(
          `Payment could not be completed: ${desc}. You can try again or choose Cash on Delivery.`
        );
      });

      trackFunnelEvent("razorpay_checkout_opened", {
        orderId: orderData.orderId,
        value: currentPayableAmount,
        currency: "INR",
      });

      rzp.open();
      setIsProcessing(false);
      setProcessingMessage("");
    } catch (err: any) {
      setIsProcessing(false);
      setProcessingMessage("");
      console.error("Razorpay error:", err);

      trackFunnelEvent("payment_failed", {
        errorMessage: err.message || "An unexpected error occurred",
        paymentMethod: "Razorpay",
        value: currentPayableAmount,
        currency: "INR",
      });

      setPaymentError(
        err.message || "An unexpected error occurred during online checkout."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs md:p-4 overflow-hidden">
      <div
        className="relative w-full h-full md:h-auto md:max-h-[92vh] md:max-w-3xl bg-neutral-50 md:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        id="zenvia-2step-checkout-modal"
      >
        {/* =======================================================
            1. CHECKOUT HEADER (Brand + Back + Close)
        ======================================================= */}
        <div className="shrink-0 px-4 py-3 sm:px-6 sm:py-3.5 bg-white border-b border-neutral-200 flex items-center justify-between z-10">
          <div className="flex items-center space-x-2.5">
            {currentStep === 2 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                disabled={isProcessing}
                className="flex items-center space-x-1 text-xs font-bold text-neutral-700 hover:text-neutral-950 p-1 -ml-1 rounded-lg transition-colors cursor-pointer"
                title="Back to Customer Details"
              >
                <ArrowLeft className="w-4 h-4 text-neutral-900" />
                <span className="hidden sm:inline">Details</span>
              </button>
            ) : currentStep === 1 ? (
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isProcessing}
                className="flex items-center space-x-1 text-xs font-bold text-neutral-600 hover:text-neutral-900 p-1 -ml-1 rounded-lg transition-colors cursor-pointer"
                title="Cancel Checkout"
              >
                <ArrowLeft className="w-4 h-4 text-neutral-800" />
                <span className="hidden sm:inline">Shop</span>
              </button>
            ) : null}

            <div className="flex items-center space-x-2">
              <ZenviaLogo variant="dark" className="h-6 sm:h-7 w-auto" />
              <div className="h-4 w-px bg-neutral-300 mx-1 hidden sm:block" />
              <div className="flex items-center space-x-1.5 text-neutral-900 font-extrabold text-sm sm:text-base tracking-tight">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {currentStep === 3
                    ? "Order Confirmed"
                    : currentStep === 2
                    ? "Payment"
                    : "Delivery Details"}
                </span>
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
            2. CHECKOUT PROGRESS INDICATOR (Step 1 -> Step 2)
        ======================================================= */}
        {currentStep !== 3 && (
          <CheckoutProgressBar
            currentStep={currentStep as 1 | 2}
            onStepClick={(step) => {
              if (step === 1) setCurrentStep(1);
            }}
            canNavigateToStep2={currentStep === 2}
          />
        )}

        {/* =======================================================
            3. SCROLLABLE BODY
        ======================================================= */}
        <div
          ref={formTopRef}
          className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-6 pb-28 md:pb-8"
        >
          {/* Promotion / Urgency Banner on Step 1 & 2 */}
          {currentStep !== 3 && (
            <div className="max-w-xl mx-auto mb-4">
              <PromotionCountdownBadge variant="checkout" />
            </div>
          )}

          {/* ERROR ALERT BANNER */}
          {paymentError && (
            <div className="max-w-xl mx-auto mb-4">
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 sm:p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start space-x-2.5 shadow-2xs"
              >
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <span className="font-extrabold block text-rose-950">Notice</span>
                  <p className="leading-relaxed text-rose-800 text-[11.5px]">
                    {paymentError}
                  </p>
                  {currentStep === 2 && formData.paymentMethod === "razorpay" && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, paymentMethod: "cod" }));
                          setPaymentError(null);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-950 active:scale-[0.98] text-white text-[11px] font-bold cursor-pointer transition-colors inline-flex items-center space-x-1.5 shadow-2xs"
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
            </div>
          )}

          {/* ===================================================
              PAGE 1: CUSTOMER DETAILS
          =================================================== */}
          {currentStep === 1 && (
            <CheckoutStep1Details
              formData={formData}
              fieldErrors={fieldErrors}
              touchedFields={touchedFields}
              pincodeCheckState={pincodeCheckState}
              onInputChange={handleInputChange}
              onBlur={handleBlur}
              onContinueToPayment={handleContinueToPayment}
            />
          )}

          {/* ===================================================
              PAGE 2: PAYMENT
          =================================================== */}
          {currentStep === 2 && (
            <CheckoutStep2Payment
              activeItems={activeItems}
              rawSubtotal={rawSubtotal}
              discountPercent={discountPercent}
              discountAmount={discountAmount}
              isFreeDelivery={isFreeDelivery}
              baseOnlineTotal={baseOnlineTotal}
              codHandlingCharge={codHandlingCharge}
              codTotal={codTotal}
              currentPayableAmount={currentPayableAmount}
              formattedOnlineTotal={formattedOnlineTotal}
              formattedCodTotal={formattedCodTotal}
              formattedCodCharge={formattedCodCharge}
              formattedTotal={formattedTotal}
              formData={formData}
              onPaymentMethodChange={(method) => {
                setFormData((prev) => ({ ...prev, paymentMethod: method }));
                trackFunnelEvent("payment_method_selected", {
                  paymentMethod: method === "cod" ? "COD" : "Razorpay",
                  value: method === "cod" ? codTotal : baseOnlineTotal,
                  currency: "INR",
                });
              }}
              onBackToDetails={() => setCurrentStep(1)}
              onSubmitOrder={handleSubmitOrder}
              isProcessing={isProcessing}
              processingMessage={processingMessage}
              isOrderSummaryExpanded={isOrderSummaryExpanded}
              setIsOrderSummaryExpanded={setIsOrderSummaryExpanded}
            />
          )}

          {/* ===================================================
              PAGE 3: ORDER CONFIRMATION
          =================================================== */}
          {currentStep === 3 && orderConfirmation && (
            <CheckoutOrderConfirmation
              orderConfirmation={orderConfirmation}
              copiedKey={copiedKey}
              onCopy={handleCopy}
              onClose={handleCloseModal}
            />
          )}
        </div>

        {/* =======================================================
            4. MOBILE STICKY CTA (Bottom Bar for Mobile)
        ======================================================= */}
        {currentStep === 1 && (
          <div className="md:hidden shrink-0 bg-white border-t border-neutral-200 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[max(0.75rem,env(safe-area-inset-bottom))] z-30">
            <button
              type="button"
              onClick={handleContinueToPayment}
              id="continue-to-payment-mobile-btn"
              className="w-full min-h-[52px] h-[52px] py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-sm uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 active:scale-[0.98]"
            >
              <span>CONTINUE TO PAYMENT</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="md:hidden shrink-0 bg-white border-t border-neutral-200 px-4 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[max(0.75rem,env(safe-area-inset-bottom))] z-30">
            <div className="flex items-center justify-between gap-3">
              <div className="shrink-0">
                <span className="text-[10px] uppercase font-bold text-neutral-500 block leading-tight">
                  {isCOD ? "COD TOTAL" : "FINAL TOTAL"}
                </span>
                <span className="text-lg font-black text-neutral-950 font-mono leading-tight">
                  {formattedTotal}
                </span>
              </div>

              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={isProcessing}
                id="mobile-payment-submit-btn"
                className={`flex-1 min-h-[52px] h-[52px] py-3.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center space-x-1.5 active:scale-[0.98] ${
                  isCOD
                    ? "bg-neutral-950 hover:bg-neutral-900 text-white"
                    : "bg-amber-500 hover:bg-amber-600 text-neutral-950"
                } disabled:opacity-75 disabled:cursor-not-allowed`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
                    <span className="truncate">
                      {processingMessage ||
                        (isCOD ? "Placing Order..." : "Connecting to Payment...")}
                    </span>
                  </>
                ) : isCOD ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                    <span className="truncate">PLACE COD ORDER</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 fill-current shrink-0" />
                    <span className="truncate">PAY {formattedTotal} &amp; PLACE ORDER</span>
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
