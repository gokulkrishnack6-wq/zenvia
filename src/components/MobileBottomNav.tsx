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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090909]/95 backdrop-blur-xl border-t border-[#D4AF37]/30 px-3 py-2 flex items-center justify-around shadow-[0_-5px_20px_rgba(0,0,0,0.8)]">
      <button
        onClick={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className="flex flex-col items-center justify-center p-1.5 text-neutral-400 hover:text-[#D4AF37] transition-colors"
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span className="text-[9px] uppercase tracking-wider font-medium">Home</span>
      </button>

      <button
        onClick={scrollToCatalog}
        className="flex flex-col items-center justify-center p-1.5 text-neutral-400 hover:text-[#D4AF37] transition-colors"
      >
        <Grid className="w-5 h-5 mb-0.5" />
        <span className="text-[9px] uppercase tracking-wider font-medium">Shop</span>
      </button>

      <button
        onClick={onOpenWishlist}
        className="flex flex-col items-center justify-center p-1.5 text-neutral-400 hover:text-[#D4AF37] transition-colors relative"
      >
        <Heart className="w-5 h-5 mb-0.5" />
        <span className="text-[9px] uppercase tracking-wider font-medium">Wishlist</span>
        {wishlistCount > 0 && (
          <span className="absolute top-1 right-2 w-4 h-4 bg-[#D4AF37] text-black rounded-full text-[9px] font-bold flex items-center justify-center">
            {wishlistCount}
          </span>
        )}
      </button>

      <button
        onClick={onOpenCart}
        className="flex flex-col items-center justify-center p-1.5 text-neutral-400 hover:text-[#D4AF37] transition-colors relative"
      >
        <ShoppingBag className="w-5 h-5 mb-0.5" />
        <span className="text-[9px] uppercase tracking-wider font-medium">Bag</span>
        {cartCount > 0 && (
          <span className="absolute top-1 right-2 w-4 h-4 bg-[#D4AF37] text-black rounded-full text-[9px] font-bold flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </button>
    </nav>
  );
};
