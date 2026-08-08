import React from "react";
import { CategoryType } from "../types";
import { CATEGORIES } from "../data/products";
import { ShieldCheck, Truck, Phone, Mail, RotateCcw, MapPin, Heart } from "lucide-react";
import { ZenviaLogo } from "./ZenviaLogo";

interface FooterProps {
  onSelectCategory: (cat: CategoryType) => void;
  onOpenAccount?: () => void;
  onOpenAISearch: () => void;
  onOpenPolicy: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenAISearch,
  onOpenPolicy,
}) => {
  return (
    <footer className="bg-neutral-900 text-neutral-300 pt-16 pb-24 sm:pb-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Trust Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-neutral-800 text-xs">
          <div className="flex items-center space-x-3 bg-neutral-800/60 p-3.5 rounded-xl border border-neutral-700/50">
            <Truck className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="text-white font-bold block">Ships Across India</span>
              <span className="text-neutral-400 text-[11px]">Free delivery over ₹499</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-neutral-800/60 p-3.5 rounded-xl border border-neutral-700/50">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="text-white font-bold block">100% Quality Verified</span>
              <span className="text-neutral-400 text-[11px]">Every product checked</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-neutral-800/60 p-3.5 rounded-xl border border-neutral-700/50">
            <RotateCcw className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <span className="text-white font-bold block">7-Day Easy Returns</span>
              <span className="text-neutral-400 text-[11px]">Instant UPI refunds</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-neutral-800/60 p-3.5 rounded-xl border border-neutral-700/50">
            <Phone className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="text-white font-bold block">Helpline & WhatsApp</span>
              <span className="text-neutral-400 text-[11px]">1800-ZENVIA-IN</span>
            </div>
          </div>
        </div>

        {/* Main Footer Column Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12 border-b border-neutral-800">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onSelectCategory("All");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-block hover:opacity-90 transition-opacity"
                title="Zenvia Official Store"
              >
                <ZenviaLogo variant="gold" className="h-12 w-auto" />
              </a>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              Discover affordable, useful, trendy and giftable smart products delivered across India. High quality shopping made simple and reliable.
            </p>

            <div className="space-y-1.5 text-xs text-neutral-300">
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>support@zenvia.in</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Mumbai • Delhi • Bengaluru • Hyderabad</span>
              </div>
            </div>
          </div>

          {/* Categories Col */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              Product Categories
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onSelectCategory("All")} className="hover:text-amber-400 transition-colors">
                  All Products
                </button>
              </li>
              {CATEGORIES.map((c) => (
                <li key={c.id}>
                  <button onClick={() => onSelectCategory(c.id)} className="hover:text-amber-400 transition-colors">
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              Customer Care
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={onOpenPolicy} className="hover:text-amber-400 transition-colors">
                  Shipping & Delivery Info
                </button>
              </li>
              <li>
                <button onClick={onOpenPolicy} className="hover:text-amber-400 transition-colors">
                  7-Day Return & Refund Policy
                </button>
              </li>
              <li>
                <button onClick={onOpenAISearch} className="hover:text-amber-400 transition-colors">
                  Product Finder & Search
                </button>
              </li>
            </ul>
          </div>

          {/* Accepted Payments in India */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              Accepted Payments
            </h3>
            <p className="text-xs text-neutral-400 mb-3">
              We accept all popular payment methods across India:
            </p>
            <div className="flex flex-wrap gap-2 text-[10px] font-bold text-neutral-300">
              <span className="px-2 py-1 rounded bg-neutral-800 border border-neutral-700">UPI / GPay</span>
              <span className="px-2 py-1 rounded bg-neutral-800 border border-neutral-700">PhonePe</span>
              <span className="px-2 py-1 rounded bg-neutral-800 border border-neutral-700">Paytm</span>
              <span className="px-2 py-1 rounded bg-neutral-800 border border-neutral-700">Cash on Delivery</span>
              <span className="px-2 py-1 rounded bg-neutral-800 border border-neutral-700">RuPay Cards</span>
              <span className="px-2 py-1 rounded bg-neutral-800 border border-neutral-700">Net Banking</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} ZENVIA India. All rights reserved.</p>

          <div className="flex items-center space-x-2 text-neutral-400">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for Indian Shoppers</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
