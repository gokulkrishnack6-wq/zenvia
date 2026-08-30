import React, { useState, useEffect } from "react";
import { CursorSpotlight } from "./components/CursorSpotlight";
import { DiscountBanner } from "./components/DiscountBanner";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { CategoryGrid } from "./components/CategoryGrid";
import { ProductGrid } from "./components/ProductGrid";
import { LuxuryExperience } from "./components/LuxuryExperience";
import { LifestyleBanner } from "./components/LifestyleBanner";
import { NewArrivalsCarousel } from "./components/NewArrivalsCarousel";
import { Testimonials } from "./components/Testimonials";
import { InstagramGallery } from "./components/InstagramGallery";
import { Newsletter } from "./components/Newsletter";
import { Footer } from "./components/Footer";

// Product Details Page
import { ProductDetailsPage } from "./components/ProductDetailsPage";
import { getProductSlug, findProductBySlugOrId } from "./lib/slug";
import { updatePageMetaTags } from "./lib/meta";

// Modals and Overlays
import { QuickViewModal } from "./components/QuickViewModal";
import { CartDrawer } from "./components/CartDrawer";
import { WishlistDrawer } from "./components/WishlistDrawer";
import { CheckoutModal } from "./components/CheckoutModal";
import { AISearchModal } from "./components/AISearchModal";
import { PolicyModal, PolicyTab } from "./components/PolicyModal";
import { MobileBottomNav } from "./components/MobileBottomNav";

import { Product, Currency, CategoryType, CartItem } from "./types";
import { PRODUCTS, CURRENCIES } from "./data/products";

