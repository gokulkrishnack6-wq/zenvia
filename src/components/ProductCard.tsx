import React, { useState } from "react";
import { Star, Heart, Eye, ShoppingBag, Check, Truck, Zap } from "lucide-react";
import { motion } from "motion/react";
import { Product, Currency } from "../types";
import { formatRupee } from "../lib/currency";

interface ProductCardProps {
  product: Product;
  currency: Currency;
  isWishlisted: boolean;
  isCompared?: boolean;
  onToggleWishlist: (p: Product) => void;
  onToggleCompare?: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onBuyNow?: (p: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
  onBuyNow,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [added, setAdded] = useState(false);

  const formattedPrice = formatRupee(product.price);
  const formattedOriginal = product.originalPrice ? formatRupee(product.originalPrice) : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBuyNow) {
      onBuyNow(product);
    } else {
      onQuickView(product);
    }
  };

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      id={`product-card-${product.id}`}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group relative bg-white rounded-2xl border border-neutral-200/90 hover:border-amber-300/80 hover:shadow-xl hover:shadow-amber-900/5 transition-all duration-500 overflow-hidden flex flex-col justify-between"
    >
      {/* Top Image Container */}
      <div 
        className="relative aspect-square overflow-hidden bg-neutral-100 cursor-pointer" 
        onClick={() => onQuickView(product)}
      >
        {/* Main Product Image with subtle zoom */}
        <motion.img
          src={isHovered && product.alternateImage ? product.alternateImage : product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full object-cover object-center"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.pricingTiers && product.pricingTiers.length > 0 && (
            <span className="px-2.5 py-1 rounded-md bg-amber-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
              PACK OFFERS AVAILABLE
            </span>
          )}
          {product.isBestseller && (
            <span className="px-2.5 py-1 rounded-md bg-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
              BESTSELLER
            </span>
          )}
          {product.isNew && (
            <span className="px-2.5 py-1 rounded-md bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
              NEW DROP
            </span>
          )}
          {product.originalPrice && (
            <span className="px-2.5 py-1 rounded-md bg-rose-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
              SAVE {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          whileTap={{ scale: 0.85 }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 z-10 shadow-md ${
            isWishlisted
              ? "bg-rose-50 text-rose-600 border border-rose-200"
              : "bg-white/90 text-neutral-600 hover:bg-white hover:text-rose-600 border border-neutral-200"
          }`}
          title="Add to Wishlist"
          aria-label="Add to Wishlist"
        >
          <Heart className={`w-4 h-4 transition-transform duration-300 ${isWishlisted ? "fill-rose-600 text-rose-600 scale-110" : ""}`} />
        </motion.button>

        {/* Quick View Hover Overlay Button */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-white/95 hover:bg-white text-neutral-900 text-xs font-bold border border-neutral-200 shadow-xl flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
          >
            <Eye className="w-3.5 h-3.5 text-amber-600" />
            <span>Quick View & Details</span>
          </button>
        </div>
      </div>

      {/* Details Container */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
            <span className="font-extrabold text-[10px] text-amber-800 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
              {product.category}
            </span>
            <div className="flex items-center space-x-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-neutral-900 text-xs font-bold">{product.rating}</span>
              <span className="text-neutral-400 text-[11px]">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => onQuickView(product)}
            className="text-base font-extrabold text-neutral-900 hover:text-amber-600 transition-colors cursor-pointer line-clamp-1 mb-1"
          >
            {product.name}
          </h3>

          {/* Tagline / Short Description */}
          <p className="text-xs text-neutral-500 line-clamp-1 mb-3">
            {product.tagline}
          </p>
        </div>

        {/* Free Delivery Message */}
        <div className="flex items-center space-x-1.5 text-[11px] font-bold mb-3">
          <span className="text-emerald-800 flex items-center space-x-1">
            <span>Free Delivery Across India 🚚</span>
          </span>
        </div>

        {/* Price & Action Buttons */}
        <div className="pt-3 border-t border-neutral-100 space-y-2.5">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline space-x-2">
              <span className="text-lg font-black text-neutral-900">{formattedPrice}</span>
              {formattedOriginal && (
                <span className="text-xs text-neutral-400 line-through font-medium">
                  {formattedOriginal}
                </span>
              )}
            </div>
            {product.originalPrice && (
              <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded">
                Save {formatRupee(product.originalPrice - product.price)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Primary CTA: Buy Now */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleBuyNowClick}
              id={`buy-now-${product.id}`}
              className="px-3 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-sm hover:shadow-md flex items-center justify-center space-x-1 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-amber-200 text-amber-200" />
              <span>Buy Now</span>
            </motion.button>

            {/* Secondary CTA: Add to Cart */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleAddToCart}
              id={`add-to-cart-${product.id}`}
              className={`px-2.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-all shadow-sm ${
                added
                  ? "bg-emerald-600 text-white font-extrabold"
                  : "bg-neutral-900 hover:bg-black text-white hover:shadow-md"
              }`}
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Added ✓</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

