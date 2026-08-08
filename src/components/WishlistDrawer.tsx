import React from "react";
import { X, Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Product, Currency } from "../types";
import { formatRupee } from "../lib/currency";

interface WishlistDrawerProps {
  isOpen: boolean;
  products: Product[];
  currency: Currency;
  onClose: () => void;
  onRemove: (id: string) => void;
  onAddToCart: (p: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  products,
  currency,
  onClose,
  onRemove,
  onAddToCart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#090909] border-l border-[#D4AF37]/30 h-full flex flex-col justify-between shadow-2xl animate-slide-left">
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-black/60">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-[#D4AF37] fill-[#D4AF37]" />
            <span className="font-serif-luxury text-2xl text-white font-normal">
              Saved Masterworks
            </span>
            <span className="text-xs text-[#D4AF37] px-2 py-0.5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 font-mono">
              ({products.length})
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {products.length > 0 ? (
            products.map((p) => {
              const formattedPrice = currency.code === "INR"
                ? formatRupee(p.price)
                : `${currency.symbol}${Math.round(p.price * currency.rate).toLocaleString()}`;

              return (
                <div
                  key={p.id}
                  className="p-4 rounded-xl bg-[#121212] border border-neutral-800 flex space-x-4 items-center justify-between"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-lg object-cover border border-neutral-800 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] uppercase tracking-widest text-[#D4AF37]">
                      {p.category}
                    </span>
                    <h4 className="font-serif-luxury text-base text-white truncate">
                      {p.name}
                    </h4>
                    <span className="text-xs font-semibold text-white block mt-0.5">
                      {formattedPrice}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => {
                        onAddToCart(p);
                        onRemove(p.id);
                      }}
                      className="px-3 py-1.5 rounded border border-[#D4AF37] bg-[#D4AF37]/10 hover:bg-[#D4AF37] hover:text-black text-[#D4AF37] text-xs font-medium flex items-center space-x-1 transition-colors"
                      title="Move to Cart"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Move</span>
                    </button>

                    <button
                      onClick={() => onRemove(p.id)}
                      className="text-neutral-500 hover:text-red-400 p-1.5"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-20 text-neutral-500">
              <Heart className="w-12 h-12 mx-auto text-neutral-700 mb-3" />
              <p className="font-serif-luxury text-2xl text-neutral-300 mb-1">Your wishlist is empty</p>
              <p className="text-xs font-light">Click the heart icon on any product to save it to your private list.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
