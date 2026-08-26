import React from "react";
import {
  Check,
  ShieldCheck,
  Banknote,
  MapPin,
  Copy,
  ArrowRight,
} from "lucide-react";
import { motion } from "motion/react";
import { CartItem } from "../types";
import { formatRupee } from "../lib/currency";
import { calculateItemSubtotal } from "../lib/pricing";

export interface OrderConfirmationData {
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
}

interface CheckoutOrderConfirmationProps {
  orderConfirmation: OrderConfirmationData;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
  onClose: () => void;
}

export const CheckoutOrderConfirmation: React.FC<CheckoutOrderConfirmationProps> = ({
  orderConfirmation,
  copiedKey,
  onCopy,
  onClose,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="py-2 max-w-xl mx-auto space-y-4 sm:space-y-5"
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
          onClick={() => onCopy(orderConfirmation.orderId, "orderId")}
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

      {/* Order Support Card */}
      <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 text-xs text-neutral-600 flex items-center justify-between flex-wrap gap-2">
        <span className="text-[11px]">Need help with this order?</span>
        <a
          href="mailto:zenviashopindia@gmail.com"
          className="font-bold text-neutral-900 hover:text-amber-700 text-[11px] underline underline-offset-2 transition-colors"
        >
          zenviashopindia@gmail.com
        </a>
      </div>

      {/* Continue Shopping */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onClose}
          id="continue-shopping-success-btn"
          className="w-full py-3.5 rounded-xl bg-neutral-950 hover:bg-neutral-900 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 active:scale-[0.98]"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
