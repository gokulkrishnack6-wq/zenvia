import React, { useState } from "react";
import { X, ShoppingBag, Trash2, Plus, Minus, Tag, ArrowRight, ShieldCheck, Truck, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CartItem, Currency } from "../types";
import { formatRupee } from "../lib/currency";
import {
  calculateCartSubtotal,
  calculateItemSubtotal,
  calculateBundleSavings,
  calculateDeliveryFee,
  FREE_DELIVERY_THRESHOLD,
  STANDARD_DELIVERY_FEE,
} from "../lib/pricing";

interface CartDrawerProps {
  isOpen: boolean;
  cartItems: CartItem[];
  currency: Currency;
  couponCode: string;
  discountPercent: number;
  onClose: () => void;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onApplyCoupon: (code: string) => boolean;
  onProceedToCheckout: () => void;
  onToggleGiftWrap?: (id: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  cartItems,
  couponCode,
  discountPercent,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onApplyCoupon,
  onProceedToCheckout,
}) => {
  const [couponInput, setCouponInput] = useState(couponCode || "");
  const [couponMsg, setCouponMsg] = useState<string | null>(null);

  const rawSubtotal = calculateCartSubtotal(cartItems);

  const shippingCost = cartItems.length === 0 ? 0 : calculateDeliveryFee(rawSubtotal);
  const amountNeededForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - rawSubtotal);
  const isFreeDelivery = rawSubtotal >= FREE_DELIVERY_THRESHOLD && cartItems.length > 0;

  const discountAmount = Math.round((rawSubtotal * discountPercent) / 100);
  const finalTotal = Math.max(0, rawSubtotal - discountAmount + shippingCost);

  const formattedSubtotal = formatRupee(rawSubtotal);
  const formattedDiscount = formatRupee(discountAmount);
  const formattedShipping = shippingCost === 0 ? "FREE" : formatRupee(shippingCost);
  const formattedTotal = formatRupee(finalTotal);

  const freeShippingProgress = Math.min(100, (rawSubtotal / FREE_DELIVERY_THRESHOLD) * 100);

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onApplyCoupon(couponInput);
    if (success) {
      setCouponMsg("✓ 10% Discount Coupon Applied!");
    } else {
      setCouponMsg("Invalid code. Try ZENVIA10 or WELCOME10");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md bg-white h-full flex flex-col justify-between shadow-2xl border-l border-neutral-200"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-neutral-900" />
                <span className="text-xl font-bold text-neutral-900">
                  Your Shopping Cart
                </span>
                <span className="text-xs bg-neutral-900 text-white font-bold px-2 py-0.5 rounded-full">
                  {cartItems.reduce((a, b) => a + b.quantity, 0)}
                </span>
              </div>

              <button
                onClick={onClose}
                className="text-neutral-500 hover:text-neutral-900 p-1.5 rounded-full hover:bg-neutral-200 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Meter */}
            <div className="px-5 py-3 bg-emerald-50/80 border-b border-emerald-200/60 text-xs">
              <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
                <span>Free Delivery Across India 🚚</span>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {cartItems.length > 0 ? (
                cartItems.map((item) => {
                  const itemSubtotal = calculateItemSubtotal(item.product, item.quantity);
                  const itemSavings = calculateBundleSavings(item.product, item.quantity);
                  return (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 flex space-x-3 items-center justify-between"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-lg object-cover border border-neutral-200 shrink-0 bg-white"
                      />

                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-amber-700 uppercase">
                          {item.product.category}
                        </span>
                        <h4 className="text-sm font-bold text-neutral-900 truncate">
                          {item.product.name}
                        </h4>

                        {item.selectedColor && (
                          <span className="text-[11px] text-neutral-500 block">
                            Color: {item.selectedColor}
                          </span>
                        )}

                        <div className="flex items-center space-x-3 mt-2">
                          <div className="flex items-center border border-neutral-300 rounded-lg bg-white">
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                              className="px-2 py-1 text-neutral-600 hover:text-neutral-900 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-bold text-neutral-900">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                              className="px-2 py-1 text-neutral-600 hover:text-neutral-900 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-neutral-900 block">
                          {formatRupee(itemSubtotal)}
                        </span>
                        {itemSavings > 0 && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded block mt-1">
                            Save ₹{itemSavings}
                          </span>
                        )}
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-neutral-400 hover:text-rose-600 p-1 mt-2 transition-colors cursor-pointer"
                          title="Remove Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-20 text-neutral-400">
                  <ShoppingBag className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
                  <p className="text-lg font-bold text-neutral-800 mb-1">Your cart is empty</p>
                  <p className="text-xs text-neutral-500">Discover affordable, useful & trendy products now.</p>
                </div>
              )}
            </div>

            {/* Coupon Code Input */}
            {cartItems.length > 0 && (
              <div className="px-5 py-3 border-t border-neutral-200 bg-neutral-50">
                <form onSubmit={handleCouponSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Coupon code (e.g. ZENVIA10)"
                      className="w-full bg-white border border-neutral-300 rounded-lg pl-9 pr-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 uppercase font-bold focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-black text-white text-xs font-semibold cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
                {couponMsg && (
                  <span className={`text-[11px] font-medium block mt-1 ${couponMsg.startsWith("✓") ? "text-emerald-700" : "text-amber-700"}`}>
                    {couponMsg}
                  </span>
                )}
              </div>
            )}

            {/* Footer Totals & Checkout Button */}
            {cartItems.length > 0 && (
              <div className="p-5 border-t border-neutral-200 bg-white space-y-3">
                <div className="space-y-1.5 text-xs text-neutral-600">
                  <div>
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-neutral-900 font-bold">{formattedSubtotal}</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-[11px] font-extrabold text-emerald-800 flex items-center space-x-1">
                        <span>Free Delivery Across India 🚚</span>
                      </span>
                    </div>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Coupon Discount ({discountPercent}%)</span>
                      <span className="font-bold">-{formattedDiscount}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span>Delivery</span>
                    <span className={`font-bold ${shippingCost === 0 ? "text-emerald-700" : "text-neutral-900"}`}>
                      {formattedShipping}
                    </span>
                  </div>

                  <div className="flex justify-between text-base text-neutral-900 pt-2 border-t border-neutral-200 font-extrabold">
                    <span>Total Amount</span>
                    <span className="text-amber-700 font-extrabold">{formattedTotal}</span>
                  </div>
                </div>

                <button
                  onClick={onProceedToCheckout}
                  id="proceed-to-checkout-btn"
                  className="w-full py-3.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold tracking-wide uppercase flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center space-x-2 text-[10px] text-neutral-500 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% RBI Compliant & Secure Payment</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
