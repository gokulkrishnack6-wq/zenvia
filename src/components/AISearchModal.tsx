import React, { useState } from "react";
import { X, Sparkles, Search, ArrowRight, Loader2 } from "lucide-react";
import { Product, Currency } from "../types";
import { PRODUCTS } from "../data/products";
import { formatRupee } from "../lib/currency";

interface AISearchModalProps {
  isOpen: boolean;
  currency: Currency;
  onClose: () => void;
  onQuickView: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onBuyNow?: (p: Product) => void;
}

export const AISearchModal: React.FC<AISearchModalProps> = ({
  isOpen,
  currency,
  onClose,
  onQuickView,
  onAddToCart,
  onBuyNow,
}) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<{
    text: string;
    products: Product[];
    tip?: string;
  } | null>(null);

  if (!isOpen) return null;

  const samplePrompts = [
    "Find a luxury gift for a tech executive under ₹1,50,000",
    "Show me horological & timekeeping masterworks",
    "Recommend acoustic products crafted with titanium",
    "What is best for a modern penthouse living room?",
  ];

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setRecommendation(null);

    try {
      const res = await fetch("/api/ai-concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, productsCatalog: PRODUCTS }),
      });

      if (res.ok) {
        const data = await res.json();
        const matched = PRODUCTS.filter((p) =>
          data.recommendedProductIds?.includes(p.id)
        );
        setRecommendation({
          text: data.recommendationText || "Here are our curated concierge recommendations.",
          products: matched.length > 0 ? matched : PRODUCTS.slice(0, 3),
          tip: data.curatedTips,
        });
      } else {
        throw new Error("Concierge API error");
      }
    } catch (err) {
      // Local fallback smart matching
      const lower = searchQuery.toLowerCase();
      const matched = PRODUCTS.filter(
        (p) =>
          p.name?.toLowerCase().includes(lower) ||
          p.category?.toLowerCase().includes(lower) ||
          p.description?.toLowerCase().includes(lower) ||
          p.tags?.some((t) => lower.includes(t.toLowerCase()))
      ).slice(0, 3);

      setRecommendation({
        text: `Welcome to Zenvia Concierge. Based on your inquiry regarding "${searchQuery}", our ateliers recommend these masterworks.`,
        products: matched.length > 0 ? matched : PRODUCTS.slice(0, 3),
        tip: "Fast & reliable delivery across eligible locations in India.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#090909] border border-[#D4AF37]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 bg-black flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            <span className="font-serif-luxury text-xl text-white">
              Zenvia AI Concierge & Smart Advisor
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-6 border-b border-neutral-800 bg-[#121212]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(query);
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask our AI Concierge anything (e.g. 'Gift for an architect under $3,000')..."
                className="w-full bg-black border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl btn-gold-fill text-xs uppercase tracking-widest font-semibold flex items-center space-x-2 shrink-0"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-black" />
              ) : (
                <>
                  <span>Consult</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Sample Prompts */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest self-center mr-1">
              Suggestions:
            </span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(p);
                  handleSearch(p);
                }}
                className="text-[10px] text-neutral-400 hover:text-[#D4AF37] px-2.5 py-1 rounded-full border border-neutral-800 hover:border-[#D4AF37]/40 bg-black/40 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Recommendation Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading && (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto" />
              <p className="font-serif-luxury text-xl text-white">Consulting Zenvia Atelier Intelligence...</p>
              <p className="text-xs text-neutral-500">Analyzing materials, acoustic parameters, & client preferences.</p>
            </div>
          )}

          {!loading && recommendation && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-[#121212] border border-[#D4AF37]/30 space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold block">
                  Concierge Statement
                </span>
                <p className="text-xs text-neutral-200 font-light leading-relaxed">
                  {recommendation.text}
                </p>
                {recommendation.tip && (
                  <p className="text-[11px] text-neutral-400 italic pt-2 border-t border-neutral-800">
                    💡 {recommendation.tip}
                  </p>
                )}
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest text-neutral-400 block mb-3 font-medium">
                  Curated Masterworks ({recommendation.products.length})
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {recommendation.products.map((p) => {
                    const priceFormatted = currency.code === "INR"
                      ? formatRupee(p.price)
                      : `${currency.symbol}${Math.round(p.price * currency.rate).toLocaleString()}`;

                    return (
                      <div
                        key={p.id}
                        className="bg-[#121212] border border-neutral-800 rounded-xl p-3 flex flex-col justify-between hover:border-[#D4AF37]/50 transition-colors"
                      >
                        <div>
                          <img
                            src={p.image}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="w-full aspect-square object-cover rounded-lg mb-2"
                          />
                          <span className="text-[9px] text-[#D4AF37] uppercase font-mono">{p.category}</span>
                          <h4 className="font-serif-luxury text-base text-white truncate">{p.name}</h4>
                          <span className="text-xs font-semibold text-white block mb-3">{priceFormatted}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5">
                          <button
                            onClick={() => {
                              if (onBuyNow) {
                                onBuyNow(p);
                                onClose();
                              } else {
                                onQuickView(p);
                                onClose();
                              }
                            }}
                            className="py-1.5 rounded bg-amber-500 hover:bg-amber-600 text-[10px] font-extrabold text-white uppercase tracking-wider"
                          >
                            Buy Now
                          </button>
                          <button
                            onClick={() => {
                              onAddToCart(p);
                            }}
                            className="py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[10px] font-semibold text-white uppercase tracking-wider"
                          >
                            + Cart
                          </button>
                          <button
                            onClick={() => {
                              onQuickView(p);
                              onClose();
                            }}
                            className="py-1.5 rounded border border-neutral-800 text-[10px] uppercase tracking-wider text-neutral-300 hover:text-white hover:border-amber-500"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {!loading && !recommendation && (
            <div className="text-center py-12 text-neutral-500">
              <Sparkles className="w-10 h-10 mx-auto text-[#D4AF37]/50 mb-3" />
              <p className="font-serif-luxury text-2xl text-neutral-300 mb-1">How may our AI Concierge assist you today?</p>
              <p className="text-xs font-light max-w-md mx-auto">
                Type your inquiry above or choose one of our sample suggestions to receive tailored masterwork recommendations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
