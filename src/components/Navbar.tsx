import React, { useState, useEffect } from "react";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Truck,
  Menu,
  X,
  Sparkles,
  MapPin,
  ChevronDown,
  Package,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Currency, CategoryType } from "../types";
import { CATEGORIES } from "../data/products";
import { ZenviaLogo } from "./ZenviaLogo";
import { useAuth } from "../context/AuthContext";

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  compareCount?: number;
  selectedCurrency: Currency;
  onSelectCurrency?: (c: Currency) => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenAccount: () => void;
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
  onOpenAccount,
  onOpenAISearch,
  onOpenPolicy,
  onSelectCategory,
  selectedCategory,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-neutral-200/90 py-2 shadow-sm"
          : "bg-white border-b border-neutral-200 py-3"
      }`}
    >
      {/* Top Shipping Bar */}
      <div className="bg-neutral-900 text-white text-[11px] py-1 px-4 text-center font-medium tracking-wide flex items-center justify-center space-x-2">
        <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
        <span>🚚 Express Delivery Across India • Free Delivery Above ₹499 • UPI & COD Available</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2 flex items-center justify-between gap-4">
        
        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden text-neutral-800 hover:text-amber-600 p-2 transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Brand Logo */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSelectCategory("All");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center space-x-2 group shrink-0 py-0.5 hover:opacity-90 transition-opacity"
          title="Zenvia Official Store"
        >
          <ZenviaLogo variant="gold" className={`w-auto transition-all duration-300 ${scrolled ? "h-9 sm:h-10" : "h-10 sm:h-11"}`} />
        </a>

        {/* Search Bar - Center Desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
          <button
            onClick={onOpenAISearch}
            className="w-full flex items-center justify-between bg-neutral-100 hover:bg-neutral-100/80 border border-neutral-200 hover:border-amber-400/60 rounded-xl px-3.5 py-2 text-xs text-neutral-500 transition-all text-left cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              <Search className="w-4 h-4 text-neutral-400" />
              <span>What are you looking for?</span>
            </div>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
              Search
            </span>
          </button>
        </div>

        {/* Desktop Navigation Category Links */}
        <nav className="hidden lg:flex items-center space-x-6 text-xs font-semibold text-neutral-700">
          <button
            onClick={() => onSelectCategory("All")}
            className={`transition-colors py-1 hover-underline-luxury cursor-pointer ${
              selectedCategory === "All" ? "text-amber-600 font-extrabold" : "hover:text-neutral-900"
            }`}
          >
            All Products
          </button>

          {/* Categories Dropdown */}
          <div className="relative">
            <button
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className="flex items-center space-x-1 hover:text-neutral-900 py-1 cursor-pointer"
            >
              <span>Categories</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${categoryDropdownOpen ? "rotate-180 text-amber-600" : ""}`} />
            </button>

            <AnimatePresence>
              {categoryDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-0 mt-2 w-52 bg-white border border-neutral-200 rounded-xl shadow-2xl py-2 z-50"
                  onMouseLeave={() => setCategoryDropdownOpen(false)}
                >
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        onSelectCategory(cat.id);
                        setCategoryDropdownOpen(false);
                        const sec = document.getElementById("catalog-section");
                        if (sec) sec.scrollIntoView({ behavior: "smooth" });
                      }}
                      className={`w-full text-left px-4 py-2 text-xs hover:bg-neutral-50 font-medium transition-colors cursor-pointer ${
                        selectedCategory === cat.id ? "text-amber-600 font-extrabold bg-amber-50/60" : "text-neutral-700"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => {
              onSelectCategory("Best Sellers");
              const sec = document.getElementById("catalog-section");
              if (sec) sec.scrollIntoView({ behavior: "smooth" });
            }}
            className="hover:text-amber-600 transition-colors hover-underline-luxury cursor-pointer"
          >
            Best Sellers
          </button>
        </nav>

        {/* Right Icon Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Search Mobile Trigger */}
          <button
            onClick={onOpenAISearch}
            className="md:hidden text-neutral-700 hover:text-neutral-900 p-2 cursor-pointer"
            title="Search"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Wishlist */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onOpenWishlist}
            className="relative text-neutral-700 hover:text-neutral-900 p-2 transition-colors cursor-pointer"
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
                  className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow"
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
            className="relative p-2 rounded-xl bg-neutral-900 hover:bg-black text-white transition-all shadow-sm flex items-center justify-center cursor-pointer"
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
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-white text-[11px] font-extrabold rounded-full flex items-center justify-center shadow-md"
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* User Account / Profile Menu */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (isAuthenticated) {
                  setUserMenuOpen(!userMenuOpen);
                } else {
                  onOpenAccount();
                }
              }}
              id="navbar-account-btn"
              className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-neutral-800 hover:text-neutral-950 hover:bg-neutral-100/80 transition-colors border border-transparent hover:border-neutral-200 cursor-pointer"
              title={isAuthenticated ? `Account: ${user?.fullName}` : "Sign In / Account"}
              aria-label="Customer Account"
            >
              {isAuthenticated && user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-full object-cover border border-amber-500/50"
                />
              ) : isAuthenticated ? (
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-800 font-bold flex items-center justify-center text-xs">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                </div>
              ) : (
                <User className="w-5 h-5 text-neutral-700" />
              )}

              <span className="hidden sm:inline text-xs font-semibold text-neutral-800 truncate max-w-[100px]">
                {isAuthenticated ? user?.fullName?.split(" ")[0] || "Account" : "Sign In"}
              </span>

              {isAuthenticated && (
                <ChevronDown className={`w-3.5 h-3.5 text-neutral-500 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
              )}
            </motion.button>

            {/* User Dropdown */}
            <AnimatePresence>
              {userMenuOpen && isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  onMouseLeave={() => setUserMenuOpen(false)}
                  className="absolute right-0 mt-2 w-56 bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl py-2 z-50 text-xs text-stone-200"
                >
                  <div className="px-4 py-2 border-b border-stone-800">
                    <p className="font-semibold text-stone-100 truncate">{user?.fullName}</p>
                    <p className="text-[11px] text-stone-400 font-mono truncate">{user?.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onOpenAccount();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-stone-800 text-stone-300 hover:text-amber-400 text-left transition-colors"
                  >
                    <Package className="w-4 h-4 text-amber-400" />
                    <span>My Orders ({user ? "View All" : ""})</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onOpenAccount();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-stone-800 text-stone-300 hover:text-amber-400 text-left transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span>Saved Addresses</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      onOpenAccount();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-stone-800 text-stone-300 hover:text-amber-400 text-left transition-colors"
                  >
                    <User className="w-4 h-4 text-amber-400" />
                    <span>Personal Details</span>
                  </button>

                  <div className="pt-1 mt-1 border-t border-stone-800">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-rose-950/40 text-rose-400 text-left transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden bg-white border-b border-neutral-200 px-6 py-5 mt-2 space-y-4 shadow-xl overflow-hidden"
          >
            {/* Account Quick Status on Mobile */}
            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                  {isAuthenticated ? (user?.fullName?.charAt(0).toUpperCase() || "U") : <User className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-900">
                    {isAuthenticated ? user?.fullName : "Guest Shopper"}
                  </p>
                  <p className="text-[10px] text-neutral-500 font-mono">
                    {isAuthenticated ? user?.email : "Sign in to save addresses"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAccount();
                }}
                className="text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200"
              >
                {isAuthenticated ? "My Account" : "Sign In"}
              </button>
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAISearch();
                }}
                className="w-full flex items-center justify-between bg-neutral-100 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-500"
              >
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-neutral-400" />
                  <span>What are you looking for?</span>
                </div>
              </button>
            </div>

            <div className="flex flex-col space-y-2 text-sm font-semibold text-neutral-800">
              <button
                onClick={() => {
                  onSelectCategory("All");
                  setMobileMenuOpen(false);
                }}
                className={`text-left py-2 border-b border-neutral-100 ${
                  selectedCategory === "All" ? "text-amber-600 font-bold" : ""
                }`}
              >
                All Products
              </button>

              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    setMobileMenuOpen(false);
                    const sec = document.getElementById("catalog-section");
                    if (sec) sec.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`text-left py-2 border-b border-neutral-100 ${
                    selectedCategory === cat.id ? "text-amber-600 font-bold" : ""
                  }`}
                >
                  {cat.name}
                </button>
              ))}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAccount();
                }}
                className="text-left py-2 text-neutral-700 hover:text-amber-600 border-b border-neutral-100 flex items-center justify-between"
              >
                <span>My Orders & Tracking</span>
                <Package className="w-4 h-4 text-neutral-400" />
              </button>

              <button
                onClick={() => {
                  onOpenPolicy();
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2 text-neutral-500 font-normal text-xs"
              >
                Policies & Help Center
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

