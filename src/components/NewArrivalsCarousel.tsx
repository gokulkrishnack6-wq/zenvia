import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { Product, Currency } from "../types";
import { PRODUCTS } from "../data/products";

interface NewArrivalsCarouselProps {
  currency: Currency;
  wishlistIds?: string[];
  compareIds?: string[];
  onToggleWishlist: (p: Product) => void;
  onToggleCompare?: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onBuyNow?: (p: Product) => void;
}

export const NewArrivalsCarousel: React.FC<NewArrivalsCarouselProps> = ({
  currency,
  wishlistIds = [],
  compareIds = [],
  onToggleWishlist,
  onToggleCompare,
  onQuickView,
  onAddToCart,
  onBuyNow,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const newProducts = PRODUCTS.filter((p) => p.isNew || p.isFeatured || p.stockCount <= 5);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-24 bg-[#090909] border-t border-neutral-800/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 border-b border-neutral-800 pb-6">
          <div>
            <span className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-medium block mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>FRESH DROPS & LIMITED EDITIONS</span>
            </span>
            <h2 className="font-serif-luxury text-4xl sm:text-5xl font-light text-white">
              New Arrivals
            </h2>
          </div>

          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 rounded-full border border-neutral-800 bg-[#121212] hover:border-[#D4AF37] hover:text-[#D4AF37] text-white flex items-center justify-center transition-colors shadow-md"
              title="Scroll Left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full border border-neutral-800 bg-[#121212] hover:border-[#D4AF37] hover:text-[#D4AF37] text-white flex items-center justify-center transition-colors shadow-md"
              title="Scroll Right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel Row */}
        <div
          ref={scrollRef}
          className="flex space-x-6 overflow-x-auto pb-8 scrollbar-none snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {newProducts.map((p) => (
            <div key={p.id} className="w-[280px] sm:w-[320px] shrink-0 snap-start">
              <ProductCard
                product={p}
                currency={currency}
                isWishlisted={wishlistIds?.includes(p.id) ?? false}
                isCompared={compareIds?.includes(p.id) ?? false}
                onToggleWishlist={onToggleWishlist}
                onToggleCompare={onToggleCompare}
                onQuickView={onQuickView}
                onAddToCart={onAddToCart}
                onBuyNow={onBuyNow}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
