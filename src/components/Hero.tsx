import React from "react";
import { ArrowRight, ShieldCheck, Truck, RefreshCw, CheckCircle2, Sparkles, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { catPrinterMain } from "../lib/catPrinterImages";

interface HeroProps {
  onShopClick: () => void;
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onShopClick, onExploreClick }) => {
  return (
    <section className="relative pt-8 sm:pt-12 md:pt-14 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FAF8F5] via-white to-neutral-50 overflow-hidden border-b border-neutral-200/60">
      {/* Background Decorative Circles */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-neutral-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* India Delivery Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-medium mb-6 shadow-sm"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>Ships Express Across India • Free Delivery Across India 🚚</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-6xl font-extrabold tracking-tight text-neutral-900 leading-[1.12] mb-5"
            >
              Smart Finds. <br />
              <span className="text-amber-600 font-serif italic">Better Living.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-neutral-600 max-w-xl leading-relaxed mb-8 font-normal"
            >
              Discover useful, trendy and affordable products, delivered reliably across India with verified quality and cash on delivery.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 w-full sm:w-auto mb-10"
            >
              <button
                onClick={onShopClick}
                id="hero-shop-now-btn"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-base font-semibold tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 group"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onExploreClick}
                id="hero-explore-bestsellers-btn"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white border border-neutral-300 text-neutral-800 hover:bg-neutral-50 text-base font-semibold transition-all shadow-sm flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Explore Best Sellers</span>
              </button>
            </motion.div>

            {/* Trust Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-neutral-200/80 w-full text-xs text-neutral-600">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Verified Quality</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Fast BlueDart Shipping</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>UPI & COD Accepted</span>
              </div>
            </div>

          </div>

          {/* Right Image / Showcase Grid */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative rounded-2xl overflow-hidden bg-white shadow-xl border border-neutral-200 p-3"
            >
              <img
                src={catPrinterMain}
                alt="Mini Thermal Printer & Smart Finds"
                referrerPolicy="no-referrer"
                className="w-full h-80 sm:h-96 object-cover rounded-xl"
              />

              {/* Floating Highlight Card */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-lg border border-neutral-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">FEATURED BEST SELLER</span>
                  <h3 className="text-sm font-bold text-neutral-900">Mini Thermal Printer</h3>
                  <div className="flex items-center space-x-2 text-xs text-neutral-600 mt-0.5">
                    <span className="text-emerald-700 font-bold">₹899</span>
                    <span className="line-through text-neutral-400">₹1,299</span>
                    <span className="text-amber-600 font-medium">★ 4.8 (342 reviews)</span>
                  </div>
                </div>
                <button
                  onClick={onShopClick}
                  className="px-3.5 py-2 rounded-lg bg-neutral-900 text-white text-xs font-semibold hover:bg-amber-600 transition-colors"
                >
                  Buy Now
                </button>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};
