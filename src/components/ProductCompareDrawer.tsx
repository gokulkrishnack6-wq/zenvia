import React from "react";
import { X, Trash2, ShoppingBag, Star } from "lucide-react";
import { Product, Currency } from "../types";
import { formatRupee } from "../lib/currency";

interface ProductCompareDrawerProps {
  products: Product[];
  currency: Currency;
  onClose: () => void;
  onRemove: (id: string) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductCompareDrawer: React.FC<ProductCompareDrawerProps> = ({
  products,
  currency,
  onClose,
  onRemove,
  onAddToCart,
}) => {
  if (products.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-[#090909]/95 backdrop-blur-2xl border-t border-[#D4AF37]/40 shadow-2xl p-4 sm:p-6 transition-all duration-500 max-h-[85vh] overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-800">
          <div className="flex items-center space-x-2">
            <span className="font-serif-luxury text-2xl text-white font-normal">
              Product Comparison Matrix
            </span>
            <span className="text-xs text-[#D4AF37] px-2 py-0.5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10">
              {products.length} Selected
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 overflow-x-auto">
          {products.map((p) => {
            const formattedPrice = currency.code === "INR"
              ? formatRupee(p.price)
              : `${currency.symbol}${Math.round(p.price * currency.rate).toLocaleString()}`;

            return (
              <div
                key={p.id}
                className="bg-[#121212] border border-neutral-800 rounded-xl p-4 flex flex-col justify-between relative space-y-3"
              >
                <button
                  onClick={() => onRemove(p.id)}
                  className="absolute top-2 right-2 text-neutral-500 hover:text-red-400 p-1"
                  title="Remove from comparison"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center space-x-3">
                  <img
                    src={p.image}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-lg object-cover border border-neutral-800"
                  />
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-[#D4AF37]">
                      {p.category}
                    </span>
                    <h4 className="font-serif-luxury text-base text-white line-clamp-1">
                      {p.name}
                    </h4>
                    <span className="text-xs text-white font-semibold">{formattedPrice}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] pt-2 border-t border-neutral-900">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Rating:</span>
                    <span className="text-white flex items-center">
                      <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37] mr-1" />
                      {p.rating}
                    </span>
                  </div>

                  {p.specs.slice(0, 3).map((spec, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-neutral-500 truncate mr-2">{spec.label}:</span>
                      <span className="text-neutral-200 font-mono truncate text-right">{spec.value}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onAddToCart(p)}
                  className="w-full py-2 rounded-lg btn-gold-luxury text-[11px] uppercase tracking-wider font-medium flex items-center justify-center space-x-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Add to Bag</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