export default function App() {
  const [currency] = useState<Currency>(CURRENCIES[0]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("All");

  // Route state for active Product Details page
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  // Sync state with URL pathname on load & popstate (browser back/forward button)
  useEffect(() => {
    const handleLocationChange = () => {
      const pathname = window.location.pathname;
      if (pathname.startsWith("/product/")) {
        const rawSlug = pathname.replace(/^\/product\//, "");
        const found = findProductBySlugOrId(rawSlug);
        if (found) {
          setActiveProduct(found);
        } else {
          window.history.replaceState(null, "", "/" + window.location.search);
          setActiveProduct(null);
        }
      } else {
        setActiveProduct(null);
      }
    };

    handleLocationChange();

    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  // Update document title and Open Graph metadata when active product changes
  useEffect(() => {
    updatePageMetaTags(activeProduct);
  }, [activeProduct]);

  // Handler to open product details page
  const handleSelectProduct = (product: Product) => {
    const slug = getProductSlug(product);
    const search = window.location.search || "";
    window.history.pushState(null, "", `/product/${slug}${search}`);
    setActiveProduct(product);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handler to go back home
  const handleGoHome = () => {
    const search = window.location.search || "";
    window.history.pushState(null, "", `/${search}`);
    setActiveProduct(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Storage keys for customer cart and wishlist persistence
  const CART_STORAGE_KEY = "zenvia_cart_items_v2";
  const WISHLIST_STORAGE_KEY = "zenvia_wishlist_ids_v2";

  // Helper to initialize cart safely (empty by default for new visitors)
  const loadInitialCart = (): CartItem[] => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item: any) => {
            const product = PRODUCTS.find((p) => p.id === (item.product?.id || item.productId));
            if (!product) return null;
            return {
              product,
              quantity: Math.max(1, Number(item.quantity) || 1),
              selectedColor: item.selectedColor,
              selectedSize: item.selectedSize,
            } as CartItem;
          })
          .filter((item): item is CartItem => item !== null);
      }
    } catch (err) {
      console.error("Error loading cart from localStorage:", err);
    }
    return [];
  };

  // Helper to initialize wishlist safely (empty by default for new visitors)
  const loadInitialWishlist = (): string[] => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (id: any) => typeof id === "string" && PRODUCTS.some((p) => p.id === id)
        );
      }
    } catch (err) {
      console.error("Error loading wishlist from localStorage:", err);
    }
    return [];
  };

  // Cart & Wishlist state (starts 100% EMPTY for new visitors)
  const [cartItems, setCartItems] = useState<CartItem[]>(loadInitialCart);
  const [wishlistIds, setWishlistIds] = useState<string[]>(loadInitialWishlist);

  // Sync cart changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (err) {
      console.error("Error saving cart to localStorage:", err);
    }
  }, [cartItems]);

  // Sync wishlist changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
    } catch (err) {
      console.error("Error saving wishlist to localStorage:", err);
    }
  }, [wishlistIds]);

  // Direct Buy Now state (bypasses full cart)
  const [directBuyItem, setDirectBuyItem] = useState<CartItem | null>(null);

  // Modals
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [aiSearchOpen, setAISearchOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [policyDefaultTab, setPolicyDefaultTab] = useState<PolicyTab>("shipping");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const handleOpenPolicy = (tab: PolicyTab = "shipping") => {
    setPolicyDefaultTab(tab);
    setPolicyOpen(true);
  };

  // Discount
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);

  // Cart total items count
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Buy Now direct purchase handler
  const handleBuyNow = (product: Product, quantity = 1, color?: string, size?: string) => {
    const item: CartItem = {
      product,
      quantity,
      selectedColor: color || product.colors?.[0]?.name,
      selectedSize: size || product.sizes?.[0],
    };
    setDirectBuyItem(item);
    setQuickViewProduct(null);
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  // Cart Management
  const handleAddToCart = (product: Product, color?: string, size?: string, quantity = 1) => {
    const qtyToAdd = Math.max(1, quantity);
    setCartItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.product.id === product.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += qtyToAdd;
        return updated;
      }
      return [
        ...prev,
        {
          product,
          quantity: qtyToAdd,
          selectedColor: color || product.colors?.[0]?.name,
          selectedSize: size || product.sizes?.[0],
        },
      ];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Wishlist
  const handleToggleWishlist = (product: Product) => {
    setWishlistIds((prev) =>
      prev?.includes(product.id)
        ? prev.filter((id) => id !== product.id)
        : [...(prev || []), product.id]
    );
  };

  // Coupon
  const handleApplyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === "ZENVIA10" || clean === "WELCOME10") {
      setCouponCode(clean);
      setDiscountPercent(10);
      return true;
    }
    return false;
  };

  const wishlistedProducts = PRODUCTS.filter((p) => wishlistIds?.includes(p.id));

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Subtle cursor spotlight */}
      <CursorSpotlight />

      {/* Top Navbar with integrated Announcement Bar */}
      <Navbar
        cartCount={cartCount}
        wishlistCount={wishlistIds.length}
        selectedCurrency={currency}
        onOpenCart={() => setCartOpen(true)}
        onOpenWishlist={() => setWishlistOpen(true)}
        onOpenAISearch={() => setAISearchOpen(true)}
        onOpenPolicy={() => setPolicyOpen(true)}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          handleGoHome();
        }}
        selectedCategory={selectedCategory}
      />

      {/* Main Sections */}
      <main className="pt-0">
        {activeProduct ? (
          <ProductDetailsPage
            product={activeProduct}
            currency={currency}
            isWishlisted={wishlistIds.includes(activeProduct.id)}
            wishlistIds={wishlistIds}
            onGoHome={handleGoHome}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              handleGoHome();
            }}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onToggleWishlist={handleToggleWishlist}
            onQuickView={handleSelectProduct}
            onOpenPolicy={handleOpenPolicy}
          />
        ) : (
          <>
            {/* Hero Section */}
            <Hero
              onShopClick={() => {
                const el = document.getElementById("catalog-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              onExploreClick={() => {
                const el = document.getElementById("featured-collections");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            />

            {/* Featured Categories Section */}
            <div id="featured-collections">
              <CategoryGrid
                onSelectCategory={(cat) => {
                  setSelectedCategory(cat);
                  const el = document.getElementById("catalog-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              />
            </div>

            {/* Main Product Catalog Grid / Best Sellers */}
            <ProductGrid
              currency={currency}
              wishlistIds={wishlistIds}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onToggleWishlist={handleToggleWishlist}
              onQuickView={handleSelectProduct}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />

            {/* Indian Trust & Shipping Pillars */}
            <LuxuryExperience />

            {/* Lifestyle Banner / Brand Concept */}
            <LifestyleBanner />

            {/* Trending Deals & New Arrivals Carousel */}
            <NewArrivalsCarousel
              currency={currency}
              wishlistIds={wishlistIds}
              onToggleWishlist={handleToggleWishlist}
              onQuickView={handleSelectProduct}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />

            {/* Real Customer Reviews across India */}
            <Testimonials />

            {/* Social / Lifestyle Gallery */}
            <InstagramGallery onQuickView={handleSelectProduct} />

            {/* Newsletter Signup */}
            <Newsletter />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          handleGoHome();
        }}
        onOpenAISearch={() => setAISearchOpen(true)}
        onOpenPolicy={handleOpenPolicy}
      />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        currency={currency}
        isWishlisted={quickViewProduct ? (wishlistIds?.includes(quickViewProduct.id) ?? false) : false}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        cartItems={cartItems}
        currency={currency}
        couponCode={couponCode}
        discountPercent={discountPercent}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onApplyCoupon={handleApplyCoupon}
        onProceedToCheckout={() => {
          setDirectBuyItem(null);
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={wishlistOpen}
        products={wishlistedProducts}
        currency={currency}
        onClose={() => setWishlistOpen(false)}
        onRemove={(id) => setWishlistIds((prev) => prev.filter((i) => i !== id))}
        onAddToCart={handleAddToCart}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutOpen}
        cartItems={cartItems}
        directBuyItem={directBuyItem}
        currency={currency}
        discountPercent={discountPercent}
        onClose={() => {
          setCheckoutOpen(false);
          setDirectBuyItem(null);
        }}
        onOrderComplete={() => {
          if (directBuyItem) {
            setDirectBuyItem(null);
          } else {
            setCartItems([]);
          }
        }}
      />

      {/* AI Search / Product Finder Modal */}
      <AISearchModal
        isOpen={aiSearchOpen}
        currency={currency}
        onClose={() => setAISearchOpen(false)}
        onQuickView={(p) => {
          setAISearchOpen(false);
          handleSelectProduct(p);
        }}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      {/* Customer Policy & Help Modal */}
      <PolicyModal
        isOpen={policyOpen}
        defaultTab={policyDefaultTab}
        onClose={() => setPolicyOpen(false)}
      />

      {/* Mobile Bottom Navigation Bar (Shown on catalog & explore views) */}
      {!activeProduct && (
        <MobileBottomNav
          cartCount={cartCount}
          wishlistCount={wishlistIds.length}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            handleGoHome();
          }}
          onOpenCart={() => setCartOpen(true)}
          onOpenWishlist={() => setWishlistOpen(true)}
        />
      )}
    </div>
  );
}
