import React from "react";
import { Home, Grid, Heart, ShoppingBag, User } from "lucide-react";
import { CategoryType } from "../types";
import { useAuth } from "../context/AuthContext";

interface MobileBottomNavProps {
  cartCount: number;
  wishlistCount: number;
  selectedCategory: CategoryType;
  onSelectCategory: (cat: CategoryType) => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenAccount: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  cartCount,
  wishlistCount,
  onSelectCategory,
  onOpenCart,
  onOpenWishlist,
  onOpenAccount,
}) => {
  const { user, isAuthenticated } = useAuth();

  const scrollToCatalog = () => {
    onSelectCategory("All");
    const el = document.getElementById("catalog-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-950/95 backdrop-blur-xl border-t border-stone-800 px-2 py-2 flex items-center justify-around shadow-2xl">
      <button
        onClick={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className="flex flex-col items-center justify-center p-1.5 text-stone-400 hover:text-amber-400 transition-colors"
        id="btn-mobile-nav-home"
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span className="text-[9px] uppercase tracking-wider font-medium">Home</span>
      </button>

      <button
        onClick={scrollToCatalog}
        className="flex flex-col items-center justify-center p-1.5 text-stone-400 hover:text-amber-400 transition-colors"
        id="btn-mobile-nav-shop"
      >
        <Grid className="w-5 h-5 mb-0.5" />
        <span className="text-[9px] uppercase tracking-wider font-medium">Shop</span>
      </button>

      <button
        onClick={onOpenWishlist}
        className="flex flex-col items-center justify-center p-1.5 text-stone-400 hover:text-amber-400 transition-colors relative"
        id="btn-mobile-nav-wishlist"
      >
        <Heart className="w-5 h-5 mb-0.5" />
        <span className="text-[9px] uppercase tracking-wider font-medium">Wishlist</span>
        {wishlistCount > 0 && (
          <span className="absolute top-1 right-2 w-4 h-4 bg-amber-500 text-stone-950 rounded-full text-[9px] font-bold flex items-center justify-center">
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
        <span className="text-[9px] uppercase tracking-wider font-medium">Bag</span>
        {cartCount > 0 && (
          <span className="absolute top-1 right-2 w-4 h-4 bg-amber-500 text-stone-950 rounded-full text-[9px] font-bold flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </button>

      <button
        onClick={onOpenAccount}
        className="flex flex-col items-center justify-center p-1.5 text-stone-400 hover:text-amber-400 transition-colors relative"
        id="btn-mobile-nav-account"
      >
        {isAuthenticated && user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.fullName}
            referrerPolicy="no-referrer"
            className="w-5 h-5 rounded-full object-cover border border-amber-400 mb-0.5"
          />
        ) : (
          <User className={`w-5 h-5 mb-0.5 ${isAuthenticated ? "text-amber-400" : ""}`} />
        )}
        <span className={`text-[9px] uppercase tracking-wider font-medium ${isAuthenticated ? "text-amber-400 font-semibold" : ""}`}>
          {isAuthenticated ? "Account" : "Sign In"}
        </span>
      </button>
    </nav>
  );
};
