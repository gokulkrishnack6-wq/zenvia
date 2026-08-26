import React, { useState, useEffect, useRef } from "react";
import {
  Star,
  Heart,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  Check,
  ChevronRight,
  ChevronLeft,
  Share2,
  MessageSquare,
  Plus,
  Minus,
  Maximize2,
  X,
  ArrowLeft,
  Package,
  Sparkles,
  CheckCircle2,
  Info,
  Copy,
  ExternalLink,
  MessageCircle,
  Play,
  HelpCircle,
  Sun,
  Flame,
  ShieldAlert,
  Smartphone,
  Video,
  ChevronDown,
  MapPin,
  Clock,
  Lock,
  Loader2,
  XCircle,
  Phone,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product, ProductVideo, Currency, CategoryType } from "../types";
import { formatRupee, formatRupeeExact } from "../lib/currency";
import {
  calculateItemSubtotal,
  calculateBundleSavings,
  calculatePerPiecePrice,
  getProductQuantityOffers,
  hasQuantityOffers,
} from "../lib/pricing";
import { getProductSlug } from "../lib/slug";
import { checkPincodeServiceability, PincodeValidationResult } from "../lib/pincodeService";
import { trackFunnelEvent } from "../lib/analytics";
import { PRODUCTS } from "../data/products";
import { ProductReviewsSection } from "./ProductReviewsSection";
import { SinkCaddySocialProofGallery } from "./SinkCaddySocialProofGallery";
import { SinkCaddyCountdownAdGraphic } from "./SinkCaddyCountdownAdGraphic";
import { ProductCard } from "./ProductCard";
import { PromotionCountdownBadge } from "./PromotionCountdownBadge";
import { PolicyTab } from "./PolicyModal";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

interface ProductDetailsPageProps {
  product: Product;
  currency: Currency;
  isWishlisted: boolean;
  wishlistIds: string[];
  onGoHome: () => void;
  onSelectCategory: (cat: CategoryType) => void;
  onSelectProduct: (p: Product) => void;
  onAddToCart: (p: Product, color?: string, size?: string, quantity?: number) => void;
  onBuyNow: (p: Product, quantity: number, color?: string, size?: string) => void;
  onToggleWishlist: (p: Product) => void;
  onQuickView?: (p: Product) => void;
  onOpenPolicy?: (tab?: PolicyTab) => void;
}

const DEFAULT_PRODUCT_HIGHLIGHTS: string[] = [
  "Practical and easy to use",
  "Designed for everyday convenience",
  "Compact and user-friendly",
  "Suitable for everyday use",
];

