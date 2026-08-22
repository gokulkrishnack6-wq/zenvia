import React, { useState, useEffect } from "react";
import {
  X,
  Star,
  ShoppingBag,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Heart,
  CheckCircle2,
  Zap,
  Plus,
  Minus,
  Play,
  CreditCard,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Product, Currency } from "../types";
import { formatRupee, formatRupeeExact } from "../lib/currency";
import {
  calculateItemSubtotal,
  calculateBundleSavings,
  calculatePerPiecePrice,
  getProductQuantityOffers,
  hasQuantityOffers,
} from "../lib/pricing";
import { ProductReviewsSection } from "./ProductReviewsSection";

interface QuickViewModalProps {
  product: Product | null;
  currency: Currency;
  isWishlisted: boolean;
  isCompared?: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, color?: string, size?: string, quantity?: number) => void;
  onBuyNow?: (product: Product, quantity?: number, color?: string, size?: string) => void;
  onToggleWishlist: (product: Product) => void;
  onToggleCompare?: (product: Product) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isWishlisted,
  onClose,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
}) => {
  const [selectedImg, setSelectedImg] = useState(product?.image || "");
  const [activeMedia, setActiveMedia] = useState<"image" | "video">("image");
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]?.name);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Reset scroll and media when product changes
  useEffect(() => {
    if (product) {
      setSelectedImg(product.image);
      setActiveMedia("image");
      setQuantity(1);
      setSelectedColor(product.colors?.[0]?.name);
      setSelectedSize(product.sizes?.[0]);

      const container = document.getElementById("modal-scroll-container");
      if (container) {
        container.scrollTop = 0;
      }
    }
  }, [product]);

  if (!product) return null;

  const quantityOffers = getProductQuantityOffers(product);
  const isOfferConfigured = hasQuantityOffers(product);

  const currentSubtotal = calculateItemSubtotal(product, quantity);
  const bundleSavings = calculateBundleSavings(product, quantity);
  const formattedPrice = formatRupee(currentSubtotal);
  const formattedOriginal = product.originalPrice ? formatRupee(product.originalPrice * quantity) : null;
  const perPieceRate = calculatePerPiecePrice(product, quantity);
  const formattedPerPiece = formatRupeeExact(perPieceRate);

  const handleAddToCart = () => {
    onAddToCart(product, selectedColor, selectedSize, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (onBuyNow) {
      onBuyNow(product, quantity, selectedColor, selectedSize);
    }
  };

  const scrollToReviews = () => {
    const reviewsEl = document.getElementById("product-reviews-section");
    if (reviewsEl) {
      reviewsEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Fallback demo product video if none provided
  const sampleVideoUrl = product.videoUrl || "https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-smartphone-with-a-blank-green-screen-41541-large.mp4";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 md:p-6 overflow-hidden">
      <div className="relative w-full max-w-4xl bg-white border border-neutral-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]">
        
        {/* Modal Top Navigation Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100 bg-neutral-50/90 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 px-2.5 py-0.5 rounded-md bg-amber-100">
              {product.category}
            </span>
            {product.isBestseller && (
              <span className="text-[11px] uppercase tracking-wider text-white font-bold px-2 py-0.5 rounded-md bg-amber-500">
                BESTSELLER
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* Quick Navigation Jump to Reviews */}
            <button
              onClick={scrollToReviews}
              className="hidden sm:flex items-center space-x-1 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <span>Customer Reviews</span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-900 p-1.5 transition-colors rounded-full hover:bg-neutral-200 cursor-pointer"
              title="Close product window"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Main Content Container - ALWAYS OPENS SCROLLED AT TOP */}
        <div id="modal-scroll-container" className="overflow-y-auto flex-1 divide-y divide-neutral-100 scroll-smooth">
          
          {/* SECTION 1: TOP PRODUCT HERO & PURCHASING PANEL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 sm:p-8">
            
            {/* Left Column: Media Gallery (Images + Video) */}
            <div className="flex flex-col space-y-3">
              {/* Main Media Viewer */}
              <div className="aspect-square bg-neutral-100 rounded-2xl overflow-hidden border border-neutral-200 relative group shadow-sm">
                {activeMedia === "video" ? (
                  <video
                    src={sampleVideoUrl}
                    controls
                    autoPlay
                    loop
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={selectedImg}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                )}

                {/* Wishlist Button on Image */}
                <button
                  onClick={() => onToggleWishlist(product)}
                  className={`absolute top-3 right-3 p-2.5 rounded-full border shadow-md transition-all cursor-pointer ${
                    isWishlisted
                      ? "bg-rose-50 text-rose-600 border-rose-200"
                      : "bg-white/90 backdrop-blur-sm border-neutral-200 text-neutral-600 hover:text-rose-600"
                  }`}
                  title="Save to Wishlist"
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? "fill-rose-600" : ""}`} />
                </button>
              </div>

              {/* Gallery Thumbnails (Images & Video Toggle) */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
                {/* Image Thumbnails */}
                {product.galleryImages?.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedImg(img);
                      setActiveMedia("image");
                    }}
                    className={`w-14 h-14 rounded-xl overflow-hidden border shrink-0 transition-all cursor-pointer ${
                      activeMedia === "image" && selectedImg === img
                        ? "border-amber-600 ring-2 ring-amber-500/30"
                        : "border-neutral-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="Thumb" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}

                {/* Video Demo Thumbnail Button */}
                <button
                  onClick={() => setActiveMedia("video")}
                  className={`w-14 h-14 rounded-xl border shrink-0 flex flex-col items-center justify-center transition-all cursor-pointer ${
                    activeMedia === "video"
                      ? "border-amber-600 bg-amber-50 text-amber-900 ring-2 ring-amber-500/30 font-bold"
                      : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
                  }`}
                  title="Watch Product Demo Video"
                >
                  <Play className="w-4 h-4 fill-amber-600 text-amber-600 mb-0.5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Video</span>
                </button>
              </div>

              {/* Key Features / Benefits Box */}
              <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/80 space-y-2 text-xs text-amber-950">
                <span className="font-extrabold block text-[11px] uppercase tracking-wider text-amber-900">
                  Key Product Benefits:
                </span>
                {product.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                    <span className="font-medium">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Product Title, Rating, Price, Options & Purchase Buttons */}
            <div className="flex flex-col justify-between space-y-4">
              <div>
                {/* Rating Link (Scrolls down to Customer Reviews at bottom) */}
                <div className="mb-2">
                  <button
                    onClick={scrollToReviews}
                    className="inline-flex items-center space-x-2 hover:opacity-80 transition-opacity text-left cursor-pointer group"
                    title="Click to view Customer Reviews"
                  >
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs font-extrabold text-neutral-900">{product.rating}</span>
                    <span className="text-xs text-amber-800 font-bold underline group-hover:text-amber-900">
                      ({product.reviewCount} Customer Reviews)
                    </span>
                  </button>
                </div>

                {/* Product Name & Tagline */}
                <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mb-1">
                  {product.name}
                </h1>
                <p className="text-xs font-semibold text-amber-700 mb-4">
                  {product.tagline}
                </p>

                {/* Price in ₹ & Savings */}
                <div className="mb-4 pb-4 border-b border-neutral-200">
                  <div className="flex items-baseline space-x-3">
                    <span className="text-3xl font-extrabold text-neutral-900">
                      {formattedPrice}
                    </span>
                    {formattedOriginal && (
                      <span className="text-sm text-neutral-400 line-through font-medium">
                        {formattedOriginal}
                      </span>
                    )}
                    {product.originalPrice && (
                      <span className="text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-md border border-emerald-200">
                        Save {formattedPrice}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-xs">
                    {currentSubtotal >= 499 ? (
                      <span className="text-emerald-800 font-extrabold flex items-center space-x-1">
                        <span>🎉 FREE delivery unlocked!</span>
                      </span>
                    ) : (
                      <span className="text-amber-950 font-bold flex items-center space-x-1">
                        <span>🚚 Spend ₹{499 - currentSubtotal} more for FREE delivery</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Short Product Description */}
                <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                  {product.description}
                </p>

                {/* Color Selection (if available) */}
                {product.colors && product.colors.length > 0 && (
                  <div className="mb-4">
                    <span className="text-xs font-bold text-neutral-800 block mb-1.5">
                      Select Color: <span className="font-normal text-neutral-600">{selectedColor}</span>
                    </span>
                    <div className="flex items-center space-x-2">
                      {product.colors.map((c) => (
                        <button
                          key={c.name}
                          onClick={() => setSelectedColor(c.name)}
                          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
                            selectedColor === c.name
                              ? "border-neutral-900 bg-neutral-900 text-white font-semibold shadow-sm"
                              : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
                          <span>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity & Bulk Tier Selector */}
                <div className="mb-4">
                  {isOfferConfigured && quantityOffers && quantityOffers.length > 0 && (
                    <div className="mb-3">
                      <span className="text-xs font-bold text-neutral-800 flex items-center space-x-1.5 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Select Bundle Quantity Offer:</span>
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {quantityOffers.map((tier) => {
                          const isSelected = quantity === tier.quantity;
                          const tierPrice = tier.totalPrice;
                          const perPiece = formatRupeeExact(tier.perPiecePrice || tierPrice / tier.quantity);
                          const tierBadge = tier.badge || (tier.isBestValue ? "BEST VALUE" : tier.isPopular ? "MOST POPULAR" : tier.label);
                          return (
                            <button
                              key={tier.quantity}
                              type="button"
                              onClick={() => setQuantity(tier.quantity)}
                              className={`relative p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                isSelected
                                  ? "border-amber-500 bg-amber-50/70 ring-2 ring-amber-500 shadow-sm"
                                  : "border-neutral-200 bg-white hover:border-neutral-300"
                              }`}
                            >
                              {tierBadge && (
                                <span className={`absolute -top-2 left-2 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                                  tier.isBestValue || tierBadge.toUpperCase().includes("VALUE")
                                    ? "bg-emerald-600 text-white"
                                    : "bg-amber-600 text-white"
                                }`}>
                                  {tierBadge}
                                </span>
                              )}
                              <div className="text-xs font-black text-neutral-900 mt-1">
                                {tier.label || (tier.quantity === 1 ? "1 Unit" : `${tier.quantity} Units`)}
                              </div>
                              <div className="text-sm font-black text-amber-800">
                                {formatRupee(tierPrice)}
                              </div>
                              <div className="text-[10px] text-neutral-500 font-medium">
                                {perPiece}/item
                              </div>
                              {tier.savings && tier.savings > 0 ? (
                                <div className="text-[10px] font-bold text-emerald-700 mt-0.5">
                                  Save ₹{tier.savings}
                                </div>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <span className="text-xs font-bold text-neutral-800 block mb-1.5">
                    Custom Quantity:
                  </span>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border border-neutral-300 rounded-xl bg-white shadow-xs">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
                        title="Decrease Quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold font-mono text-neutral-900 min-w-8 text-center">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => q + 1)}
                        className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
                        title="Increase Quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-xs text-neutral-600">
                      <span>Total: <strong className="text-neutral-900 font-extrabold">{formattedPrice}</strong></span>
                      {quantity > 1 && (
                        <span className="text-neutral-500 font-medium ml-1.5">({formattedPerPiece}/pc)</span>
                      )}
                      {bundleSavings > 0 && (
                        <span className="text-emerald-700 font-bold ml-1.5 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Save ₹{bundleSavings}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl mb-3 space-y-1">
                  <div className="flex items-center space-x-2 text-xs font-bold text-neutral-900">
                    <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Fast &amp; Reliable Delivery Across India</span>
                  </div>
                  <p className="text-[11px] text-neutral-600 leading-relaxed pl-6">
                    Delivery available across eligible locations. Your order will be delivered to the address provided during checkout.
                  </p>
                </div>

                {/* Payment Guarantees */}
                <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center space-x-2 text-emerald-950 text-[11px] mb-4">
                  <CreditCard className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="font-bold">100% Secure Checkout (UPI / Cards / Net Banking / COD)</span>
                </div>

                {/* Specifications Table */}
                {product.specs && product.specs.length > 0 && (
                  <div className="border border-neutral-200 rounded-xl p-3 bg-white mb-2 space-y-1 text-xs">
                    <span className="font-extrabold text-[11px] uppercase tracking-wider text-neutral-700 block mb-1">
                      Technical Specifications:
                    </span>
                    {product.specs.map((s, idx) => (
                      <div key={idx} className="flex justify-between py-1 border-b border-neutral-100 last:border-0 text-neutral-600">
                        <span className="font-medium text-neutral-500">{s.label}:</span>
                        <span className="font-semibold text-neutral-800">{s.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Primary & Secondary Purchasing Buttons */}
              <div className="pt-3 border-t border-neutral-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Primary CTA: BUY NOW */}
                  <button
                    onClick={handleBuyNow}
                    id="modal-buy-now-btn"
                    className="w-full py-3.5 px-4 rounded-xl text-xs font-extrabold tracking-wide uppercase flex items-center justify-center space-x-2 transition-all shadow-md bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-white cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-white text-white" />
                    <span>Buy Now • {formattedPrice}</span>
                  </button>

                  {/* Secondary CTA: ADD TO CART */}
                  <button
                    onClick={handleAddToCart}
                    id="modal-add-to-cart-btn"
                    className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold tracking-wide uppercase flex items-center justify-center space-x-2 transition-all shadow-sm cursor-pointer ${
                      added
                        ? "bg-emerald-600 text-white font-bold"
                        : "bg-neutral-900 hover:bg-black text-white"
                    }`}
                  >
                    {added ? (
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

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-3 text-center text-[10px] font-medium text-neutral-500 pt-1">
                  <div className="flex flex-col items-center">
                    <Truck className="w-4 h-4 text-amber-600 mb-0.5" />
                    <span>Free Shipping</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 mb-0.5" />
                    <span>100% Genuine</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* SECTION 2: CUSTOMER REVIEWS (PLACED AT THE VERY BOTTOM OF THE PRODUCT PAGE) */}
          <div id="product-reviews-section" className="p-5 sm:p-8 bg-neutral-50/50 border-t border-neutral-200">
            <ProductReviewsSection product={product} />
          </div>

          {/* SECTION 3: MODAL FOOTER */}
          <div className="p-4 bg-neutral-900 text-neutral-400 text-xs text-center border-t border-neutral-800">
            <p className="font-medium">
              Zenvia Ultra-Luxury © 2026 • Verified Premium Quality • Shipped from Mumbai, MH
            </p>
          </div>

        </div>

        {/* Sticky Mobile Purchasing Bar */}
        <div className="sm:hidden sticky bottom-0 z-20 bg-white border-t border-neutral-200 p-3 grid grid-cols-2 gap-2 shadow-2xl">
          <button
            onClick={handleAddToCart}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-bold uppercase bg-neutral-900 text-white flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add to Cart</span>
          </button>
          <button
            onClick={handleBuyNow}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-extrabold uppercase bg-amber-500 text-white flex items-center justify-center space-x-1.5 shadow-md cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-white text-white" />
            <span>Buy Now</span>
          </button>
        </div>

      </div>
    </div>
  );
};
