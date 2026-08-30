import React from "react";
import {
  ShieldCheck,
  Lock,
  Sparkles,
  CheckCircle2,
  Check,
  CreditCard,
  Banknote,
  Info,
  Loader2,
  Truck,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CartItem } from "../types";
import { formatRupee, formatRupeeExact } from "../lib/currency";
import { calculateItemSubtotal } from "../lib/pricing";
import { CheckoutFormState } from "./CheckoutStep1Details";

interface CheckoutStep2PaymentProps {
  activeItems: CartItem[];
  rawSubtotal: number;
  discountPercent: number;
  discountAmount: number;
  isFreeDelivery: boolean;
  baseOnlineTotal: number;
  codHandlingCharge: number;
  codTotal: number;
  currentPayableAmount: number;
  formattedOnlineTotal: string;
  formattedCodTotal: string;
  formattedCodCharge: string;
  formattedTotal: string;
  formData: CheckoutFormState;
  onPaymentMethodChange: (method: "razorpay" | "cod") => void;
  onBackToDetails: () => void;
  onSubmitOrder: () => void;
  isProcessing: boolean;
  processingMessage: string;
  isOrderSummaryExpanded: boolean;
  setIsOrderSummaryExpanded: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export const CheckoutStep2Payment: React.FC<CheckoutStep2PaymentProps> = ({
  activeItems,
  rawSubtotal,
  discountPercent,
  discountAmount,
  baseOnlineTotal,
  codHandlingCharge,
  codTotal,
  currentPayableAmount,
  formattedOnlineTotal,
  formattedCodTotal,
  formattedCodCharge,
  formattedTotal,
  formData,
  onPaymentMethodChange,
  onBackToDetails,
  onSubmitOrder,
  isProcessing,
  processingMessage,
  isOrderSummaryExpanded,
  setIsOrderSummaryExpanded,
}) => {
  const totalItemCount = activeItems.reduce((sum, item) => sum + item.quantity, 0);
  const isCOD = formData.paymentMethod === "cod";

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      {/* ========================================================
          1. ORDER SUMMARY AT TOP
      ======================================================== */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl shadow-xs overflow-hidden">
        {/* Toggle Bar / Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 bg-neutral-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                ZENVIA
              </span>
              <span className="text-[10px] text-neutral-400 font-bold">•</span>
              <span className="text-[10px] text-neutral-300 font-bold uppercase tracking-wider">
                SECURE CHECKOUT
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight mt-0.5">
              Order Summary ({totalItemCount} {totalItemCount === 1 ? "item" : "items"})
            </h3>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-neutral-400 font-bold block uppercase">
              {isCOD ? "COD TOTAL" : "PAYABLE TOTAL"}
            </span>
            <span className="text-lg sm:text-xl font-black text-amber-400 font-mono">
              {formattedTotal}
            </span>
          </div>
        </div>

        {/* Product Items List (Always clearly shown) */}
        <div className="p-4 sm:p-5 space-y-3 bg-neutral-50/50">
          <div className="space-y-2.5">
            {activeItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-white p-3 rounded-xl border border-neutral-200/80 shadow-2xs"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-lg object-cover border border-neutral-200 shrink-0 bg-neutral-100"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-neutral-900 text-xs sm:text-sm truncate">
                      {item.product.name}
                    </h4>
                    <div className="text-[11px] text-neutral-500 flex flex-wrap gap-2 mt-0.5">
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
                      <span>
                        Qty: <strong className="text-neutral-900">{item.quantity}</strong>
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-emerald-700 mt-0.5">
                      {formatRupee(calculateItemSubtotal(item.product, item.quantity))}
                    </div>
                  </div>
                </div>

                <div className="text-right font-black text-neutral-900 text-xs sm:text-sm font-mono shrink-0 pl-2">
                  {formatRupee(calculateItemSubtotal(item.product, item.quantity))}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-white p-3.5 rounded-xl border border-neutral-200/80 space-y-2 text-xs text-neutral-600">
            <div className="flex justify-between items-center">
              <span>Product Price (MRP/Subtotal)</span>
              <span className="font-semibold text-neutral-900 font-mono">
                {formatRupeeExact(rawSubtotal)}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between items-center text-emerald-700 font-semibold">
                <span>Discount Applied ({discountPercent}%)</span>
                <span className="font-mono">-{formatRupeeExact(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="flex items-center space-x-1">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Delivery Charge</span>
              </span>
              <span className="font-bold text-emerald-700">FREE</span>
            </div>

            <div className="flex justify-between items-center">
              <span>COD Handling Fee</span>
              {isCOD ? (
                <span className="font-bold text-amber-900 font-mono bg-amber-50 px-1.5 py-0.5 rounded">
                  +{formattedCodCharge} (5%)
                </span>
              ) : (
                <span className="font-bold text-emerald-700 font-mono">₹0</span>
              )}
            </div>

            <div className="flex justify-between items-center pt-2.5 border-t border-neutral-200 text-neutral-950 font-black text-sm sm:text-base">
              <span>Final Total</span>
              <span className="text-amber-700 font-black font-mono text-base sm:text-lg">
                {formattedTotal}
              </span>
            </div>
          </div>

          {/* Delivery To Address Preview */}
          <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-3 flex items-center justify-between text-xs">
            <div className="min-w-0 pr-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900/80 block">
                DELIVERING TO:
              </span>
              <p className="font-bold text-neutral-900 truncate">
                {formData.fullName} • +91 {formData.phone}
              </p>
              <p className="text-[11px] text-neutral-600 truncate mt-0.5">
                {formData.houseNo}, {formData.street}, {formData.city} - {formData.pincode}
              </p>
            </div>
            <button
              type="button"
              onClick={onBackToDetails}
              className="shrink-0 px-2.5 py-1 text-[11px] font-bold text-amber-900 hover:text-amber-950 bg-white border border-amber-300 rounded-lg hover:bg-amber-100/50 transition-colors cursor-pointer"
            >
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. CHOOSE PAYMENT METHOD SECTION
      ======================================================== */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-neutral-950 tracking-tight">
            Choose Payment Method
          </h3>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">
            Select your preferred payment method below.
          </p>
        </div>

        {/* Payment Options */}
        <div className="space-y-3">
          {/* OPTION 1: GOOGLE PAY / UPI / CARDS / NET BANKING */}
          <div
            onClick={() => onPaymentMethodChange("razorpay")}
            id="payment-option-prepaid"
            className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer select-none flex items-start space-x-3.5 ${
              formData.paymentMethod === "razorpay"
                ? "border-amber-600 bg-amber-50/40 shadow-xs ring-1 ring-amber-600/30"
                : "border-neutral-200 bg-white hover:border-neutral-300"
            }`}
          >
            {/* Tag */}
            <div className="absolute -top-2.5 right-4 bg-amber-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs flex items-center space-x-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>RECOMMENDED • INSTANT CONFIRMATION</span>
            </div>

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
                <span className="text-sm sm:text-base font-black text-neutral-950 block">
                  💳 Online Payment (Google Pay / UPI / Cards)
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm sm:text-base font-black text-neutral-950 font-mono">
                    {formattedOnlineTotal}
                  </span>
                  <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded">
                    Save {formattedCodCharge}
                  </span>
                </div>
              </div>

              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                Pay securely to <strong>ZENVIA</strong> via Merchant Payment Gateway.
              </p>

              {/* Supported payment badges */}
              <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-2 border-t border-amber-200/50">
                <div className="flex items-center space-x-1 bg-white border border-neutral-200 rounded-md px-2 py-1 text-[11px] font-bold text-neutral-800">
                  <span>●</span>
                  <span>Google Pay / UPI</span>
                </div>
                <div className="flex items-center space-x-1 bg-white border border-neutral-200 rounded-md px-2 py-1 text-[11px] font-bold text-neutral-800">
                  <span>●</span>
                  <span>Credit / Debit Card</span>
                </div>
                <div className="flex items-center space-x-1 bg-white border border-neutral-200 rounded-md px-2 py-1 text-[11px] font-bold text-neutral-800">
                  <span>●</span>
                  <span>Net Banking</span>
                </div>
                <div className="flex items-center space-x-1 bg-white border border-neutral-200 rounded-md px-2 py-1 text-[11px] font-bold text-neutral-800">
                  <span>●</span>
                  <span>Paytm / PhonePe</span>
                </div>
              </div>
            </div>
          </div>

          {/* OPTION 2: CASH ON DELIVERY */}
          <div
            onClick={() => onPaymentMethodChange("cod")}
            id="payment-option-cod"
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer select-none flex items-start space-x-3.5 ${
              formData.paymentMethod === "cod"
                ? "border-neutral-900 bg-neutral-50 shadow-xs ring-1 ring-neutral-900/20"
                : "border-neutral-200 bg-white hover:border-neutral-300"
            }`}
          >
            {/* Radio circle */}
            <div className="mt-0.5">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  formData.paymentMethod === "cod"
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 bg-white"
                }`}
              >
                {formData.paymentMethod === "cod" && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <span className="text-sm sm:text-base font-black text-neutral-950 block">
                  📦 Cash on Delivery (COD)
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm sm:text-base font-black text-neutral-950 font-mono">
                    {formattedCodTotal}
                  </span>
                  <span className="text-[10px] font-bold text-neutral-700 bg-neutral-200 px-2 py-0.5 rounded">
                    Pay on Arrival
                  </span>
                </div>
              </div>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                Pay in cash or scan courier UPI QR code directly at your doorstep upon delivery.
              </p>
              <p className="text-[11px] font-semibold text-neutral-500 mt-1">
                • Includes {formattedCodCharge} courier handling fee
              </p>
            </div>
          </div>
        </div>

        {/* TRUST REASSURANCE AREA */}
        <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80 flex items-start space-x-3 text-xs text-neutral-600">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-neutral-900 block flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>🔒 Secure Payment</span>
            </span>
            <p className="text-[11px] text-neutral-600 leading-relaxed">
              Your payment is securely processed through our payment partner.
            </p>
          </div>
        </div>

        {/* Desktop prominent Submit Button */}
        <div className="hidden md:flex flex-col gap-2 pt-2">
          <button
            type="button"
            onClick={onSubmitOrder}
            disabled={isProcessing}
            id="desktop-payment-submit-btn"
            className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              isCOD
                ? "bg-neutral-950 hover:bg-neutral-900 text-white active:scale-[0.99]"
                : "bg-amber-500 hover:bg-amber-600 text-neutral-950 active:scale-[0.99]"
            } disabled:opacity-75 disabled:cursor-not-allowed`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-current shrink-0" />
                <span>{processingMessage || "Processing..."}</span>
              </>
            ) : isCOD ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span>PLACE COD ORDER — {formattedTotal}</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 fill-neutral-950" />
                <span>PAY {formattedTotal} &amp; PLACE ORDER</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onBackToDetails}
            disabled={isProcessing}
            className="w-full py-2.5 text-neutral-600 hover:text-neutral-900 font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Delivery Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};
