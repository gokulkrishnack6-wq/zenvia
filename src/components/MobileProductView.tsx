import React, { useState, useRef } from "react";
import {
  Star,
  Zap,
  ShoppingBag,
  Check,
  ChevronRight,
  ChevronLeft,
  Share2,
  ArrowLeft,
  Package,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Lock,
  ChevronDown,
  MapPin,
  Loader2,
  Maximize2,
  Clock,
  ThumbsUp,
  HelpCircle,
  Flame,
  X,
  Play,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product, Currency, CategoryType } from "../types";
import { PolicyTab } from "./PolicyModal";
import { PincodeValidationResult } from "../lib/pincodeService";
import { INITIAL_PRODUCT_REVIEWS, PRODUCT_RATING_STATS } from "../data/reviews";
import { ProductReviewsSection } from "./ProductReviewsSection";
import { getProductQuantityOffers } from "../lib/pricing";
import { formatRupee } from "../lib/currency";
import { usePromotionCountdown, PROMOTION_CONFIG } from "../lib/promotionConfig";

interface MobileProductViewProps {
  product: Product;
  currency: Currency;
  mediaList: { type: "image" | "video"; url: string; title?: string }[];
  selectedMediaIndex: number;
  setSelectedMediaIndex: (idx: number) => void;
  selectedColor?: string;
  setSelectedColor?: (col: string) => void;
  selectedSize?: string;
  setSelectedSize?: (size: string) => void;
  quantity: number;
  setQuantity: (qty: number) => void;
  formattedPrice: string;
  formattedOriginalPrice: string | null;
  discountPercent: number;
  savingsAmount: string | null;
  bundleSavings: number;
  addedSuccess: boolean;
  variantError: string | null;
  handleBuyNowClick: () => void;
  handleAddToCartClick: () => void;
  onGoHome: () => void;
  onSelectCategory: (cat: CategoryType) => void;
  handleShare: () => void;
  copiedLink: boolean;
  scrollToReviews: () => void;
  pincodeInput: string;
  setPincodeInput: (val: string) => void;
  handleCheckPincode: (e: React.FormEvent) => void;
  isCheckingPincode: boolean;
  pincodeResult: PincodeValidationResult | null;
  onOpenPolicy?: (tab?: PolicyTab) => void;
  setIsZoomOpen: (open: boolean) => void;
}

