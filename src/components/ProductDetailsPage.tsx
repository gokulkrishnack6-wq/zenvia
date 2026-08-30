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
            MAIN PRODUCT TWO-COLUMN SECTION (HAPPY MAMMOTH STRUCTURE)
        ======================================================== */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm p-4 sm:p-6 lg:p-10 mb-8 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* LEFT COLUMN: Gallery with Vertical/Horizontal Thumbnails + Product Highlights */}
            <div className="lg:col-span-6 flex flex-col space-y-6">
              {/* Desktop Gallery: Left Thumbnails + Right Main Image */}
              <div className="flex flex-col-reverse md:flex-row gap-3 sm:gap-4 items-start">
                {/* Thumbnails (Vertical on md+, Horizontal on mobile) */}
                {mediaList.length > 1 && (
                  <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto max-h-[500px] w-full md:w-20 shrink-0 pb-1 md:pb-0 scrollbar-none snap-x">
                    {mediaList.map((item, idx) => {
                      const isSelected = selectedMediaIndex === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedMediaIndex(idx)}
                          className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer snap-start bg-[#fbf9f6] ${
                            isSelected
                              ? "border-neutral-900 shadow-sm ring-2 ring-neutral-900/20"
                              : "border-neutral-200 hover:border-neutral-400 opacity-75 hover:opacity-100"
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
                                <div className="w-6 h-6 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shadow-md">
                                  <Play className="w-3 h-3 fill-neutral-950 ml-0.5 text-neutral-950" />
                                </div>
                                <span className="text-[8px] font-black text-amber-300 uppercase tracking-tight mt-0.5 bg-black/70 px-1 rounded">
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

                {/* Main Media Viewer - Full Fill with Ambient Generative Extension */}
                <div
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  className="relative flex-1 w-full aspect-square rounded-2xl bg-neutral-900 overflow-hidden border border-neutral-200/90 group flex items-center justify-center touch-pan-y select-none"
                >
                  {currentMedia.type === "image" ? (
                    <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                      {/* Ambient extended backdrop filling any background margins */}
                      <img
                        src={currentMedia.url}
                        alt=""
                        aria-hidden="true"
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-60"
                      />
                      {/* Main photograph filling container with perfect composition */}
                      <img
                        key={currentMedia.url}
                        src={currentMedia.url}
                        alt={product.name}
                        loading="eager"
                        fetchPriority="high"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="relative z-1 w-full h-full object-cover object-center transition-transform duration-300 cursor-pointer select-none"
                        onClick={() => setIsZoomOpen(true)}
                      />
                    </div>
                  ) : (
                    <video
                      key={currentMedia.url}
                      src={currentMedia.url}
                      controls
                      playsInline
                      preload="metadata"
                      autoPlay={false}
                      className="w-full h-full object-contain bg-black select-none z-1"
                    />
                  )}

                  {/* Badges overlay */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
                    {product.isBestseller && (
                      <span className="px-2.5 py-1 rounded-md bg-neutral-900 text-white text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
                        BESTSELLER
                      </span>
                    )}
                    {discountPercent > 0 && (
                      <span className="px-2.5 py-1 rounded-md bg-[#136b8a] text-white text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
                        SAVE {discountPercent}%
                      </span>
                    )}
                  </div>

                  {/* Numerical Slide Counter Badge e.g. "1 / 6" */}
                  {mediaList.length > 1 && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-mono font-bold tracking-widest shadow-sm z-10 select-none">
                      {selectedMediaIndex + 1} / {mediaList.length}
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
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 hover:bg-white text-neutral-800 shadow-md border border-neutral-200 transition-all cursor-pointer z-10 active:scale-90"
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 hover:bg-white text-neutral-800 shadow-md border border-neutral-200 transition-all cursor-pointer z-10 active:scale-90"
                        aria-label="Next Media"
                      >
                        <ChevronRight className="w-5 h-5 text-neutral-800" />
                      </button>
                    </>
                  )}

                  {/* Zoom button */}
                  {currentMedia.type === "image" && (
                    <button
                      onClick={() => setIsZoomOpen(true)}
                      className="absolute bottom-3 right-3 p-2 rounded-xl bg-white/90 hover:bg-white text-neutral-800 shadow-sm border border-neutral-200 transition-all cursor-pointer flex items-center space-x-1 text-xs font-semibold z-10"
                      title="Click to Zoom Image"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-neutral-700" />
                      <span className="text-[11px] font-bold">Zoom</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Product Highlights Under Left Gallery (Inspired by Happy Mammoth screenshot 1 & 2) */}
              <div className="pt-4 border-t border-neutral-200/80">
                <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900 mb-3.5">
                  Product Highlights
                </h3>
                <div className="space-y-2.5 text-xs sm:text-[13px] text-neutral-700 font-medium leading-relaxed">
                  <div className="flex items-start space-x-2.5">
                    <span className="text-[#38b2ac] font-bold text-base leading-none">✓</span>
                    <span>5-day easy replacement policy on any manufacturing defect</span>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="text-[#38b2ac] font-bold text-base leading-none">✓</span>
                    <span>Crafted from thickened stainless steel for daily kitchen moisture resistance</span>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="text-[#38b2ac] font-bold text-base leading-none">✓</span>
                    <span>Universal clamp fits standard round faucet pipes (18mm to 28mm diameter)</span>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="text-[#38b2ac] font-bold text-base leading-none">✓</span>
                    <span>Open-grid wire drainage keeps sponges dry and prevents water puddles</span>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="text-[#38b2ac] font-bold text-base leading-none">✓</span>
                    <span>Tool-free 30-second hand-screw clamp installation</span>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="text-[#38b2ac] font-bold text-base leading-none">✓</span>
                    <span>Free express delivery &amp; Cash on Delivery (COD) available across India</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Product Title, Rating, Benefits, Quantity Bundles, Offer Box, CTAs */}
            <div className="lg:col-span-6 flex flex-col space-y-5">
              <div>
                {/* Product Title with Trademark Symbol */}
                <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-black text-neutral-900 tracking-tight leading-tight mb-2">
                  {product.name} <span className="text-xs font-normal text-neutral-400 align-super">™</span>
                </h1>

                {/* Rating & Review Count (Happy Mammoth style) */}
                <div
                  className="flex items-center space-x-2 mb-3 cursor-pointer select-none"
                  onClick={scrollToReviews}
                >
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-neutral-700 hover:text-neutral-900 underline decoration-neutral-300">
                    {product.reviewCount || "1,248"} Reviews
                  </span>
                </div>

                {/* Intro Tagline */}
                <p className="text-xs sm:text-[13px] text-neutral-600 font-medium leading-relaxed mb-4">
                  {product.tagline || "With premium stainless steel engineering designed to:"}
                </p>

                {/* Benefit-Oriented Bullet Points with Green Checkmarks (Happy Mammoth style) */}
                <div className="space-y-2 mb-6 text-xs sm:text-[13px] text-neutral-800 font-medium">
                  <div className="flex items-start space-x-2.5">
                    <span className="text-[#38b2ac] font-black text-base leading-none">✓</span>
                    <span>Relieve sink clutter and soggy countertop mess</span>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="text-[#38b2ac] font-black text-base leading-none">✓</span>
                    <span>Keep sponges, scrubbers, and dish soaps elevated and dry</span>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="text-[#38b2ac] font-black text-base leading-none">✓</span>
                    <span>Open-grid wire design drains excess water straight into the sink basin</span>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="text-[#38b2ac] font-black text-base leading-none">✓</span>
                    <span>Adjustable 360° clamp securely fits standard round faucet pipes (18–28mm)</span>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="text-[#38b2ac] font-black text-base leading-none">✓</span>
                    <span>Zero tools, drilling, or suction cups required</span>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="text-[#38b2ac] font-black text-base leading-none">✓</span>
                    <span>Includes built-in side hanging hooks for scrub brushes and peelers</span>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="text-[#38b2ac] font-black text-base leading-none">✓</span>
                    <span>Crafted from thickened rust-resistant stainless steel</span>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <span className="text-[#38b2ac] font-black text-base leading-none">✓</span>
                    <span>National bestseller — trusted in thousands of Indian kitchens</span>
                  </div>
                </div>

                {/* SELECT QUANTITY SECTION (Inspired by 1 Jar, 2 Jars, 4 Jars from Screenshot 2) */}
                <div className="mb-5 space-y-2">
                  <label className="text-xs sm:text-[13px] font-bold text-neutral-900 block">
                    Select quantity:
                  </label>

                  <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                    {/* 1 Unit */}
                    <div
                      onClick={() => setQuantity(1)}
                      className={`relative p-3 sm:p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-between text-center select-none bg-white ${
                        quantity === 1
                          ? "border-neutral-900 shadow-sm ring-1 ring-neutral-900/10"
                          : "border-neutral-200 hover:border-neutral-400"
                      }`}
                    >
                      <div className="w-12 h-12 sm:w-14 sm:h-14 mb-2 flex items-center justify-center">
                        <img
                          src={product.image}
                          alt="1 Caddy"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <span className="text-xs font-black text-neutral-900 mb-0.5">1 Unit</span>
                      <span className="text-xs font-bold text-neutral-600">₹299</span>
                    </div>

                    {/* 2 Units (BEST SELLER) */}
                    <div
                      onClick={() => setQuantity(2)}
                      className={`relative p-3 sm:p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-between text-center select-none bg-white ${
                        quantity === 2
                          ? "border-neutral-900 shadow-sm ring-1 ring-neutral-900/10"
                          : "border-neutral-200 hover:border-neutral-400"
                      }`}
                    >
                      {/* BEST SELLER BADGE */}
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                        <span className="bg-neutral-900 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                          BEST SELLER
                        </span>
                      </div>

                      <div className="w-12 h-12 sm:w-14 sm:h-14 mb-2 flex items-center justify-center">
                        <img
                          src={product.alternateImage || product.image}
                          alt="2 Caddies"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <span className="text-xs font-black text-neutral-900 mb-0.5">2 Units</span>
                      <span className="text-xs font-bold text-neutral-600">₹549</span>
                    </div>

                    {/* 4 Units (BEST VALUE) */}
                    <div
                      onClick={() => setQuantity(4)}
                      className={`relative p-3 sm:p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center justify-between text-center select-none bg-white ${
                        quantity === 4
                          ? "border-neutral-900 shadow-sm ring-1 ring-neutral-900/10"
                          : "border-neutral-200 hover:border-neutral-400"
                      }`}
                    >
                      {/* BEST VALUE BADGE */}
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                        <span className="bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                          BEST VALUE
                        </span>
                      </div>

                      <div className="w-12 h-12 sm:w-14 sm:h-14 mb-2 flex items-center justify-center">
                        <img
                          src={product.image}
                          alt="4 Caddies"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <span className="text-xs font-black text-neutral-900 mb-0.5">4 Units</span>
                      <span className="text-xs font-bold text-neutral-600">₹999</span>
                    </div>
                  </div>
                </div>

                {/* SELECT YOUR PURCHASE TYPE (Inspired by Happy Mammoth screenshot 2) */}
                <div className="mb-5 space-y-2.5">
                  <label className="text-xs sm:text-[13px] font-bold text-neutral-900 block">
                    Select your purchase offer:
                  </label>

                  {/* Option 1: Limited Deal (Selected by default) */}
                  <div className="p-4 rounded-xl border-2 border-neutral-900 bg-[#faf8f5] transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full border-2 border-neutral-900 flex items-center justify-center bg-neutral-900">
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-neutral-900">
                          Special Limited-Time Deal
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-[#22c55e] text-white px-2 py-0.5 rounded">
                          {discountPercent}% OFF
                        </span>
                      </div>
                    </div>

                    {/* Price display */}
                    <div className="flex items-baseline space-x-2 my-2 pl-6">
                      {formattedOriginalPrice && (
                        <span className="text-sm font-semibold text-neutral-400 line-through">
                          {formattedOriginalPrice}
                        </span>
                      )}
                      <span className="text-xl sm:text-2xl font-black text-neutral-900">
                        {formattedPrice}
                      </span>
                    </div>

                    {/* Inner Benefits */}
                    <div className="pl-6 pt-2 border-t border-neutral-200/80 space-y-1.5 text-xs text-neutral-700 font-medium">
                      <div className="flex items-center space-x-2">
                        <span className="text-[#38b2ac] font-bold">✓</span>
                        <span>Save {savingsAmount || "50%"} with today's direct factory price</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[#38b2ac] font-bold">✓</span>
                        <span>Free Doorstep Delivery across India included</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[#38b2ac] font-bold">✓</span>
                        <span>Cash on Delivery (COD) &amp; UPI available at checkout</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[#38b2ac] font-bold">✓</span>
                        <span>Dispatched within 24 hours with live SMS tracking</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* MAIN CALL TO ACTION BUTTON (Inspired by Happy Mammoth's Mint Green Button) */}
                <div className="space-y-3 mb-4">
                  <button
                    onClick={handleAddToCartClick}
                    className="w-full py-4 px-6 rounded-xl bg-[#5ac4a2] hover:bg-[#4eb392] text-white font-black text-sm sm:text-base uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center space-x-2"
                  >
                    {addedSuccess ? (
                      <>
                        <Check className="w-5 h-5 text-white" />
                        <span>ADDED TO CART!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5 text-white" />
                        <span>
                          ADD TO CART — {formattedOriginalPrice ? <span className="line-through opacity-70 mr-1">{formattedOriginalPrice}</span> : null}
                          {formattedPrice}
                        </span>
                      </>
                    )}
                  </button>

                  {/* BUY NOW BUTTON FOR FAST COD / UPI CHECKOUT */}
                  <button
                    onClick={handleBuyNowClick}
                    className="w-full py-3.5 px-6 rounded-xl bg-neutral-900 hover:bg-black text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-sm transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span>Buy Now – Cash on Delivery Available</span>
                  </button>
                </div>

                {/* REASSURANCE / DISPATCH PILL (Inspired by Screenshot 3) */}
                <div className="flex flex-col items-center space-y-2.5 mb-4">
                  {/* Order today chip */}
                  <div className="inline-flex items-center space-x-1.5 px-4 py-1 rounded-full bg-[#fcedea] text-neutral-800 text-xs font-semibold">
                    <span className="text-[#38b2ac] font-black">✓</span>
                    <span>Order today, ships in 1-2 business days</span>
                  </div>

                  {/* Row of clean outline pills */}
                  <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold text-neutral-700">
                    <span className="px-3 py-1 rounded-full border border-neutral-200 bg-white">
                      ↺ 5 Day Replacement Policy
                    </span>
                    <span className="px-3 py-1 rounded-full border border-neutral-200 bg-white">
                      📦 Free Shipping Across India
                    </span>
                    <span className="px-3 py-1 rounded-full border border-neutral-200 bg-white">
                      💵 Cash on Delivery Available
                    </span>
                  </div>
                </div>

                {/* URGENCY ALERT BANNER (Inspired by Screenshot 3: "Selling fast — 102 orders in last 24h") */}
                <div className="p-2.5 rounded-xl bg-[#fff2db] border border-[#fde1b0] text-center text-xs font-bold text-amber-950 flex items-center justify-center space-x-1.5 mb-4">
                  <span>🔥</span>
                  <span>Selling fast — 102 orders placed in the last 24 hours!</span>
                </div>

                {/* VERIFIED STORE & CUSTOMER TRUST CARD (Inspired by Screenshot 3) */}
                <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-white border border-neutral-200 shadow-xs flex flex-col items-center">
                      <div className="flex text-emerald-600 mb-0.5">
                        <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                        <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                        <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                        <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                        <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                      </div>
                      <span className="text-[10px] font-extrabold text-neutral-900">4.3 / 5.0</span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-1 font-black text-neutral-900">
                        <span>ZENVIA India</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full flex items-center space-x-0.5">
                          <span>✓</span>
                          <span>VERIFIED STORE</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 font-medium">
                        Based on 1,248+ verified Indian customer reviews
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] text-neutral-600 font-bold">
                    <Lock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>256-Bit SSL Encrypted</span>
                  </div>
                </div>

                {/* PIN CODE DELIVERY CHECKER */}
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/90 space-y-2">
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-4 h-4 text-neutral-700" />
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
                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900"
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
                          <span>Checking...</span>
                        </>
                      ) : (
                        <span>Check</span>
                      )}
                    </button>
                  </form>

                  {/* PIN Code Verification Output */}
                  {pincodeResult && pincodeResult.serviceable && (
                    <div className="mt-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                      <div className="font-bold text-emerald-900 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>✓ Delivery Available to {pincodeResult.location || pincodeInput}</span>
                      </div>
                      <p className="text-[11px] text-emerald-800">
                        {pincodeResult.message} • Free Delivery &amp; COD Available
                      </p>
                    </div>
                  )}

                  {pincodeResult && !pincodeResult.serviceable && (
                    <div className="mt-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-950">
                      <p className="text-[11px] font-semibold text-rose-700">
                        {pincodeResult.message}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            "WHY YOU'LL LOVE YOUR ZENVIA SINK CADDY" - PRODUCT BENEFITS
        ======================================================== */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm p-6 sm:p-8 mb-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-extrabold text-amber-800 uppercase tracking-widest bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-md">
              Product Highlights
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-neutral-900 mt-2 tracking-tight">
              {product.id === "p13" || product.slug?.includes("sink-caddy")
                ? "Why You'll Love Your ZENVIA Sink Caddy"
                : `Why You'll Love Your ${product.name}`}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1.5 font-medium">
              Thoughtfully engineered for convenience, durability, and a clean countertop.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Benefit 1 */}
            <div className="p-5 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 hover:border-amber-400/80 hover:bg-white transition-all shadow-xs">
              <div className="text-2xl mb-2.5">🧽</div>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-neutral-900 mb-1.5">
                Keep Your Sponge Organized
              </h3>
              <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                Keep your everyday cleaning tools in one convenient, elevated place without cluttering your basin.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="p-5 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 hover:border-amber-400/80 hover:bg-white transition-all shadow-xs">
              <div className="text-2xl mb-2.5">💧</div>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-neutral-900 mb-1.5">
                Less Sink Clutter
              </h3>
              <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                Create a cleaner-looking and more organized sink area with excess water draining straight into the basin.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="p-5 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 hover:border-amber-400/80 hover:bg-white transition-all shadow-xs">
              <div className="text-2xl mb-2.5">🔧</div>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-neutral-900 mb-1.5">
                Adjustable Design
              </h3>
              <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                Designed to adapt easily to different sink and faucet setups with an adjustable tool-free clamp.
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="p-5 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 hover:border-amber-400/80 hover:bg-white transition-all shadow-xs">
              <div className="text-2xl mb-2.5">✨</div>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-neutral-900 mb-1.5">
                Durable Material
              </h3>
              <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                Thickened stainless-steel construction built for daily kitchen moisture and long-lasting use.
              </p>
            </div>

            {/* Benefit 5 */}
            <div className="p-5 rounded-2xl bg-neutral-50/80 border border-neutral-200/80 hover:border-amber-400/80 hover:bg-white transition-all shadow-xs sm:col-span-2 lg:col-span-2">
              <div className="text-2xl mb-2.5">🧼</div>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-neutral-900 mb-1.5">
                Everything Within Reach
              </h3>
              <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                Keep frequently used cleaning accessories, scrubbers, and soaps easily accessible right where you wash dishes.
              </p>
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
            VISUAL PRODUCT GALLERY (Kitchen Sink Caddy Only)
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
                    1 x {product.name}, Sizing Adapter Clip, Tightening Screw Cap, Protective Cushion Packaging.
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
                  <strong>Cash on Delivery (COD) &amp; Online Payment Available:</strong> Free Delivery Across India on all orders. Tracking updates provided via SMS and email.
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
              Our support team is here to help with order inquiries, product guidance, or delivery updates.
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
            FINAL DIRECT-RESPONSE PURCHASE CALLOUT
        ======================================================== */}
        <div className="bg-neutral-950 text-white rounded-2xl border border-neutral-800 p-6 sm:p-10 mb-8 text-center shadow-xl">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Clean &amp; Organized Sink in Seconds</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Get Your {product.name}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 font-medium">
              No more soggy sponges or countertop water rings. Fast tool-free installation with open-grid drainage.
            </p>
            <div className="flex items-center justify-center space-x-3 py-1">
              <span className="text-2xl sm:text-3xl font-black text-amber-400">
                {formattedPrice}
              </span>
              {formattedOriginalPrice && (
                <span className="text-base text-neutral-500 line-through font-semibold">
                  {formattedOriginalPrice}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-md bg-rose-600 text-white text-xs font-black">
                50% OFF
              </span>
            </div>
            <div className="pt-2 max-w-md mx-auto">
              <button
                type="button"
                id="bottom-final-buy-now-btn"
                onClick={handleBuyNowClick}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-neutral-950 text-sm sm:text-base font-black uppercase tracking-wider transition-all transform active:scale-[0.99] shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Zap className="w-5 h-5 fill-neutral-950" />
                <span>BUY NOW – {formattedPrice}</span>
              </button>
              <div className="flex items-center justify-center space-x-3 mt-3 text-[11px] sm:text-xs text-neutral-400">
                <span className="flex items-center space-x-1">
                  <Truck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Free Delivery Across India</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cash on Delivery</span>
                </span>
              </div>
            </div>
          </div>
        </div>
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
