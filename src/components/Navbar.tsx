import React, { useState, useEffect } from "react";
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  User,
  Star,
  HelpCircle,
  ShoppingBag as ShopIcon,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Currency, CategoryType } from "../types";
import { ZenviaLogo } from "./ZenviaLogo";
import { DiscountBanner } from "./DiscountBanner";

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  compareCount?: number;
  selectedCurrency: Currency;
  onSelectCurrency?: (c: Currency) => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenAISearch: () => void;
  onOpenCompare?: () => void;
  onOpenPolicy: () => void;
  onSelectCategory: (cat: CategoryType) => void;
  selectedCategory: CategoryType;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenAISearch,
  onOpenPolicy,
  onSelectCategory,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToReviews = () => {
    const el = document.getElementById("reviews-section") || document.getElementById("product-reviews-container");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToShop = () => {
    onSelectCategory("All");
    const el = document.getElementById("catalog-section") || document.getElementById("main-product-details-container");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header
      className={`sticky top-0 left-0 right-0 z-40 transition-all duration-300 bg-white ${
        scrolled
          ? "border-b border-neutral-200/90 shadow-xs"
          : "border-b border-neutral-200"
      }`}
    >
      {/* Top Announcement & Trust Bar */}
      <DiscountBanner />

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 transition-all duration-300 ${
        scrolled ? "py-2.5" : "py-3 sm:py-3.5"
      }`}>
        
        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden text-neutral-800 hover:text-amber-600 p-2 -ml-2 transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Left: Desktop Navigation: Shop, Best Sellers, About, Reviews */}
        <nav className="hidden lg:flex items-center space-x-5 text-xs font-bold tracking-wide text-neutral-800 flex-1">
          <button
            onClick={scrollToShop}
            className="transition-colors hover:text-neutral-950 py-1 hover-underline-luxury cursor-pointer flex items-center space-x-1"
          >
            <span>Shop</span>
            <span className="text-[10px] text-neutral-400 font-bold">+</span>
          </button>

          <button
            onClick={scrollToShop}
            className="px-2.5 py-1 rounded-md bg-[#e6f4f8] text-[#136b8a] hover:bg-[#d9eff5] transition-colors font-extrabold text-[11px] cursor-pointer"
          >
            Best Sellers
          </button>

          <button
            onClick={() => onOpenPolicy()}
            className="transition-colors hover:text-neutral-950 py-1 hover-underline-luxury cursor-pointer flex items-center space-x-1"
          >
            <span>Our Story</span>
            <span className="text-[10px] text-neutral-400 font-bold">+</span>
          </button>

          <button
            onClick={scrollToReviews}
            className="transition-colors hover:text-neutral-950 py-1 hover-underline-luxury cursor-pointer"
          >
            Reviews
          </button>
        </nav>

        {/* Center: Brand Logo */}
        <div className="flex justify-center shrink-0">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSelectCategory("All");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center space-x-2 group py-0.5 hover:opacity-90 transition-opacity"
            title="ZENVIA"
          >
            <ZenviaLogo variant="gold" className={`w-auto transition-all duration-300 ${scrolled ? "h-8 sm:h-9" : "h-9 sm:h-10"}`} />
          </a>
        </div>

        {/* Right Actions: Search, Account, Cart */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Search Trigger */}
          <button
            onClick={onOpenAISearch}
            className="text-neutral-700 hover:text-neutral-950 p-2 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            title="Search"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Account */}
          <button
            onClick={() => onOpenPolicy()}
            className="hidden sm:inline-flex text-neutral-700 hover:text-neutral-950 p-2 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            title="Account & Support"
            aria-label="Account"
          >
            <User className="w-5 h-5" />
          </button>

          {/* Wishlist */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onOpenWishlist}
            className="relative text-neutral-700 hover:text-neutral-950 p-2 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            title="Wishlist"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            <AnimatePresence>
              {wishlistCount > 0 && (
                <motion.span 
                  key={`wishlist-badge-${wishlistCount}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow"
                >
                  {wishlistCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Cart Bag */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onOpenCart}
            id="cart-bag-btn"
            className="relative p-2.5 rounded-xl bg-neutral-950 hover:bg-black text-white transition-all shadow-sm flex items-center justify-center cursor-pointer"
            title="Shopping Cart"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span 
                  key={`cart-badge-${cartCount}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-md"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden bg-white border-b border-neutral-200 px-6 py-4 space-y-3 shadow-xl overflow-hidden"
          >
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAISearch();
              }}
              className="w-full flex items-center justify-between bg-neutral-100 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-500"
            >
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-neutral-400" />
                <span>Search catalog...</span>
              </div>
            </button>

            <div className="flex flex-col space-y-1 text-sm font-semibold text-neutral-800 pt-1">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  scrollToShop();
                }}
                className="flex items-center space-x-3 py-2.5 border-b border-neutral-100 hover:text-amber-600 transition-colors text-left"
              >
                <ShopIcon className="w-4 h-4 text-neutral-400" />
                <span>Shop</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPolicy();
                }}
                className="flex items-center space-x-3 py-2.5 border-b border-neutral-100 hover:text-amber-600 transition-colors text-left"
              >
                <Info className="w-4 h-4 text-neutral-400" />
                <span>About</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  scrollToReviews();
                }}
                className="flex items-center space-x-3 py-2.5 border-b border-neutral-100 hover:text-amber-600 transition-colors text-left"
              >
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Reviews</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPolicy();
                }}
                className="flex items-center space-x-3 py-2.5 hover:text-amber-600 transition-colors text-left"
              >
                <HelpCircle className="w-4 h-4 text-neutral-400" />
                <span>Contact &amp; Policies</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};