export const MobileProductView: React.FC<MobileProductViewProps> = ({
  product,
  currency,
  mediaList,
  selectedMediaIndex,
  setSelectedMediaIndex,
  selectedColor,
  setSelectedColor,
  selectedSize,
  setSelectedSize,
  quantity,
  setQuantity,
  formattedPrice,
  formattedOriginalPrice,
  discountPercent,
  savingsAmount,
  bundleSavings,
  addedSuccess,
  variantError,
  handleBuyNowClick,
  handleAddToCartClick,
  onGoHome,
  onSelectCategory,
  handleShare,
  copiedLink,
  scrollToReviews,
  pincodeInput,
  setPincodeInput,
  handleCheckPincode,
  isCheckingPincode,
  pincodeResult,
  onOpenPolicy,
  setIsZoomOpen,
}) => {
  // Mobile touch swipe handling
  const touchStartXRef = useRef<number | null>(null);
  const [showAllReviewsModal, setShowAllReviewsModal] = useState(false);

  // Accordion state
  const [openDetailSection, setOpenDetailSection] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleDetail = (key: string) => {
    setOpenDetailSection((prev) => (prev === key ? null : key));
  };

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex((prev) => (prev === idx ? null : idx));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // Swipe left -> next
        setSelectedMediaIndex((selectedMediaIndex + 1) % mediaList.length);
      } else {
        // Swipe right -> prev
        setSelectedMediaIndex(
          (selectedMediaIndex - 1 + mediaList.length) % mediaList.length
        );
      }
    }
    touchStartXRef.current = null;
  };

  const currentMedia = mediaList[selectedMediaIndex] || mediaList[0] || {
    type: "image",
    url: product.image,
  };

  // Top 3 Core Benefits from product data or customized for Zenvia Sink Caddy
  const coreBenefits = product.keyHighlights && product.keyHighlights.length >= 3
    ? product.keyHighlights.slice(0, 3)
    : [
        "Keeps sponges, soaps & scrubbers elevated and organized",
        "Adjustable 360° clamp fits standard round faucets (18–28mm)",
        "Rustproof stainless-steel construction with auto-drainage",
      ];

  // 3-4 Curated "Why You'll Love It" highlights
  const whyYouLoveIt = [
    {
      icon: "🧽",
      title: "Clean Countertops",
      desc: "Keeps wet sponges and soaps elevated off your counters, preventing water rings and grime.",
    },
    {
      icon: "💧",
      title: "Open-Grid Drainage",
      desc: "Excess water drips directly into the sink basin so sponges dry faster and stay hygienic.",
    },
    {
      icon: "🔧",
      title: "Tool-Free 30s Install",
      desc: "Tightens securely onto your faucet pipe by hand. No drills, suction cups, or glue needed.",
    },
    {
      icon: "✨",
      title: "Durable Stainless Steel",
      desc: "Engineered with thickened rust-resistant stainless steel for long-term daily kitchen use.",
    },
  ];

  // 3 Simple Steps for "How It Works"
  const howItWorksSteps = [
    {
      step: "01",
      title: "Position Clamp",
      desc: "Wrap the clamp around your round faucet pipe (18–28mm).",
    },
    {
      step: "02",
      title: "Hand-Tighten",
      desc: "Screw the tightening cap firmly in place by hand.",
    },
    {
      step: "03",
      title: "Organize Sink",
      desc: "Place your sponge, soap bottle, and scrubber in the caddy.",
    },
  ];

  // Genuine reviews preview (filtered by product or general sample)
  const productReviews = INITIAL_PRODUCT_REVIEWS.filter(
    (r) => r.productId === product.id
  ).slice(0, 3);
  const reviewsToDisplay = productReviews.length > 0
    ? productReviews
    : INITIAL_PRODUCT_REVIEWS.slice(0, 3);

  // Default FAQs if none specified
  const faqs = product.faqs && product.faqs.length > 0
    ? product.faqs
    : [
        {
          question: "Will this caddy fit my kitchen sink faucet?",
          answer:
            "Yes! The adjustable clamp is designed for standard round faucet pipes with a diameter between 18mm and 28mm (approx. 0.7 to 1.1 inches). A sizing insert is included for thinner faucets.",
        },
        {
          question: "Will it rust over time in kitchen water?",
          answer:
            "No. It is crafted from premium, thickened rust-resistant stainless steel built specifically to withstand daily moisture and soap exposure.",
        },
        {
          question: "Do I need any tools or screws to install it?",
          answer:
            "Zero tools are required. You simply place the clamp on the pipe and hand-tighten the screw cap. Installation takes under 30 seconds.",
        },
        {
          question: "What is the delivery time and is COD available?",
          answer:
            "Orders are dispatched within 24 hours. Delivery takes 2–5 business days across India. Cash on Delivery (COD) and Online Payment (Google Pay/UPI/Cards) are both available.",
        },
      ];

  // Quantity bundle options from pricing engine or standard 1, 2, 4 tiers
  const quantityOffers = getProductQuantityOffers(product);
  const bundleTiers = quantityOffers && quantityOffers.length > 0
    ? quantityOffers
    : [
        { quantity: 1, totalPrice: product.price, label: "1 Unit", badge: undefined },
        { quantity: 2, totalPrice: Math.round(product.price * 1.85), label: "2 Units", badge: "BEST SELLER" },
        { quantity: 4, totalPrice: Math.round(product.price * 3.35), label: "4 Units", badge: "BEST VALUE" },
      ];

  // Authoritative, synchronized live 22-Hour promotion countdown
  const { hours, minutes, seconds, isExpired } = usePromotionCountdown();

  return (
    <div className="lg:hidden bg-white text-neutral-900 font-inter pb-32">
      {/* ========================================================
          LARGE, CLEAN PRODUCT GALLERY
      ======================================================== */}
      <div className="relative w-full bg-[#f8f7f5] border-b border-neutral-100">
        {/* Main Image / Video Viewport */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full aspect-square overflow-hidden flex items-center justify-center select-none"
        >
          {currentMedia.type === "image" ? (
            <img
              key={currentMedia.url}
              src={currentMedia.url}
              alt={product.name}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
              onClick={() => setIsZoomOpen(true)}
            />
          ) : (
            <video
              key={currentMedia.url}
              src={currentMedia.url}
              controls
              playsInline
              preload="metadata"
              className="w-full h-full object-contain bg-black"
            />
          )}

          {/* Floating Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
            {product.isBestseller && (
              <span className="px-2.5 py-1 rounded-md bg-neutral-900 text-white text-[10px] font-montserrat font-black uppercase tracking-wider shadow-sm">
                BESTSELLER
              </span>
            )}
            {discountPercent > 0 && (
              <span className="px-2.5 py-1 rounded-md bg-amber-600 text-white text-[10px] font-montserrat font-black uppercase tracking-wider shadow-sm">
                SAVE {discountPercent}%
              </span>
            )}
          </div>

          {/* Top-Right Action Controls (Share + Zoom) */}
          <div className="absolute top-3 right-3 flex items-center space-x-1.5 z-10">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl bg-white/90 backdrop-blur-xs text-neutral-800 shadow-xs border border-neutral-200/80 active:scale-95 transition-transform cursor-pointer flex items-center justify-center"
              title="Share Product"
              aria-label="Share Product"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            {currentMedia.type === "image" && (
              <button
                type="button"
                onClick={() => setIsZoomOpen(true)}
                className="p-2 rounded-xl bg-white/90 backdrop-blur-xs text-neutral-800 shadow-xs border border-neutral-200/80 active:scale-95 transition-transform cursor-pointer flex items-center justify-center"
                title="Zoom image"
                aria-label="Zoom image"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Left / Right Arrow buttons */}
          {mediaList.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setSelectedMediaIndex(
                    (selectedMediaIndex - 1 + mediaList.length) % mediaList.length
                  )
                }
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-neutral-800 shadow-sm flex items-center justify-center active:scale-90 transition-transform"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setSelectedMediaIndex((selectedMediaIndex + 1) % mediaList.length)
                }
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-neutral-800 shadow-sm flex items-center justify-center active:scale-90 transition-transform"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Clean Pagination Dots */}
        {mediaList.length > 1 && (
          <div className="py-2.5 flex items-center justify-center space-x-1.5">
            {mediaList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedMediaIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                  selectedMediaIndex === idx
                    ? "w-6 bg-neutral-900"
                    : "w-1.5 bg-neutral-300 hover:bg-neutral-400"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ========================================================
          3. PRODUCT HERO: TITLE, RATING, BENEFITS, PRICE, CTA
      ======================================================== */}
      <div className="px-4 pt-4 pb-6 space-y-4">
        {/* Product Title */}
        <div>
          <span className="text-[10px] font-montserrat font-bold tracking-widest text-amber-700 uppercase block mb-1">
            ZENVIA OFFICIAL STORE
          </span>
          <h1 className="text-xl sm:text-2xl font-montserrat font-black text-neutral-950 tracking-tight leading-tight">
            {product.name}
            <span className="text-xs font-normal text-neutral-400 align-super ml-0.5">™</span>
          </h1>

          {/* Genuine Rating info */}
          <div
            onClick={scrollToReviews}
            className="flex items-center space-x-2 mt-2 cursor-pointer select-none"
          >
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              ))}
            </div>
            <span className="text-xs font-bold text-neutral-900">{product.rating || 4.8}</span>
            <span className="text-neutral-400 text-xs">•</span>
            <span className="text-xs font-medium text-neutral-600 underline decoration-neutral-300">
              {product.reviewCount || "884"} Reviews
            </span>
          </div>
        </div>

        {/* Short, clear product description */}
        <p className="text-xs text-neutral-600 font-medium leading-relaxed">
          {product.tagline ||
            "Elevated, tool-free stainless steel sink organizer that drains water directly into your basin, keeping sponges dry and countertops clutter-free."}
        </p>

        {/* 3 Key Benefits Only (Clean and easy to scan) */}
        <div className="bg-[#faf9f6] border border-neutral-200/80 rounded-xl p-3.5 space-y-2">
          {coreBenefits.map((benefit, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-xs text-neutral-800 font-medium">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        {/* ========================================================
            PRICE + 22-HOUR OFFER TIMER
        ======================================================== */}
        <div className="pt-2">
          {/* Price Row */}
          <div className="flex items-baseline space-x-3">
            <span className="text-2xl sm:text-3xl font-montserrat font-bold text-neutral-900 tracking-tight">
              {formattedPrice}
            </span>
            {formattedOriginalPrice && (
              <span className="text-sm sm:text-base font-montserrat font-normal text-neutral-400 line-through">
                {formattedOriginalPrice}
              </span>
            )}
            <span className="text-xs font-montserrat font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded">
              SAVE {discountPercent}%
            </span>
          </div>

          {/* Limited-Time Offer Banner */}
          {isExpired ? (
            <div className="mt-2.5 p-2.5 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-between text-xs text-neutral-600">
              <div className="flex items-center space-x-1.5 font-bold">
                <Clock className="w-3.5 h-3.5 text-neutral-500" />
                <span className="font-montserrat text-[11px] font-semibold uppercase tracking-wide">
                  {PROMOTION_CONFIG.expiredNotice}
                </span>
              </div>
              <div className="font-mono font-bold text-neutral-500 text-xs">
                00 : 00 : 00
              </div>
            </div>
          ) : (
            <div className="mt-2.5 p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/70 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5 text-amber-900 font-bold">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span className="font-montserrat text-[11px] font-semibold uppercase tracking-wide">
                  LIMITED-TIME OFFER
                </span>
              </div>
              <div className="flex items-center space-x-1 font-mono font-bold text-amber-950 text-xs">
                <span className="bg-amber-200/70 px-1.5 py-0.5 rounded text-[11px] min-w-[22px] text-center inline-block">
                  {hours}
                </span>
                <span>:</span>
                <span className="bg-amber-200/70 px-1.5 py-0.5 rounded text-[11px] min-w-[22px] text-center inline-block">
                  {minutes}
                </span>
                <span>:</span>
                <span className="bg-amber-200/70 px-1.5 py-0.5 rounded text-[11px] min-w-[22px] text-center inline-block">
                  {seconds}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================
            PURCHASE OPTIONS: CLEAN QUANTITY BUNDLE CARDS
        ======================================================== */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-montserrat font-bold text-neutral-900 block">
            Select Quantity:
          </label>

          <div className="grid grid-cols-3 gap-2">
            {bundleTiers.map((tier) => {
              const isSelected = quantity === tier.quantity;
              const priceDisplay = formatRupee(tier.totalPrice);
              const tierImage =
                tier.image ||
                (tier.quantity === 2
                  ? "https://res.cloudinary.com/vgl84jqo/image/upload/v1788096728/ChatGPT_Image_Aug_30_2026_07_00_58_PM.png"
                  : tier.quantity === 4
                  ? "https://res.cloudinary.com/vgl84jqo/image/upload/v1788096728/ChatGPT_Image_Aug_30_2026_07_01_03_PM.png"
                  : "https://res.cloudinary.com/vgl84jqo/image/upload/v1788096728/ChatGPT_Image_Aug_30_2026_07_00_52_PM.png");

              return (
                <div
                  key={tier.quantity}
                  onClick={() => setQuantity(tier.quantity)}
                  className={`relative p-2.5 rounded-lg border-2 transition-all cursor-pointer flex flex-col items-center justify-between text-center select-none ${
                    isSelected
                      ? "border-neutral-900 bg-[#fbf9f6] shadow-xs ring-1 ring-neutral-900/10"
                      : "border-neutral-200 bg-white hover:border-neutral-300"
                  }`}
                >
                  {tier.badge && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                      <span
                        className={`text-[8px] font-montserrat font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                          tier.badge.includes("VALUE")
                            ? "bg-amber-700 text-white"
                            : "bg-neutral-900 text-white"
                        }`}
                      >
                        {tier.badge}
                      </span>
                    </div>
                  )}

                  <div className="w-12 h-12 mb-1 flex items-center justify-center">
                    <img
                      src={tierImage}
                      alt={`${tier.quantity} Unit${tier.quantity > 1 ? "s" : ""}`}
                      className="max-h-full max-w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <span className="text-xs font-montserrat font-bold text-neutral-950">
                    {tier.quantity === 1 ? "1 Unit" : `${tier.quantity} Units`}
                  </span>
                  <span className="text-xs font-montserrat font-bold text-neutral-950 mt-0.5">
                    {priceDisplay}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            PRIMARY CTA BUTTONS
        ======================================================== */}
        <div className="space-y-2.5 pt-2">
          {/* Main Dominant BUY NOW Button - Solid, Mature, High-converting */}
          <button
            type="button"
            id="mobile-main-buy-now-cta"
            onClick={handleBuyNowClick}
            className="w-full h-12 py-3 px-6 rounded-lg bg-neutral-900 hover:bg-black text-white font-montserrat font-bold text-sm uppercase tracking-wider shadow-xs hover:shadow-sm transition-all duration-200 active:scale-[0.99] cursor-pointer flex items-center justify-center space-x-2"
          >
            <span>BUY NOW — {formattedPrice}</span>
          </button>

          {/* Secondary Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCartClick}
            className="w-full h-11 py-2.5 px-4 rounded-lg bg-white border border-neutral-300 hover:border-neutral-900 text-neutral-900 font-montserrat font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 active:scale-[0.99] cursor-pointer flex items-center justify-center space-x-2"
          >
            {addedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>ADDED TO CART</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 text-neutral-700" />
                <span>ADD TO CART</span>
              </>
            )}
          </button>
        </div>

        {/* ========================================================
            3-4 TRUST SIGNALS AROUND CTA
        ======================================================== */}
        <div className="pt-1 grid grid-cols-2 gap-2 text-[11px] font-medium text-neutral-700">
          <div className="flex items-center space-x-1.5 bg-[#faf9f6] border border-neutral-200/60 rounded-lg p-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-[#faf9f6] border border-neutral-200/60 rounded-lg p-2">
            <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Free Fast Delivery</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-[#faf9f6] border border-neutral-200/60 rounded-lg p-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Cash on Delivery</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-[#faf9f6] border border-neutral-200/60 rounded-lg p-2">
            <RotateCcw className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>5-Day Replacement</span>
          </div>
        </div>

        {/* PIN Code Delivery Check (Lightweight single-row) */}
        <div className="pt-2 border-t border-neutral-100">
          <div className="flex items-center space-x-1 text-xs font-semibold text-neutral-700 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-neutral-500" />
            <span>Check PIN Code Delivery</span>
          </div>
          <form onSubmit={handleCheckPincode} className="flex items-center space-x-2">
            <input
              type="text"
              maxLength={6}
              placeholder="Enter 6-digit PIN code"
              value={pincodeInput}
              onChange={(e) => {
                setPincodeInput(e.target.value.replace(/\D/g, ""));
              }}
              className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900"
            />
            <button
              type="submit"
              disabled={isCheckingPincode}
              className="px-3.5 py-2 bg-neutral-900 text-white rounded-lg text-xs font-montserrat font-bold uppercase transition-colors shrink-0 disabled:opacity-60 cursor-pointer"
            >
              {isCheckingPincode ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Check"}
            </button>
          </form>
          {pincodeResult && pincodeResult.serviceable && (
            <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center space-x-1">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Free Delivery available to {pincodeResult.location || pincodeInput}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