const getHighlightIcon = (text: string, index: number) => {
  const lower = text.toLowerCase();
  if (lower.includes("sun") || lower.includes("light") || lower.includes("glow") || lower.includes("halo")) {
    return <Sun className="w-4 h-4 text-amber-600 shrink-0" />;
  }
  if (
    lower.includes("shield") ||
    lower.includes("protect") ||
    lower.includes("safe") ||
    lower.includes("scald") ||
    lower.includes("rustproof") ||
    lower.includes("bpa-free") ||
    lower.includes("timer") ||
    lower.includes("guard")
  ) {
    return <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />;
  }
  if (
    lower.includes("fold") ||
    lower.includes("pocket") ||
    lower.includes("compact") ||
    lower.includes("box") ||
    lower.includes("case") ||
    lower.includes("storage") ||
    lower.includes("caddy") ||
    lower.includes("organize") ||
    lower.includes("strap") ||
    lower.includes("infuser") ||
    lower.includes("blade") ||
    lower.includes("container")
  ) {
    return <Package className="w-4 h-4 text-blue-600 shrink-0" />;
  }
  if (
    lower.includes("quick") ||
    lower.includes("instant") ||
    lower.includes("fast") ||
    lower.includes("speed") ||
    lower.includes("second") ||
    lower.includes("minute") ||
    lower.includes("rapid") ||
    lower.includes("vortex") ||
    lower.includes("suction") ||
    lower.includes("500+") ||
    lower.includes("45,000")
  ) {
    return <Zap className="w-4 h-4 text-amber-500 shrink-0" />;
  }
  if (
    lower.includes("heat") ||
    lower.includes("thermal") ||
    lower.includes("infrared") ||
    lower.includes("temp") ||
    lower.includes("warm") ||
    lower.includes("hot")
  ) {
    return <Flame className="w-4 h-4 text-rose-500 shrink-0" />;
  }
  if (
    lower.includes("clean") ||
    lower.includes("shine") ||
    lower.includes("sparkl") ||
    lower.includes("exfoliat") ||
    lower.includes("drain") ||
    lower.includes("wash") ||
    lower.includes("shampoo") ||
    lower.includes("ion")
  ) {
    return <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />;
  }
  if (
    lower.includes("bluetooth") ||
    lower.includes("app") ||
    lower.includes("wireless") ||
    lower.includes("cordless") ||
    lower.includes("usb") ||
    lower.includes("battery") ||
    lower.includes("recharge") ||
    lower.includes("screen") ||
    lower.includes("led") ||
    lower.includes("touch")
  ) {
    return <Smartphone className="w-4 h-4 text-indigo-600 shrink-0" />;
  }
  if (
    lower.includes("comfort") ||
    lower.includes("relax") ||
    lower.includes("massage") ||
    lower.includes("gentle") ||
    lower.includes("soft") ||
    lower.includes("relief") ||
    lower.includes("care") ||
    lower.includes("scalp") ||
    lower.includes("eye") ||
    lower.includes("sleep")
  ) {
    return <Heart className="w-4 h-4 text-rose-600 shrink-0" />;
  }

  const defaultIcons = [
    <Sun key="0" className="w-4 h-4 text-amber-600 shrink-0" />,
    <ShieldCheck key="1" className="w-4 h-4 text-emerald-600 shrink-0" />,
    <Package key="2" className="w-4 h-4 text-blue-600 shrink-0" />,
    <Zap key="3" className="w-4 h-4 text-amber-500 shrink-0" />,
  ];
  return defaultIcons[index % defaultIcons.length];
};

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  product,
  currency,
  isWishlisted,
  wishlistIds,
  onGoHome,
  onSelectCategory,
  onSelectProduct,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  onQuickView,
  onOpenPolicy,
}) => {
  // Gallery images combined
  const allImages = Array.from(
    new Set([
      product.image,
      ...(product.alternateImage ? [product.alternateImage] : []),
      ...(product.galleryImages || []),
    ])
  );

  const productVideos: ProductVideo[] =
    product.videos && product.videos.length > 0
      ? product.videos
      : product.videoUrl
      ? [{ title: `${product.name} Video Demonstration`, url: product.videoUrl }]
      : [];

  const mediaList: {
    type: "image" | "video";
    url: string;
    title?: string;
  }[] = [
    ...allImages.map((img) => ({ type: "image" as const, url: img })),
    ...productVideos.map((vid, idx) => ({
      type: "video" as const,
      url: vid.url,
      title: vid.title || `Demonstration Video ${idx + 1}`,
    })),
  ];

  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.colors?.[0]?.name
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes?.[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "description" | "features" | "specs" | "shipping"
  >("description");
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Lightbox / Image Zoom modal state
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // PIN Code Delivery Checker State
  const [pincodeInput, setPincodeInput] = useState("");
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [pincodeResult, setPincodeResult] = useState<PincodeValidationResult | null>(null);

  const handleCheckPincode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = pincodeInput.trim();

    if (!cleaned) {
      setPincodeResult({
        serviceable: false,
        status: "invalid_format",
        title: "Invalid PIN Code",
        message: "Please enter a valid 6-digit Indian PIN code.",
      });
      return;
    }

    setIsCheckingPincode(true);
    setPincodeResult(null);

    try {
      const result = await checkPincodeServiceability(cleaned);
      setPincodeResult(result);
    } catch (err) {
      setPincodeResult({
        serviceable: false,
        status: "unavailable",
        title: "Delivery Not Available",
        message: "Sorry, delivery is currently unavailable for this PIN code.",
      });
    } finally {
      setIsCheckingPincode(false);
    }
  };

  const currentMedia =
    mediaList[selectedMediaIndex] || mediaList[0] || { type: "image", url: product.image };
  const currentImage = currentMedia.type === "image" ? currentMedia.url : product.image;

  const handleNextMedia = () => {
    setSelectedMediaIndex((prev) => (prev + 1) % mediaList.length);
  };
  const handlePrevMedia = () => {
    setSelectedMediaIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
  };

  // Mobile Touch Swipe Handling (Smooth Left/Right swipe navigation)
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const minSwipeDistance = 40; // in px

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchStartXRef.current - touchEndX;
    const diffY = touchStartYRef.current - touchEndY;

    // Detect horizontal swipe intent (horizontal distance exceeds vertical distance)
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
      if (diffX > 0) {
        // Swiped Left -> Next Image
        handleNextMedia();
      } else {
        // Swiped Right -> Previous Image
        handlePrevMedia();
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // Share modal & feedback state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Variant selection error state
  const [variantError, setVariantError] = useState<string | null>(null);

  // Reset selected image and quantity when product changes
  useEffect(() => {
    setAllImagesReset();
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Funnel event: product_view
    trackFunnelEvent("product_view", {
      productId: product.id,
      productName: product.name,
      category: product.category,
      price: product.price,
      value: product.price,
    });
  }, [product.id]);

  const setAllImagesReset = () => {
    setSelectedMediaIndex(0);
    setSelectedColor(product.colors?.[0]?.name);
    setSelectedSize(product.sizes?.[0]);
    setQuantity(1);
    setVariantError(null);
  };

  const quantityOffers = getProductQuantityOffers(product);
  const isOfferConfigured = hasQuantityOffers(product);

  const currentItemSubtotal = calculateItemSubtotal(product, quantity);
  const formattedPrice = formatRupee(currentItemSubtotal);
  const bundleSavings = calculateBundleSavings(product, quantity);
  const perPiecePrice = calculatePerPiecePrice(product, quantity);
  const formattedPerPiecePrice = formatRupeeExact(perPiecePrice);

  const baseOriginalPrice = product.originalPrice
    ? product.originalPrice * quantity
    : null;
  const formattedOriginalPrice = baseOriginalPrice
    ? formatRupee(baseOriginalPrice)
    : null;
  const totalSavings = baseOriginalPrice
    ? baseOriginalPrice - currentItemSubtotal
    : bundleSavings;
  const savingsAmount = totalSavings > 0 ? formatRupee(totalSavings) : null;
  const discountPercent = baseOriginalPrice
    ? Math.round(((baseOriginalPrice - currentItemSubtotal) / baseOriginalPrice) * 100)
    : 0;

  const handleAddToCartClick = () => {
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      setVariantError("Please select a color variant");
      const el = document.getElementById("product-variants-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setVariantError("Please select a size variant");
      const el = document.getElementById("product-variants-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setVariantError(null);
    onAddToCart(product, selectedColor, selectedSize, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);

    // Funnel event: add_to_cart
    trackFunnelEvent("add_to_cart", {
      productId: product.id,
      productName: product.name,
      category: product.category,
      value: currentItemSubtotal,
      price: product.price,
      quantity,
    });
  };

  const handleBuyNowClick = () => {
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      setVariantError("Please select a color before proceeding");
      const el = document.getElementById("product-variants-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setVariantError("Please select a size before proceeding");
      const el = document.getElementById("product-variants-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setVariantError(null);

    // Funnel event: begin_checkout
    trackFunnelEvent("begin_checkout", {
      productId: product.id,
      productName: product.name,
      category: product.category,
      value: currentItemSubtotal,
      price: product.price,
      quantity,
      items: [
        {
          id: product.id,
          name: product.name,
          quantity,
          price: currentItemSubtotal,
        },
      ],
    });

    onBuyNow(product, quantity, selectedColor, selectedSize);
  };

  const scrollToReviews = () => {
    const el = document.getElementById("product-reviews-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleShare = async () => {
    const slug = getProductSlug(product);
    const origin = typeof window !== "undefined" ? window.location.origin : "https://zenviaco.in";
    const shareUrl = `${origin}/product/${slug}`;
    const shareTitle = `${product.name} | Zenvia`;
    const shareText = `Check out ${product.name} on Zenvia - ${product.tagline || product.description.slice(0, 80)}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.log("Web Share API failed, using share modal fallback:", err);
        } else {
          return;
        }
      }
    }

    setIsShareModalOpen(true);
  };

  // Filter Related Products (same category or bestsellers, excluding current product)
  const relatedProducts = PRODUCTS.filter(
    (p) => p.id !== product.id && (p.category === product.category || p.isBestseller)
  ).slice(0, 4);

  return (
    <div className="min-h-screen bg-neutral-50 pb-28 md:pb-16 pt-4">
      {/* Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Breadcrumb & Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 mb-4 text-xs text-neutral-600 border-b border-neutral-200">
          <nav className="flex items-center space-x-2 flex-wrap">
            <button
              onClick={onGoHome}
              className="hover:text-amber-600 transition-colors flex items-center space-x-1 font-medium cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-neutral-400" />
              <span>Home</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <button
              onClick={() => {
                onSelectCategory(product.category);
                onGoHome();
              }}
              className="hover:text-amber-600 transition-colors font-medium cursor-pointer"
            >
              {product.category}
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span className="font-bold text-neutral-900 truncate max-w-[200px] sm:max-w-xs">
              {product.name}
            </span>
          </nav>

          <button
            onClick={handleShare}
            className="flex items-center space-x-1.5 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-white border border-neutral-200 hover:border-neutral-300 px-3 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-600" />
            <span>{copiedLink ? "Link Copied!" : "Share Product"}</span>
          </button>
        </div>

        {/* ========================================================
            MAIN PRODUCT TWO-COLUMN SECTION (DESKTOP 2-COL, MOBILE 1-COL)
        ======================================================== */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm p-3 sm:p-6 lg:p-8 mb-8 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
            
            {/* LEFT COLUMN: Mobile-Optimized Image & Video Gallery & Carousel */}
            <div className="lg:col-span-6 flex flex-col space-y-3">
              {/* Main Media View box with touch controls */}
              <div
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="relative aspect-square sm:aspect-4/3 lg:aspect-square rounded-2xl bg-neutral-950 overflow-hidden border border-neutral-200 group flex items-center justify-center touch-pan-y select-none"
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
                    className="w-full h-full object-cover object-center transition-transform duration-300 cursor-pointer select-none"
                    onClick={() => setIsZoomOpen(true)}
                  />
                ) : (
                  <video
                    key={currentMedia.url}
                    src={currentMedia.url}
                    controls
                    playsInline
                    preload="metadata"
                    autoPlay={false}
                    className="w-full h-full object-contain bg-black select-none"
                  />
                )}

                {/* Badges overlay */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
                  {product.isBestseller && (
                    <span className="px-2.5 py-1 rounded-md bg-amber-500 text-white text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider shadow-md">
                      BESTSELLER
                    </span>
                  )}
                  {product.isNew && (
                    <span className="px-2.5 py-1 rounded-md bg-emerald-600 text-white text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider shadow-md">
                      NEW DROP
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="px-2.5 py-1 rounded-md bg-rose-600 text-white text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider shadow-md">
                      SAVE {discountPercent}%
                    </span>
                  )}
                  {currentMedia.type === "video" && (
                    <span className="px-2.5 py-1 rounded-md bg-amber-600 text-white text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider shadow-md flex items-center space-x-1">
                      <Video className="w-3 h-3" />
                      <span>VIDEO DEMO</span>
                    </span>
                  )}
                </div>

                {/* Numerical Slide Counter Badge e.g. "1 / 6" */}
                {mediaList.length > 1 && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-xs font-mono font-bold tracking-widest shadow-md z-10 select-none">
                    {selectedMediaIndex + 1} / {mediaList.length}
                  </div>
                )}

                {/* Interactive Slide Indicator Dots (Mobile & Desktop) */}
                {mediaList.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md z-10 shadow-md">
                    {mediaList.map((_, dotIdx) => {
                      const isDotActive = selectedMediaIndex === dotIdx;
                      return (
                        <button
                          key={dotIdx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMediaIndex(dotIdx);
                          }}
                          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                            isDotActive
                              ? "w-5 bg-amber-400"
                              : "w-1.5 bg-white/60 hover:bg-white"
                          }`}
                          aria-label={`Go to slide ${dotIdx + 1}`}
                        />
                      );
                    })}
                  </div>
                )}

                {/* Left/Right Desktop & Touch Nav Arrows */}
                {mediaList.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevMedia();
                      }}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 hover:bg-white text-neutral-800 shadow-md border border-neutral-200/80 transition-all cursor-pointer z-10 active:scale-90"
                      aria-label="Previous Media"
                    >
                      <ChevronLeft className="w-5 h-5 text-neutral-800" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextMedia();
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 hover:bg-white text-neutral-800 shadow-md border border-neutral-200/80 transition-all cursor-pointer z-10 active:scale-90"
                      aria-label="Next Media"
                    >
                      <ChevronRight className="w-5 h-5 text-neutral-800" />
                    </button>
                  </>
                )}

                {/* Zoom indicator button (for images) */}
                {currentMedia.type === "image" && (
                  <button
                    onClick={() => setIsZoomOpen(true)}
                    className="absolute bottom-3 right-3 p-2 rounded-xl bg-white/90 hover:bg-white text-neutral-800 shadow-md border border-neutral-200/80 transition-all cursor-pointer flex items-center space-x-1 text-xs font-semibold z-10"
                    title="Click to Zoom Image"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-[11px] font-bold">Zoom</span>
                  </button>
                )}
              </div>

              {/* Gallery Thumbnails Horizontal Scroll Row */}
              {mediaList.length > 1 && (
                <div className="flex items-center space-x-2.5 overflow-x-auto pb-1 pt-1 scrollbar-none snap-x">
                  {mediaList.map((item, idx) => {
                    const isSelected = selectedMediaIndex === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedMediaIndex(idx)}
                        className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer snap-start ${
                          isSelected
                            ? "border-amber-500 shadow-sm ring-2 ring-amber-400/30 scale-100"
                            : "border-neutral-200 hover:border-neutral-300 opacity-75 hover:opacity-100"
                        }`}
                      >
                        {item.type === "image" ? (
                          <img
                            src={item.url}
                            alt={`${product.name} thumbnail ${idx + 1}`}
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover object-center"
                          />
                        ) : (
                          <div className="relative w-full h-full bg-neutral-900 flex flex-col items-center justify-center overflow-hidden">
                            <img
                              src={product.image}
                              alt={item.title || "Video thumbnail"}
                              loading="lazy"
                              decoding="async"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover opacity-40"
                            />
                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-1">
                              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shadow-md">
                                <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-neutral-950 ml-0.5 text-neutral-950" />
                              </div>
                              <span className="text-[8px] sm:text-[9px] font-black text-amber-300 uppercase tracking-tight mt-0.5 bg-black/70 px-1 rounded">
                                VIDEO
                              </span>
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Visual Quality Guarantee Box */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 flex items-center justify-between text-xs text-neutral-700">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold text-[11px] sm:text-xs">100% Quality Inspected Before Dispatch</span>
                </div>
                <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                  Zenvia Express
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN: Product Details, Price, Benefits, Actions */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
              <div>
                {/* Category Tag */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-md">
                    {product.category}
                  </span>

                  <button
                    onClick={scrollToReviews}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 underline decoration-amber-400/80 cursor-pointer flex items-center space-x-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                    <span>See All Reviews</span>
                  </button>
                </div>

                {/* Product Title - Prominent & Compact for Mobile */}
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-neutral-900 tracking-tight leading-snug mb-2">
                  {product.name}
                </h1>

                {/* Rating & Social Proof - Immediately Below Title */}
                <div className="flex items-center space-x-2 mb-3 cursor-pointer" onClick={scrollToReviews}>
                  <div className="flex items-center space-x-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs font-black text-neutral-900 ml-1">{product.rating}</span>
                    <span className="text-xs text-neutral-500 font-bold">/ 5</span>
                  </div>
                  <span className="text-xs text-neutral-600 font-semibold underline decoration-neutral-300">
                    {product.reviewCount} verified ratings
                  </span>
                </div>

                {/* Short Tagline */}
                <p className="text-xs sm:text-sm text-neutral-600 font-medium mb-4 leading-relaxed">
                  {product.tagline}
                </p>

                {/* Pricing Box - Highly Visible */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 mb-4">
                  <div className="flex flex-wrap items-baseline gap-2 mb-1">
                    <span className="text-2xl sm:text-3xl font-black text-neutral-900">{formattedPrice}</span>
                    {quantity > 1 && (
                      <span className="text-xs sm:text-sm font-bold text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-md">
                        ({formattedPerPiecePrice} / pc)
                      </span>
                    )}
                    {formattedOriginalPrice && (
                      <span className="text-xs sm:text-sm font-semibold text-neutral-400 line-through">
                        {formattedOriginalPrice}
                      </span>
                    )}
                    {savingsAmount && (
                      <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md">
                        Save {savingsAmount} {bundleSavings > 0 ? `(Includes ₹${bundleSavings} Bulk Off)` : `(${discountPercent}% OFF)`}
                      </span>
                    )}
                  </div>

                  {/* 🔥 LIMITED-TIME DEAL Countdown Timer */}
                  <div className="my-2.5">
                    <PromotionCountdownBadge variant="product-page" />
                  </div>

                  {/* Free Delivery Across India Badge */}
                  <div className="mt-2 pt-2 border-t border-amber-200/60">
                    <div className="text-xs sm:text-sm font-extrabold text-emerald-800 flex items-center space-x-1.5">
                      <span>Free Delivery Across India 🚚</span>
                    </div>
                  </div>

                  <p className="text-[11px] font-medium text-neutral-700 flex items-center space-x-1.5 mt-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Inclusive of all taxes • Fast dispatch across India</span>
                  </p>
                </div>

                {/* VALUE PROPOSITION: 4 Product-Specific Benefit Bullets with Icons */}
                {(() => {
                  const activeHighlights =
                    product.keyHighlights && product.keyHighlights.length > 0
                      ? product.keyHighlights
                      : DEFAULT_PRODUCT_HIGHLIGHTS;
                  return (
                    <div id="product-key-highlights" className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 mb-4 space-y-2 text-xs">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-500 block mb-1">
                        Key Highlights
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-800 font-bold">
                        {activeHighlights.map((highlight, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            {getHighlightIcon(highlight, idx)}
                            <span className="leading-snug">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* TRUST STRIP - Compact Mobile Trust Indicators */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-[11px] font-bold text-neutral-700">
                  <div className="p-2 bg-emerald-50/60 border border-emerald-200/70 rounded-lg flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span className="leading-tight">Secure Payment</span>
                  </div>
                  <div className="p-2 bg-emerald-50/60 border border-emerald-200/70 rounded-lg flex items-center space-x-1.5">
                    <Truck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span className="leading-tight">Fast Shipping</span>
                  </div>
                  <div className="p-2 bg-emerald-50/60 border border-emerald-200/70 rounded-lg flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span className="leading-tight">COD Available</span>
                  </div>
                </div>

                {/* PIN CODE DELIVERY CHECKER SECTION */}
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/90 mb-5">
                  <div className="flex items-center space-x-1.5 mb-2">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-extrabold text-neutral-900 uppercase tracking-wider">
                      Check Delivery to Your PIN Code
                    </span>
                  </div>

                  <form onSubmit={handleCheckPincode} className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Enter 6-digit PIN code (e.g. 110001)"
                        value={pincodeInput}
                        onChange={(e) => {
                          setPincodeInput(e.target.value.replace(/\D/g, ""));
                          if (pincodeResult) setPincodeResult(null);
                        }}
                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isCheckingPincode}
                      className="px-4 py-2 bg-neutral-900 hover:bg-black text-white rounded-lg text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer shrink-0 disabled:opacity-70 flex items-center justify-center space-x-1.5"
                    >
                      {isCheckingPincode ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                          <span>Checking delivery...</span>
                        </>
                      ) : (
                        <span>Check</span>
                      )}
                    </button>
                  </form>

                  {/* PIN Code Verification Output */}
                  {pincodeResult && pincodeResult.serviceable && (
                    <div className="mt-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1.5 animate-fadeIn">
                      <div className="font-black text-emerald-900 flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>✓ Delivery Available</span>
                      </div>
                      <p className="text-[12px] font-semibold text-emerald-800 pl-5.5">
                        {pincodeResult.message}
                      </p>
                      {pincodeResult.location && (
                        <div className="text-[11px] text-emerald-900 font-medium pl-5.5 flex items-center space-x-1">
                          <span>📍 Delivering to: <strong>{pincodeResult.location}</strong></span>
                        </div>
                      )}
                      <div className="text-[11px] text-emerald-800 font-medium pl-5.5">
                        ✓ Fast &amp; Reliable Delivery Across India
                      </div>
                      <div className="text-[11px] text-emerald-800 font-medium pl-5.5">
                        ✓ Cash on Delivery (COD) Available
                      </div>
                    </div>
                  )}

                  {pincodeResult && !pincodeResult.serviceable && (
                    <div className="mt-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-1 animate-fadeIn">
                      <div className="font-black text-rose-800 flex items-center space-x-1.5">
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{pincodeResult.status === "invalid_format" ? "✕ Invalid PIN Code" : "✕ Delivery Not Available"}</span>
                      </div>
                      <p className="text-[12px] font-semibold text-rose-700 pl-5.5">
                        {pincodeResult.message}
                      </p>
                    </div>
                  )}
                </div>

                {/* Stock Status */}
                <div className="flex items-center space-x-2 text-xs mb-5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="font-extrabold text-emerald-800">In Stock</span>
                  <span className="text-neutral-400">•</span>
                  <span className="text-neutral-600">
                    {product.stockCount ? `${product.stockCount} units available for instant dispatch` : "Ready to Ship"}
                  </span>
                </div>

                {/* Color & Size Variants (if available) */}
                {(product.colors?.length || product.sizes?.length) ? (
                  <div id="product-variants-section" className="scroll-mt-28">
                    {/* Color Variants (if available) */}
                    {product.colors && product.colors.length > 0 && (
                      <div className="mb-5 space-y-2">
                        <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-800 block">
                          Color: <span className="text-amber-700 font-bold">{selectedColor}</span>
                        </label>
                        <div className="flex items-center space-x-2.5">
                          {product.colors.map((c) => (
                            <button
                              key={c.name}
                              onClick={() => {
                                setSelectedColor(c.name);
                                setVariantError(null);
                              }}
                              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                                selectedColor === c.name
                                  ? "border-amber-500 bg-amber-50 text-neutral-900 shadow-sm ring-1 ring-amber-400"
                                  : "border-neutral-200 hover:border-neutral-300 text-neutral-700"
                              }`}
                            >
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-neutral-300 inline-block"
                                style={{ backgroundColor: c.hex }}
                              />
                              <span>{c.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Size Variants (if available) */}
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="mb-5 space-y-2">
                        <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-800 block">
                          Size: <span className="text-amber-700 font-bold">{selectedSize}</span>
                        </label>
                        <div className="flex items-center space-x-2">
                          {product.sizes.map((s) => (
                            <button
                              key={s}
                              onClick={() => {
                                setSelectedSize(s);
                                setVariantError(null);
                              }}
                              className={`px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                                selectedSize === s
                                  ? "border-amber-500 bg-amber-50 text-neutral-900 shadow-sm ring-1 ring-amber-400"
                                  : "border-neutral-200 hover:border-neutral-300 text-neutral-700"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* UNIVERSAL QUANTITY-BASED BUNDLE OFFERS (BUY MORE, SAVE MORE) */}
                {isOfferConfigured && quantityOffers && quantityOffers.length > 0 && (
                  <div className="mb-6 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-900 flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Buy More, Save More</span>
                      </label>
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-100/90 border border-amber-200 px-2 py-0.5 rounded-md">
                        Special Quantity Offer
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {quantityOffers.map((tier) => {
                        const isSelected = quantity === tier.quantity;
                        const perPieceFormatted = formatRupeeExact(tier.perPiecePrice || (tier.totalPrice / tier.quantity));
                        const unitLabel = tier.label || (tier.quantity === 1 ? "1 UNIT" : `${tier.quantity} UNITS`);
                        const badgeText = tier.badge || (tier.isBestValue ? "BEST VALUE" : tier.isPopular ? "MOST POPULAR" : undefined);

                        return (
                          <div
                            key={tier.quantity}
                            onClick={() => setQuantity(tier.quantity)}
                            className={`relative p-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between select-none ${
                              isSelected
                                ? "border-amber-600 bg-gradient-to-b from-amber-50/95 to-amber-100/50 shadow-md ring-2 ring-amber-500/20"
                                : tier.isBestValue
                                ? "border-emerald-200 bg-emerald-50/30 hover:border-emerald-400 hover:bg-emerald-50/60"
                                : tier.isPopular
                                ? "border-amber-200 bg-amber-50/30 hover:border-amber-400 hover:bg-amber-50/60"
                                : "border-neutral-200/90 bg-white hover:border-amber-300 hover:bg-neutral-50/80"
                            }`}
                          >
                            {/* Prominent Badge for strongest offers */}
                            {badgeText && (
                              <div className="absolute -top-2.5 right-2.5">
                                <span
                                  className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm flex items-center space-x-1 ${
                                    tier.isBestValue || badgeText.toUpperCase().includes("VALUE")
                                      ? "bg-emerald-600 text-white ring-1 ring-white"
                                      : "bg-amber-600 text-white ring-1 ring-white"
                                  }`}
                                >
                                  <Sparkles className="w-2.5 h-2.5 fill-white" />
                                  <span>{badgeText}</span>
                                </span>
                              </div>
                            )}

                            <div>
                              {/* Header & Radio */}
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-black uppercase tracking-wider text-neutral-900">
                                  {unitLabel}
                                </span>
                                <div
                                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    isSelected
                                      ? "border-amber-600 bg-amber-600 text-white"
                                      : "border-neutral-300 bg-white"
                                  }`}
                                >
                                  {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                </div>
                              </div>

                              {/* Total Bundle Price */}
                              <div className="text-lg font-black text-neutral-900 tracking-tight leading-tight">
                                {formatRupee(tier.totalPrice)}
                              </div>

                              {/* Per-piece breakdown */}
                              {tier.quantity > 1 ? (
                                <div className="text-[11px] font-semibold text-neutral-600 mt-0.5">
                                  {perPieceFormatted} per item
                                </div>
                              ) : (
                                <div className="text-[11px] font-semibold text-neutral-500 mt-0.5">
                                  Standard Pack
                                </div>
                              )}
                            </div>

                            {/* Savings callout */}
                            <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between">
                              {tier.savings && tier.savings > 0 ? (
                                <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded">
                                  SAVE ₹{tier.savings}
                                </span>
                              ) : (
                                <span className="text-[10px] text-neutral-400 font-semibold">
                                  Standard Price
                                </span>
                              )}
                              {isSelected && (
                                <span className="text-[10px] font-bold text-amber-700">
                                  Selected
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="mb-6 space-y-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-800 block">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-3">
                    <div className="inline-flex items-center border border-neutral-300 rounded-xl bg-neutral-50 overflow-hidden">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="p-2.5 text-neutral-700 hover:bg-neutral-200 transition-colors disabled:opacity-40 cursor-pointer"
                        disabled={quantity <= 1}
                        title="Decrease Quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center text-sm font-extrabold text-neutral-900">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => q + 1)}
                        className="p-2.5 text-neutral-700 hover:bg-neutral-200 transition-colors cursor-pointer"
                        title="Increase Quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <span className="text-xs text-neutral-500 font-medium">
                      Subtotal: <strong className="text-neutral-900 font-extrabold">{formattedPrice}</strong>
                    </span>
                  </div>
                </div>

                {/* Main Action Buttons: Buy Now & Add to Cart */}
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Buy Now Button */}
                    <button
                      onClick={handleBuyNowClick}
                      className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <Zap className="w-4 h-4 text-amber-200 fill-amber-200" />
                      <span>Buy Now – {formattedPrice}</span>
                    </button>

                    {/* Add to Cart Button */}
                    <button
                      onClick={handleAddToCartClick}
                      className={`w-full py-4 px-6 rounded-xl font-extrabold text-sm uppercase tracking-wider border-2 flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer ${
                        addedSuccess
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "bg-neutral-900 hover:bg-black border-neutral-900 text-white shadow-md"
                      }`}
                    >
                      {addedSuccess ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span>Added to Cart!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Secondary Actions: Wishlist & Share */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => onToggleWishlist(product)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                        isWishlisted
                          ? "bg-rose-50 border-rose-300 text-rose-700"
                          : "bg-white border-neutral-200 hover:border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? "fill-rose-600 text-rose-600" : ""}`} />
                      <span>{isWishlisted ? "In Wishlist" : "Save to Wishlist"}</span>
                    </button>

                    <button
                      onClick={handleShare}
                      className="py-2.5 px-3 rounded-xl border border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm"
                    >
                      <Share2 className="w-4 h-4 text-amber-600" />
                      <span>Share Product</span>
                    </button>
                  </div>

                  {/* Social Proof Review Snippet */}
                  <div
                    onClick={scrollToReviews}
                    className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start space-x-3 cursor-pointer hover:bg-amber-100/60 transition-colors"
                  >
                    <div className="flex text-amber-400 shrink-0 mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <div className="text-xs">
                      <span className="font-extrabold text-neutral-900 block leading-snug">
                        {product.id === "p12"
                          ? '"Good quality product, good in strength and full size for my car window!"'
                          : `"Rated ${product.rating || 5.0}/5 stars by verified shoppers"`}
                      </span>
                      <span className="text-[11px] text-neutral-600 font-medium flex items-center space-x-1 mt-0.5">
                        <span>{product.reviewCount || 3} customer reviews</span>
                        <span>•</span>
                        <span className="text-amber-800 underline font-bold">Read all reviews</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Clean Trust-Benefit Cards */}
              <div className="pt-4 border-t border-neutral-200 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-neutral-800">
                  <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200/70 flex flex-col items-center justify-center space-y-1">
                    <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-[11px] font-bold leading-tight">Secure Checkout</span>
                  </div>
                  <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200/70 flex flex-col items-center justify-center space-y-1">
                    <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-[11px] font-bold leading-tight">Fast Pan-India Delivery</span>
                  </div>
                  <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200/70 flex flex-col items-center justify-center space-y-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-[11px] font-bold leading-tight">Easy Ordering</span>
                  </div>
                  <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200/70 flex flex-col items-center justify-center space-y-1">
                    <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-[11px] font-bold leading-tight">Customer Support</span>
                  </div>
                </div>

                {/* Pan-India Shipping Notice */}
                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-amber-700 shrink-0" />
                    <span className="font-bold">🚚 Delivery Available Across India</span>
                  </div>
                  <span className="text-[11px] text-amber-900/80">
                    Delivery times may vary depending on your location.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            "WHY YOU NEED THIS" & PROBLEM-SOLUTION CALLOUT
        ======================================================== */}
        {product.whyYouNeedThis && (
          <div className="bg-gradient-to-br from-amber-950 via-neutral-900 to-black text-white rounded-2xl border border-amber-500/30 p-6 sm:p-10 mb-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-extrabold uppercase tracking-widest border border-amber-400/30 mb-4">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Why You Need This</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
                {product.whyYouNeedThis.headline}
              </h2>
              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed mb-6 font-medium">
                {product.whyYouNeedThis.description}
              </p>
              {product.whyYouNeedThis.callout && (
                <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-amber-500 text-neutral-950 shrink-0 font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-amber-200">
                    {product.whyYouNeedThis.callout}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            BEFORE vs AFTER VISUAL COMPARISON
        ======================================================== */}
        {product.beforeAfterStory && (
          <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm p-6 sm:p-8 mb-8">
            <div className="text-center max-w-xl mx-auto mb-6">
              <span className="text-xs font-extrabold text-amber-800 uppercase tracking-widest bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-md">
                Proven Difference
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 mt-2">
                {product.id === "p12" ? "Before & After Solar Shield Protection" : `Before & After with ${product.name}`}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* WITHOUT */}
              <div className="p-5 sm:p-6 rounded-xl bg-rose-50/70 border border-rose-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-rose-700 font-extrabold text-xs uppercase tracking-wider mb-2">
                    <Flame className="w-4 h-4 text-rose-600" />
                    <span>{product.beforeAfterStory.beforeTitle}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-800 font-medium leading-relaxed">
                    {product.beforeAfterStory.beforeText}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-rose-200/80 flex items-center space-x-2 text-[11px] font-extrabold text-rose-800">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>
                    {product.beforeAfterStory.beforeNote ||
                      (product.id === "p12"
                        ? "Cabin Temperature can reach 60°C+ under direct sun"
                        : "Inefficient and prone to daily friction")}
                  </span>
                </div>
              </div>

              {/* WITH ZENVIA */}
              <div className="p-5 sm:p-6 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-emerald-800 font-extrabold text-xs uppercase tracking-wider mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{product.beforeAfterStory.afterTitle}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-800 font-medium leading-relaxed">
                    {product.beforeAfterStory.afterText}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-emerald-200/80 flex items-center space-x-2 text-[11px] font-extrabold text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>
                    {product.beforeAfterStory.afterNote ||
                      (product.id === "p12"
                        ? "Protects dashboard, steering wheel & seats from heat damage"
                        : "Streamlined, effortless, and reliably protected")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            HOW TO USE STEP-BY-STEP GUIDE
        ======================================================== */}
        {product.howToUse && product.howToUse.length > 0 && (
          <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm p-6 sm:p-8 mb-8">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-xs font-extrabold text-amber-800 uppercase tracking-widest bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-md">
                Effortless Operation
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 mt-2">
                How To Use in 3 Simple Steps
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {product.howToUse.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex flex-col items-center text-center space-y-3"
                >
                  <div className="w-9 h-9 rounded-full bg-amber-500 text-neutral-950 font-black text-sm flex items-center justify-center shadow-md">
                    {step.stepNumber}
                  </div>
                  {step.image && (
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-40 object-cover rounded-xl border border-neutral-200 shadow-sm"
                    />
                  )}
                  <h3 className="text-sm font-extrabold text-neutral-900">{step.title}</h3>
                  <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            IMAGE + BENEFIT BREAKDOWN SECTIONS (Dynamic per Product)
        ======================================================== */}
        {((product.featureSpotlights && product.featureSpotlights.length > 0) || product.id === "p12") && (
          <div className="space-y-6 mb-8">
            {(product.featureSpotlights && product.featureSpotlights.length > 0
              ? product.featureSpotlights
              : [
                  {
                    badge: "01. Solar Shield",
                    title: "Blocks Harsh Sunlight & UV Rays",
                    description:
                      "The multi-layered composite canopy reflects intense solar radiation before it enters your car, keeping dashboard temperature drastically lower and protecting electronics.",
                    image: "https://m.media-amazon.com/images/I/71+Fd3P0SUL._SL1500_.jpg",
                  },
                  {
                    badge: "02. Rapid Setup",
                    title: "5-Second Push-Up Installation",
                    description:
                      "No suction cups or messy marks. Simply press open like a pocket umbrella, place against the inner windshield, and lower your car's sun visors to hold it firmly in position.",
                    image: "https://m.media-amazon.com/images/I/61gphzv6IRL._SL1024_.jpg",
                  },
                  {
                    badge: "03. Compact Storage",
                    title: "Folds Away into Door Pocket",
                    description:
                      "When ready to drive, collapse the umbrella with one press, wrap the velcro strap, and slide it into the leatherette storage sleeve. Fits easily inside your driver door pocket.",
                    image: "https://m.media-amazon.com/images/I/61PEd4JPXzL._SL1024_.jpg",
                  },
                ]
            ).map((spotlight, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm p-5 sm:p-8 overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div
                    className={`relative aspect-4/3 rounded-2xl overflow-hidden border border-neutral-200 ${
                      idx % 2 === 1 ? "order-1 md:order-2" : "order-1 md:order-1"
                    }`}
                  >
                    <img
                      src={spotlight.image}
                      alt={spotlight.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    {spotlight.badge && (
                      <span className="absolute top-3 left-3 px-3 py-1 bg-amber-500 text-neutral-950 font-black text-xs rounded-lg uppercase tracking-wider shadow-md">
                        {spotlight.badge}
                      </span>
                    )}
                  </div>
                  <div
                    className={`space-y-2 ${
                      idx % 2 === 1 ? "order-2 md:order-1" : "order-2 md:order-2"
                    }`}
                  >
                    <h3 className="text-lg sm:text-xl font-black text-neutral-900">
                      {spotlight.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed">
                      {spotlight.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========================================================
            22-HOUR LIMITED-TIME OFFER COUNTDOWN AD GRAPHIC (Sink Caddy)
        ======================================================== */}
        {(product.id === "p13" || product.slug?.includes("sink-caddy") || product.name.toLowerCase().includes("sink caddy")) && (
          <div className="mb-10">
            <SinkCaddyCountdownAdGraphic onShopNow={handleBuyNowClick} />
          </div>
        )}

        {/* ========================================================
            VISUAL SOCIAL-PROOF GALLERY (Kitchen Sink Caddy Only)
        ======================================================== */}
        {(product.id === "p13" || product.slug?.includes("sink-caddy") || product.name.toLowerCase().includes("sink caddy")) && (
          <div className="mb-8">
            <SinkCaddySocialProofGallery />
          </div>
        )}

        {/* ========================================================
            CUSTOMER REVIEWS & SOCIAL PROOF SECTION
        ======================================================== */}
        <div id="product-reviews-section" className="scroll-mt-24 mb-10 bg-white rounded-2xl border border-neutral-200/90 shadow-sm p-6 sm:p-8">
          <ProductReviewsSection product={product} />
        </div>

        {/* ========================================================
            FREQUENTLY ASKED QUESTIONS (FAQ)
        ======================================================== */}
        {product.faqs && product.faqs.length > 0 && (
          <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm p-6 sm:p-8 mb-8">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-xs font-extrabold text-amber-800 uppercase tracking-widest bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-md">
                Got Questions?
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 mt-2">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="max-w-3xl mx-auto space-y-3">
              {product.faqs.map((faq, idx) => (
                <FAQAccordionItem key={idx} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            STRUCTURED PRODUCT INFORMATION TABS & ACCORDION
        ======================================================== */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm overflow-hidden mb-12">
          {/* Tab Navigation Header */}
          <div className="flex items-center overflow-x-auto border-b border-neutral-200 bg-neutral-50/80 scrollbar-none">
            {[
              { id: "description", label: "Product Description" },
              { id: "features", label: "Key Features" },
              { id: "specs", label: "Specifications" },
              { id: "shipping", label: "Delivery Information" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-4 text-xs font-extrabold uppercase tracking-wider shrink-0 transition-all cursor-pointer border-b-2 ${
                  activeTab === tab.id
                    ? "border-amber-500 text-amber-800 bg-white"
                    : "border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content Box */}
          <div className="p-6 sm:p-8">
            {/* 1. Description */}
            {activeTab === "description" && (
              <div className="space-y-6 max-w-4xl text-neutral-700 text-sm leading-relaxed">
                <div>
                  <h3 className="text-base font-extrabold text-neutral-900 mb-2">
                    Overview
                  </h3>
                  <p className="mb-4">{product.description}</p>
                </div>

                {product.craftsmanshipStory && (
                  <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                    <h4 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Behind The Design</span>
                    </h4>
                    <p className="text-xs text-neutral-800 font-medium italic">
                      "{product.craftsmanshipStory}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 2. Key Features */}
            {activeTab === "features" && (
              <div className="max-w-4xl">
                <h3 className="text-base font-extrabold text-neutral-900 mb-4">
                  Key Features & Highlights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.features?.map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-start space-x-3"
                    >
                      <div className="p-1 rounded-full bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-neutral-800">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Specifications & What's Included */}
            {activeTab === "specs" && (
              <div className="max-w-4xl space-y-6">
                <div>
                  <h3 className="text-base font-extrabold text-neutral-900 mb-3">
                    Technical Specifications
                  </h3>
                  <div className="border border-neutral-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <tbody className="divide-y divide-neutral-200">
                        {product.specs?.map((s, idx) => (
                          <tr
                            key={idx}
                            className={idx % 2 === 0 ? "bg-white" : "bg-neutral-50"}
                          >
                            <td className="px-4 py-3 font-extrabold text-neutral-800 w-1/3">
                              {s.label}
                            </td>
                            <td className="px-4 py-3 text-neutral-600 font-medium">
                              {s.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-2">
                  <h4 className="text-xs font-extrabold text-neutral-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <Package className="w-4 h-4 text-amber-600" />
                    <span>What's Included in the Box</span>
                  </h4>
                  <p className="text-xs text-neutral-700 font-medium">
                    1 x {product.name}, User Manual & Setup Guide, Protective Cushion Packaging.
                  </p>
                </div>
              </div>
            )}

            {/* 4. Shipping & Delivery Info */}
            {activeTab === "shipping" && (
              <div className="max-w-4xl space-y-4 text-xs text-neutral-700 leading-relaxed">
                <h3 className="text-base font-extrabold text-neutral-900">
                  Fast &amp; Reliable Delivery Across India
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1">
                    <span className="font-extrabold text-neutral-900 block text-sm">
                      Delivery Across Eligible Locations
                    </span>
                    <p className="text-neutral-600">
                      We deliver to serviceable PIN codes across all states and Union Territories in India. Your order will be delivered to the address provided during checkout.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1">
                    <span className="font-extrabold text-neutral-900 block text-sm">
                      Secure &amp; Insured Packaging
                    </span>
                    <p className="text-neutral-600">
                      Every item is thoroughly inspected, sealed in tamper-evident protective packaging, and handled with care until doorstep delivery.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium">
                  <strong>Cash on Delivery (COD) &amp; UPI Available:</strong> Free Delivery Across India 🚚 on all orders. Delivery details and tracking updates will be provided as soon as they become available.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================
            "WHY SHOP WITH ZENVIA?" BRAND TRUST SECTION
        ======================================================== */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm p-6 sm:p-8 mb-8">
          <div className="text-center max-w-xl mx-auto mb-6">
            <span className="text-xs font-extrabold text-amber-800 uppercase tracking-widest bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-md">
              Trust &amp; Reliability
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 mt-2">
              Why Shop with Zenvia?
            </h2>
            <p className="text-xs text-neutral-600 mt-1 font-medium">
              "Zenvia — Smart products for a better everyday life."
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/70 space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                🛍
              </div>
              <h3 className="text-xs font-extrabold text-neutral-900">Carefully Selected Products</h3>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                We focus on practical products designed to make everyday life easier.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/70 space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                📦
              </div>
              <h3 className="text-xs font-extrabold text-neutral-900">Pan-India Delivery</h3>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                Orders can be delivered across India to all serviceable locations.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/70 space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                💬
              </div>
              <h3 className="text-xs font-extrabold text-neutral-900">Customer Support</h3>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                Have a question about your order? Contact our dedicated support team.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/70 space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                🔒
              </div>
              <h3 className="text-xs font-extrabold text-neutral-900">Secure Website</h3>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                Your information is transmitted through a secure 256-bit HTTPS connection.
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================
            "NEED HELP?" CUSTOMER SUPPORT SECTION
        ======================================================== */}
        <div className="bg-amber-50/60 rounded-2xl border border-amber-200/80 p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-extrabold text-amber-800 uppercase tracking-widest bg-amber-100 px-2.5 py-0.5 rounded">
              Customer Care
            </span>
            <h3 className="text-lg font-black text-neutral-900">
              Need help with your order?
            </h3>
            <p className="text-xs text-neutral-600 max-w-md font-medium">
              Our support team is here to help with order inquiries, product guidance, or tracking updates.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-medium text-neutral-700">
              <span className="flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-700" />
                <a
                  href="mailto:zenviashopindia@gmail.com"
                  className="font-bold text-neutral-900 hover:text-amber-800 transition-colors underline decoration-neutral-300 underline-offset-2"
                >
                  zenviashopindia@gmail.com
                </a>
              </span>
              <span className="text-neutral-400">•</span>
              <span>Mon – Sat, 9:00 AM – 6:00 PM IST</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenPolicy?.("contact")}
            className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 shadow-sm"
          >
            Contact Us
          </button>
        </div>

        {/* ========================================================
            RELATED PRODUCTS / YOU MAY ALSO LIKE (Suppressed on Kitchen Sink Caddy page)
        ======================================================== */}
        {relatedProducts.length > 0 && product.id !== "prod-kitchen-sink-caddy" && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-neutral-900">
                  You May Also Like
                </h2>
                <p className="text-xs text-neutral-500 font-medium">
                  Explore complementary utility gadgets and trending finds from {product.category}
                </p>
              </div>

              <button
                onClick={onGoHome}
                className="text-xs font-extrabold text-amber-700 hover:text-amber-800 underline cursor-pointer"
              >
                View Full Catalog
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct) => (
                <ProductCard
                  key={relProduct.id}
                  product={relProduct}
                  currency={currency}
                  isWishlisted={wishlistIds.includes(relProduct.id)}
                  onToggleWishlist={onToggleWishlist}
                  onQuickView={(p) => {
                    onSelectProduct(p);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  onAddToCart={(p) => onAddToCart(p)}
                  onBuyNow={(p) => onBuyNow(p, 1)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          STICKY MOBILE BOTTOM "BUY NOW" PURCHASE BAR
      ======================================================== */}
      <div
        id="sticky-mobile-buy-bar"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-neutral-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center justify-between gap-3.5 max-w-lg mx-auto">
          {/* Left: Dynamic Price & Delivery Indicator */}
          <div className="flex flex-col justify-center shrink-0">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-xl font-black text-neutral-900 tracking-tight leading-none">
                {formattedPrice}
              </span>
              {formattedOriginalPrice && (
                <span className="text-xs text-neutral-400 line-through font-semibold">
                  {formattedOriginalPrice}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1 mt-0.5">
              <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-tight flex items-center space-x-0.5">
                <span>Free Delivery Across India 🚚</span>
              </span>
              {bundleSavings > 0 && (
                <>
                  <span className="text-neutral-300 text-[10px]">•</span>
                  <span className="text-[9px] font-extrabold text-amber-800 bg-amber-100 px-1 rounded">
                    Save ₹{bundleSavings}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right: High-Visibility BUY NOW CTA Button */}
          <button
            type="button"
            id="mobile-sticky-buy-now-btn"
            onClick={handleBuyNowClick}
            className="flex-1 min-h-[48px] h-[48px] py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-neutral-950 font-black text-sm uppercase tracking-wider shadow-md hover:shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-neutral-950 text-neutral-950 shrink-0" />
            <span className="font-black">BUY NOW</span>
          </button>
        </div>

        {/* Variant selection error notice if missing selection */}
        {variantError && (
          <div className="mt-1 text-[11px] font-bold text-rose-600 text-center animate-fadeIn">
            {variantError}
          </div>
        )}
      </div>

      {/* ========================================================
          LIGHTBOX IMAGE ZOOM MODAL
      ======================================================== */}
      <AnimatePresence>
        {isZoomOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center"
            >
              <button
                onClick={() => setIsZoomOpen(false)}
                className="absolute top-2 right-2 p-2 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 transition-colors z-10 cursor-pointer shadow-lg"
                title="Close Zoom"
              >
                <X className="w-6 h-6" />
              </button>

              <img
                src={currentImage}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="max-h-[80vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl"
              />

              <div className="mt-4 text-center text-white">
                <h3 className="text-sm font-bold">{product.name}</h3>
                <p className="text-xs text-neutral-400">High Resolution Inspection View</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ========================================================
          SHARE PRODUCT MODAL / DESKTOP FALLBACK
      ======================================================== */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md bg-white rounded-2xl border border-neutral-200 shadow-2xl p-6 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/60">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-neutral-900">Share Product</h3>
                    <p className="text-[11px] text-neutral-500 font-medium">Spread the word or save for later</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Product Preview Snippet */}
              <div className="my-4 p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 flex items-center space-x-3">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover border border-neutral-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-neutral-900 truncate">{product.name}</h4>
                  <p className="text-[11px] font-semibold text-amber-700">{formattedPrice}</p>
                </div>
              </div>

              {/* Copy Direct URL Bar */}
              <div className="mb-5 space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-600 block">
                  Product Link
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== "undefined" ? window.location.origin : "https://zenviaco.in"}/product/${getProductSlug(product)}`}
                    className="flex-1 px-3 py-2 bg-neutral-100 border border-neutral-300 rounded-xl text-xs font-mono text-neutral-800 focus:outline-none select-all"
                  />
                  <button
                    onClick={async () => {
                      const shareUrl = `${typeof window !== "undefined" ? window.location.origin : "https://zenviaco.in"}/product/${getProductSlug(product)}`;
                      if (navigator.clipboard) {
                        await navigator.clipboard.writeText(shareUrl);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2500);
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                      copiedLink
                        ? "bg-emerald-600 text-white"
                        : "bg-neutral-900 hover:bg-black text-white shadow-sm"
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Social Share Channel Grid */}
              <div className="space-y-2">
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-600 block">
                  Share via Social
                </label>

                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  {/* WhatsApp */}
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out ${product.name} on Zenvia: ${typeof window !== "undefined" ? window.location.origin : "https://zenviaco.in"}/product/${getProductSlug(product)}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>

                  {/* Facebook */}
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${typeof window !== "undefined" ? window.location.origin : "https://zenviaco.in"}/product/${getProductSlug(product)}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                    <span>Facebook</span>
                  </a>

                  {/* X / Twitter */}
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${typeof window !== "undefined" ? window.location.origin : "https://zenviaco.in"}/product/${getProductSlug(product)}`)}&text=${encodeURIComponent(`Check out ${product.name} on Zenvia`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl border border-neutral-200 bg-neutral-100 text-neutral-800 hover:bg-neutral-200 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-neutral-700" />
                    <span>X / Twitter</span>
                  </a>

                  {/* Instagram / Copy Link */}
                  <button
                    onClick={async () => {
                      const shareUrl = `${typeof window !== "undefined" ? window.location.origin : "https://zenviaco.in"}/product/${getProductSlug(product)}`;
                      if (navigator.clipboard) {
                        await navigator.clipboard.writeText(shareUrl);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2500);
                      }
                    }}
                    className="p-2.5 rounded-xl border border-pink-200 bg-pink-50 text-pink-800 hover:bg-pink-100 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Copy className="w-4 h-4 text-pink-600" />
                    <span>Instagram Link</span>
                  </button>
                </div>
              </div>

              {/* Close Button Footer */}
              <div className="mt-6 pt-3 border-t border-neutral-100 text-center">
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  className="w-full py-2.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQAccordionItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden transition-colors bg-neutral-50/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 text-left flex items-center justify-between font-bold text-xs sm:text-sm text-neutral-900 hover:text-amber-800 transition-colors cursor-pointer"
      >
        <div className="flex items-center space-x-2 pr-3">
          <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{question}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-neutral-500 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-amber-600" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-neutral-600 font-medium border-t border-neutral-100 bg-white leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
};
