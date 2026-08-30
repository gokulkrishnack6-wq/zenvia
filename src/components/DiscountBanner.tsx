import React, { useState } from "react";
import { Star, X } from "lucide-react";

export const DiscountBanner: React.FC = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="relative z-40 bg-[#fcedea] text-neutral-800 text-[11px] sm:text-xs py-2 px-3 tracking-normal border-b border-[#f1d0c8]/60 font-medium">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1 flex items-center justify-center space-x-2 sm:space-x-4 text-center">
          <div className="flex items-center space-x-1">
            <div className="flex text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <Star className="w-3.5 h-3.5 fill-amber-500" />
            </div>
            <span className="font-semibold text-neutral-900 ml-1">
              Trusted by thousands of happy customers
            </span>
          </div>

          <span className="text-neutral-400 font-bold">•</span>

          <span className="inline-flex items-center space-x-1.5 font-bold uppercase tracking-wider text-neutral-800">
            <span>📦 FREE DELIVERY on all orders across India</span>
          </span>
        </div>

        <button
          onClick={() => setVisible(false)}
          className="text-neutral-500 hover:text-neutral-900 transition-colors p-1 ml-2 shrink-0 cursor-pointer"
          title="Dismiss Announcement"
          aria-label="Dismiss Announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};


