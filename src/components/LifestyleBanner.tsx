import React, { useState } from "react";
import { Sparkles, CheckCircle, ArrowRight, Play, X } from "lucide-react";
import { motion } from "motion/react";
import { catPrinterDesk } from "../lib/catPrinterImages";

export const LifestyleBanner: React.FC = () => {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-neutral-50 overflow-hidden border-y border-neutral-200/60">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column Text */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-amber-200 text-amber-900 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>THE ZENVIA PROMISE</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-neutral-900 leading-tight">
            Smart, useful & affordable gadgets <br className="hidden sm:block" />
            <span className="text-amber-600">designed for your daily life.</span>
          </h2>

          <p className="text-neutral-600 text-base sm:text-lg leading-relaxed max-w-xl">
            We scour trending utility innovations to bring you high-value products that simplify study, home organization, personal care, and work desk setups.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-neutral-800 font-medium pt-2">
            <div className="flex items-center space-x-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>100% Quality Checked Before Dispatch</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Free Express Delivery Above ₹499</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>GPay, PhonePe, UPI & COD Accepted</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>7-Day Easy Doorstep Replacement</span>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <button
              onClick={() => {
                const el = document.getElementById("catalog-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-7 py-3.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-sm font-semibold shadow-md hover:shadow-lg flex items-center space-x-2 transition-all"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setVideoOpen(true)}
              className="px-6 py-3.5 rounded-xl bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-900 text-sm font-semibold shadow-sm flex items-center space-x-2 transition-all"
            >
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                <Play className="w-3 h-3 fill-amber-700 translate-x-0.5" />
              </div>
              <span>Watch Product Demo</span>
            </button>
          </div>
        </div>

        {/* Right Image Showcase */}
        <div className="lg:col-span-5 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-2xl overflow-hidden bg-white shadow-xl border border-neutral-200/80 p-3"
          >
            <img
              src={catPrinterDesk}
              alt="Zenvia Desk Setup & Smart Gadgets"
              className="w-full h-80 sm:h-96 object-cover rounded-xl"
            />
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-lg border border-neutral-100">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block">DAILY ESSENTIAL</span>
                  <p className="text-sm font-bold text-neutral-900">Mini Inkless Thermal Pocket Printer</p>
                  <p className="text-xs text-neutral-500 mt-0.5">Compact, Wireless & Easy to Use</p>
                </div>
                <span className="text-lg font-extrabold text-emerald-700">₹899</span>
              </div>
            </div>
          </motion.div>
        </div>

      </div>

      {/* Demo Modal */}
      {videoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl overflow-hidden shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
              <span className="font-bold text-neutral-900 text-base">Zenvia — Mini Thermal Printer Demo</span>
              <button
                onClick={() => setVideoOpen(false)}
                className="text-neutral-500 hover:text-neutral-900 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mx-auto">
                <Play className="w-8 h-8 fill-amber-600 translate-x-1" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">See How It Works</h3>
              <p className="text-sm text-neutral-600 max-w-md mx-auto">
                Connect via Bluetooth to your Android or iOS phone and print study notes, to-do lists, photos, and shipping labels inklessly in seconds.
              </p>
              <button
                onClick={() => setVideoOpen(false)}
                className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-black transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

