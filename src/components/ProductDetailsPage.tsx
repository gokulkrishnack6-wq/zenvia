import React, { useState, useEffect, useRef } from "react";
import {
  Star,
  Heart,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  ChevronRight,
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
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product, Currency, CategoryType } from "../types";
import { formatRupee } from "../lib/currency";
import { getProductSlug } from "../lib/slug";
import { PRODUCTS } from "../data/products";
import { ProductReviewsSection } from "./ProductReviewsSection";
import { ProductCard } from "./ProductCard";

interface ProductDetailsPageProps {
  product: Product;
  currency: Currency;
  isWishlisted: boolean;
  wishlistIds: string[];
  onGoHome: () => void;
  onSelectCategory: (cat: CategoryType) => void;
  onSelectProduct: (p: Product) => void;
  onAddToCart: (p: Product, color?: string, size?: string) => void;
  onBuyNow: (p: Product, quantity: number, color?: string, size?: string) => void;
  onToggleWishlist: (p: Product) => void;
  onQuickView?: (p: Product) => void;
}

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
}) => {
  // Gallery images combined
  const allImages = Array.from(
    new Set([
      product.image,
      ...(product.alternateImage ? [product.alternateImage] : []),
      ...(product.galleryImages || []),
    ])
  );

  const [selectedImage, setSelectedImage] = useState(allImages[0] || product.image);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.colors?.[0]?.name
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes?.[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "description" | "features" | "specs" | "shipping" | "returns"
  >("description");
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Lightbox / Image Zoom modal state
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Share feedback state
  const [copiedLink, setCopiedLink] = useState(false);

  // Sticky bottom bar visibility trigger when scrolling past main buy action
  const [showStickyBar, setShowStickyBar] = useState(false);
  const buyActionRef = useRef<HTMLDivElement>(null);

  // Reset selected image and quantity when product changes
  useEffect(() => {
    setAllImagesReset();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [product.id]);

  const setAllImagesReset = () => {
    const fresh = Array.from(
      new Set([
        product.image,
        ...(product.alternateImage ? [product.alternateImage] : []),
        ...(product.galleryImages || []),
      ])
    );
    setSelectedImage(fresh[0] || product.image);
    setSelectedColor(product.colors?.[0]?.name);
    setSelectedSize(product.sizes?.[0]);
    setQuantity(1);
  };

  // Scroll observer for sticky mobile bar
  useEffect(() => {
    const handleScroll = () => {
      if (!buyActionRef.current) return;
      const rect = buyActionRef.current.getBoundingClientRect();
      setShowStickyBar(rect.bottom < 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const formattedPrice = formatRupee(product.price * quantity);
  const formattedOriginalPrice = product.originalPrice
    ? formatRupee(product.originalPrice * quantity)
    : null;
  const savingsAmount = product.originalPrice
    ? formatRupee((product.originalPrice - product.price) * quantity)
    : null;
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCartClick = () => {
    onAddToCart(product, selectedColor, selectedSize);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  const handleBuyNowClick = () => {
    onBuyNow(product, quantity, selectedColor, selectedSize);
  };

  const scrollToReviews = () => {
    const el = document.getElementById("product-reviews-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      } catch (e) {
        console.log("Clipboard write failed:", e);
      }
    }
  };

  // Filter Related Products (same category or bestsellers, excluding current product)
  const relatedProducts = PRODUCTS.filter(
    (p) => p.id !== product.id && (p.category === product.category || p.isBestseller)
  ).slice(0, 4);

  return (
    <div className="min-h-screen bg-neutral-50 pb-20 pt-4">
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
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-sm p-4 sm:p-6 lg:p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* LEFT COLUMN: Main Image & Gallery Thumbnails */}
            <div className="lg:col-span-6 flex flex-col space-y-4">
              {/* Main Image View box */}
              <div className="relative aspect-square rounded-2xl bg-neutral-100 overflow-hidden border border-neutral-200 group">
                <img
                  src={selectedImage}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                  onClick={() => setIsZoomOpen(true)}
                />

                {/* Badges overlay */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
                  {product.isBestseller && (
                    <span className="px-3 py-1 rounded-md bg-amber-500 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md">
                      BESTSELLER
                    </span>
                  )}
                  {product.isNew && (
                    <span className="px-3 py-1 rounded-md bg-emerald-600 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md">
                      NEW DROP
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="px-3 py-1 rounded-md bg-rose-600 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md">
                      SAVE {discountPercent}%
                    </span>
                  )}
                </div>

                {/* Zoom indicator button */}
                <button
                  onClick={() => setIsZoomOpen(true)}
                  className="absolute bottom-3 right-3 p-2.5 rounded-xl bg-white/90 hover:bg-white text-neutral-800 shadow-md border border-neutral-200/80 transition-all cursor-pointer flex items-center space-x-1.5 text-xs font-semibold"
                  title="Click to Zoom Image"
                >
                  <Maximize2 className="w-4 h-4 text-amber-600" />
                  <span className="hidden sm:inline">Zoom Image</span>
                </button>
              </div>

              {/* Gallery Thumbnails List */}
              {allImages.length > 1 && (
                <div className="flex items-center space-x-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        selectedImage === img
                          ? "border-amber-500 shadow-md ring-2 ring-amber-400/30 scale-105"
                          : "border-neutral-200 hover:border-neutral-300 opacity-80 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} gallery ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Visual Quality Guarantee Box */}
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80 flex items-center justify-between text-xs text-neutral-600">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">100% Quality Tested Before Dispatch</span>
                </div>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  India Express
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN: Product Details, Price, Variant, Actions */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <div>
                {/* Category & Ratings Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-md">
                    {product.category}
                  </span>

                  {/* Rating + Read Reviews button */}
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-extrabold text-neutral-900">{product.rating}</span>
                      <span className="text-xs text-neutral-500">({product.reviewCount})</span>
                    </div>

                    <button
                      onClick={scrollToReviews}
                      className="text-xs font-bold text-amber-700 hover:text-amber-800 underline decoration-amber-400/80 cursor-pointer flex items-center space-x-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                      <span>Read Reviews</span>
                    </button>
                  </div>
                </div>

                {/* Product Title */}
                <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mb-2">
                  {product.name}
                </h1>

                {/* Short Tagline / Overview */}
                <p className="text-sm text-neutral-600 font-medium mb-4 leading-relaxed">
                  {product.tagline}
                </p>

                {/* Pricing Box */}
                <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60 mb-5">
                  <div className="flex items-baseline space-x-3 mb-1">
                    <span className="text-3xl font-black text-neutral-900">{formattedPrice}</span>
                    {formattedOriginalPrice && (
                      <span className="text-sm font-semibold text-neutral-400 line-through">
                        {formattedOriginalPrice}
                      </span>
                    )}
                    {savingsAmount && (
                      <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-md">
                        Save {savingsAmount} ({discountPercent}% OFF)
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] font-medium text-neutral-600 flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Inclusive of all taxes • Free Shipping Across India</span>
                  </p>
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
                          onClick={() => setSelectedColor(c.name)}
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
                          onClick={() => setSelectedSize(s)}
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
                <div ref={buyActionRef} className="space-y-3 pt-2">
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

                  {/* Wishlist button */}
                  <button
                    onClick={() => onToggleWishlist(product)}
                    className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                      isWishlisted
                        ? "bg-rose-50 border-rose-300 text-rose-700"
                        : "bg-white border-neutral-200 hover:border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? "fill-rose-600 text-rose-600" : ""}`} />
                    <span>{isWishlisted ? "In Wishlist (Saved)" : "Save to Wishlist"}</span>
                  </button>
                </div>
              </div>

              {/* Delivery Perks Grid */}
              <div className="pt-4 border-t border-neutral-200 grid grid-cols-3 gap-2 text-center text-[11px] text-neutral-700">
                <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200/60 flex flex-col items-center justify-center space-y-1">
                  <Truck className="w-4 h-4 text-amber-600" />
                  <span className="font-bold leading-tight">Free India Express Delivery</span>
                </div>
                <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200/60 flex flex-col items-center justify-center space-y-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold leading-tight">Cash on Delivery Available</span>
                </div>
                <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200/60 flex flex-col items-center justify-center space-y-1">
                  <RotateCcw className="w-4 h-4 text-blue-600" />
                  <span className="font-bold leading-tight">7-Day Easy Replacement</span>
                </div>
              </div>
            </div>
          </div>
        </div>

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
              { id: "returns", label: "Return & Refund Policy" },
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
                    1 x {product.name}, User Guide & Warranty Document, Protective Cushion Packaging.
                  </p>
                </div>
              </div>
            )}

            {/* 4. Shipping & Delivery Info */}
            {activeTab === "shipping" && (
              <div className="max-w-4xl space-y-4 text-xs text-neutral-700 leading-relaxed">
                <h3 className="text-base font-extrabold text-neutral-900">
                  Express Delivery Across India
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1">
                    <span className="font-extrabold text-neutral-900 block text-sm">
                      Metro Cities (2–3 Business Days)
                    </span>
                    <p className="text-neutral-600">
                      Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata, Pune & Ahmedabad.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1">
                    <span className="font-extrabold text-neutral-900 block text-sm">
                      Rest of India (3–5 Business Days)
                    </span>
                    <p className="text-neutral-600">
                      All tier-2, tier-3 cities & town PIN codes served via Blue Dart / Delhivery express air.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium">
                  <strong>Cash on Delivery (COD) & UPI Available:</strong> Free shipping on all orders above ₹499. Real-time SMS and WhatsApp tracking dispatched as soon as order leaves the warehouse.
                </div>
              </div>
            )}

            {/* 5. Returns & Refund Policy */}
            {activeTab === "returns" && (
              <div className="max-w-4xl space-y-4 text-xs text-neutral-700 leading-relaxed">
                <h3 className="text-base font-extrabold text-neutral-900">
                  7-Day Replacement Guarantee
                </h3>
                <p>
                  At Zenvia, we stand firmly behind the quality of every product. If your item arrives damaged, defective, or missing accessories, we offer a hassle-free 7-day replacement or doorstep pickup across India.
                </p>
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-2">
                  <span className="font-extrabold text-neutral-900 block">
                    How to initiate a return:
                  </span>
                  <ol className="list-decimal list-inside space-y-1 text-neutral-600">
                    <li>Contact us via support email or Client Concierge in your Account menu.</li>
                    <li>Share order ID and brief photo/video of the issue.</li>
                    <li>Our courier partner will arrange a doorstep pick-up within 24-48 hours.</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================
            CUSTOMER REVIEWS SECTION (NEAR THE VERY BOTTOM)
        ======================================================== */}
        <div id="product-reviews-section" className="scroll-mt-24 mb-16">
          <ProductReviewsSection product={product} />
        </div>

        {/* ========================================================
            RELATED PRODUCTS / YOU MAY ALSO LIKE
        ======================================================== */}
        {relatedProducts.length > 0 && (
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
          STICKY MOBILE BOTTOM ACTION BAR
      ======================================================== */}
      <div
        className={`fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-neutral-200 p-3 z-40 sm:hidden transition-transform duration-300 shadow-2xl ${
          showStickyBar ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div className="flex items-center space-x-2 shrink-0">
            <img
              src={selectedImage}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-lg object-cover border border-neutral-200"
            />
            <div>
              <span className="text-xs font-bold text-neutral-900 truncate block max-w-[110px]">
                {product.name}
              </span>
              <span className="text-xs font-black text-amber-700">
                {formattedPrice}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-1 justify-end">
            <button
              onClick={handleAddToCartClick}
              className="py-2.5 px-3 rounded-xl bg-neutral-900 text-white text-xs font-bold shrink-0 cursor-pointer"
            >
              Add
            </button>
            <button
              onClick={handleBuyNowClick}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 text-white text-xs font-extrabold uppercase tracking-wider shrink-0 shadow-md cursor-pointer flex items-center space-x-1"
            >
              <Zap className="w-3.5 h-3.5 fill-amber-200 text-amber-200" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
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
                src={selectedImage}
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
    </div>
  );
};
