import React, { useState } from "react";
import { Sparkles, X, Copy, Check } from "lucide-react";

export const DiscountBanner: React.FC = () => {
  const [visible, setVisible] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!visible) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText("ZENVIAVIP10");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative z-40 bg-gradient-to-r from-[#090909] via-[#1a180e] to-[#090909] border-b border-[#D4AF37]/20 py-2 px-4 text-xs tracking-wider text-neutral-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1 overflow-hidden whitespace-nowrap">
          <div className="inline-flex items-center space-x-6 animate-marquee">
            <span className="inline-flex items-center space-x-2 text-[#D4AF37]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>COMPLIMENTARY BLUEDART AIR EXPRESS SHIPPING ACROSS ALL INDIA ON ORDERS OVER ₹1,999</span>
            </span>
            <span className="text-neutral-500">•</span>
            <span className="inline-flex items-center space-x-2 text-white">
              <span>USE CODE <strong className="text-[#D4AF37] font-semibold tracking-widest">ZENVIAVIP10</strong> FOR 10% WELCOME DISCOUNT</span>
            </span>
            <span className="text-neutral-500">•</span>
            <span className="text-neutral-400">100% CERTIFIED GENUINE PRODUCTS • SECURE PAYMENT & FAST DISPATCH</span>
            <span className="text-neutral-500">•</span>
            <span className="inline-flex items-center space-x-2 text-[#D4AF37]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>COMPLIMENTARY BLUEDART AIR EXPRESS SHIPPING ACROSS ALL INDIA ON ORDERS OVER ₹1,999</span>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 ml-4 shrink-0">
          <button
            onClick={handleCopyCode}
            className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded border border-[#D4AF37]/40 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] text-[11px] font-medium transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span>COPIED</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>COPY CODE</span>
              </>
            )}
          </button>

          <button
            onClick={() => setVisible(false)}
            className="text-neutral-400 hover:text-white transition-colors p-1"
            title="Dismiss Announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
