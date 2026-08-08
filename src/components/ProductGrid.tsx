import React, { useState, useMemo } from "react";
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ProductCard } from "./ProductCard";
import { Product, Currency, CategoryType } from "../types";
import { PRODUCTS, CATEGORIES } from "../data/products";
import { formatRupee } from "../lib/currency";

interface ProductGridProps {
  currency: Currency;
  wishlistIds: string[];
  compareIds?: string[];
  selectedCategory: CategoryType;
  onSelectCategory: (cat: CategoryType) => void;
  onToggleWishlist: (p: Product) => void;
  onToggleCompare?: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onBuyNow?: (p: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  currency,
  wishlistIds = [],
  selectedCategory,
  onSelectCategory,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
  onBuyNow,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"bestseller" | "price-low" | "price-high" | "rating">("bestseller");
  const [priceMax, setPriceMax] = useState<number>(2000);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      // Category filter
      if (selectedCategory !== "All" && p.category !== selectedCategory) return false;
      // Price filter
      if (p.price > priceMax) return false;
      // Search query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query);
        const matchCategory = p.category.toLowerCase().includes(query);
        const matchDesc = p.description.toLowerCase().includes(query);
        const matchTags = p.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchName && !matchCategory && !matchDesc && !matchTags) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      // default bestseller
      return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
    });
  }, [selectedCategory, searchQuery, sortBy, priceMax]);

  return (
    <section id="catalog-section" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-neutral-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 block mb-1">
            CURATED PRODUCTS FOR EVERYDAY LIVING
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Trending Finds & Best Sellers
          </h2>
        </div>

        {/* Search & Sort Controls */}
        <div className="mt-6 md:mt-0 flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What are you looking for?"
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="appearance-none bg-neutral-50 border border-neutral-200 rounded-xl pl-3 pr-8 py-2 text-xs text-neutral-800 font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="bestseller">Sort by: Best Sellers</option>
              <option value="rating">Sort by: Customer Rating</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
        <button
          onClick={() => onSelectCategory("All")}
          className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all shrink-0 ${
            selectedCategory === "All"
              ? "bg-neutral-900 text-white shadow-sm"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          }`}
        >
          All Products ({PRODUCTS.length})
        </button>

        {CATEGORIES.map((cat) => {
          const count = PRODUCTS.filter((p) => p.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all shrink-0 ${
                selectedCategory === cat.id
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Filter Info & Price Slider */}
      <div className="flex items-center justify-between text-xs text-neutral-600 mb-6 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200/80">
        <span>
          Showing <strong className="text-neutral-900 font-bold">{filteredProducts.length}</strong> of{" "}
          <strong className="text-neutral-900 font-bold">{PRODUCTS.length}</strong> smart products
        </span>

        {/* Price Slider */}
        <div className="hidden sm:flex items-center space-x-3">
          <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
          <span>Max Price: <strong className="text-neutral-900">{formatRupee(priceMax)}</strong></span>
          <input
            type="range"
            min="300"
            max="2000"
            step="100"
            value={priceMax}
            onChange={(e) => setPriceMax(Number(e.target.value))}
            className="w-28 accent-neutral-900 cursor-pointer"
          />
        </div>
      </div>

      {/* Product Cards Grid with smooth motion transitions */}
      {filteredProducts.length > 0 ? (
        <AnimatePresence mode="popLayout">
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8"
          >
            {filteredProducts.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProductCard
                  product={p}
                  currency={currency}
                  isWishlisted={wishlistIds?.includes(p.id) ?? false}
                  onToggleWishlist={onToggleWishlist}
                  onQuickView={onQuickView}
                  onAddToCart={onAddToCart}
                  onBuyNow={onBuyNow}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="text-center py-16 bg-neutral-50 rounded-2xl border border-neutral-200">
          <p className="text-lg font-bold text-neutral-800 mb-1">No products found matching your search</p>
          <p className="text-xs text-neutral-500 mb-5">Try adjusting search query or price slider filter.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              onSelectCategory("All");
              setPriceMax(2000);
            }}
            className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
};
