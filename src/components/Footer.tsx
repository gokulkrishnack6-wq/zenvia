import React from "react";
import { CategoryType } from "../types";
import { CATEGORIES } from "../data/products";
import { ShieldCheck, Truck, Phone, Mail, MapPin, Heart, Lock, HelpCircle } from "lucide-react";
import { ZenviaLogo } from "./ZenviaLogo";
import { PolicyTab } from "./PolicyModal";

interface FooterProps {
  onSelectCategory: (cat: CategoryType) => void;
  onOpenAISearch: () => void;
  onOpenPolicy: (tab?: PolicyTab) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenAISearch,
  onOpenPolicy,
}) => {
  return (
    <footer className="bg-neutral-950 text-neutral-300 pt-14 pb-24 sm:pb-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Trust Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-10 border-b border-neutral-800 text-xs">
          <div className="flex items-center space-x-3 bg-neutral-900/80 p-3.5 rounded-xl border border-neutral-800">
            <Truck className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="text-white font-bold block">Pan-India Delivery</span>
              <span className="text-neutral-400 text-[11px]">Free delivery on orders over ₹499</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-neutral-900/80 p-3.5 rounded-xl border border-neutral-800">
            <Lock className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="text-white font-bold block">Secure Checkout</span>
              <span className="text-neutral-400 text-[11px]">256-bit encrypted SSL payment</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-neutral-900/80 p-3.5 rounded-xl border border-neutral-800">
            <Mail className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="text-white font-bold block">Customer Support</span>
              <span className="text-neutral-400 text-[11px]">support@zenvia.in (Mon–Sat 9AM–6PM)</span>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-10 border-b border-neutral-800">
          
          {/* Brand Col */}
          <div className="space-y-3.5">
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
              <ZenviaLogo variant="gold" className="h-10 w-auto" />
            </a>

            <p className="text-xs text-neutral-300 font-medium leading-relaxed">
              "Zenvia — Smart products for a better everyday life."
            </p>

            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Practical, high-utility home and lifestyle essentials delivered to your doorstep across India.
            </p>

            <div className="pt-1 text-xs text-neutral-300 space-y-1">
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>support@zenvia.in</span>
              </div>
              <div className="flex items-center space-x-2 text-[11px] text-neutral-400">
                <span>Support Hours: Mon – Sat, 9:00 AM – 6:00 PM IST</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Navigation
            </h3>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <button
                  onClick={() => {
                    onSelectCategory("All");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onSelectCategory("All");
                    const el = document.getElementById("catalog-section") || document.getElementById("featured-products");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                    else window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Shop
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy("about")}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy("contact")}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAISearch}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Search Products
                </button>
              </li>
            </ul>
          </div>

          {/* Policies & Trust */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Customer Policies
            </h3>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <button
                  onClick={() => onOpenPolicy("shipping")}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Shipping Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy("refund")}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Refund & Cancellation Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy("privacy")}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy("terms")}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Terms & Conditions
                </button>
              </li>
            </ul>
          </div>

          {/* Accepted Payment Options */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Payment Options
            </h3>
            <p className="text-[11px] text-neutral-400 mb-3">
              Safe & secure payment options available at checkout:
            </p>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-neutral-300">
              <span className="px-2 py-1 rounded bg-neutral-900 border border-neutral-800">UPI (GPay / PhonePe / Paytm)</span>
              <span className="px-2 py-1 rounded bg-neutral-900 border border-neutral-800">Credit / Debit Cards</span>
              <span className="px-2 py-1 rounded bg-neutral-900 border border-neutral-800">Net Banking</span>
              <span className="px-2 py-1 rounded bg-neutral-900 border border-neutral-800">Cash on Delivery</span>
            </div>
            <div className="mt-3 flex items-center space-x-1.5 text-[11px] text-neutral-400">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>SSL 256-Bit Encrypted</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-3">
          <p>© {new Date().getFullYear()} ZENVIA India. All rights reserved.</p>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => onOpenPolicy("privacy")}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Privacy
            </button>
            <button
              onClick={() => onOpenPolicy("terms")}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Terms
            </button>
            <button
              onClick={() => onOpenPolicy("shipping")}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Shipping
            </button>
            <button
              onClick={() => onOpenPolicy("contact")}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Support
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
