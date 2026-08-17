import React from "react";
import { Home, Grid, Heart, ShoppingBag } from "lucide-react";
import { CategoryType } from "../types";

interface MobileBottomNavProps {
  cartCount: number;
  wishlistCount: number;
  selectedCategory: CategoryType;
  onSelectCategory: (cat: CategoryType) => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  cartCount,
  wishlistCount,
  onSelectCategory,
  onOpenCart,
  onOpenWishlist,
}) => {
  const scrollToCatalog = () => {
    onSelectCategory("All");
    const el = document.getElementById("catalog-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-950/95 backdrop-blur-xl border-t border-stone-800 px-4 py-2 flex items-center justify-around shadow-2xl">
      <button
        onClick={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className="flex flex-col items-center justify-center p-1.5 text-stone-400 hover:text-amber-400 transition-colors"
        id="btn-mobile-nav-home"
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] uppercase tracking-wider font-medium">Home</span>
      </button>

      <button
        onClick={scrollToCatalog}
        className="flex flex-col items-center justify-center p-1.5 text-stone-400 hover:text-amber-400 transition-colors"
        id="btn-mobile-nav-shop"
      >
        <Grid className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] uppercase tracking-wider font-medium">Shop</span>
      </button>

      <button
        onClick={onOpenWishlist}
        className="flex flex-col items-center justify-center p-1.5 text-stone-400 hover:text-amber-400 transition-colors relative"
        id="btn-mobile-nav-wishlist"
      >
        <Heart className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] uppercase tracking-wider font-medium">Wishlist</span>
        {wishlistCount > 0 && (
          <span className="absolute top-0 right-2 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow">
            {wishlistCount}
          </span>
        )}
      </button>

      <button
        onClick={onOpenCart}
        className="flex flex-col items-center justify-center p-1.5 text-stone-400 hover:text-amber-400 transition-colors relative"
        id="btn-mobile-nav-bag"
      >
        <ShoppingBag className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] uppercase tracking-wider font-medium">Bag</span>
        {cartCount > 0 && (
          <span className="absolute top-0 right-2 w-4 h-4 bg-amber-500 text-stone-950 rounded-full text-[9px] font-bold flex items-center justify-center shadow">
            {cartCount}
          </span>
        )}
      </button>
    </nav>
  );
};
